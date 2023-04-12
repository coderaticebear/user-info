const express = require('express')

const router = express()
var path = require('path');
const bodyParser = require('body-parser')
const Person = require('./../../models/Person')



// test route . URL /api/profile
router.get('/', (req, res) => res.send('Profile related routes.'))

// get all records. URL : /api/profile/get
router.get('/get', async (req, res) => {
    // fetch data from db
    const people = await Person.find({})
    try {
        res.status(200).send(people)
    }
    catch {
        res.status(500).send(error)
    }
})

// create a new document. URL : /api/profile/add
router.post('/add', (req, res) => {
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

                // add new document to the collection.
                person
                    .save()
                    .then(person => res.send('add success'))
                    .catch(err => res.send(err.message))
            }
        })
        .catch(err => res.send(err))
})

// updating the password for a user. URL : /api/profile/update-pwd/:username
router.put('/update-pwd/:username', (req, res) => {
    Person
        .updateOne(
            {username: req.params.username},
            {$set: {password: req.body.password}})
        .exec()
        .then(() => {
            res.status(201).send('Password updated')
        })
        .catch(err => res.status(500).send(err.message))
})

// deleting a person. URL: /api/profile/delete/:username
router.delete('/delete/:username', (req, res) => {
    Person
        .deleteOne({username: req.params.username})
        .exec()
        .then(() => {
            res.send('Person Deleted.')
        })
        .catch(err => res.status(500).send(err.message))
})

module.exports = router