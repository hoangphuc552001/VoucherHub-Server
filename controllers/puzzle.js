const Puzzle = require('../models/puzzle');
const PuzzleOwner = require('../models/puzzleowner');
const User = require('../models/user')
exports.addPuzzle = async (req, res) => {
    try {

        const puzzle = new Puzzle(req.body);
        const newPuzzle = new Puzzle(puzzle);
        await newPuzzle.save();
        res.status(201).send({success: true, message: 'Puzzle added successfully'});
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
        throw new Error(e.message);
    }
}

exports.getAll = async (req, res) => {
    try {
        const user = req.user._id
        const puzzlesowner = await PuzzleOwner.findOne({user});
        if (puzzlesowner.length <= 0) return res.status(200).send({
            success: true,
            message: 'No puzzle found',
            result: []
        });
        const puzzle = await Puzzle.findById(puzzlesowner.puzzleID);
        const result = puzzle.toObject()
        for (let i = 0; i < result.pieces.length; i++) {
            result.pieces[i].userQuantity = puzzlesowner[`piece_${i + 1}`].quantity
        }
        res.status(200).send({success: true, message: 'Get all puzzles successfully', result});
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

exports.addPuzzleByPlayGame = async (puzzle) => {
    try {
        const newPuzzle = new Puzzle(puzzle);
        await newPuzzle.save();
    } catch (e) {
        throw new Error(e.message);
    }

}

exports.sendPuzzleFriend = async (req, res) => {
    try {
        const object = req.body;
        const user = req.user._id
        const puzzle = await Puzzle.findById(object.puzzleID)
        if (!puzzle) return res.status(400).send({success: false, message: "Puzzle do not exist"})
        const userSend = await User.findById(user)
        if (!userSend) return res.status(400).send({success: false, message: "User do not exist"});
        const userReceive = await User.findById(object.userID)
        if (!userReceive) return res.status(400).send({success: false, message: "User do not exist"});
        //sender
        const puzzleOwnedSender = await PuzzleOwner.findOne({user: userSend._id});
        if (!puzzleOwnedSender) return res.status(400).send({success: false, message: "User do not have puzzle"});
        if (puzzleOwnedSender[`piece_${object.piece}`].quantity <= 0) return res.status(400).send({
            success: false,
            message: "User do not have this piece"
        });
        puzzleOwnedSender[`piece_${object.piece}`].quantity = puzzleOwnedSender[`piece_${object.piece}`].quantity - 1
        puzzleOwnedSender.lastPieceUpdated = {
            pieceID: object.pieceID,
            pieceType: "piece_" + object.piece,
            date: new Date(),
            image: object.image,
            receiveTo: userReceive.email
        }
        await PuzzleOwner.findOneAndUpdate({user: userSend._id}, puzzleOwnedSender, {new: true});
        //receiver
        const puzzleOwnedReceiver = await PuzzleOwner.findOne({user: object.userID});
        if (puzzleOwnedReceiver) {
            puzzleOwnedReceiver[`piece_${object.piece}`].quantity = puzzleOwnedReceiver[`piece_${object.piece}`].quantity + 1
            puzzleOwnedReceiver.lastPieceUpdated = {
                pieceID: object.pieceID,
                pieceType: "piece_" + object.piece,
                date: new Date(),
                image: object.image,
                receiveFrom: userSend.email
            }
            await PuzzleOwner.findOneAndUpdate({user: object.userID}, puzzleOwnedReceiver, {new: true});
        } else {
            await PuzzleOwner.create({
                user: object.userID,
                puzzleID: puzzle._id,
                [`piece_${object.piece}`]: {
                    quantity: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                lastPieceUpdated: {
                    pieceID: object.pieceID,
                    pieceType: "piece_" + object.piece,
                    date: new Date(),
                    image: object.image,
                    receiveFrom: userSend.email,
                }
            })
        }
        return res.status(201).send({
            success: true, message: {
                puzzle
            }
        })
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
        throw new Error(e.message);
    }
}

exports.sendPuzzleEveryone = async (req, res) => {
    try {
        const object = req.body;
        const user = req.user._id
        const puzzle = await Puzzle.findById(object.puzzleID)
        if (!puzzle) return res.status(400).send({success: false, message: "Puzzle do not exist"})
        const userReceive = await User.findById(user)
        if (!userReceive) return res.status(400).send({success: false, message: "User do not exist"});
        const userSend = await User.findById(object.userID)
        if (!userSend) return res.status(400).send({success: false, message: "User do not exist"});
        //sender
        const puzzleOwnedSender = await PuzzleOwner.findOne({user: userSend._id});
        console.log("sender", puzzleOwnedSender)
        if (!puzzleOwnedSender) return res.status(400).send({success: false, message: "User do not have puzzle"});
        if (puzzleOwnedSender[`piece_${object.piece}`].quantity <= 0) return res.status(400).send({
            success: false,
            message: "User do not have this piece"
        });
        puzzleOwnedSender[`piece_${object.piece}`].quantity = puzzleOwnedSender[`piece_${object.piece}`].quantity - 1
        puzzleOwnedSender.lastPieceUpdated = {
            pieceID: object.pieceID,
            pieceType: "piece_" + object.piece,
            date: new Date(),
            image: object.image,
            receiveTo: userReceive.email
        }
        await PuzzleOwner.findOneAndUpdate({user: userSend._id}, puzzleOwnedSender, {new: true});
        //receiver
        const puzzleOwnedReceiver = await PuzzleOwner.findOne({user: userReceive._id});
        console.log("receiver", puzzleOwnedReceiver)
        if (puzzleOwnedReceiver) {
            puzzleOwnedReceiver[`piece_${object.piece}`].quantity = puzzleOwnedReceiver[`piece_${object.piece}`].quantity + 1
            puzzleOwnedReceiver.lastPieceUpdated = {
                pieceID: object.pieceID,
                pieceType: "piece_" + object.piece,
                date: new Date(),
                image: object.image,
                receiveFrom: userSend.email
            }
            await PuzzleOwner.findOneAndUpdate({user: userReceive._id}, puzzleOwnedReceiver, {new: true});
        } else {
            await PuzzleOwner.create({
                user: object.userID,
                puzzleID: puzzle._id,
                [`piece_${object.piece}`]: {
                    quantity: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                lastPieceUpdated: {
                    pieceID: object.pieceID,
                    pieceType: "piece_" + object.piece,
                    date: new Date(),
                    image: object.image,
                    receiveFrom: userSend.email,
                }
            })
        }
        return res.status(201).send({
            success: true, message: {
                puzzle,
                image: object.image
            }
        })
    } catch (e) {
        res.status(400).send({success: false, message: e.message});
        throw new Error(e.message);
    }
}
