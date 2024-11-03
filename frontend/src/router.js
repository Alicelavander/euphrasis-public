import Main from "./components/Main.vue";

import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes: [
    { path: '/', component: Main },
    // { path: '/words', component: ViewWords },
  ]
});

export default router;