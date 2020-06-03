import Vue from "vue";
import Vuex from "vuex";
import API from "@/api/index";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    /**
     * 全消耗品
     */
    items: [],
    /**
     * ユーザー情報
     */
    user: {},
    /**
     * ログイン状態
     */
    loginStatus: "logout",
    /**
     * 初回ロード済か
     */
    initialLoaded: false,
  },
  getters: {
    items(state) {
      return state.items;
    },
    user(state) {
      return state.user;
    },
    isSignedIn(state) {
      return state.loginStatus === "login";
    },
    isSigning(state) {
      return state.loginStatus === "logining";
    },
    isInitialLoaded(state) {
      return state.initialLoaded;
    },
  },
  mutations: {
    /**
     * 消耗品
     * @param {*} state
     * @param {*} payload
     */
    itemsType(state, payload) {
      state.items = payload;
    },
    onAuthStateChanged(state, user) {
      state.user = user;
    },
    onUserStatusChanged(state, loginStatus) {
      state.loginStatus = loginStatus ? "login" : "logout";
    },
    initialLoaded(state, payload) {
      state.initialLoaded = payload;
    },
    onUserLogining(state, payload) {
      state.loginStatus = payload;
    },
  },
  actions: {
    async updateItems({ commit }) {
      const api = await API();
      const result = await api.get("/items/get");
      const items = result.data.map((x) => {
        return {
          id: x.Id,
          name: x.Name,
          buyInterval: x.BuyInterval,
          lastBuyDate: x.LastBuyDate,
        };
      });
      commit("itemsType", items);
    },
    initialLoaded({ commit }, payload) {
      commit("initialLoaded", payload);
    },
  },
  plugins: [createPersistedState({ storage: window.sessionStorage })],
});

export default store;
