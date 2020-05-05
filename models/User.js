const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fullName: String,
    email: String,
    subscriptions: [String],
})
module.exports = mongoose.model('User', userSchema)