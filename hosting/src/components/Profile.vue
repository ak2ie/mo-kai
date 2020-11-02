<template>
  <v-main>
    <v-container fluid>
      <v-row class="" justify="center" no-gutters>
        <v-col sm="6">
          <h3 class="mb-5">プロフィール</h3>
          <v-btn
            color="red darken-4 white--text"
            block
            @click.stop="deleteDialog = true"
            >退会</v-btn
          >
          <!-- 削除確認ダイアログ -->
          <v-dialog
            v-model="deleteDialog"
            max-width="290"
            :persistent="isLoading"
          >
            <v-card>
              <v-card-subtitle></v-card-subtitle>
              <v-card-text>
                <div v-if="!isLoading">
                  消耗品の登録内容を元に戻すことはできません。<br />
                  本当に退会してよろしいですか？
                </div>
                <div v-else class="text-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    class="mb-4"
                  ></v-progress-circular
                  ><br />
                  Loading...
                </div>
              </v-card-text>

              <v-card-actions v-if="!isLoading">
                <v-spacer></v-spacer>

                <v-btn
                  color="green darken-1"
                  text
                  @click="deleteDialog = false"
                >
                  キャンセル
                </v-btn>

                <v-btn color="red text--darken-4" text @click="deleteUser">
                  退会
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import API from "../api/index";

export default {
  name: "Profile",
  data() {
    return {
      deleteDialog: false,
      isLoading: false,
    };
  },
  mounted: async function() {},
  methods: {
    deleteUser: async function() {
      const api = await API();
      await api.get("/user/delete");
      this.deleteDialog = false;
      this.$router.push({ name: "Logout" });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
