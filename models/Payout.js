const mongoose = require('mongoose');

const payoutSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    recipient_type: String,
    sender_item_id: String,
    amount: {
        value: String,
        currency: String
    },
    receiver: String,
    subscriptionPlanId: String,
})
module.exports = mongoose.model('Payouts', payoutSchema)