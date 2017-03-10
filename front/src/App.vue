<template>
  <div id="app">
    <!--<img src="./assets/logo.png">-->
    <!--<hello></hello>-->
    <!--<home></home>-->
    <!--<detail></detail>-->
    <tab></tab>
  </div>
</template>

<script>
// import Hello from './components/Hello'
// import Home from './components/pages/Home'
// import Detail from './components/pages/DetailDialog'
import Tab from './components/pages/Tab'

export default {
  name: 'app',
  components: {
    // Hello
    // Home
    // detail: Detail
    Tab
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
