package uredis

import (
	goredis "gopkg.in/redis.v5"
)

var Client *goredis.Client

func Connect(options *goredis.Options) {
	Client = goredis.NewClient(options)
}
