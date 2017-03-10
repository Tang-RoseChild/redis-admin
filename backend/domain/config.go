package domain

import (
	"fmt"
	"time"

	"github.com/Tang-RoseChild/redis-admin/backend/utils/uredis"

	"github.com/Tang-RoseChild/redis-admin/backend/utils"

	redis "gopkg.in/redis.v5"
)

var Seperator string

var redisConfig = new(RedisConfig)

// var mux sync.RWMutex

type RedisConfig struct {
	Url       *string `json:"url"`
	DB        *int    `json:"db"`
	Timeout   *int    `json:"timeout"`
	Seperator *string `json:"seperator"`
	Password  *string `json:"password"`
}

func (s *domainStore) Config() RedisConfig {
	// mux.RLock()
	// defer mux.RUnlock()

	return *redisConfig.clone()
}

func (s *domainStore) UpdateConfig(config *RedisConfig) {
	// mux.Lock()
	// mux.Unlock()
	mergeConfig(redisConfig, config)

	s.InitRedis(config)
}

func (s *domainStore) InitRedis(config *RedisConfig) {
	mergeConfig(redisConfig, config)

	var opts redis.Options
	if redisConfig.DB != nil {
		opts.DB = *redisConfig.DB
	}
	if redisConfig.Password != nil {
		opts.Password = *redisConfig.Password
	}
	if redisConfig.Timeout != nil {
		opts.DialTimeout = time.Duration(*redisConfig.Timeout) * time.Second
	}
	if redisConfig.Url != nil {
		opts.Addr = *redisConfig.Url
	}

	if redisConfig.Seperator != nil {
		Seperator = *redisConfig.Seperator
	}

	fmt.Printf("opts >>> %#v \n ", opts)
	uredis.Connect(&opts)
}

func (config *RedisConfig) clone() *RedisConfig {
	newConfig := new(RedisConfig)
	mergeConfig(newConfig, config)

	return newConfig
}

// TODO: merge through reflection
func mergeConfig(dst, src *RedisConfig) {
	if src.DB != nil {
		if dst.DB == nil {
			dst.DB = utils.PInt(*src.DB)
		} else {
			*dst.DB = *src.DB
		}
	}
	if src.Password != nil {
		if dst.Password == nil {
			dst.Password = utils.PString(*src.Password)
		} else {
			*dst.Password = *src.Password
		}
	}
	if src.Timeout != nil {
		if dst.Timeout == nil {
			dst.Timeout = utils.PInt(*src.Timeout)
		} else {
			*dst.Timeout = *src.Timeout
		}
	}
	if src.Url != nil {
		if dst.Url == nil {
			dst.Url = utils.PString(*src.Url)
		} else {
			*dst.Url = *src.Url
		}
	}

	if src.Seperator != nil {
		if dst.Seperator == nil {
			dst.Seperator = utils.PString(*src.Seperator)
		} else {
			*dst.Seperator = *src.Seperator
		}
	}
}
