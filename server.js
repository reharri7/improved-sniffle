const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const enforce = require('express-sslify');
const firebase = require('firebase');
const { nanoid } = require('nanoid');
const increment = firebase.firestore.FieldValue.increment(1);

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

// Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId 
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const urlCollection = 'urls';


const app = express();
const port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
    res.render('index');
});

app.post('/create', async (req, res) => {
    try{
         urlWithProtocol  = req.body.url;
         var url = urlWithProtocol.replace(/^https?\:\/\//i, "");
         code = nanoid(10);
         console.log(`${ url } points to http://localhost:3001/to/${ code }`);
         await db.collection(urlCollection).add({
             "url": url,
             "code": code,
             "timesVisited": 0,
             "dateCreated": new Date()
         });
         res.status(201).render('create', { code: code, url: url });

    }
    catch(err){
        res.status(400);
    }
});

app.get('/to/:code', async (req, res) => {
    const code = req.params.code;
    const query = await db.collection(urlCollection).where("code", "==", code);

    query.onSnapshot((data) => {
        if(data.empty) {
            //TODO: Change this to  a 404 with a 404 page. "We couldn't find the page you were looking for"
            res.status(301).redirect('/');
            console.log("Nothing was found");
            return
        }
        let url = data.docs[0].data().url;
        res.status(301).redirect(`https://${ url }`);
        
    });
    
});

app.listen(port, error => {
    if(error) throw error;
    console.log('Server is running on port ' + port);
});