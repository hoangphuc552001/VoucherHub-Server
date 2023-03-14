const mongoose = require('mongoose');
const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
    },
    image: {
        type: String,
        required: true,
    },
    qrCode: {
        type: String,
        required: true,
    },
    available: {
        type: Boolean,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    description: {
        type: String
    },
    expiredDate: {
        type: Date,
    },
    usedAt: {
        type: Date,
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
    },
    timeGet: {
        type:Date
    },
    game: {
        type:String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
    },
    transaction: {
        type: String
    }
}
, { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);
