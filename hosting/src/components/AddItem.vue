<template>
  <v-content>
    <v-container fluid>
      <v-row class="" justify="center" no-gutters>
        <v-col sm="6">
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
            <v-btn
              color="light-green darken-3"
              class="white--text mt-5"
              block
              @click="regist"
              :disabled="!formValid || isAdding"
              :loading="isAdding"
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
import * as firebase from "firebase/app";
import "firebase/auth";
import API from "../api/index";

export default {
  name: "AddItem",
  data() {
    return {
      item: {
        id: 0,
        name: "",
        buyInterval: 1,
        lastBuyDate: ""
      },
      rules: {
        required: value => !!value || "文字を入力してください",
        greaterThan0: value => {
          if (value > 0 && value.toString() === Number(value).toString()) {
            return true;
          } else {
            return "0より大きい値を入力してください";
          }
        }
      },
      menu2: false,
      snackbar: false,
      message: "",
      formValid: false,
      isAdding: false
    };
  },
  methods: {
    regist: async function() {
      this.isAdding = true;
      const api = await API();
      await api.post("/items/add", {
        Items: [
          {
            Name: this.item.name,
            LastBuyDate: new Date(this.item.lastBuyDate).toISOString(),
            BuyInterval: Number(this.item.buyInterval)
          }
        ]
      });
      await this.$store.dispatch("updateItems");
      this.$router.push({ name: "Home", params: { is_submit: true } });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
