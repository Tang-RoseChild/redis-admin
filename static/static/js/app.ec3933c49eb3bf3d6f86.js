webpackJsonp([1,2],{

/***/ 24:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(71)

var Component = __webpack_require__(7)(
  /* script */
  __webpack_require__(49),
  /* template */
  __webpack_require__(77),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 49:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_pages_Tab__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_pages_Tab___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_pages_Tab__);
//
//
//
//
//
//
//
//
//
//

// import Hello from './components/Hello'
// import Home from './components/pages/Home'
// import Detail from './components/pages/DetailDialog'


/* harmony default export */ __webpack_exports__["default"] = {
  name: 'app',
  components: {
    // Hello
    // Home
    // detail: Detail
    Tab: __WEBPACK_IMPORTED_MODULE_0__components_pages_Tab___default.a
  }
};

/***/ }),

/***/ 50:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = {
  data() {
    return {
      config: {},
      labelPosition: 'left'
    };
  },
  methods: {
    getConfig() {
      let _this = this;
      this.$http.get('/config').then(resp => {
        _this.config = resp.body;
      });
    },
    updateConfig() {
      let _this = this;
      _this.$http.post('/config', _this.config).then(resp => {
        _this.$message({ message: 'config changed', type: 'warning' });
        _this.$root.$data.eventHub.$emit('tab-change', 'first');
      });
    }
  },
  mounted: function () {
    this.getConfig();
  },
  created: function () {
    let _this = this;
    _this.$root.$data.eventHub.$on('config-refresh', function () {
      console.log('home-refresh event .... ');
      _this.getConfig();
    });
  }
};

/***/ }),

/***/ 51:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_element_ui__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_element_ui___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_element_ui__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = {
  name: 'home',
  data() {
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
    };
  },
  computed: {
    dialogTitle: function () {
      let type = this.detailInfo.type ? this.detailInfo.type : '-';
      return this.detailInfo.fullName + '  [' + type + ']';
    }
  },
  methods: {
    exec() {
      // this.$message('exec ... ' + this.redisLine)
      console.log('redis line >> ', this.redisLine);
      let _this = this;
      let splits = _this.redisLine.split(' ');
      let redisCmd = { cmd: splits[0] };
      redisCmd.key = splits[1] ? splits[1] : null;
      redisCmd.args = splits.slice(2) ? splits.slice(2) : null;

      _this.$http.post('/exec', redisCmd).then(resp => {
        let lowerCmd = redisCmd.cmd.toLowerCase();
        if (lowerCmd.includes('select')) {
          // modify db setting
          _this.$message({ message: 'db changed', type: 'warning' });
          console.log('resp after select ', resp);
          _this.treeData = resp.body.nodes ? resp.body.nodes : [];
          _this.tableData = [];
        } else if (lowerCmd.includes('keys')) {
          if (resp.body.nodes && resp.body.nodes.length) {
            _this.treeData = resp.body.nodes;
            _this.tableData = [];
          }
        } else {
          let msg = resp.body.info ? resp.body.info : 'done';
          _this.$message(msg);
        }
      });
    },
    showDetailDialog(row, ctx) {
      this.detailDialogVisible = true;
      this.detailInfo = row.key;
      this.detailIndex = ctx;
      console.log('ctx .... ', this.detailInfo);
    },
    del(idx) {
      let redisKey = this.detailInfo;
      console.log('redisKey', redisKey);
      let req = { type: redisKey.type, key: redisKey.fullName };
      if (redisKey.values.length > 1) {
        let value = redisKey.values[idx];
        req.field = value.field ? value.field : value.score;
      }

      let _this = this;
      _this.$http.post('/del', req).then(resp => {
        _this.$message({ message: 'deleted', type: 'info' });
        console.log('after delete  ', redisKey);
        let removeFromTree = true;
        if (redisKey.values.length > 1) {
          redisKey.values.splice(idx, 1);
          removeFromTree = false;
        }

        if (removeFromTree) {
          _this.tableData.splice(_this.detailIndex, 1);
          // console.log('_this.tableData ', _this.tableData, _this.selectedNode)
          if (_this.tableData.length === 0) {
            let removeNode = function (node, displayName) {
              for (let i = 0; i < node.parent.children.length; i++) {
                if (node.parent.children[i].displayName === displayName) {
                  node.parent.children.splice(i, 1);

                  if (node.parent.children.length === 0 && node.parent.parent) {
                    removeNode(node.parent, node.parent.displayName);
                  }
                }
              }
            };

            removeNode(_this.selectedNode, redisKey.displayName);
          }
          _this.detailDialogVisible = false;
        }
      });
    },
    modify(idx, ope, newVal) {
      if (!this.detailDialogVisible || !newVal) {
        return;
      }
      const RENAME_FIELD = 1;
      const MODIFY_VALUE = 2;

      let redisKey = this.detailInfo;
      let req = { key: redisKey.fullName, type: redisKey.type, ope: ope };
      if (ope === RENAME_FIELD) {
        req.oldField = redisKey.values[idx].field;
        req.field = newVal;
        req.value = redisKey.values[idx].score;
      } else if (ope === MODIFY_VALUE) {
        if (redisKey.values[idx].field) {
          req.field = redisKey.values[idx].field;
        }
        req.oldValue = redisKey.values[idx].score;
        req.value = newVal;
      } else {
        return;
      }
      // console.log('modify req > ', req)
      let _this = this;
      _this.$http.post('/modify', req).then(resp => {
        if (resp.error) {
          console.log('err', resp.error);
          _this.$message({ message: resp.error, type: 'error' });
        } else {
          // _this.$message({message: 'updated', type: 'info'})
          if (ope === RENAME_FIELD) {
            redisKey.values[idx].field = newVal;
          } else if (ope === MODIFY_VALUE) {
            redisKey.values[idx].score = newVal;
          }
        }
      });
    },
    fetchData() {
      let loadingInstance = __WEBPACK_IMPORTED_MODULE_0_element_ui__["Loading"].service({ body: this.loading });
      setTimeout(() => {
        loadingInstance.close();
      }, 3000);

      let _this = this;
      _this.$http.get('/all').then(resp => {
        console.log('resp in fetchData ....  ', resp.body);
        console.log(' nedd ... addNodeParent', resp.body && resp.body.length);
        if (resp.body && resp.body.length) {
          let parent = { displayName: 'root', children: resp.body };
          _this.addNodeParent(parent, resp.body);
          _this.treeData = resp.body;
        } else {
          _this.treeData = [];
        }
        _this.redisLine = '';
        _this.tableData = [];
        loadingInstance.close();
        console.log('treeData ... ', _this.treeData);
      });
    },
    nodeClick(node) {
      this.selectedNode = node;
      console.log('selectedNode .... ', node);
      if (node.children && node.children.length) {
        let newNode = [];
        // filter empty value
        for (let i = 0; i < node.children.length; i++) {
          // console.log('node clicked ... ', node.children[i])
          if (node.children[i].key) {
            newNode.push(node.children[i]);
          }
        }
        this.tableData = newNode;
      } else {
        this.tableData = [node];
      }
    },
    dialogClose() {
      console.log('dialogClose ..... ');
      this.detailInfo = {};
      this.dialogOpenStatus = false;
    },
    dialogOpen() {
      this.dialogOpenStatus = true;
    },
    addNodeParent(parent, children) {
      console.log('addNodeParent , ', parent, ' children .. ', children);
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          children[i].parent = parent;
          this.addNodeParent(children[i], children[i].children);
        }
      }
    }
  },
  mounted: function () {
    this.fetchData();
  },
  created: function () {
    let _this = this;
    _this.$root.$data.eventHub.$on('home-refresh', function () {
      console.log('home-refresh event .... ');
      _this.fetchData();
    });
  }
};

/***/ }),

/***/ 52:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Home__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Home___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Home__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Config__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Config___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__Config__);
//
//
//
//
//
//
//
//
//
//



// import eventHub from '../../event/eventhub.js'
/* harmony default export */ __webpack_exports__["default"] = {
  components: {
    'home': __WEBPACK_IMPORTED_MODULE_0__Home___default.a,
    'config': __WEBPACK_IMPORTED_MODULE_1__Config___default.a
  },
  data() {
    return {
      activeName: 'first'
    };
  },
  methods: {
    handleClick(tab, event) {}
  },
  created: function () {
    this.$root.$data.eventHub.$on('tab-change', name => {
      this.activeName = name;
      this.$root.$data.eventHub.$emit('home-refresh');
    });
  },
  beforeDestroy: function () {
    this.$root.$data.eventHub.$off('home-refresh');
    this.$root.$data.eventHub.$off('tab-change');
  }
};

/***/ }),

/***/ 70:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 71:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 72:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(7)(
  /* script */
  __webpack_require__(50),
  /* template */
  __webpack_require__(75),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 73:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(70)

var Component = __webpack_require__(7)(
  /* script */
  __webpack_require__(51),
  /* template */
  __webpack_require__(76),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(7)(
  /* script */
  __webpack_require__(52),
  /* template */
  __webpack_require__(78),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 75:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('el-row', {
    attrs: {
      "gutter": 20
    }
  }, [_c('el-col', {
    attrs: {
      "xs": 20,
      "sm": 16,
      "md": 14,
      "lg": 12
    }
  }, [_c('el-form', {
    attrs: {
      "label-position": _vm.labelPosition,
      "label-width": "80px"
    }
  }, [_c('el-form-item', {
    attrs: {
      "label": "URL"
    }
  }, [_c('el-input', {
    attrs: {
      "value": _vm.config.url
    },
    model: {
      value: (_vm.config.url),
      callback: function($$v) {
        _vm.config.url = $$v
      },
      expression: "config.url"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "DB"
    }
  }, [_c('el-input', {
    attrs: {
      "type": "number",
      "value": _vm.config.db
    },
    model: {
      value: (_vm.config.db),
      callback: function($$v) {
        _vm.config.db = _vm._n($$v)
      },
      expression: "config.db"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "Password"
    }
  }, [_c('el-input', {
    attrs: {
      "value": _vm.config.password
    },
    model: {
      value: (_vm.config.password),
      callback: function($$v) {
        _vm.config.password = $$v
      },
      expression: "config.password"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "Timeout"
    }
  }, [_c('el-input', {
    attrs: {
      "type": "number",
      "value": _vm.config.timeout
    },
    model: {
      value: (_vm.config.timeout),
      callback: function($$v) {
        _vm.config.timeout = _vm._n($$v)
      },
      expression: "config.timeout"
    }
  })], 1), _vm._v(" "), _c('el-form-item', {
    attrs: {
      "label": "Seperator"
    }
  }, [_c('el-input', {
    attrs: {
      "value": _vm.config.seperator
    },
    model: {
      value: (_vm.config.seperator),
      callback: function($$v) {
        _vm.config.seperator = $$v
      },
      expression: "config.seperator"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    attrs: {
      "type": "primary"
    },
    on: {
      "click": _vm.updateConfig
    }
  }, [_vm._v("更新")])], 1)], 1)], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 76:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('el-row', {
    attrs: {
      "gutter": 23
    }
  }, [_c('el-col', {
    attrs: {
      "span": 6
    }
  }, [_c('div', {
    staticClass: "grid-content bg-purple"
  }, [_c('el-tree', {
    attrs: {
      "data": _vm.treeData,
      "props": _vm.treeProps
    },
    on: {
      "node-click": _vm.nodeClick
    }
  })], 1)]), _vm._v(" "), _c('el-col', {
    attrs: {
      "span": 16
    }
  }, [_c('div', {
    staticClass: "grid-content bg-purple"
  }, [_c('el-row', [_c('el-form', {
    attrs: {
      "inline": true,
      "id": "home-form"
    },
    nativeOn: {
      "submit": function($event) {
        $event.preventDefault();
      }
    }
  }, [_c('el-form-item', [_c('el-input', {
    attrs: {
      "type": "text",
      "placeholder": "命令"
    },
    model: {
      value: (_vm.redisLine),
      callback: function($$v) {
        _vm.redisLine = $$v
      },
      expression: "redisLine"
    }
  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    attrs: {
      "type": "primary",
      "disabled": !_vm.redisLine
    },
    on: {
      "click": _vm.exec
    }
  }, [_vm._v("执行")])], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
    attrs: {
      "type": "primary"
    },
    on: {
      "click": _vm.fetchData
    }
  }, [_vm._v("刷新")])], 1)], 1)], 1), _vm._v(" "), _c('el-row', [_c('el-table', {
    staticStyle: {
      "width": "100%"
    },
    attrs: {
      "data": _vm.tableData,
      "border": ""
    }
  }, [_c('el-table-column', {
    attrs: {
      "label": "key"
    },
    scopedSlots: _vm._u([
      ["default", function(scope) {
        return [_c('p', [_vm._v(" " + _vm._s(scope.row.key.fullName))])]
      }]
    ])
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "label": "value"
    },
    scopedSlots: _vm._u([
      ["default", function(scope) {
        return [(scope.row.key && scope.row.key.type === 'string') ? _c('p', [_vm._v(_vm._s(scope.row.key.values[0].score))]) : _c('p', [_vm._v("Object")])]
      }]
    ])
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "label": "type"
    },
    scopedSlots: _vm._u([
      ["default", function(scope) {
        return [(scope.row.key) ? _c('p', [_vm._v(_vm._s(scope.row.key.type))]) : _c('p', [_vm._v("--")])]
      }]
    ])
  }), _vm._v(" "), _c('el-table-column', {
    attrs: {
      "label": "操作"
    },
    scopedSlots: _vm._u([
      ["default", function(scope) {
        return [_c('el-button', {
          attrs: {
            "size": "small"
          },
          on: {
            "click": function($event) {
              _vm.showDetailDialog(scope.row, scope.$index)
            }
          }
        }, [_vm._v("详细")])]
      }]
    ])
  })], 1)], 1)], 1)])], 1), _vm._v(" "), _c('el-dialog', {
    attrs: {
      "id": "detail-dialog",
      "title": _vm.dialogTitle
    },
    on: {
      "close": _vm.dialogClose,
      "open": _vm.dialogOpen
    },
    model: {
      value: (_vm.detailDialogVisible),
      callback: function($$v) {
        _vm.detailDialogVisible = $$v
      },
      expression: "detailDialogVisible"
    }
  }, [_c('div', {
    attrs: {
      "id": "home-dialog-form-label"
    }
  }, [_c('p', {
    attrs: {
      "id": "field-label"
    }
  }, [_vm._v("field")]), _c('p', {
    attrs: {
      "id": "value-label"
    }
  }, [_vm._v("value")])]), _vm._v(" "), _c('el-form', {
    staticClass: "demo-form-inline",
    attrs: {
      "inline": true,
      "model": _vm.detailInfo
    }
  }, [_vm._l((_vm.detailInfo.values), function(value, idx) {
    return _c('div', {
      key: value
    }, [_c('el-form-item', [(value.field) ? _c('el-input', {
      attrs: {
        "value": value.field
      },
      on: {
        "change": function($event) {
          _vm.modify(idx, 1, $event)
        }
      }
    }) : _c('el-input', {
      attrs: {
        "value": "--",
        "disabled": true
      },
      model: {
        value: (value.field),
        callback: function($$v) {
          value.field = $$v
        },
        expression: "value.field"
      }
    })], 1), _vm._v(" "), _c('el-form-item', [_c('el-input', {
      attrs: {
        "value": value.score
      },
      on: {
        "change": function($event) {
          _vm.modify(idx, 2, $event)
        }
      }
    })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
      on: {
        "click": function($event) {
          _vm.del(idx, 1)
        }
      }
    }, [_vm._v("删除")])], 1)], 1)
  }), _vm._v(" "), (_vm.detailInfo.type != 'string') ? _c('el-form-item', [_c('el-button', {
    on: {
      "click": _vm.del
    }
  }, [_vm._v("全部删除")])], 1) : _vm._e()], 2)], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 77:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    attrs: {
      "id": "app"
    }
  }, [_c('tab')], 1)
},staticRenderFns: []}

/***/ }),

/***/ 78:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('el-tabs', {
    on: {
      "tab-click": _vm.handleClick
    },
    model: {
      value: (_vm.activeName),
      callback: function($$v) {
        _vm.activeName = $$v
      },
      expression: "activeName"
    }
  }, [_c('el-tab-pane', {
    attrs: {
      "label": "主页",
      "name": "first"
    }
  }, [_c('home')], 1), _vm._v(" "), _c('el-tab-pane', {
    attrs: {
      "label": "配置管理",
      "name": "second"
    }
  }, [_c('config')], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 81:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 82:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__App__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_element_ui__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_element_ui___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_element_ui__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_element_ui_lib_theme_default_index_css__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_element_ui_lib_theme_default_index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_element_ui_lib_theme_default_index_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_resource__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vue_resource___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vue_resource__);
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.






 // handle http

__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_2_element_ui___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_4_vue_resource___default.a);

let eventHub = new __WEBPACK_IMPORTED_MODULE_0_vue___default.a();
/* eslint-disable no-new */
new __WEBPACK_IMPORTED_MODULE_0_vue___default.a({
  el: '#app',
  template: '<App/>',
  // render: h => h(App),
  components: { App: __WEBPACK_IMPORTED_MODULE_1__App___default.a },
  data() {
    return {
      eventHub
    };
  }
});

/***/ })

},[82]);
//# sourceMappingURL=app.ec3933c49eb3bf3d6f86.js.map