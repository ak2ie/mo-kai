import Api from "./index";

export default {
  testPosting() {
    const item = { text: "Success!" };
    return Api().post("/test", item);
  }
};
