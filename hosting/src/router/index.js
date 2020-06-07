import Vue from "vue";
import Router from "vue-router";
import HelloWorld from "@/components/HelloWorld";
import Home from "@/components/Home";
import Login from "@/components/Login";
import EditItem from "@/components/EditItem";
import AddItem from "@/components/AddItem";
import BulkAdd from "@/components/BulkAdd";
import Logout from "@/components/Logout";
import Introduction from "@/components/Introduction";
import Profile from "@/components/Profile";

import store from "@/store";
// import firebase from "firebase/app";
// import "firebase/auth";

Vue.use(Router);

var router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "HelloWorld",
      component: HelloWorld,
      meta: { isPublic: true },
    },
    {
      path: "/home",
      name: "Home",
      component: Home,
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { isPublic: true },
      props: true,
    },
    {
      path: "/edit/:id",
      name: "EditItem",
      component: EditItem,
      props: (route) => ({ id: Number(route.params.id) }),
    },
    {
      path: "/add",
      name: "AddItem",
      component: AddItem,
    },
    {
      path: "/logout",
      name: "Logout",
      component: Logout,
      meta: { isPublic: true }, // 認証後に遷移するとログアウトされてしまい意味が無い。Component内で遷移先判定
    },
    {
      path: "/bulkadd",
      name: "BulkAdd",
      component: BulkAdd,
    },
    {
      path: "/intro",
      name: "Introduction",
      component: Introduction,
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
    },
    {
      path: "*",
      redirect: { name: "HelloWorld" },
    },
  ],
});

// ページ表示時にログイン要否を判断
router.beforeEach((to, from, next) => {
  // 閲覧時のログイン要否
  let isPublic = to.matched.some((record) => record.meta.isPublic);

  // if (isPublic) {
  //   // ログイン不要ページ
  //   if (to.name !== "Login") {
  //     // ログイン画面以外
  //     next();
  //   } else {
  //     // ログイン画面
  //     firebase.auth().onAuthStateChanged(function(user) {
  //       if (user) {
  //         // ログイン後リダイレクト
  //         if (to.query.redirect) {
  //           next(to.query.redirect);
  //         } else {
  //           next({ name: "Home" });
  //         }
  //       } else {
  //         // 未ログインならログイン画面を表示
  //         next();
  //       }
  //     });
  //   }
  // } else {
  //   // ログイン必須ページ
  //   firebase.auth().onAuthStateChanged(function(user) {
  //     if (user) {
  //       // ログイン中
  //       next();
  //     } else {
  //       console.log("未ログインのためリダイレクト");
  //       // 未ログインの場合はログインページへ遷移
  //       next({
  //         path: "/login",
  //         query: { redirect: to.fullPath }
  //       });
  //     }
  //   });
  // }

  // firebase.auth().onAuthStateChanged(function(user) {
  //   if (isPublic) {
  //     // ログイン不要ページ
  //     if (to.name !== "Login") {
  //       // ログイン画面以外
  //       next();
  //     } else {
  //       // ログイン画面
  //       if (user) {
  //         // ログイン中または、ログイン後にリダイレクトされた場合
  //         const toPath = to.query.redirect
  //           ? to.query.redirect
  //           : { name: "Home" };
  //         next(toPath);
  //       } else {
  //         // 未ログインならログイン画面を表示
  //         next();
  //       }
  //     }
  //   } else {
  //     if (user) {
  //       // ログイン中
  //       next();
  //     } else {
  //       if (to.name !== "Logout") {
  //         // 未ログインの場合はログインページへ遷移
  //         next({
  //           path: "/login",
  //           query: { redirect: to.fullPath }
  //         });
  //       } else {
  //         // ログアウト後はトップページに遷移
  //         next({ name: "HelloWorld" });
  //       }
  //     }
  //   }
  // });

  // firebase.auth().onAuthStateChanged(function(user) {
  // store.watch(
  //   (state, getters) => {
  //     return getters.isSignedIn;
  //   },
  //   (newVal, oldVal) => {
  if (isPublic) {
    // ログイン不要ページ
    next();
    // if (to.name !== "Logining") {
    //   // ログイン画面以外
    //   next();
    // } else {
    //   next();
    // }
  } else {
    // 認証必要ページ
    if (store.getters.isSignedIn) {
      // ログイン中
      next();
    } else {
      // if (to.name !== "Logout") {
      // 未ログインの場合はログインページへ遷移
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      // } else {
      //   // ログアウト後はトップページに遷移
      //   next({ name: "HelloWorld" });
      // }
    }
  }
  // }
  // );
  // });
});

export default router;
