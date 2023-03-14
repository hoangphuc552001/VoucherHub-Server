const History = require('../models/history');
exports.addHistory = async (req, res) => {
    const {name, date} = req.body;
    try {
        const newHistory = new History({name, date,type});
        await newHistory.save();
        return res.status(201).send({success: true, message: 'History created successfully!'});
    }catch (e) {
        return res.status(400).send({success: false, message: e.message});
    }
}

exports.deleteAll = async (req, res) => {
    try {
       await History.deleteMany({});
        return res.status(200).send({success: true, message: 'Delete all histories successfully'});
    } catch (e) {
        return res.status(400).send({success: false, message: e.message});
    }
}

exports.getAll = async (req, res) => {
    try {
        const userID = req.user._id
        const histories = await History.find({userID}).sort({date: -1});
        return res.status(200).send({success: true, message: 'Get all histories successfully', histories});
    } catch (e) {
        return res.status(400).send({success: false, message: e.message});
    }
}
