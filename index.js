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
router.use(bodyParser.urlencoded({ extended: true }));


//to avoid cross origin requests errors
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, process.env.SECRET_KEY');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
  });

const findUserByEmail = (email) => {
    return database('users').where({email}).first();
}

const findUserById = (id) => {
    return database('users').where({id}).first();
}

const createUser = (user) => {
    return database("users").insert(user);
}

const getUserSites = async (email) => {
    try {
        const res = await findUserByEmail(email);
        // console.log(res.sites);
        return res.sites
    }
    catch (err) {
        console.log(err);
    }
}

const addSites = (sites, email) => {
    
    getUserSites(email).then(res => {
        const oldSites = res;
        const splitOld = oldSites.split(',');
        let preSplit = [];
        splitOld.map((element) => {
            preSplit.push(element.trim());
        })
        preSplit.push(sites);
        let splitReturn = preSplit.join(',');
        return database("users").where("sites", '=', email).update({sites: splitReturn});
    })
    .catch(err => {console.log(err)})
}

// router.post('/', (req, res) => {
//     // console.log(req.body);
//     getUserSites(req.body.email)
//     .then(promResponse => {
//         if (!promResponse) {
//             return res.status(500).json({ message: 'DB Error.' });
//         }
//         //Edit to return sites for side menu
//         let newSiteArray = promResponse.split(',');
//         let trimmedArr = []
//         newSiteArray.map(element => {
//             trimmedArr.push(element.trim());
//         })
//         return res.status(201).json({sites:  trimmedArr});
//     })
// })

// router.post('/profile', (req, res) => {
//     // return {message: 'This route works.'};
//     const sites = req.body.sites;
//     const email = req.body.email;
//     // Promise error
//     addSites(sites, email)
//     .then(response => {
//         return res.status(201).json({message: response});
//     })
//     .catch(err => {console.log(err)})
// })

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

router.get('/login', (req, res) => {
    res.status(200).send('Login route works.');
})

app.use(router);
const port =  process.env.PORT  ||  3000;
app.listen(port, () => {
	console.log('Server listening at http://localhost:'  +  port);
}); 