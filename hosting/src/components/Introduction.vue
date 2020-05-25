<template>
  <v-content>
    <v-container fluid>
      <v-row justify="center" no-gutters>
        <v-col cols="12">
          <v-carousel
            hide-delimiter-background
            :continuous="false"
            class="text-center"
            delimiter-icon="mdi-circle-slice-8 black--text"
          >
            <v-carousel-item>
              <v-img
                :src="require('@/assets/intro1.png')"
                width="100"
                class="ml-auto mr-auto main-image"
              ></v-img>
              <p class="mt-auto">
                もーかいは、消耗品の買い時お知らせサービスです。<br />
                買った日と買う頻度を登録しておけば、いつ買えば良いのかが分かります。
              </p>
            </v-carousel-item>
            <v-carousel-item>
              <v-img
                :src="require('@/assets/intro2.png')"
                width="300"
                class="ml-auto mr-auto main-image"
              ></v-img>
              <p class="mt-auto">
                品名、買った日、買う頻度を登録しておくと、買い時が分かります。
              </p>
            </v-carousel-item>
            <v-carousel-item>
              <v-img
                :src="require('@/assets/intro3.png')"
                width="170"
                class="ml-auto mr-auto main-image"
              ></v-img>
              <p class="mt-auto">
                使い方はこれだけです！<br /><br />
                はじめに、よく使う消耗品を登録しましょう。
              </p>
              <v-btn color="primary" to="/bulkadd">使いはじめる</v-btn>
            </v-carousel-item>
          </v-carousel>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
export default {
  name: "Introduction",
  data() {
    return {};
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-image {
  margin-top: 100px;
  margin-bottom: 30px;
}
</style>
