const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();

const Subscription = require('../models/Subscription');

const ACCESS_TOKEN = process.env.PAYPAL_TOKEN

const AxConf = {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
};

router.post('/createSubscription', async(req, res) => {

    let productAxBody = {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        category: req.body.category,
    }
    let planAxBody = {
        product_id: 'TO BE FILLED',
        name: req.body.name,
        description: req.body.description,
        status: "ACTIVE",
        billing_cycles: [
            {
                frequency: {
                    interval_unit: "MONTH",
                    interval_count: 1
                },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                    fixed_price: {
                        value: req.body.pricePerPerson,
                        currency_code: "USD"
                    }
                }
            }
        ],
        payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
                value: "0",
                currency_code: "USD"
            },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
        },
    }
    
    try {
        const createProdResponse = await axios.post('https://api.sandbox.paypal.com/v1/catalogs/products', productAxBody, AxConf)
        const productData = createProdResponse.data
        console.log(`Finished Creating Product ${productData.id}`)
        planAxBody.product_id = productData.id
        const createPlanResponse = await axios.post('https://api.sandbox.paypal.com/v1/billing/plans', planAxBody, AxConf)
        console.log('Finished Creating Plan');

        //SAVE TO DB
        const subscription = new Subscription({
            _id: new mongoose.Types.ObjectId(),
            planId: createPlanResponse.data.id,
            prodId: createPlanResponse.data.product_id,
            name: req.body.name,
            description: req.body.description,
            ownerInfo: req.body.ownerInfo,
            type: req.body.type,
            category: req.body.category,
            totalPrice: req.body.totalPrice,
            pricePerPerson: req.body.pricePerPerson,
            sharers: req.body.sharers
        })
        subscription.save().then(res => {
            console.log('res :', res);
        })
        .catch(err => console.log(err))    


        res.send(createPlanResponse.data)
    } catch (error) {
        console.log('error :', error);
    }
})

router.get('/plandetails', async(req, res) => {
    const { plan_id } = req.query
    try {
        await Subscription.findOne({ planId: plan_id }, (err, subscription) => {
            res.send(subscription)
        })
    } catch(error) {
        console.log('error :', error);
    }
})

module.exports = router