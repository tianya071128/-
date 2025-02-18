import Vue from 'vue';

// 全局组件注册
import '@/globalAssets';

// svg
import '@/icons';

// vuex
import store from './store';

// vue
import router from './router';

import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  store,
  router,
}).$mount('#app');
