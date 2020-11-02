<template>
  <v-main>
    <v-container fluid class="fill-height mt-5">
      <v-row justify="center" align="center">
        <v-col cols="12" class="text-center">
          <!-- ログアウト処理のみを行うので、常にLoading画面 -->
          <v-progress-circular
            :indeterminate="true"
            size="40"
            color="primary"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import Firebase from "@/firebase.js";

export default {
  name: "Logout",
  data() {
    return {};
  },
  computed: {},
  mounted: async function() {
    if (this.$store.getters.isSignedIn) {
      this.$store.dispatch("deleteData");
      await Firebase.logout();
    }
    this.$router.push({ name: "HelloWorld" });
  },
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
