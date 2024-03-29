import firebase from "@firebase/app";
import "@firebase/auth";
import "@firebase/analytics";
import "@firebase/functions";
import "@firebase/firestore";
import store from "./store";

const config = {
  apiKey: "AIzaSyCWh2QZlHcH-1k1JjUN62JkEIpKlOL3nVk",
  authDomain: "mo-kai.firebaseapp.com",
  databaseURL: "https://mo-kai.firebaseio.com",
  messagingSenderId: "458970012504",
  projectId: "mo-kai",
  storageBucket: "mo-kai.appspot.com",
  appId: "1:458970012504:web:895db70c22ae835a34232d",
  measurementId: "G-Z22RLF287T",
};

export default {
  init() {
    firebase.initializeApp(config);

    const isEmulating = window.location.hostname === "localhost";
    if (isEmulating) {
      firebase.functions().useEmulator("localhost", 5001);
      firebase.firestore().useEmulator("localhost", 8080);
      firebase.auth().useEmulator("http://localhost:9099");
    }

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    firebase.analytics();
  },
  async login() {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().useDeviceLanguage();
    await firebase.auth().signInWithRedirect(provider);
  },
  async logout() {
    await firebase.auth().signOut();
  },
  onAuth() {
    firebase.auth().onAuthStateChanged((user) => {
      user = user ? user : {};
      store.commit("onAuthStateChanged", user);
      store.commit("onUserStatusChanged", user.uid ? true : false);
    });
  },
};
