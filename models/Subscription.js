const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    planId: String,
    prodId: String,
    ownerInfo: { name: String, email: String },
    name: String,
    description: String,
    type: String,
    category: String,
    totalPrice: Number,
    pricePerPerson: Number,
    date: { type: Date, default: Date.now },
    sharers: [{ name: String, email: String, confirmationId: {type: String, default: null} }]
})
module.exports = mongoose.model('Subscription', subscriptionSchema)