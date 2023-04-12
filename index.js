require('dotenv').config()
const express = require('express')


const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
var path = require('path');
const port = process.env.PORT || 8000

const app = express()
// registering the bodyparser


// getting setting
const settings = require('./config/settings')

// mongo db URL
const db = settings.mongoDBUrl



// attempt to connect with DB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log(err))

// importing routes
const profile = require('./routes/api/person')
const auth = require('./routes/api/auth')

app.get('/', (req, res) => {
    res.send('Week 10 code goes from here')
})

// mapping the imported routes
app.use('/api/profile', profile)

app.use('/api/auth', auth)

// Config for JWT strategy
require('./strategies/jsonwtStrategy')(passport)

app.listen(port, () => console.log(`App running at port ${port}`))