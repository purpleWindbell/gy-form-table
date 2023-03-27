<template>
  <div id="app">
    <button @click="handleToPage1">测试1</button>
    <button @click="handleToPage2">测试2</button>
    <keep-alive :include="cachedViews">
      <router-view />
    </keep-alive>
  </div>
</template>
<script>
export default {
  data() {
    return {
      msg: '',
      cachedViews: ['Page1']
    }
  },
  methods: {
    handleToPage1() {
      this.$router.push('/page1')
    },
    handleToPage2() {
      this.$router.push('/page2')
    }

  }
}
</script>
