import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: "#34495E",
        secondary: "#FDEBD0",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#34495E",
        success: "#4CAF50",
        warning: "#FFC107"
      }
    }
  },
  icons: {
    iconfont: "md"
  }
});
