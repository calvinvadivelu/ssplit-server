const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');
const Subscription = require('../models/Subscription');
router.get('/getUser', async(req, res) => {
    const userResponse = await User.findOne({ email: req.query.email })
    let userData = userResponse._doc
    const usersSubscriptionList = await Subscription.find({ 'ownerInfo.id' : userData._id })
    const subscriptionData = usersSubscriptionList.map(subscription => ({
        planId: subscription.planId,
        name: subscription.name,
        planName: subscription.planName,
        description: subscription.description,
        totalPrice: subscription.totalPrice,
        pricePerPerson: subscription.pricePerPerson,
        sharers: subscription.sharers.map(sharer => ({
            name: sharer.name,
            email: sharer.email,
            paid: sharer.paid
        })),
        receiverAddress: subscription.receiverAddress,
        dataIndex: subscription.dataIndex,
        payoutDate: subscription.payoutDate
    }))
    userData.subscriptions = subscriptionData
    res.send(userData)
})


router.post('/createUser', async(req, res) => {
    let user = new User({
        _id: new mongoose.Types.ObjectId(),
        fullName: req.body.fullName,
        email: req.body.email,
        subscriptions: req.body.subscriptions
    })

    const response = await user.save()
    .catch(err => console.log(err))
    res.send(response)
})

module.exports = router