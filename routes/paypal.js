const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();

const Subscription = require('../models/Subscription');
const User = require('../models/User');

const AxConf = {
    headers: {
      Authorization: `Bearer ${process.env.PAYPAL_TOKEN}`,
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
                        value: req.body.pricePerPerson.toString(),
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
        const planData = createPlanResponse.data
        console.log(`Finished Creating Plan ${planData.id}`);
        //SAVE TO DB
        const subscription = new Subscription({
            _id: new mongoose.Types.ObjectId(),
            planId: createPlanResponse.data.id,
            prodId: createPlanResponse.data.product_id,
            name: req.body.name,
            planName: req.body.planName,
            description: req.body.description,
            ownerInfo: req.body.ownerInfo,
            type: req.body.type,
            category: req.body.category,
            totalPrice: req.body.totalPrice,
            pricePerPerson: req.body.pricePerPerson,
            currency: req.body.currency,
            sharers: req.body.sharers,
            receivingMethod: req.body.receivingMethod,
            receiverAddress: req.body.receiverAddress,
            dataIndex: req.body.dataIndex,
            payoutDate: req.body.payoutDate
        })
        subscription.save()
        .catch(err => console.log(err))    
        // *** need to check if error with saving *** //
        const owner = await User.findById(req.body.ownerInfo.id) 
        owner.subscriptions.push(planData.id) 
        await owner.save()

        res.send(planData)
    } catch (error) {
        console.log('error :', error);
    }
})


router.patch('/confirmSharer', async(req, res) => {
    const { planId, payerId, sharerEmail, subscriptionId } = req.body
    const subscription = await Subscription.findOne({ planId: planId })
    let sharer = subscription.sharers.find(sharer => sharer.email === sharerEmail)
    sharer.subscriptionId = subscriptionId
    sharer.payerId = payerId
    const response = await subscription.save()
    res.send(response)
})

router.get('/plandetails', async(req, res) => {
    const { planId } = req.query
    try {
        await Subscription.findOne({ planId: planId }, (err, subscription) => {
            res.send(subscription)
        })
    } catch(error) {
        console.log('error :', error);
    }
})

module.exports = router