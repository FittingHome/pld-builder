const {invertObject} = require('#src/invertObject')

test("should invert values with keys", () => {
	expect(invertObject({
		a: "1",
		b: 2,
		c: [1, "a"],
		d: null,
		e: undefined,
		f: undefined
	})).toEqual({
		"1": "a",
		2: "b",
		"1,a": "c",
		"null": "d",
		"undefined": "f"
	})
})