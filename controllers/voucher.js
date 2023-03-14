const Voucher = require('../models/voucher');
const User = require('../models/user');
const History = require('../models/history');
const {
    getRandomNumberBaseOnUniswap,
    getRandomNumberBaseOnChainLink,
    getRandomNumberBaseOnUniswapWithNonceNumber
} = require("../scripts/getRandomNumber");
const Category = require('../models/category');
const {findPointAndDiscount} = require("./game");
const Puzzle = require('../models/puzzle');
const PuzzleOwner = require('../models/puzzleowner');
const Campaign = require('../models/campaign');
const Counterpart = require('../models/counterpart');
const io = require("../app");

exports.createVoucher = async (req, res) => {
    try {
        const voucher = new Voucher(req.body);
        await voucher.save();
        res.status(201).send({success: true, message: 'Voucher created successfully'});
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

exports.addVoucher = async (req, res) => {
    try {
        const {userId, voucherId} = req.body;
        await User.findByIdAndUpdate(userId, {$push: {vouchers: voucherId}, new: true, useFindAndModify: false});
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
    res.status(201).send({success: true, message: 'Voucher added successfully'});
}

exports.getAllVouchersById = async (req, res) => {
    try {
        const user = req.user._id
        const vouchers = await Voucher.find({user})
        res.status(200).send({success: true, message: 'Get all vouchers successfully', vouchers});
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

exports.getAllVouchersByCategoryName = async (req, res) => {
    try {
        const user = req.user._id
        const category = req.body.category;
        if (category === 'All') {
            const vouchers = await Voucher.find({user});
            res.status(200).send({success: true, message: 'Get all vouchers successfully', vouchers});
        } else {
            const catFinding = await Category.findOne({name: category})
            if (!catFinding) res.status(400).send({success: false, message: 'No category'});
            const campaigns = await Campaign.find({category: catFinding._id})
            const vouchers = await Voucher.find({user, campaign: {$in: campaigns}});
            res.status(200).send({success: true, message: 'Get all vouchers successfully', vouchers});
        }
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

exports.getAllVouchersAndCategory = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).populate('vouchers');
        const categories = await Category.find();
        const data = {vouchers: user.vouchers, categories};
        res.status(200).send({success: true, message: 'Get all vouchers successfully', data});
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

exports.searchVouchersByDescriptionAndShop = async (req, res) => {
    try {
        const {keyword} = req.body;
        const user = req.user._id
        if (keyword === '') {
            const vouchers = await Voucher.find({user});
            res.status(200).send({success: true, message: 'Get all vouchers successfully', vouchers});
        } else {
            const vouchersFind = await Voucher.find({user});
            const vouchers = []
            for (let i = 0; i < vouchersFind.length; i++) {
                const campaign = await Campaign.findById(vouchersFind[i].campaign)
                const counterPart = await Counterpart.findById(campaign?.counterpartID)
                if (vouchersFind[i].description.toLowerCase().includes(keyword.toLowerCase()) || counterPart.nameOfShop.toLowerCase().includes(keyword.toLowerCase())) {
                    vouchers.push(vouchersFind[i])
                }
            }
            res.status(200).send({success: true, message: 'Get all vouchers successfully', vouchers});
        }
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

//get range
function getRandom(number) {
    return number % (10000 - 1) + 1;
}


const classifyVouchers = async (randomNumber, campaignID) => {
    const vouchers = await Campaign.findById(campaignID).select('vouchers');
    const voucher = vouchers.vouchers
    voucher.sort((a, b) => b.discount - a.discount);
    const totalDiscount = voucher.reduce((acc, cur) => acc + cur.discount, 0);
    let value = 0
    const cumulativeDiscount = voucher.map((x) => {
        value += x.discount / totalDiscount
        return value
    });
    for (let i = 0; i < voucher.length; i++) {
        if (randomNumber <= cumulativeDiscount[i]) {
            return voucher[i].discount
        }
    }
}
const classifyPuzzle = async (randomNumber, puzzleID) => {
    const puzzle = await Puzzle.findById(puzzleID).select('pieces');
    const piecesArray = puzzle.pieces
    piecesArray.sort((a, b) => a.quantity - b.quantity);
    const totalPieces = piecesArray.reduce((acc, cur) => acc + cur.quantity, 0);
    let value = 0
    const cumulativeQuantity = piecesArray.map((x) => {
        value += x.quantity / totalPieces
        return value
    });
    for (let i = 0; i < piecesArray.length; i++) {
        if (randomNumber <= cumulativeQuantity[i]) {
            return i
        }
    }
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

exports.playGamev2 = async (req, res) => {
    try {
        console.log(req.body)
        const {points, game, campaignID} = req.body;
        const userId = req.user._id
        const user = await User.findById(userId);
        if (user) {
            const campaign = await Campaign.findById(campaignID);
            if (!campaign) res.status(400).send({success: false, message: 'No campaign'});
            console.log(campaign)
            const typeRandom = campaign.typeOfRandom
            if (typeRandom === 'uniswap') {
                getRandomNumberBaseOnUniswap(points).then(async (x) => {
                    const rand = getRandom(x);
                    if (rand < 2000) {
                        res.status(201).send({
                            success: true, message: 'Better luck next time',
                        });
                    } else if (rand < 7000) {
                        const randomNumber = x / 10 ** Math.floor(Math.log10(x) + 1);
                        const discount = await classifyVouchers(randomNumber, campaignID);
                        const check = await checkDiscountAndAmount(campaignID, discount);
                        if (check) {
                            let voucher = await Voucher.create({
                                image: campaign.image,
                                qrCode: campaign.image,
                                available: true,
                                discount,
                                description: campaign.description,
                                campaign: campaign._id,
                                expiredDate: campaign.dateEnd,
                            })
                            voucher = await setVoucherInformation(voucher._id, campaign._id, game, user._id, new Date(), generateRandomString(7));
                            return res.status(201).send({
                                success: true, message: 'Voucher added successfully', voucher
                            })
                        } else {
                            return res.status(400).send({
                                success: false, message: 'No voucher available'
                            })
                        }
                    } else {
                        const randomNumber = x / 10 ** Math.floor(Math.log10(x) + 1);
                        let puzzle = await Puzzle.find();
                        if (puzzle.length <= 0) return res.status(400).send({
                            success: false,
                            message: 'No puzzle available'
                        });
                        puzzle = puzzle[0]
                        const index = await classifyPuzzle(randomNumber, puzzle._id);
                        const piece = puzzle.pieces[index];
                        if (piece.remaningQuantity <= 0) return res.status(400).send({
                            success: false,
                            message: 'No piece available'
                        })
                        await updateRemainQuantity(puzzle.pieces, piece._id, puzzle._id);
                        const puzzle_owner = await PuzzleOwner.findOne({user: user._id, puzzleID: puzzle._id});
                        if (puzzle_owner) {
                            puzzle_owner[`piece_${index}`] = {
                                quantity: puzzle_owner[`piece_${index}`].quantity + 1,
                            }
                            puzzle_owner.lastPieceUpdated = {
                                pieceID: piece._id,
                                pieceType: "piece_" + index,
                                date: new Date(),
                                game: game,
                                image: piece.image
                            }
                            await PuzzleOwner.findByIdAndUpdate(puzzle_owner._id, puzzle_owner, {
                                new: true,
                                useFindAndModify: false
                            })
                        } else {
                            let puzzleOwner = await PuzzleOwner.create({
                                user: user._id,
                                puzzleID: puzzle._id
                            })
                            puzzleOwner[`piece_${index}`] = {
                                quantity: puzzleOwner[`piece_${index}`].quantity + 1,
                            }
                            puzzleOwner.lastPieceUpdated = {
                                pieceID: piece._id,
                                pieceType: "piece_" + index,
                                date: new Date(),
                                game: game,
                                image: piece.image
                            }
                            await PuzzleOwner.findByIdAndUpdate(puzzleOwner._id, puzzleOwner, {
                                new: true,
                                useFindAndModify: false
                            })
                        }
                        // io.emit('mod_puzzle',{
                        //     img: piece.image,
                        //     msg: user.email + ' has just got a piece'
                        // })
                        return res.status(201).send({
                            success: true, message: 'Puzzle added successfully', piece
                        })
                    }
                }).catch((e) => {
                    res.status(400).send({success: false, message: e.message});
                });
            } else if (typeRandom === 'uniswap with nonce number') {
                let x = await getRandomNumberBaseOnUniswapWithNonceNumber(points);
                let transaction = x.re
                x = Number(x.rs)
                const rand = getRandom(x);
                if (rand < 2000) {
                    res.status(201).send({
                        success: true, message: 'Better luck next time',
                    });
                } else if (rand < 7000) {
                    const randomNumber = x / 10 ** Math.floor(Math.log10(x) + 1);
                    const discount = await classifyVouchers(randomNumber, campaignID);
                    const check = await checkDiscountAndAmount(campaignID, discount);
                    if (check) {
                        let voucher = await Voucher.create({
                            image: campaign.image,
                            qrCode: campaign.image,
                            available: true,
                            discount,
                            description: campaign.description,
                            campaign: campaign._id,
                            expiredDate: campaign.dateEnd,
                        })
                        voucher = await setVoucherInformation(voucher._id, campaign._id, game, user._id, new Date(), generateRandomString(7), transaction);
                        return res.status(201).send({
                            success: true, message: 'Voucher added successfully', voucher
                        })
                    } else {
                        return res.status(400).send({
                            success: false, message: 'No voucher available'
                        })
                    }
                } else {
                    const randomNumber = x / 10 ** Math.floor(Math.log10(x) + 1);
                    let puzzle = await Puzzle.find();
                    if (puzzle.length <= 0) return res.status(400).send({
                        success: false,
                        message: 'No puzzle available'
                    });
                    puzzle = puzzle[0]
                    const index = await classifyPuzzle(randomNumber, puzzle._id);
                    const piece = puzzle.pieces[index];
                    if (piece.remaningQuantity <= 0) return res.status(400).send({
                        success: false,
                        message: 'No piece available'
                    })
                    await updateRemainQuantity(puzzle.pieces, piece._id, puzzle._id);
                    const puzzle_owner = await PuzzleOwner.findOne({user: user._id, puzzleID: puzzle._id});
                    if (puzzle_owner) {
                        puzzle_owner[`piece_${index}`] = {
                            quantity: puzzle_owner[`piece_${index}`].quantity + 1,
                        }
                        puzzle_owner.lastPieceUpdated = {
                            pieceID: piece._id,
                            pieceType: "piece_" + index,
                            date: new Date(),
                            game: game,
                            image: piece.image
                        }
                        await PuzzleOwner.findByIdAndUpdate(puzzle_owner._id, puzzle_owner, {
                            new: true,
                            useFindAndModify: false
                        })
                    } else {
                        let puzzleOwner = await PuzzleOwner.create({
                            user: user._id,
                            puzzleID: puzzle._id
                        })
                        puzzleOwner[`piece_${index}`] = {
                            quantity: puzzleOwner[`piece_${index}`].quantity + 1,
                        }
                        puzzleOwner.lastPieceUpdated = {
                            pieceID: piece._id,
                            pieceType: "piece_" + index,
                            date: new Date(),
                            game: game,
                            image: piece.image
                        }
                        await PuzzleOwner.findByIdAndUpdate(puzzleOwner._id, puzzleOwner, {
                            new: true,
                            useFindAndModify: false
                        })
                    }
                    return res.status(201).send({
                        success: true, message: 'Puzzle added successfully', piece
                    })
                }
            } else if (typeRandom === 'chainlink') {
                getRandomNumberBaseOnChainLink(async (ob) => {
                    let transaction = ob.transactionHash
                    let x = Number(ob.randomNumber)
                    const rand = getRandom(x);
                    if (rand < 2000) {
                        res.status(201).send({
                            success: true, message: 'Better luck next time',
                        });
                    } else if (rand < 7000) {
                        const randomNumber = x / 10 ** Math.floor(Math.log10(x) + 1);
                        const discount = await classifyVouchers(randomNumber, campaignID);
                        const check = await checkDiscountAndAmount(campaignID, discount);
                        if (check) {
                            let voucher = await Voucher.create({
                                image: campaign.image,
                                qrCode: campaign.image,
                                available: true,
                                discount,
                                description: campaign.description,
                                campaign: campaign._id,
                                expiredDate: campaign.dateEnd,
                            })
                            voucher = await setVoucherInformation(voucher._id, campaign._id, game, user._id, new Date(), generateRandomString(7), transaction);
                            return res.status(201).send({
                                success: true, message: 'Voucher added successfully', voucher
                            })
                        } else {
                            return res.status(400).send({
                                success: false, message: 'No voucher available'
                            })
                        }
                    } else {
                        const randomNumber = x / 10 ** Math.floor(Math.log10(x) + 1);
                        let puzzle = await Puzzle.find();
                        if (puzzle.length <= 0) return res.status(400).send({
                            success: false,
                            message: 'No puzzle available'
                        });
                        puzzle = puzzle[0]
                        const index = await classifyPuzzle(randomNumber, puzzle._id);
                        const piece = puzzle.pieces[index];
                        if (piece.remaningQuantity <= 0) return res.status(400).send({
                            success: false,
                            message: 'No piece available'
                        })
                        await updateRemainQuantity(puzzle.pieces, piece._id, puzzle._id);
                        const puzzle_owner = await PuzzleOwner.findOne({user: user._id, puzzleID: puzzle._id});
                        if (puzzle_owner) {
                            puzzle_owner[`piece_${index}`] = {
                                quantity: puzzle_owner[`piece_${index}`].quantity + 1,
                            }
                            puzzle_owner.lastPieceUpdated = {
                                pieceID: piece._id,
                                pieceType: "piece_" + index,
                                date: new Date(),
                                game: game,
                                image: piece.image
                            }
                            await PuzzleOwner.findByIdAndUpdate(puzzle_owner._id, puzzle_owner, {
                                new: true,
                                useFindAndModify: false
                            })
                        } else {
                            let puzzleOwner = await PuzzleOwner.create({
                                user: user._id,
                                puzzleID: puzzle._id
                            })
                            puzzleOwner[`piece_${index}`] = {
                                quantity: puzzleOwner[`piece_${index}`].quantity + 1,
                            }
                            puzzleOwner.lastPieceUpdated = {
                                pieceID: piece._id,
                                pieceType: "piece_" + index,
                                date: new Date(),
                                game: game,
                                image: piece.image
                            }
                            await PuzzleOwner.findByIdAndUpdate(puzzleOwner._id, puzzleOwner, {
                                new: true,
                                useFindAndModify: false
                            })
                        }
                        return res.status(201).send({
                            success: true, message: 'Puzzle added successfully', piece
                        })
                    }
                })

            }
        } else {
            res.status(400).send({success: false, message: 'No user'});
        }
    } catch (e) {
        console.log(e)
        res.status(400).send({success: false, message: e.message});
    }
}


const statisticsOfCampagin = async (camPaign, userId) => {
    const campaign = await Campaign.findById(camPaign)
    const userArray = campaign.userJoin
    console.log(campaign)
    if (userArray.length > 0 && userArray.includes(userId)) {
        return false
    }
    return true
}

exports.checkPrize = async (req, res) => {
    try {
        const userID = req.user._id
        const puzzleOwner = await PuzzleOwner.findOne({user: userID})
        if (!puzzleOwner) return res.status(400).send({success: false, message: 'No puzzle'})
        let count = 0
        for (let i = 1; i <= 9; i++) {
            if (puzzleOwner[`piece_${i}`].quantity > 0) {
                count++
            }
        }
        const puzzle = await Puzzle.findById(puzzleOwner.puzzleID)
        if (count === 9){
            for (let i = 1; i <= 9; i++) {
                puzzleOwner[`piece_${i}`].quantity = puzzleOwner[`piece_${i}`].quantity - 1
            }
            await PuzzleOwner.findByIdAndUpdate(puzzleOwner._id, puzzleOwner, {
                new: true,
            })
            puzzle.userWin.push({
                userID,
                code: generateRandomString(7)
            })
            await Puzzle.findByIdAndUpdate(puzzle._id, puzzle, {
                new: true,
            })
            await History.create({
                userID,
                type: 'puzzle',
                image:puzzle.image,
                date: new Date(),
                message:"Bạn vừa nhận một món quà từ trò chơi mảnh ghép"
            })
            return res.status(200).send({
                success: true, message: 'Congratulation! You have completed the puzzle',
                image: puzzle.image
            })
        }
        else{
            return res.status(200).send({
                success: false, message: 'You have not completed the puzzle',
            })
        }
    } catch (e) {
        console.log(e)
        res.status(400).send({success: false, message: e.message});
    }
}

//getPuzzle
exports.playPuzzle = async (req, res) => {
    try {
        console.log(req.body)
        const {name} = req.body;
        const userId = req.user._id
        const puzzleMapDb = await Puzzle.findOne({name})
        if (puzzleMapDb) {
            const user = await User.findById(userId);
            if (user) {
                getRandomNumberBaseOnUniswap().then(async (x) => {
                    const convertInRange = findRangeOfRandomNumber(1, 105, x);
                    const puzzleGetByUserId = await Puzzle.findOne({user: userId});
                    if (puzzleGetByUserId) {
                        const piece = checkRarityAndReturnPuzzle(convertInRange, puzzleGetByUserId);
                        puzzleGetByUserId[piece].quantity = puzzleGetByUserId[piece].quantity + 1;
                        puzzleGetByUserId[piece].id.push(x)
                        const imgPiece = puzzleGetByUserId[piece].img;
                        puzzleGetByUserId.lastPieceReceived = {
                            piece,
                            img: imgPiece
                        }
                        const result = await Puzzle.findByIdAndUpdate(puzzleGetByUserId._id, puzzleGetByUserId,
                            {
                                new: true,
                                useFindAndModify: false
                            })
                        const img = result[piece].img;
                        res.status(201).send({
                            success: true, message: 'successfully', data: {
                                convertInRange,
                                piece,
                                img,
                                result
                            }
                        });
                    } else {
                        console.log(puzzleMapDb)
                        const newPuzzle = {
                            user: userId,
                            piece_1: puzzleMapDb.piece_1,
                            piece_2: puzzleMapDb.piece_2,
                            piece_3: puzzleMapDb.piece_3,
                            piece_4: puzzleMapDb.piece_4,
                            piece_5: puzzleMapDb.piece_5,
                            piece_6: puzzleMapDb.piece_6,
                            piece_7: puzzleMapDb.piece_7,
                            piece_8: puzzleMapDb.piece_8,
                            piece_9: puzzleMapDb.piece_9,
                            name: puzzleMapDb.name,
                            lastPieceReceived: puzzleMapDb.lastPieceReceived
                        }
                        const puzzleAdding = await Puzzle.create(newPuzzle);
                        const piece = checkRarityAndReturnPuzzle(convertInRange, puzzleAdding);
                        puzzleAdding[piece].quantity = puzzleAdding[piece].quantity + 1;
                        puzzleAdding[piece].id.push(x)
                        const imgPiece = puzzleAdding[piece].img;
                        puzzleAdding.lastPieceReceived = {
                            piece,
                            img: imgPiece
                        }
                        const result = await Puzzle.findByIdAndUpdate(puzzleAdding._id, puzzleAdding,
                            {
                                new: true,
                                useFindAndModify: false
                            })
                        const img = result[piece].img;
                        res.status(201).send({
                            success: true, message: 'successfully', data: {
                                convertInRange,
                                piece,
                                img,
                                result
                            }
                        });
                    }
                }).catch((e) => {
                    res.status(400).send({success: false, message: e.message});
                });
            } else {
                res.status(400).send({success: false, message: 'User not found'});
            }
        } else {
            res.status(400).send({success: false, message: 'Puzzle not found'});
        }
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}


const findRangeOfRandomNumber = (min, max, randNumber) => {
    let range = max - min + 1;
    return randNumber % range + min;
}

const checkRarityAndReturnPuzzle = (rarity, object) => {
    for (let i = 1; i <= 9; i++) {
        const nameProps = 'piece_' + i;
        if (object[nameProps].min <= rarity && object[nameProps].max >= rarity) {
            return nameProps
        }
    }
}

const setVoucherInformation = async (voucherId, campaignId, game, user, timeGet, code, transaction) => {
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) throw new Error('Campaign not found');
        const voucher = await Voucher.findByIdAndUpdate(voucherId, {available: false, game, user, timeGet, code, transaction}, {
            new: true,
            useFindAndModify: false
        });
        return voucher
    } catch (e) {
        throw new Error(e.message);
        return null
    }
}

const getCampaignInThisCampaignAndDiscount = async (campaignId, discount) => {
    try {
        return await Voucher.find({campaign: campaignId, discount, available: true});
    } catch (e) {
        throw new Error(e.message);
    }
}

const checkDiscountAndAmount = async (campaignID, discount) => {
    const vouchers = await Campaign.findById(campaignID).select('vouchers');
    const voucher = vouchers.vouchers
    let amount = 0;
    let countIndex = 0;
    for (let i = 0; i < voucher.length; i++) {
        if (voucher[i].discount === discount) {
            amount = voucher[i].amount
            countIndex = i
            break
        }
    }
    if (amount > 0) {
        const update = {$set: {}};
        update.$set[`vouchers.${countIndex}.amount`] = amount - 1; // dynamically build the path to the property you want to update
        await Campaign.updateOne({_id: campaignID}, update, {new: true, useFindAndModify: false})
        return true
    } else return false
}

updateRemainQuantity = async (pieces, pieceID, puzzleID) => {
    let countIndex = 0;
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i]._id.equals(pieceID)) {
            countIndex = i
            break
        }
    }
    const update = {$set: {}};
    update.$set[`pieces.${countIndex}.quantity`] = pieces[countIndex].remaningQuantity - 1; // dynamically build the path to the property you want to update
    await Puzzle.updateOne({_id: puzzleID}, update, {new: true, useFindAndModify: false})
}
const getCampaignInThisCampaign = async (campaignId) => {
    try {
        return await Voucher.find({campaign: campaignId, available: false});
    } catch (e) {
        throw new Error(e.message);
    }
}

