const mongoose = require('mongoose');

const sharerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    payerId: {type: String, default: null},
    subscriptionId: {type: String, default: null},
    paid: {type: Boolean, default: false}
})

const subscriptionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    planId: String,
    prodId: String,
    ownerInfo: { name: String, email: String, id: String },
    name: String,
    planName: String,
    description: String,
    type: String,
    category: String,
    totalPrice: Number,
    pricePerPerson: Number,
    currency: String,
    sharers: [sharerSchema],
    receivingMethod: String,
    receiverAddress: String,
    payoutDate: Number,
    dataIndex: Number,
    date: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Subscription', subscriptionSchema)