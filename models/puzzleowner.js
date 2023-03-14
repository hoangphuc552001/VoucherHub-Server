const mongoose = require("mongoose");
const pieceDetail = new mongoose.Schema(
    {
        quantity: {
            type: Number,
            default: 0,
        },
    },
    {timestamps: true, _id: false},
)
const puzzleownerSchema = new mongoose.Schema({
    puzzleID: mongoose.Schema.Types.ObjectId,
    piece_1: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false,
        }
    },
    piece_2: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_3: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_4: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_5: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_6: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_7: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_8: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    piece_9: {
        type: new Object(pieceDetail),
        default: {
            quantity: 0,
            id:false
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
    },
    lastPieceUpdated:{
        type: Object,
    }
})
module.exports = mongoose.model('PuzzleOwner', puzzleownerSchema);
