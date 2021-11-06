<template>
  <VMain>
    <v-container fluid>
      <v-row justify="center" no-gutters>
        <v-col sm="6">
          <v-list two-line subheader v-show="!isLoading">
            <v-subheader
              >消耗品<v-spacer></v-spacer
              ><v-checkbox
                label="表示切替"
                @change="toggleCheckbox"
                class="mr-10"
              ></v-checkbox
              ><v-btn-toggle rounded dense
                ><v-btn @click="filterList" width="150"
                  ><v-icon>mdi-filter</v-icon
                  ><span v-if="isFiltered">チェックのみ</span
                  ><span v-else>全表示</span></v-btn
                ></v-btn-toggle
              ></v-subheader
            >
            <div v-for="item in items" :key="item.id">
              <v-list-item>
                <v-list-item-action>
                  <v-checkbox
                    v-show="isDisplayCheckbox"
                    v-model="item.isChecked"
                    @change="updateItemCheckbox(item.id)"
                  ></v-checkbox>
                </v-list-item-action>
                <v-list-item-content
                  @click="moveToEdit('/edit/' + item.id)"
                  class="list-item"
                >
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <!-- <v-list-item-subtitle>{{
                    item.lastBuyDate | humanizeTime(item.buyInterval)
                  }}</v-list-item-subtitle> -->
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text>
                    {{ item.lastBuyDate | humanizeTime(item.buyInterval) }}
                  </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </v-list>
          <div v-show="isLoading" class="text-center">
            <v-progress-circular
              :indeterminate="true"
              size="40"
              color="primary"
            ></v-progress-circular
            ><br /><br />
            Loading...
          </div>
          <v-btn
            fixed
            dark
            fab
            bottom
            right
            color="light-green darken-1"
            to="/add"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar" :multi-line="true" top>
        {{ message }}
        <v-btn color="red" text @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
    </v-container>
  </VMain>
</template>

<script>
import API from "@/api/index";
import * as moment from "moment";
import * as firebase from "firebase/app";
import "firebase/auth";

export default {
  name: "Home",
  data() {
    return {
      items: [
        {
          id: 0,
          name: "",
          buyInterval: 0,
          lastBuyDate: "",
          isChecked: false,
        },
      ],
      isLoading: true,
      snackbar: false,
      message: "登録完了しました",
      isDisplayCheckbox: false,
      isFiltered: false,
    };
  },
  filters: {
    humanizeTime: function (lastBuyDate, buyInterval) {
      const nextBuyDate = moment(lastBuyDate).add(buyInterval, "months");
      const remain = moment.duration(nextBuyDate.diff(new Date()));
      if (nextBuyDate >= moment()) {
        return "あと " + remain.locale("ja").humanize();
      } else if (nextBuyDate.isSame(moment(), "day")) {
        return "今日が買い時！";
      } else {
        return "買い時を過ぎています";
      }
    },
  },
  computed: {
    sortedItem: function () {
      return this.items
        .slice(0)
        .sort(
          (x, y) =>
            moment(x.lastBuyDate).add(x.buyInterval, "months") -
            moment(y.lastBuyDate).add(y.buyInterval, "months")
        );
    },
  },
  mounted: async function () {
    if (!this.$store.getters.isInitialLoaded) {
      // 初回ロード
      const api = await API();
      const userData = await api.get("/user/get");
      if (userData.data.isNew) {
        const result = await firebase.auth().getRedirectResult();
        await api.post("/user/add", {
          userId: result.additionalUserInfo.username,
        });
        this.$router.push("/intro");
        return;
      }
      await this.$store.dispatch("updateItems");
      this.items = this.$store.getters.items;
      this.isLoading = false;

      this.$store.dispatch("initialLoaded", true);
    } else {
      // 2回目以降ロード時
      this.items = this.$store.getters.items;
      this.isLoading = false;
    }
    this.itemsForDisplay = this.items;
  },
  methods: {
    /**
     * 消耗品編集ページへ遷移
     * @params link {string} 遷移先URL
     */
    moveToEdit(link) {
      this.$router.push(link);
    },
    /**
     * チェックボックス表示切り替え
     */
    toggleCheckbox() {
      if (this.isDisplayCheckbox) {
        this.isDisplayCheckbox = false;
      } else {
        this.isDisplayCheckbox = true;
      }
    },
    /**
     * 消耗品をフィルター表示
     */
    filterList() {
      if (this.isFiltered) {
        this.items = this.$store.getters.items;
        this.isFiltered = false;
      } else {
        this.items = this.items.filter((item) => item.isChecked);
        this.isFiltered = true;
      }
    },
    /**
     * チェックボックス選択状態を保存
     * @param {Number} id 消耗品ID
     */
    updateItemCheckbox() {
      // this.items = this.items.map((item, index) => {
      //   if (item.id === id) {
      //     this.$set(this.items, index, {
      //       id: item.id,
      //       name: item.name,
      //       buyInterval: item.buyInterval,
      //       lastBuyDate: item.lastBuyDate,
      //       isChecked: !item.isChecked,
      //     });
      //     item["isChecked"] = false;
      //   }
      //   return item;
      // });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.list-item {
  cursor: pointer;
}
#toggle-display-checkbox {
  margin-right: 100px;
}
</style>
