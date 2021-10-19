const {
	optionalAppend,
	stringIsUrl,
} = require("../src/string")

test('append if not present at the end', () => {
	expect(optionalAppend('foo', '.jpg')).toEqual('foo.jpg')
	expect(optionalAppend('foo.jpge', '.jpg')).toEqual('foo.jpge.jpg')
})

test("doesn't append if already present", () => {
	expect(optionalAppend('foo.jpg', '.jpg')).toEqual('foo.jpg')
	expect(optionalAppend('oofoo', 'foo')).toEqual('oofoo')
})

test("check that string is a valid url", () => {
	expect(stringIsUrl("https://google.com")).toBeTruthy()
	expect(stringIsUrl("https://www.google.com")).toBeTruthy()
	expect(stringIsUrl("https://www.google.com/img?q=dog")).toBeTruthy()
})

test("check that string isn't a valid url", () => {
	expect(stringIsUrl("google.com")).toBeFalsy()
	expect(stringIsUrl("/www.google.com")).toBeFalsy()
})