<template>
  <VMain>
    <v-container fluid>
      <v-row justify="center" no-gutters>
        <v-col sm="6">
          <div class="d-flex flex-column flex-md-row">
            <v-col class="align-self-center">消耗品</v-col>
            <v-col class="pa-0">
              <div class="d-flex align-self-center justify-end">
                <v-checkbox
                  label="表示切替"
                  @change="isDisplayCheckbox = !isDisplayCheckbox"
                  class="mr-10 toggle-checkbox"
                ></v-checkbox
                ><v-btn-toggle rounded dense class="d-flex align-self-center"
                  ><v-btn @click="filterList" width="150"
                    ><v-icon>mdi-filter</v-icon
                    ><span v-if="isFiltered">チェックのみ</span
                    ><span v-else>全表示</span></v-btn
                  ></v-btn-toggle
                >
              </div>
            </v-col>
          </div>
          <v-list two-line subheader v-show="!isLoading">
            <div v-for="(category, index) in items" :key="index">
              <v-subheader>{{ category.categoryName }}</v-subheader>
              <v-list-item v-for="item in category.items" :key="item.id">
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
          <!-- 消耗品が無い場合 -->
          <div v-show="items.length == 0">表示対象の消耗品がありません。</div>
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
import firebase from "firebase/app";
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
          categoryName: "",
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
      this.items.splice(0);
      this.items.push(...this.$store.getters.items);
      this.isLoading = false;

      this.$store.dispatch("initialLoaded", true);
    } else {
      // 2回目以降ロード時
      this.items.splice(0);

      this.items.push(...this.$store.getters.items);
      this.isLoading = false;
    }

    this.Sort();
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
     * 消耗品をフィルター表示
     */
    filterList() {
      if (this.isFiltered) {
        // フィルター無効化
        this.isFiltered = false;
        // 全消耗品取得
        this.items.splice(0);
        this.items.push(...this.$store.getters.items);
        // ソート
        this.Sort();
      } else {
        // フィルター有効化
        const beforeCount = this.items.length;
        this.items.map((category) => {
          // カテゴリごとにチェック済項目を抽出
          const checkedItems = category.items.filter((item) => item.isChecked);

          if (checkedItems.length > 0) {
            // チェック済項目がある場合は、チェック済項目のみを残す
            this.items.push({
              categoryName: category.categoryName,
              items: checkedItems,
            });
          }
        });
        // フィルター有効化前に存在した項目を削除
        this.items.splice(0, beforeCount);

        this.isFiltered = true;
      }
    },
    /**
     * チェックボックス選択状態を保存
     * @param {Number} id 消耗品ID
     */
    async updateItemCheckbox(id) {
      const api = await API();
      let item = {};
      for (let i = 0; i < this.items.length; i++) {
        item = this.items[i].items.filter((x) => x.id === id);
        if (item.length > 0) {
          break;
        }
      }
      await api.post("/items/update?id=" + id, {
        Id: id,
        Name: item[0].name,
        LastBuyDate: new Date(item[0].lastBuyDate).toISOString(),
        BuyInterval: Number(item[0].buyInterval),
        IsChecked: item[0].isChecked,
        CategoryName: item[0].categoryName,
      });
      await this.$store.dispatch("updateItems");

      // 全消耗品取得
      this.items.splice(0);
      this.items.push(...this.$store.getters.items);
      // 再ソート
      this.Sort();
    },

    Sort() {
      this.SortByDate();
      this.SetCategory();
    },

    SortByDate() {
      this.items.sort(
        (x, y) =>
          moment(x.lastBuyDate).add(x.buyInterval, "months") -
          moment(y.lastBuyDate).add(y.buyInterval, "months")
      );
    },

    SetCategory() {
      let categorized = [];
      this.items.map((item) => {
        // カテゴリーが追加済か確認
        const categoryMatched = categorized.filter(
          (category) => item.categoryName === category.categoryName
        );
        if (categoryMatched.length > 0) {
          // カテゴリが存在する場合
          categorized.map((c) => {
            if (c.categoryName == item.categoryName) {
              c["items"].push(item);
            }
          });
        } else {
          // カテゴリが存在しない場合は作成して追加
          categorized.push({
            categoryName: item.categoryName,
            items: [item],
          });
        }
      });
      // カテゴリ名無しを「未分類」に設定
      categorized.map((category) => {
        if (category.categoryName === null) {
          category.categoryName = "未分類";
        }
      });
      categorized.sort();
      this.items.splice(0);
      this.items.push(...categorized);
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
.toggle-checkbox {
  min-width: 100px;
}
</style>
