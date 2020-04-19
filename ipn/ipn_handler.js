const querystring = require("querystring");
const axios = require('axios');

const Subscription = require('../models/Subscription');

const ipnHandler = (req, res) => {
    //Sandbox Postback URL
    const SANDBOX_VERIFY_URI = "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr";

    if (req.method !== "POST") {
        console.error("Request method not allowed.");
        res.status(405).send("Method Not Allowed");
    } else {
        // Return empty 200 response to acknowledge IPN post success.
        console.log("IPN Notification Event received successfully.");
        res.status(200).end();
    } //SENT BACK SUCCESS

    let ipnTransactionMessage = req.body;
    let formUrlEncodedBody = querystring.stringify(ipnTransactionMessage);
    let verificationBody = `cmd=_notify-validate&${formUrlEncodedBody}`;

    const axBody = verificationBody
    const axConf = {
        headers: {
            'Content-Length': verificationBody.length,
        },
    };
    console.log("IPN Notification Event Received");
    //MUST CHECK IF VERIFIED

    // deprecated must change to AXIOS


    axios.post(SANDBOX_VERIFY_URI, axBody, axConf).then( async response => {
        const VERIFIED = response.data === 'VERIFIED'
        if (VERIFIED) {
            const body = querystring.parse(verificationBody, null, null)
            console.log('VERIFIED');
            const transactionType = body.txn_type
            switch(transactionType) {
                case 'recurring_payment_profile_created': {
                    console.log('SUBSCRIBER SIGNING UP FOR RECURRING PAYMENT');
                    const subscriptionId = body.recurring_payment_id
                    const payerId = body.payer_id
                    let subscription = await Subscription.findOne({
                        'sharers.subscriptionId' : subscriptionId,
                        'sharers.payerId' : payerId
                    })
                    // console.log(subscription)
                    console.log(subscription);
                    break;
                }
                case 'recurring_payment': {
                    console.log('RECURRING PAYMENT');
                    const payerId = body.payer_id
                    const subscriptionId = body.recurring_payment_id
                    let subscription = await Subscription.findOne({
                        'sharers.subscriptionId' : subscriptionId,
                        'sharers.payerId' : payerId
                    })
                    const indexOfSharer = subscription.sharers.findIndex(sharer => (sharer.subscriptionId === subscriptionId && sharer.payerId === payerId))
                    subscription.sharers[indexOfSharer].paid = true;
                    subscription.save().catch(err => console.log(err));
                    console.log("SHARER PAID IN", subscription.name)
                    break;
                }
                default:
                    console.log('Unhandled transaction type: ', transactionType);
            }
            console.log('transactionType :', transactionType);
        } else {
            console.log('IPN NOT VERIFIED')
        }

    }).catch(err => console.error(err))
}

module.exports = ipnHandler