<template>
  <v-main>
    <v-container fluid>
      <v-row class="" justify="center" no-gutters>
        <v-col sm="6">
          <div v-show="!isLoading">
            <v-form v-model="formValid">
              <v-text-field
                v-model="item.name"
                label="品名"
                :rules="[rules.required]"
                prepend-icon="mdi-note"
              ></v-text-field>
              <v-menu
                v-model="menu2"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="item.lastBuyDate"
                    label="購入日"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="item.lastBuyDate"
                  @input="menu2 = false"
                  :max="new Date().toISOString()"
                  no-title
                ></v-date-picker>
              </v-menu>
              <v-text-field
                label="購入間隔"
                suffix="ヶ月"
                :rules="[rules.greaterThan0]"
                prepend-icon="mdi-refresh-circle"
                v-model="item.buyInterval"
              ></v-text-field>
              <v-combobox
                label="カテゴリー"
                persistent-hint
                prepend-icon="mdi-label"
                :items="categories"
                v-model="item.categoryName"
              ></v-combobox>
              <v-btn
                color="light-green darken-3"
                class="white--text mt-5"
                block
                @click="updateItem"
                :disabled="!formValid || isUpdating"
                :loading="isUpdating"
                ><v-icon left>mdi-checkbox-marked-circle-outline</v-icon
                >登録</v-btn
              >
              <v-btn
                color="red darken-4"
                class="white--text mt-5"
                block
                @click.stop="deleteDialog = true"
                :disabled="isUpdating"
                ><v-icon left>mdi-delete-forever-outline</v-icon>削除</v-btn
              >
            </v-form>
          </div>
          <!-- ローディング画面 -->
          <div v-show="isLoading"><v-icon>mdi-cached</v-icon> Loading...</div>
          <!-- 削除確認ダイアログ -->
          <v-dialog v-model="deleteDialog" max-width="290">
            <v-card>
              <v-card-subtitle></v-card-subtitle>
              <v-card-text> 削除してよろしいですか？ </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                  color="green darken-1"
                  text
                  @click="deleteDialog = false"
                >
                  キャンセル
                </v-btn>

                <v-btn color="red text--darken-4" text @click="deleteItem">
                  削除
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar" :multi-line="true" top>
        {{ message }}
        <v-btn color="red" text @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
    </v-container>
  </v-main>
</template>

<script>
import API from "../api/index";

export default {
  name: "EditItem",
  data() {
    return {
      item: {
        id: 0,
        name: "",
        buyInterval: 1,
        lastBuyDate: "",
        isChecked: false,
        categoryName: "",
      },
      rules: {
        required: (value) => !!value || "文字を入力してください",
        greaterThan0: (value) => {
          if (value > 0 && value.toString() === Number(value).toString()) {
            return true;
          } else {
            return "0より大きい値を入力してください";
          }
        },
      },
      menu2: false,
      snackbar: false,
      message: "",
      formValid: false,
      isLoading: true,
      deleteDialog: false,
      isUpdating: false,
      categories: [],
    };
  },
  props: {
    id: Number,
  },
  mounted: async function () {
    // const api = await API();
    // try {
    //   const result = await api.get("/items/get?id=" + this.id);
    //   this.$set(this.item, "id", result.data[0].Id);
    //   this.$set(this.item, "name", result.data[0].Name);
    //   this.$set(this.item, "buyInterval", Number(result.data[0].BuyInterval));
    //   this.$set(
    //     this.item,
    //     "lastBuyDate",
    //     new Date(result.data[0].LastBuyDate).toISOString().substr(0, 10)
    //   );
    //   this.isLoading = false;
    // } catch (e) {
    //   this.$router.push("/home");
    // }
    if (!this.$store.getters.isInitialLoaded) {
      await this.$store.dispatch("updateItems");
    }
    const result = this.$store.getters.items.filter((x) => x.id === this.id);
    if (result) {
      this.$set(this.item, "id", result[0].id);
      this.$set(this.item, "name", result[0].name);
      this.$set(this.item, "buyInterval", Number(result[0].buyInterval));
      this.$set(
        this.item,
        "lastBuyDate",
        new Date(result[0].lastBuyDate).toISOString().substr(0, 10)
      );
      this.$set(this.item, "isChecked", result[0].name);
      this.$set(this.item, "categoryName", result[0].categoryName);
      this.isLoading = false;
    } else {
      this.$router.push({ name: "Home" });
    }

    const api = await API();
    const categoriesResponse = await api.get("/category/get");
    this.categories = categoriesResponse.data.categories;
  },
  methods: {
    updateItem: async function () {
      this.isUpdating = true;
      const api = await API();
      await api.post("/items/update?id=" + this.item.id, {
        Id: this.item.id,
        Name: this.item.name,
        LastBuyDate: new Date(this.item.lastBuyDate).toISOString(),
        BuyInterval: Number(this.item.buyInterval),
        IsChecked: this.item.isChecked,
        CategoryName: this.item.categoryName,
      });
      await this.$store.dispatch("updateItems");
      this.$router.push({ name: "Home", params: { is_submit: true } });
    },
    deleteItem: async function () {
      const api = await API();
      await api.get("/items/delete?id=" + this.item.id);
      this.deleteDialog = false;
      await this.$store.dispatch("updateItems");
      this.$router.push({ name: "Home", params: { is_submit: true } });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
