package main

import (
	"log"
	"net/http"
	"redis_backend/usercase"
	"redis_backend/utils/uredis"

	"gopkg.in/redis.v5"
)

func main() {
	uredis.Connect(&redis.Options{Addr: "127.0.0.1:6379", DB: 11})
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
