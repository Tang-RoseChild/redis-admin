package impl

import (
	"fmt"
	"log"

	"github.com/Tang-RoseChild/redis-admin/backend/domain"
	"github.com/Tang-RoseChild/redis-admin/backend/utils/uredis"

	"strconv"

	"github.com/Tang-RoseChild/redis-admin/backend/utils"

	"gopkg.in/redis.v5"
)

type impl struct{}

var Impl impl

func (s *impl) GetAllKeys() (root *domain.Node) {
	root = &domain.Node{
		DisplayName: "all keys",
	}

	keys := domain.DomainStore.Search("*")
	for _, k := range keys {
		domain.AddKeyToNode(root, k)
	}

	return
}

func (s *impl) ExecCmd(req *domain.RedisCmd) (root *domain.Node, info interface{}) {
	switch req.Cmd {
	case "select":
		// modify db
		db, err := strconv.Atoi(req.Key)
		if err != nil {
			panic(err)
		}

		domain.DomainStore.UpdateConfig(&domain.RedisConfig{DB: utils.PInt(db)})
		root = getRootNode("*")
	case "keys":
		getRootNode(req.Key)
	default:
		// just return simple info
		cmd := redis.NewCmd(formatRedisCmdAsArgs(req)...)
		uredis.Client.Process(cmd)
		info = cmd.Val()
	}

	return
}

func getRootNode(keyPatern string) *domain.Node {
	root := &domain.Node{
		DisplayName: "all keys",
	}
	redisKeys := domain.DomainStore.Search(keyPatern)
	for _, k := range redisKeys {
		domain.AddKeyToNode(root, k)
	}

	return root
}

func formatRedisCmdAsArgs(cmd *domain.RedisCmd) (dst []interface{}) {
	dst = append(dst, cmd.Cmd, cmd.Key)
	dst = append(dst, cmd.Args...)
	return
}

func (s *impl) Modify(req *domain.RedisConfig) {
	domain.DomainStore.UpdateConfig(req)
}

func (s *impl) GetConfig() domain.RedisConfig {
	return domain.DomainStore.Config()
}

func (s *impl) DelKey(key string) {
	cmd := redis.NewCmd("del", key)
	uredis.Client.Process(cmd)
}

func (s *impl) DelField(keyType string, key string, field interface{}) error {
	var cmd *redis.Cmd
	switch keyType {
	case "hash":
		cmd = redis.NewCmd("hdel", key, field)
	case "zset":
		cmd = redis.NewCmd("zrem", key, field)
	case "list":
		cmd = redis.NewCmd("lrem", key, 0, field)
	case "set":
		cmd = redis.NewCmd("srem", key, field)
	default:
		log.Println("DelField unsupported type ", keyType)
	}

	return uredis.Client.Process(cmd)
}

func (s *impl) RenameField(keyType string, key string, oldField string, field string, value interface{}) (err error) {
	tx := uredis.Client.TxPipeline()
	defer tx.Close()

	switch keyType {
	case "hash":
		tx.HDel(key, field)
		tx.HSet(key, field, value)
		_, err = tx.Exec()
	case "zset":
		tx.ZRem(key, oldField)
		tx.ZAdd(key, redis.Z{Member: field, Score: value.(float64)})
		_, err = tx.Exec()
	default:
		return fmt.Errorf("RenameField unsupported type ")
	}

	return
}

func (s *impl) ModifyValue(keyType string, key string, field string, oldValue interface{}, value interface{}) (err error) {
	switch keyType {
	case "hash":
		err = uredis.Client.HSet(key, field, value).Err()
	case "zset":
		cmd := redis.NewCmd("zadd", key, value, field)
		uredis.Client.Process(cmd)
		err = cmd.Err()
	case "list":
		tx := uredis.Client.TxPipeline()
		defer tx.Close()
		tx.LRem(key, 0, oldValue)
		tx.LPush(key, value)
		_, err = tx.Exec()
	case "set":
		tx := uredis.Client.TxPipeline()
		defer tx.Close()

		tx.SRem(key, oldValue)
		tx.SAdd(key, value)
		_, err = tx.Exec()
	case "string":
		err = uredis.Client.Set(key, value, 0).Err()
	default:
		return fmt.Errorf("ModifyValue unsupported type ")
	}

	return
}
