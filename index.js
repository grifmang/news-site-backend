
"use strict";
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const database = require('./data/dbConfig');
const cors = require('cors');
const router = express.Router();

app.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//to avoid cross origin requests errors
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, SECRET_KEY');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
  });

const findUserByEmail = (email) => {
    return database('users').where({email}).first();
}

const findUserById = (id) => {
    return database('users').where({id}).first();
}

const createUser = (user) => {
    return database("users").insert(user)
}

router.post('/register',  (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const salt = bcrypt.genSaltSync(10);
    const nonHash = req.body.password;
    const password = bcrypt.hashSync(nonHash, 10, salt);

    createUser({name, email, password}).then(id => {
        findUserById(id[0]).then(user => {
            return res.status(201).json({...user, message: 'User Created!'});
        })
    })
});

router.post('/login',  (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    findUserByEmail(email).then(user => {
        if (!user) return res.status(404).send('User not found!');
        
        const result = bcrypt.compareSync(password, user.password);
        if(!result) return res.status(401).send('Password not valid!');

        const expiresIn = 24 * 60 * 60; 
        const accessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: expiresIn
        }); 

        return res.status(201).json({ "user": user, "access_token": accessToken, "expires_in": expiresIn, message: 'Logged In!'});
    });
});

router.get('/',  (req, res) => {
    res.status(200).send('This is an authentication server');
});

app.use(router);
const port =  process.env.PORT  ||  3000;
app.listen(port, () => {
	console.log('Server listening at http://localhost:'  +  port);
}); 