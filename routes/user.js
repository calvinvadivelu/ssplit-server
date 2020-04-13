const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');

router.get('/getUser', async(req, res) => {
    console.log('req.query.email :', req.query.email);
    await User.findOne({ email: req.query.email }, (err, user) => {
        console.log('user :', user);
        res.send(user)
    })
})


router.post('/createUser', async(req, res) => {
    let user = new User({
        _id: new mongoose.Types.ObjectId(),
        fullName: req.body.fullName,
        email: req.body.email
    })

    user.save().then(res => {
        console.log('res :', res);
    }).catch(err => console.log(err))
})

module.exports = router