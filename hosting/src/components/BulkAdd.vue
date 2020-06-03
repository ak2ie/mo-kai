<template>
  <v-content>
    <v-container fluid>
      <v-row class="" justify="center" no-gutters>
        <v-col sm="6">
          <p>
            ご登録ありがとうございます。<br />
            はじめに、よく使う消耗品を登録しましょう。
          </p>
          <v-form v-model="formValid">
            <!-- 消耗品リスト -->
            <v-checkbox
              v-for="(item, i) in items"
              :key="i"
              :label="item.name"
              v-model="item.checked"
              hide-details
              color="primary"
            ></v-checkbox>
            <!-- 購入日 -->
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
                  v-model="lastBuyDate"
                  label="購入日"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  class="mt-6"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="lastBuyDate"
                @input="menu2 = false"
                :max="new Date().toISOString()"
                no-title
              ></v-date-picker>
            </v-menu>
            <!-- 購入間隔 -->
            <v-text-field
              label="購入間隔"
              suffix="ヶ月"
              :rules="[rules.greaterThan0]"
              prepend-icon="mdi-refresh-circle"
              v-model="buyInterval"
            ></v-text-field>
            <!-- 登録ボタン -->
            <v-btn
              color="primary"
              class="white--text mt-5"
              block
              @click="regist"
              :disabled="!formValid"
              >登録</v-btn
            >
          </v-form>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar" :multi-line="true" top>
        {{ message }}
        <v-btn color="red" text @click="snackbar = false">
          Close
        </v-btn>
      </v-snackbar>
    </v-container>
  </v-content>
</template>

<script>
import API from "../api/index";

export default {
  name: "BulkAdd",
  data() {
    return {
      /**
       * 一括追加する消耗品
       */
      items: [
        {
          id: 0,
          name: "シャンプー",
          buyInterval: 1,
          lastBuyDate: "",
          checked: true,
        },
        {
          id: 0,
          name: "リンス",
          buyInterval: 1,
          lastBuyDate: "",
          checked: true,
        },
        {
          id: 0,
          name: "洗剤",
          buyInterval: 1,
          lastBuyDate: "",
          checked: true,
        },
      ],
      lastBuyDate: "",
      buyInterval: 1,
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
    };
  },
  mounted: function() {
    // 前回購入日はデフォルトで当日とする
    this.lastBuyDate = new Date().toISOString().slice(0, 10);
  },
  methods: {
    /**
     * 一括登録
     */
    regist: async function() {
      // 一括登録する消耗品

      let items = this.items.filter((item) => item.checked);
      items = items.map((item) => ({
        Name: item.name,
        LastBuyDate: new Date(this.lastBuyDate).toISOString(),
        BuyInterval: Number(this.buyInterval),
      }));
      const api = await API();
      await api.post("/items/add", {
        Items: items,
      });
      await this.$store.dispatch("updateItems");
      this.$router.push({ name: "Home", params: { is_submit: true } });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
