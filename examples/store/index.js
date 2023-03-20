/*
 * @params:
 */
import Vue from 'vue'
import Vuex from 'vuex'
import dicts from './dicts'
import getters from './getters'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    dicts
  },
  getters
})

export default store
