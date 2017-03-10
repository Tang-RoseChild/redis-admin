package domain

import (
	"redis_backend/utils/uredis"
	"sync"
	"time"

	redis "gopkg.in/redis.v5"
)

var Seperator string

func init() {
	redisConfig = &RedisConfig{
		Url:       "127.0.0.1:6379",
		DB:        11,
		Seperator: ":",
		Timeout:   5,
	}
	Seperator = redisConfig.Seperator
}

var redisConfig *RedisConfig
var mux sync.RWMutex

type RedisConfig struct {
	Url       string `json:"url"`
	DB        int    `json:"db"`
	Timeout   int    `json:"timeout"`
	Seperator string `json:"seperator"`
	Password  string `json:"password"`
}

func (s *domainStore) Config() RedisConfig {
	mux.RLock()
	defer mux.RUnlock()

	return *redisConfig
}

func (s *domainStore) UpdateConfig(config RedisConfig) {
	mux.Lock()
	*redisConfig = config
	mux.Unlock()

	refreshRedis()
}

func refreshRedis() {
	opts := redis.Options{
		Addr:        redisConfig.Url,
		DB:          redisConfig.DB,
		DialTimeout: time.Duration(redisConfig.Timeout),
	}

	if len(redisConfig.Password) > 0 {
		opts.Password = redisConfig.Password
	}

	Seperator = redisConfig.Seperator

	uredis.Connect(&opts)
}
