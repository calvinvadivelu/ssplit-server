const axios = require('axios');
const schedule = require('node-schedule');

const Subscription = require('../models/Subscription');

const AxConf = {
    headers: {
      Authorization: `Bearer ${process.env.PAYPAL_TOKEN}`,
      'Content-Type': 'application/json'
    }
};
const scheduler = () => {
  schedule.scheduleJob('* * 8 * *', async () => {
    console.log('SENDING PAYMENTS OUT')
    const today = new Date();
    const date = today.getFullYear()+(today.getMonth()+1)+today.getDate();
    
    const subsDueToday = await Subscription.find({ payoutDate: Number(today.getDate()) })
    let unpaidSubscriptions = []
    let paidSubscriptions = []

    const AxBody = {
      sender_batch_header: {
        sender_batch_id: date,
        email_subject: "You have a payout!",
        email_message: "You have received a payout! Thanks for using our ssplit.io!"
      },
      items: await subsDueToday.reduce( async (result, subscription) => {
        let unpaidSharers = [];
        const paidSharers = subscription.sharers.filter(sharer => {
          if (sharer.paid === false) unpaidSharers.push(sharer.name)
          else return sharer
        })

        if (paidSharers.length !== 0) {
          paidSubscriptions.push(subscription)
          const totalPayout = paidSharers.length * subscription.pricePerPerson
          const note = `All your subscription sharers paid you except ${unpaidSharers.map(sharer => `${sharer}, `)}. Track them down those leeches`
          result.push({
            recipient_type : subscription.receivingMethod,
            amount : {
              value: totalPayout,
              currency: subscription.currency
            },
            note: note,
            sender_item_id: `${date}${index}`,
            receiver: subscription.receiverAddress
          })
          return result
        }
        else unpaidSubscriptions.push(subscription)
      }, [])
    }
    const sendPayoutsResponse = await axios.post('https://api.sandbox.paypal.com/v1/catalogs/products', AxBody, AxConf)
    const payoutRespData = sendPayoutsResponse.data
    console.log('FINISHED SENDING PAYOUTS', payoutRespData.batch_header.payout_batch_id);
    paidSubscriptions.forEach( async subscription => {
      subscription.sharers.forEach(sharer => sharer.paid = null)
      await subscription.save()
      .catch(err => console.log(err))
    })
    //need to send out emails to subscriptions that had no payments made.
  })
}

module.exports = scheduler