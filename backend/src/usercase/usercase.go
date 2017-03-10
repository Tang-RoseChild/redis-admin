package usercase

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"redis_backend/domain"
	"redis_backend/impl"
	"redis_backend/utils"
	"strings"
)

type hanlder struct{}

var Handler hanlder

func (h *hanlder) GetAllKeys(w http.ResponseWriter, r *http.Request) {
	root := impl.Impl.GetAllKeys()

	if len(root.Children) > 0 {
		data := utils.FilterError(json.Marshal(root.Children)).([]byte)
		fmt.Fprint(w, string(data))
	}
}

func (h *hanlder) ExecCmd(w http.ResponseWriter, r *http.Request) {
	var req domain.RedisCmd
	reqData, err := ioutil.ReadAll(r.Body)
	if err == nil {
		err = json.Unmarshal(reqData, &req)
	}
	if err != nil {
		panic(err)
	}

	root, info := impl.Impl.ExecCmd(&req)
	resp := struct {
		Nodes []*domain.Node
		Info  interface{}
	}{Info: info}

	if root != nil {
		resp.Nodes = root.Children
	}

	data := utils.FilterError(json.Marshal(resp)).([]byte)
	fmt.Fprint(w, string(data))
}

func (h *hanlder) Config(w http.ResponseWriter, r *http.Request) {
	switch strings.ToLower(r.Method) {
	case "get":
		config := impl.Impl.GetConfig()
		marshal(w, config)
	case "post":
		var config domain.RedisConfig
		unmarshalReq(r, &config)
		impl.Impl.Modify(config)
	}
}

func (h *hanlder) Del(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Type  string
		Key   string
		Field interface{} `json:",omitempty"`
	}

	unmarshalReq(r, &req)
	fmt.Println(req)
	if req.Field == nil {
		impl.Impl.DelKey(req.Key)
	} else {
		impl.Impl.DelField(req.Type, req.Key, req.Field)
	}

}

const (
	RENAME_FIELD = 1
	MODIFY_VALUE = 2
)

type modifyReq struct {
	Ope      int
	Type     string
	Key      string
	Field    string
	OldField string
	Value    interface{}
	OldValue interface{}
}

func (h *hanlder) Modify(w http.ResponseWriter, r *http.Request) {
	var req modifyReq
	unmarshalReq(r, &req)
	fmt.Printf("req >> %#v\n", req)
	var err error
	switch req.Ope {
	case RENAME_FIELD:
		err = impl.Impl.RenameField(req.Type, req.Key, req.OldField, req.Field, req.Value)
	case MODIFY_VALUE:
		err = impl.Impl.ModifyValue(req.Type, req.Key, req.Field, req.OldValue, req.Value)
	}

	if err != nil {
		fmt.Println("err in modify > ", err)
	}
	marshal(w, map[string]interface{}{"error": err})
}

func unmarshalReq(r *http.Request, dst interface{}) {
	reqData, err := ioutil.ReadAll(r.Body)
	if err == nil {
		err = json.Unmarshal(reqData, dst)
	}
	if err != nil {
		panic(err)
	}
}

func marshal(w http.ResponseWriter, src interface{}) {
	data := utils.FilterError(json.Marshal(src)).([]byte)
	fmt.Fprint(w, string(data))
}
