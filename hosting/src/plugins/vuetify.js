import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/dist/vuetify.min.css";
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

const opts = {
  theme: {
    themes: {
      light: {
        primary: colors.lightGreen.darken4,
        secondary: colors.lightGreen.darken3,
        accent: colors.lightGreen.darken2,
      },
    },
  },
};

export default new Vuetify(opts);
