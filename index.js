"use strict";
const  express  =  require('express');
const  bodyParser  =  require('body-parser');

const  app  =  express();
const  router  =  express.Router();

router.use(bodyParser.urlencoded({ extended:  false }));
router.use(bodyParser.json());

router.post('/register', (req, res) => {
    res.status(200).send({ access_token:  '' });
});

router.post('/login', (req, res) => {
    res.status(200).send({ access_token:  '' });
});

app.use(router);
const  port  =  process.env.PORT  ||  3000;
const  server  =  app.listen(port, () => {
    console.log('Server listening on port '  +  port);
}); 