package main

import (
	"log"
	"net/http"

	"github.com/Tang-RoseChild/redis-admin/backend/domain"
	"github.com/Tang-RoseChild/redis-admin/backend/usercase"
	"github.com/Tang-RoseChild/redis-admin/backend/utils"
)

func main() {
	domain.DomainStore.InitRedis(&domain.RedisConfig{
		Url:       utils.PString("127.0.0.1:6379"),
		DB:        utils.PInt(11),
		Timeout:   utils.PInt(5),
		Seperator: utils.PString(":"),
	})

	// TODO: reflect to inject handler
	http.HandleFunc("/all", usercase.Handler.GetAllKeys)
	http.HandleFunc("/exec", usercase.Handler.ExecCmd)
	http.HandleFunc("/config", usercase.Handler.Config)
	http.HandleFunc("/del", usercase.Handler.Del)
	http.HandleFunc("/modify", usercase.Handler.Modify)

	log.Println("listen on :: 9092")
	if err := http.ListenAndServe(":9092", nil); err != nil {
		panic(err)
	}
}
