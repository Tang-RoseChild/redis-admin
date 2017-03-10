package domain

import (
	"fmt"
	"redis_backend/utils/uredis"
	"strings"

	"gopkg.in/redis.v5"
)

type RedisKey struct {
	DisplayName string   `json:"displayName,omitempty"`
	FullName    string   `json:"fullName,omitempty"`
	Type        string   `json:"type,omitempty"`
	Values      []*value `json:"values,omitempty"`
}

type value struct {
	Field interface{} `json:"field,omitempty"`
	Score interface{} `json:"score,omitempty"`
}

type Node struct {
	DisplayName string    `json:"displayName,omitempty"`
	Key         *RedisKey `json:"key,omitempty" `
	Children    []*Node   `json:"children,omitempty"`
}

type domainStore struct{}

var DomainStore domainStore

func (s *domainStore) GetSingleKey(key string) *RedisKey {
	keyType := handleError(uredis.Client.Type(key).Result()).(string)
	redisKey := &RedisKey{DisplayName: key, FullName: key, Type: keyType}
	switch keyType {
	case "string":
		r := handleError(uredis.Client.Get(key).Result()).(string)
		redisKey.Values = []*value{&value{Score: r}}
	case "list":
		scores := handleError(uredis.Client.LRange(key, 0, -1).Result()).([]string)

		for _, s := range scores {
			redisKey.Values = append(redisKey.Values, &value{Score: s})
		}
	case "set":
		scores := handleError(uredis.Client.SMembers(key).Result()).([]string)

		for _, s := range scores {
			redisKey.Values = append(redisKey.Values, &value{Score: s})
		}
	case "hash":
		fieldWithScores := handleError(uredis.Client.HGetAll(key).Result()).(map[string]string)

		for k, v := range fieldWithScores {
			redisKey.Values = append(redisKey.Values, &value{k, v})
		}

	case "zset":
		fieldWithScores := handleError(uredis.Client.ZRangeWithScores(key, 0, -1).Result()).([]redis.Z)

		for _, z := range fieldWithScores {
			redisKey.Values = append(redisKey.Values, &value{z.Member, z.Score})
		}
	default:
		panic("unsupported key type")
	}

	return redisKey
}

func (s *domainStore) Search(pattern string) (redisKeys []*RedisKey) {
	keys, err := uredis.Client.Keys(pattern).Result()
	if err != nil {
		panic(err)
	}

	for _, k := range keys {
		redisKeys = append(redisKeys, s.GetSingleKey(k))
	}
	return
}

func handleError(v interface{}, err error) interface{} {
	if err != nil {
		panic(err)
	}
	return v
}

func AddKeyToNode(root *Node, key *RedisKey) {
	splits := splitKey(key.DisplayName)
	if len(splits) == 1 {
		root.Children = append(root.Children, &Node{DisplayName: key.DisplayName, Key: key})
		return
	}

	nodeDisplayName := fmt.Sprintf("%s%s*", splits[0], Seperator)
	key.DisplayName = strings.Join(splits[1:], Seperator)

	var exist bool
	for _, child := range root.Children {
		if child.DisplayName == nodeDisplayName {
			exist = true
			key.DisplayName = strings.Join(splits[1:], Seperator)

			root = child
		}
	}

	if !exist {
		newNode := &Node{DisplayName: nodeDisplayName}
		root.Children = append(root.Children, newNode)

		root = newNode
	}

	AddKeyToNode(root, key)
}

func splitKey(key string) []string {
	return strings.Split(key, Seperator)
}

type RedisCmd struct {
	Cmd  string
	Key  string
	Args []interface{}
}
