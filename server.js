const express = require('express');
//const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const enforce = require('express-sslify');
const firebase = require('firebase');
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

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cors());

if(process.env.NODE_ENV === 'production') {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
    });
}

app.get('/:code', async (req, res) => {
    const code = req.params.code;
    const query = await db.collection(urlCollection).where("code", "==", code);
    query.onSnapshot((data) => {
        if(data.empty) {
            res.status(301).redirect('/');
            console.log("Nothing was found");
            return
        }
        let url = data.docs[0].data().url;
        console.log(url);
        res.status(301).redirect(`https://${ url }`);
    });
});

// app.post('/create', (req, res) => {

// });

app.listen(port, error => {
    if(error) throw error;
    console.log('Server is running on port ' + port);
});