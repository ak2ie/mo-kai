<template>
  <v-app>
    <div id="app">
      <v-app-bar
        dense
        :app="true"
        class="white--text"
        color="light-green darken-3"
      >
        <v-toolbar-title @click="GoHome()" class="title ml-5"
          ><v-img :src="require('@/assets/logo_mokai.png')"></v-img
        ></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu left bottom offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" v-show="isLogined">
              <v-icon color="white">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-if="userStatus" @click="logout">
              <v-list-item-title>ログアウト</v-list-item-title>
            </v-list-item>
            <v-list-item v-else @click="login">
              <v-list-item-title>ログイン</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>
      <router-view class="content" />

      <v-footer padless absolute color="grey darken-4">
        <v-row no-gutters justify="center">
          <v-btn text rounded color="white" class="mt-1 mb-1">
            <a
              target="_blank"
              rel="noopener"
              class="white--text"
              href="https://docs.google.com/forms/d/e/1FAIpQLSevxEsKlJ37n_u5AGgebcklk-G0n4NA0EVre4TE6ZHWJ8Agrg/viewform"
              >お問い合わせ</a
            >
          </v-btn>
          <v-col
            cols="12"
            class="grey darken-3 text-center designed-by pt-1 pb-1"
          >
            <!--/* This template is free as long as you keep the footer attribution link. If you'd like to use the template without the attribution link, you can buy the commercial license via our website: themes.3rdwavemedia.com Thank you for your support. :) */-->
            <small class="copyright caption"
              >Designed with <v-icon class="heart-icon">mdi-heart</v-icon> by
              <a href="https://themes.3rdwavemedia.com/" target="_blank"
                >Xiaoying Riley</a
              >
              for developers</small
            >
          </v-col>
          <!--//container-->
        </v-row>
      </v-footer>
    </div>
  </v-app>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/auth";
import Firebase from "@/firebase";

export default {
  name: "App",
  data: () => ({
    drawer: null,
    isLogined: true
  }),
  mounted: () => {
    this.drawer = false;
    const _this = this;
    firebase
      .auth()
      .onAuthStateChanged(function(user) {
        // console.log("ログイン状態:", user ? true : false);
        _this.isLogined = user ? true : false;
      })
      .bind(this);
  },
  created: function() {
    Firebase.onAuth();
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    userStatus() {
      // ログインするとtrue
      return this.$store.getters.isSignedIn;
    }
  },
  methods: {
    logout: async function() {
      // await firebase.auth().signOut();
      // await Firebase.logout();
      // 順番に注意：遷移前にログアウトすると、vue-routerによりリダイレクトされてしまう
      this.$router.push({ name: "Logout" });
    },
    login: async function() {
      this.$router.push({ name: "Login" });
    },
    GoHome: function() {
      if (this.$store.getters.isSignedIn) {
        if (this.$route.name !== "Home") {
          this.$router.push({ name: "Home" });
        }
      } else {
        if (this.$route.name !== "HelloWorld") {
          this.$router.push({ name: "HelloWorld" });
        }
      }
    }
  }
};
</script>

<style scoped>
#app {
  font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN",
    "Hiragino Sans", Meiryo, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

a {
  text-decoration: none !important;
}

.title {
  cursor: pointer;
}

.content {
  margin-bottom: 80px;
}

.designed-by {
  /* background-color: #26282c; */
  color: rgba(255, 255, 255, 0.6);
}

.heart-icon {
  color: indianred;
}

.designed-by a {
  color: #40babd;
}
</style>
