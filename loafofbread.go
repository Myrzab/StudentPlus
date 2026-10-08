package piscine

func LoafOfBread(str string) string {
	runes := []rune(str)
	var result string
	count := 0
	skip := false

	for _, ch := range runes {
		if ch == ' ' {
			continue
		}

		if skip {
			skip = false
			continue
		}

		if count == 5 {
			result += " "
			count = 0
		}

		result += string(ch)
		count++

		if count == 5 {
			skip = true
		}
	}

	if len([]rune(result)) < 5 {
		return "Invalid Output\n"
	}

	return result + "\n"
}
