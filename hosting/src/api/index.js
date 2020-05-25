import axios from "axios";
import firebase from "firebase/app";
import "firebase/auth";

export default async () => {
  try {
    const idToken = await firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true);
    return axios.create({
      baseURL: process.env.API_BASEURL,
      headers: {
        Authorization: idToken
      }
    });
  } catch (error) {
    // Handle error
  }
};
