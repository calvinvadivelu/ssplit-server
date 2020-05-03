const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');

router.get('/getUser', async(req, res) => {
    await User.findOne({ email: req.query.email }, (err, user) => {
        res.send(user)
    })
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