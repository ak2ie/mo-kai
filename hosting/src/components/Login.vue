<template>
  <v-content>
    <v-container fluid class="fill-height mt-5">
      <!-- ログイン画面 -->
      <v-row v-if="!isLogining">
        <v-col>
          <v-row justify="center" align="center">
            <v-col class="text-center">
              <p>
                「もーかい」はtwitterアカウントでご利用頂けます。<br />
                ログインしても、<span class="primary--text font-weight-bold"
                  >ツイートやDMは送りません</span
                >のでご安心ください。
              </p>
              <v-btn
                color="#1DA1F2"
                class="white--text mt-5 mb-5"
                @click="login"
                ><v-icon class="pr-2">mdi-twitter</v-icon>ログイン</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- ログイン処理中画面 -->
      <v-row justify="center" align="center" v-else>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            :indeterminate="true"
            size="40"
            color="primary"
          ></v-progress-circular
          ><br /><br />
          Loading...
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
// import * as firebase from "firebase/app";
// import "firebase/auth";

import Firebase from "@/firebase.js";

export default {
  name: "Login",
  data: () => ({}),
  computed: {
    /**
     * ログイン処理中
     */
    isLogining() {
      return this.$store.getters.isSigning;
    },
  },
  mounted: function() {
    if (this.$store.getters.isSignedIn) {
      // ログイン中または、ログイン後にリダイレクトされた場合
      const toPath = this.$route.query.redirect
        ? this.$route.query.redirect
        : { name: "Home" };
      this.$router.push(toPath);
    } else {
      this.$store.watch(
        (state, getters) => {
          return getters.isSignedIn;
        },
        (isSignedIn) => {
          if (isSignedIn) {
            // ログイン中または、ログイン後にリダイレクトされた場合
            const toPath = this.$route.query.redirect
              ? this.$route.query.redirect
              : { name: "Home" };
            this.$router.push(toPath);
          }
        }
      );
    }
  },
  methods: {
    async login() {
      this.$store.commit("onUserLogining", "logining");
      await Firebase.login();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
