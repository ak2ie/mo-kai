<template>
  <v-content>
    <v-container fluid class="fill-height mt-5">
      <v-row justify="center" align="center">
        <v-col class="text-center">
          <v-progress-circular
            :indeterminate="true"
            size="40"
            color="success"
          ></v-progress-circular
          ><br /><br />
          Loading...
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
export default {
  name: "Logining",
  data() {
    return {};
  },
  mounted: function() {
    // ログイン画面
    this.$store.watch(
      (state, getters) => {
        return getters.isSignedIn;
      },
      (isSignedIn, oldVal) => {
        if (isSignedIn) {
          // ログイン中または、ログイン後にリダイレクトされた場合
          const toPath = this.$route.query.redirect
            ? this.$route.query.redirect
            : { name: "Home" };
          this.$router.push(toPath);
        }
      }
    );
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
