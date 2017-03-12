<template><div>
  <el-row :gutter="23">
    <el-col :span="6">
      <!-- all keys -->
      <div class="grid-content bg-purple">
        <el-tree :data="treeData" :props="treeProps" @node-click="nodeClick"></el-tree>
      </div>
    </el-col>
    <el-col :span="16">
      <!-- detail table info -->
      <div class="grid-content bg-purple">
        <el-row>
          <el-form :inline="true" id="home-form" @submit.native.prevent>
            <el-form-item>
              <el-input type="text" placeholder="命令" v-model="redisLine"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="exec" :disabled="!redisLine">执行</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchData" >刷新</el-button>
            </el-form-item>
          </el-form>
        </el-row>

        <el-row>
          <el-table :data="tableData" border style="width: 100%">
              <el-table-column
                label="key"
              >
                <template scope="scope">
                  <p> {{scope.row.key.fullName}}</p>
                </template>
              </el-table-column>
              <el-table-column
                label="value"
              >
                <template scope="scope">
                     <p v-if="scope.row.key && scope.row.key.type ==='string'" >{{scope.row.key.values[0].score}}</p>
                     <p v-else >Object</p>
                </template>
              </el-table-column>
              <el-table-column
                label="type"
              >
                <template scope="scope">
                  <p v-if="scope.row.key">{{scope.row.key.type}}</p>
                  <p v-else>--</p>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template scope="scope">
                  <el-button
                    size="small"
                    @click="showDetailDialog(scope.row, scope.$index)"
                  >详细</el-button>
                </template>
              </el-table-column>
          </el-table>
        </el-row>
      </div>
    </el-col>
  </el-row>
  <el-dialog id="detail-dialog" v-model="detailDialogVisible" :title="dialogTitle" @close="dialogClose" @open="dialogOpen">
  <div id="home-dialog-form-label"> <p id="field-label" >field</p><p id="value-label">value</p></div>
  <el-form :inline="true" class="demo-form-inline" :model="detailInfo">
    <div v-for="(value,idx) in detailInfo.values" :key="value">
    <el-form-item >
      <el-input v-if="value.field" :value="value.field" @change="modify(idx, 1, $event)"></el-input>
      <el-input v-else value="--" v-model="value.field" :disabled="true" ></el-input>
    </el-form-item>
    <el-form-item >
      <el-input :value="value.score" v-on:change="modify(idx, 2, $event)"></el-input>
    </el-form-item>
    <el-form-item >
      <el-button @click="del(idx, 1)">删除</el-button>
    </el-form-item>
    </div>
    <el-form-item v-if="detailInfo.type !='string'"><el-button @click="del">全部删除</el-button> </el-form-item>
  </el-form>
</el-dialog>
</div></template>

<script >
import { Loading } from 'element-ui'

export default {
  name: 'home',
  data () {
    return {
      treeData: [],
      treeProps: {
        children: 'children',
        label: 'displayName'
      },
      tableData: [],
      detailDialogVisible: false,
      detailInfo: {},
      redisLine: '',
      oldField: '',
      oldValue: '',
      dialogOpenStatus: false,
      selectedNode: null,
      detailIndex: 0
    }
  },
  computed: {
    dialogTitle: function () {
      let type = this.detailInfo.type ? this.detailInfo.type : '-'
      return this.detailInfo.fullName + '  [' + type + ']'
    }
  },
  methods: {
    exec () {
      // this.$message('exec ... ' + this.redisLine)
      console.log('redis line >> ', this.redisLine)
      let _this = this
      let splits = _this.redisLine.split(' ')
      let redisCmd = {cmd: splits[0]}
      redisCmd.key = splits[1] ? splits[1] : null
      redisCmd.args = splits.slice(2) ? splits.slice(2) : null

      _this.$http.post('/exec', redisCmd).then(resp => {
        let lowerCmd = redisCmd.cmd.toLowerCase()
        if (lowerCmd.includes('select')) {
          // modify db setting
          _this.$message({message: 'db changed', type: 'warning'})
          console.log('resp after select ', resp)
          _this.treeData = resp.body.nodes ? resp.body.nodes : []
          _this.tableData = []
        } else if (lowerCmd.includes('keys')) {
          if (resp.body.nodes && resp.body.nodes.length) {
            _this.treeData = resp.body.nodes
            _this.tableData = []
          }
        } else {
          let msg = resp.body.info ? resp.body.info : 'done'
          _this.$message(msg)
        }
      })
    },
    showDetailDialog (row, ctx) {
      this.detailDialogVisible = true
      this.detailInfo = row.key
      this.detailIndex = ctx
      console.log('ctx .... ', this.detailInfo)
    },
    del (idx) {
      let redisKey = this.detailInfo
      console.log('redisKey', redisKey)
      let req = {type: redisKey.type, key: redisKey.fullName}
      if (redisKey.values.length > 1) {
        let value = redisKey.values[idx]
        req.field = value.field ? value.field : value.score
      }

      let _this = this
      _this.$http.post('/del', req).then(resp => {
        _this.$message({message: 'deleted', type: 'info'})
        console.log('after delete  ', redisKey)
        let removeFromTree = true
        if (redisKey.values.length > 1) {
          redisKey.values.splice(idx, 1)
          removeFromTree = false
        }

        if (removeFromTree) {
          _this.tableData.splice(_this.detailIndex, 1)
          // console.log('_this.tableData ', _this.tableData, _this.selectedNode)
          if (_this.tableData.length === 0) {
            let removeNode = function (node, displayName) {
              for (let i = 0; i < node.parent.children.length; i++) {
                if (node.parent.children[i].displayName === displayName) {
                  node.parent.children.splice(i, 1)

                  if (node.parent.children.length === 0 && node.parent.parent) {
                    removeNode(node.parent, node.parent.displayName)
                  }
                }
              }
            }

            removeNode(_this.selectedNode, redisKey.displayName)
          }
          _this.detailDialogVisible = false
        }
      })
    },
    modify (idx, ope, newVal) {
      if (!this.detailDialogVisible) {
        return
      }
      const RENAME_FIELD = 1
      const MODIFY_VALUE = 2

      let redisKey = this.detailInfo
      let req = {key: redisKey.fullName, type: redisKey.type, ope: ope}
      if (ope === RENAME_FIELD) {
        req.oldField = redisKey.values[idx].field
        req.field = newVal
      } else if (ope === MODIFY_VALUE) {
        if (redisKey.values[idx].field) {
          req.field = redisKey.values[idx].field
        }
        req.oldValue = redisKey.values[idx].score
        req.value = newVal
      } else {
        return
      }

      let _this = this
      _this.$http.post('/modify', req).then(resp => {
        if (resp.error) {
          console.log('err', resp.error)
          _this.$message({message: resp.error, type: 'error'})
        } else {
          _this.$message({message: 'updated', type: 'info'})
          if (ope === RENAME_FIELD) {
            redisKey.values[idx].field = newVal
          } else if (ope === MODIFY_VALUE) {
            redisKey.values[idx].score = newVal
          }
        }
      })
    },
    fetchData () {
      let loadingInstance = Loading.service({ body: this.loading })
      setTimeout(() => {
        loadingInstance.close()
      }, 3000)

      let _this = this
      _this.$http.get('/all').then(resp => {
        console.log('resp in fetchData ....  ', resp.body)
        console.log(' nedd ... addNodeParent', (resp.body && resp.body.length))
        if (resp.body && resp.body.length) {
          let parent = {displayName: 'root', children: resp.body}
          _this.addNodeParent(parent, resp.body)
          _this.treeData = resp.body
        } else {
          _this.treeData = []
        }
        _this.redisLine = ''
        _this.tableData = []
        loadingInstance.close()
        console.log('treeData ... ', _this.treeData)
      })
    },
    nodeClick (node) {
      this.selectedNode = node
      console.log('selectedNode .... ', node)
      if (node.children && node.children.length) {
        let newNode = []
        // filter empty value
        for (let i = 0; i < node.children.length; i++) {
          // console.log('node clicked ... ', node.children[i])
          if (node.children[i].key) {
            newNode.push(node.children[i])
          }
        }
        this.tableData = newNode
      } else {
        this.tableData = [node]
      }
    },
    dialogClose () {
      console.log('dialogClose ..... ')
      this.detailInfo = {}
      this.dialogOpenStatus = false
    },
    dialogOpen () {
      this.dialogOpenStatus = true
    },
    addNodeParent (parent, children) {
      console.log('addNodeParent , ', parent, ' children .. ', children)
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          children[i].parent = parent
          this.addNodeParent(children[i], children[i].children)
        }
      }
    }
  },
  mounted: function () {
    this.fetchData()
  },
  created: function () {
    let _this = this
    _this.$root.$data.eventHub.$on('home-refresh', function () {
      console.log('home-refresh event .... ')
      _this.fetchData()
    })
  }
}

</script>

<style>
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  #home-form {
    text-align: left;
    height: 15px;
    margin-bottom: 0px;
  }

  #field-label {
    position: absolute;
    left: 101px;
    top: 38px;
  }
  #value-label {
    position: absolute;
    left: 284px;
    top: 38px;
  }
  #home-dialog-form-label p {
    display: inline;
    margin-bottom: 10px;
  }
</style>
