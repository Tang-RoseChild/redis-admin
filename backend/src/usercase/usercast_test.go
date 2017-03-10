package usercase

import (
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInjectHandler(t *testing.T) {
	var h handler

	fmt.Println("num >", reflect.TypeOf(&h).NumMethod())
	for i := 0; i < reflect.TypeOf(&h).NumMethod(); i++ {
		fmt.Printf("method >> %q \n", reflect.TypeOf(&h).Method(i).Type.String())
	}
	assert.Empty(t, h)
}

type handler struct{}

func (h *handler) Show(w http.ResponseWriter, r *http.Request) {

}

func (h *handler) Detail(w http.ResponseWriter, r *http.Request) {

}

var mux map[string]reflect.Value

func inject(src interface{}) {
	rt := reflect.TypeOf(src)
	for i := 0; i < rt.NumMethod(); i++ {
		funcName := rt.Method(i).Type.String()
		funcName = funcName[strings.Index(funcName, "("):strings.LastIndex(funcName, ")")]
		fmt.Println("funName >> ", funcName)
		splits := strings.Split(funcName, ",")

		fmt.Println("splits ", splits[1], splits[2])
		if len(splits) != 3 {
			log.Println("no methods")
			continue
		}

		fmt.Println("splits[1] != respArgName ", splits[1] != respArgName, " >>> ", splits[2] != reqArgName)
		if strings.TrimSpace(splits[1]) != respArgName || strings.TrimSpace(splits[2]) != reqArgName {
			log.Println("not handler")
			continue
		}

		mux[rt.Method(i).Name] = rt.Method(i).Func
	}
}

const (
	respArgName = "http.ResponseWriter"
	reqArgName  = "*http.Request"
)

func TestA(t *testing.T) {
	mux = make(map[string]reflect.Value)
	h := &handler{}

	inject(h)
	fmt.Println("mux ", mux)
}
