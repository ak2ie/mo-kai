import * as functions from "firebase-functions";
// import * as cors from "cors";
const axios = require("axios");
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

/* --------------------------------------------------------
 *  Discord Bot
 * -------------------------------------------------------- */
// Glitchで利用中のDiscord Botを常時起動させる
exports.scheduledFunction = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(() => {
    axios
      .get("https://uttermost-aged-armadillo.glitch.me/keep-a-live")
      .then(() => {
        return null;
      });
  });

exports.app = functions.region("asia-northeast1").https.onRequest(app);
