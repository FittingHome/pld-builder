const {
	extractFirstMarkdownEmojiFromLine,
} = require('#src/trelloExtractor')


test("must return null cause it can't find the emoji", () => {
	expect(extractFirstMarkdownEmojiFromLine("The quick brown fox")).toBeNull()
	expect(extractFirstMarkdownEmojiFromLine("The quick: brown fox")).toBeNull()
	expect(extractFirstMarkdownEmojiFromLine("The quick: brown: fox")).toBeNull()
	expect(extractFirstMarkdownEmojiFromLine("")).toBeNull()
})

test("must return the first emoji found", () => {
	expect(extractFirstMarkdownEmojiFromLine("The :quick: :brown: fox")).toEqual("quick")
	expect(extractFirstMarkdownEmojiFromLine("The :quick :brown :fox:")).toEqual("fox")
})