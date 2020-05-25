import * as functions from "firebase-functions";
// import * as cors from "cors";

// import * as admin from "firebase-admin";
const app = require("./App");

/* --------------------------------------------------------
 *  Firebase初期化
 * -------------------------------------------------------- */
// var firebaseConfig = {
//     apiKey: "AIzaSyCTuwMT6zj3QYxoTAS5XLkIAVTeh2fRXDk",
//     authDomain: "itscow-a199a.firebaseapp.com",
//     databaseURL: "https://itscow-a199a.firebaseio.com",
//     messagingSenderId: "697735106683",
//     projectId: "itscow-a199a",
//     storageBucket: "itscow-a199a.appspot.com",
// };

// admin.initializeApp();

/* --------------------------------------------------------
 *  Express
 * -------------------------------------------------------- */
// app.use(cors());

exports.app = functions.region("asia-northeast1").https.onRequest(app);
