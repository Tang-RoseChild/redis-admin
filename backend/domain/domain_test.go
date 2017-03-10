package domain

import (
	"testing"

	"github.com/Tang-RoseChild/redis-admin/backend/utils/uredis"

	"github.com/stretchr/testify/assert"
	redis "gopkg.in/redis.v5"
)

func init() {
	uredis.Connect(&redis.Options{Addr: "127.0.0.1:6379", DB: 11})
}
func TestAddKey(t *testing.T) {
	redisKey := &RedisKey{
		FullName:    "a:b:c:d",
		DisplayName: "a:b:c:d",
	}

	root := &Node{DisplayName: "allKeys"}
	AddKeyToNode(root, redisKey)
	_root := &Node{
		DisplayName: "a:*",
		Children: []*Node{
			&Node{
				DisplayName: "b:*",
				Children: []*Node{
					&Node{
						DisplayName: "c:*",
						Children: []*Node{
							&Node{
								DisplayName: "d",
								Key:         redisKey,
							},
						},
					},
				},
			},
		},
	}

	assert.Equal(t, root.Children[0], _root)
}
