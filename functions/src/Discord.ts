const axios = require("axios");

export class Discord {
  static API_URL = "https://uttermost-aged-armadillo.glitch.me";

  public static async SendMessage() {
    await axios.post(Discord.API_URL + "/api/new-user", {
      authKey: "test",
    });
  }
}
