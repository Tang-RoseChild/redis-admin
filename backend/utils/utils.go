package utils

func FilterError(v interface{}, err error) interface{} {
	if err != nil {
		panic(err)
	}
	return v
}

func ToInterfaceSlice(src []string) []interface{} {
	dst := make([]interface{}, len(src))
	for i := range src {
		dst[i] = src[i]
	}

	return dst
}
