<template>
  <el-row :gutter="20">
    <el-col :xs="20" :sm="16" :md="14" :lg="12">
      <el-form :label-position="labelPosition" label-width="80px" >
        <el-form-item label="URL">
          <el-input :value="config.url" v-model="config.url"></el-input>
        </el-form-item>
        <el-form-item label="DB"><el-input type="number" :value="config.db" v-model.number="config.db"></el-input></el-form-item>
        <el-form-item label="Password"><el-input :value="config.password" v-model="config.password"></el-input></el-form-item>
        <el-form-item label="Timeout"><el-input type="number" :value="config.timeout" v-model.number="config.timeout"></el-input></el-form-item>
        <el-form-item label="Seperator"><el-input :value="config.seperator" v-model="config.seperator"></el-input></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateConfig">更新</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data () {
    return {
      config: {},
      labelPosition: 'left'
    }
  },
  methods: {
    getConfig () {
      let _this = this
      this.$http.get('/config').then(resp => {
        _this.config = resp.body
      })
    },
    updateConfig () {
      let _this = this
      _this.$http.post('/config', _this.config).then(resp => {
        _this.$message({message: 'config changed', type: 'warning'})
        _this.$root.$data.eventHub.$emit('tab-change', 'first')
      })
    }
  },
  mounted: function () {
    this.getConfig()
  },
  created: function () {
    let _this = this
    _this.$root.$data.eventHub.$on('config-refresh', function () {
      console.log('home-refresh event .... ')
      _this.getConfig()
    })
  }
}
</script>
