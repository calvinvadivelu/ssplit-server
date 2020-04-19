const express = require('express');

const ipnHandler = require('../ipn/ipn_handler');

const router = express.Router();

router.post('/', ipnHandler)

module.exports = router