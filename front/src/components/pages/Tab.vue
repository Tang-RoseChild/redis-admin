<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="主页" name="first">
      <home></home>
    </el-tab-pane>
    <el-tab-pane label="配置管理" name="second">
      <config></config>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import Home from './Home'
import Config from './Config'
// import eventHub from '../../event/eventhub.js'
export default {
  components: {
    'home': Home,
    'config': Config
  },
  data () {
    return {
      activeName: 'first'
    }
  },
  methods: {
    handleClick (tab, event) {
    }
  },
  created: function () {
    this.$root.$data.eventHub.$on('tab-change', name => {
      this.activeName = name
      this.$root.$data.eventHub.$emit('home-refresh')
    })
  },
  beforeDestroy: function () {
    this.$root.$data.eventHub.$off('home-refresh')
    this.$root.$data.eventHub.$off('tab-change')
  }
}
</script>
