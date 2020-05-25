import { shallowMount, createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";
import { App } from "../src/App.vue";

const localVue = createLocalVue();
localVue.use(VueRouter);
const router = new VueRouter();

shallowMount(App, {
  localVue,
  router
});
