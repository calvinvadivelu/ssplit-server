const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

router.post('/sendEmails', (req, res) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PW
        }
    });
    const { recipients, owner, subscription_name, link } = req.body
    recipients.forEach(async recipient => {
        var mailOptions = { 
            from: 'subscription@ssplit.com',
            to: recipient.email,
            subject: `Sharing ${subscription_name} Subscription with ${owner}`,
            text: `Click this link to add your paypal to the subscription process and start contributing monthly ${link}`
        };
  
      let info = await transporter.sendMail(mailOptions)
      console.log(`message sent: ${info.messageId}`)
      res.send(info.messageId)
    });
})

module.exports = router