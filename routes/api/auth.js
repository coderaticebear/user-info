const express = require('express')
const exphbs = require('express-handlebars')
var path = require('path');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
var cookie = require('cookie-parser')
const jsonwt = require('jsonwebtoken')
const passport = require('passport')

// getting setting
const settings = require('../../config/settings')

const router = express()

router.use(bodyParser.urlencoded({extended: false}))

router.use(express.static(path.join(__dirname, 'public')));
router.use(express.urlencoded())

router.engine(
    '.hbs',
    exphbs.engine(
        {
            extname: '.hbs',
        }
    )
)

// Setting the view engine to use Handlebars for rendering templates.
router.set(
    'view engine',
    '.hbs'
)

const Person = require('./../../models/Person')

router.use(cookie())

// Route to register a user. URL : /api/auth/register
router.post('/register', (req, res) => {
    // check if username is already in collection.
    Person
        .findOne({username: req.body.username})
        .then(person => {
            if (person) {
                res.status(400).send('Username already there.')
            } else {
                
                const person = Person({
                    name: req.body.name,
                    username: req.body.username,
                    password: req.body.password
                })

                // encrypting the password using bcryptjs
                bcrypt.genSalt(10, (err, salt) => {
                    // salt is provided in salt variable.
                    bcrypt.hash(person.password, salt, (err, hash) => {
                        if(err) {
                            return res.status(400).send('Not Registered, Contact Admin!')
                        }
                        else {
                            // hashed password
                            person.password = hash

                            // add new person with hashed password.
                            person
                                .save()
                                .then(person => res.send('add success'))
                                .catch(err => res.send(err.message))
                        }
                    })
                })
            }
        })
        .catch(err => res.send(err))
})

router.get('/login', (req, res) => {
    res.render('login', {
        title : 'login',
    })
})
router.get('/register', (req, res) => {
    res.render('register', {
        title : 'Register'
    })
})

router.get('/get', (req, res) => {
    res.render('getAll', {
        title: 'All Data'
    })
})
// Route to login a user. URL : /api/auth/login
router.post('/login', (req, res) => {
    username = req.body.username
    password = req.body.password // 123456

    // check if username is already in collection.
    Person
        .findOne({username: req.body.username})
        .then(person => {
            if (person) {
                // compare the password
                bcrypt
                    .compare(password, person.password)
                    .then(
                        (isCompared) => {
                            if(isCompared) {
                                // res.cookie('session_id', '123')
                                // res.send('Login Success')
                                
                                // generate JWT
                                const payload = {
                                    id: person.id, 
                                    name: person.name,
                                    username: person.username
                                }
                                
                                // jsonwebtoken method used to create token.
                                jsonwt.sign(
                                    payload,
                                    settings.secret,
                                    {expiresIn: 3600},
                                    (err, token) => {
                                        console.log(err)

                                        // let responseData = {
                                        //     success: true,
                                        //     token: 'Bearer ' + token
                                        // }
                                        res.json({
                                            success: true,
                                            token: 'Bearer ' + token
                                        })
                                        // res.header('Authorization', 'Bearer ' + token)
                                        // res.redirect('get')
                                    }
                                )
                            }
                            else {
                                res.status(401).send('Password is not correct')
                            }
                        }
                    )
                    .catch()
            } else {
                res.status(400).send('Username is not there.')
            }
        })

})

// function validateCookie(req, res, next) {
//     const {cookies} = req;

//     if('session_id' in cookies) {
//         if(cookies.session_id == 123) {
//             next()
//         }else{
//             res.status(403).send('Not Authorized')
//         }
//     }
// }

// Private route to get all user details
router.post(
    '/get',
    passport.authenticate('jwt', { session: false }), // middleware from passport-jwt
    async(req, res) => {
    let people_un = []
    const cursor = await Person.find()
    cursor.forEach((person) => {
        people_un.push(person)
    })

    /*res.render('getAll', {
        title : 'All Data',
        data : people_un
    })*/
    res.json(people_un)
})

module.exports = router