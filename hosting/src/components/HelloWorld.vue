<template>
  <v-main>
    <v-container fluid class="pa-0">
      <v-row justify="center" no-gutters>
        <v-col>
          <v-carousel
            cycle
            :show-arrows="false"
            :hide-delimiters="true"
            interval="10000"
          >
            <v-carousel-item>
              <v-img
                :src="require('@/assets/hero-1.jpg')"
                position="top center"
                height="560"
              >
                <v-row justify="center">
                  <v-col md="7" cols="11" class="white--text mt-5">
                    <h2 class="title font-weight-bold">
                      「あっ、もう無い」が無くなります
                    </h2>
                    <p class="intro">
                      いつの間にか無くなってしまう、シャンプーや洗剤<br />
                      "もーかい"を使えば買い忘れが無くなります
                    </p>
                    <v-btn color="secondary" to="/login">使ってみる</v-btn>
                  </v-col>
                </v-row>
              </v-img>
            </v-carousel-item>
            <v-carousel-item>
              <v-img
                :src="require('@/assets/hero-2.jpg')"
                position="center center"
                height="560"
              >
                <v-row justify="center">
                  <v-col md="7" cols="11" class="white--text mt-5">
                    <h2 class="title font-weight-bold">
                      「洗剤まだあったかな？」 それ、いつでも分かります
                    </h2>
                    <p class="intro">
                      買い物に行ってから、無くなっていないか心配になる消耗品<br />
                      "もーかい"を使えば買い時が分かります
                    </p>
                    <v-btn color="secondary" to="/login">使ってみる</v-btn>
                  </v-col>
                </v-row>
              </v-img>
            </v-carousel-item>
            <v-carousel-item>
              <v-img
                :src="require('@/assets/hero-3.jpg')"
                position="center center"
                height="560"
              >
                <v-row justify="center" class="d-flex align-baseline">
                  <v-col md="7" cols="11" class="white--text mt-5">
                    <h2 class="title font-weight-bold">
                      「今日買う物は、これとこれ！」
                    </h2>
                    <p class="intro">
                      出かける前に買う物を、いちいちメモしていませんか？<br />
                      "もーかい"を使えばメモする必要はありません
                    </p>
                    <v-btn color="secondary" to="/login">使ってみる</v-btn>
                  </v-col>
                </v-row>
              </v-img>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>

      <v-row class="mt-10" justify="center" no-gutters>
        <v-col md="3" lg="2" cols="9" class="mb-10 mr-5">
          <div>
            <h2
              class="subtitle-1 text-center light-green--text text--darken-4 font-weight-black"
            >
              買い時が一目瞭然
            </h2>
            <p class="body-2">
              洗剤やシャンプーといった消耗品を、無くなる度に買いに行っていませんか？<br /><br />
              「もーかい」に登録しておけば、もうすぐ無くなる物が分かって買い物の機会を減らせます！
            </p>
            <v-img v-bind:src="require('@/assets/product_info.png')"></v-img>
          </div>
        </v-col>
        <v-col md="3" lg="2" cols="9" class="mb-10 mr-5">
          <div>
            <h2
              class="subtitle-1 text-center light-green--text text--darken-4 font-weight-black"
            >
              メモはいりません
            </h2>
            <p class="body-2">
              「洗剤を買ってくるのを忘れた！」「まだ残ってたのに買ってしまった...」といったことはありませんか？
              <br /><br />
              「もーかい」を開けば、外出先でも買うべき消耗品が分かります！
            </p>
          </div>
        </v-col>
        <v-col md="3" lg="2" cols="9" class="mb-10">
          <div>
            <h2
              class="subtitle-1 text-center light-green--text text--darken-4 font-weight-black"
            >
              通知は一切無し
            </h2>
            <p class="body-2">
              アプリの通知にうんざりしていませんか？
              <br /><br />
              消耗品の買い時は「もーかい」でいつでも確認できます。
              通知は一切送りませんので、うっとおしい通知を消す必要もありません。
            </p>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="text-center">
          <v-btn color="accent" height="50" to="/login"
            >ログインして使い始める</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
export default {
  name: "HelloWorld",
  data() {
    return {};
  },
  methods: {},
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
</style>
