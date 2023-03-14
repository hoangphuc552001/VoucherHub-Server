const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    campaignID: {
        type: mongoose.Schema.Types.ObjectId,
    }
})
module.exports = mongoose.model('Favorite', favoriteSchema);
