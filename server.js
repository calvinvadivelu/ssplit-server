const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
require('dotenv/config')

const app = express();
const port = process.env.PORT || 5000;



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//PAYPAL ROUTES
const paypalRoutes = require('./routes/paypal');
app.use('/paypal', paypalRoutes)

//USER ROUTES
const userRoutes = require('./routes/user')
app.use('/user', userRoutes)

//CONNECT TO DB
mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  () => { console.log('Connected to db!')}
)


app.post('/sendEmails', (req, res) => {
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


//idek why this is here still...
app.get('/favicon.ico', (req, res) => {
  console.log('are u srs rn')
  res.send('bruh')
})

app.listen(port, () => console.log(`Listening on port ${port}`));
