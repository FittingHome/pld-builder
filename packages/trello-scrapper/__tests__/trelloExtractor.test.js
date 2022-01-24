const {
	extractUserStoryIdAndNameFromCardName,
	extractFirstMarkdownEmojiFromLine,
	extractMainInfosFromCardDesc,
	extractMeaningulArrayFromString,
	// extractUserStoryPropertiesEmojiFromTemplateCard,
	extractEmojisFromDescription,
} = require('#src/trelloExtractor')

const {
	convertNoisyInfosToIndexListInfos,
	convertNoisyInfosToUserStoryInfos,
} = require('#src/trelloConverter')

const usEmojis = require('./res/usEmojis')
const indexEmojis = require('./res/indexEmojis')

console.log(usEmojis)

const classicUserStory = `#I want :eyes:
To break free
---

#Description :book:
Quick description
of the user story

---

#Definition of Done :pencil:
- This
- And this

---

1.5 J/H :hourglass:
---`


test('must find both id', () => {
	expect(extractUserStoryIdAndNameFromCardName("1.2 Choose the best tools")).toEqual({
		secId: 1,
		id: 2,
		name: "Choose the best tools"
	})
})

test('must fail to parse and return null', () => {
	expect(extractUserStoryIdAndNameFromCardName("1.2.3 Choose the best tools")).toBeNull()
	expect(extractUserStoryIdAndNameFromCardName("a.2 Choose the best tools")).toBeNull()
	expect(extractUserStoryIdAndNameFromCardName("1.b Choose the best tools")).toBeNull()
	expect(extractUserStoryIdAndNameFromCardName("1 Choose the best tools")).toBeNull()
})

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



test("should extract main information from card description", () => {
	expect(extractMainInfosFromCardDesc(classicUserStory, usEmojis, convertNoisyInfosToUserStoryInfos)).toEqual({
		wantTo: "To break free",
		description: "Quick description\nof the user story",
		DoD: [
			"- This",
			"- And this",
		],
		estimatedTime: 1.5
	})
})

test("extractMainInfosFromCardDesc minimal requirements", () => {
	const desc = `:eyes:
To break free
:book:
Quick description
of the user story
:pencil:
- This
- And this
1.5 :hourglass:`

	expect(extractMainInfosFromCardDesc(desc, usEmojis, convertNoisyInfosToUserStoryInfos)).toEqual({
		wantTo: "To break free",
		description: "Quick description\nof the user story",
		DoD: [
			"- This",
			"- And this",
		],
		estimatedTime: 1.5
	})
})

test("invalid emoji in description", () => {
	const desc = `:eyes:
To break free
:book:
Quick description
:oof:
of the user story
:pencil:
- This
- And this
1.5 :hourglass:`

	expect(extractMainInfosFromCardDesc(desc, usEmojis, convertNoisyInfosToUserStoryInfos)).toEqual({
		wantTo: "To break free",
		description: "Quick description",
		DoD: [
			"- This",
			"- And this",
		],
		estimatedTime: 1.5
	})
})


test("missing emoji in description", () => {
	const desc = `:eyes:
To break free
:pencil:
- This
- And this
1.5 :hourglass:`

	expect(extractMainInfosFromCardDesc(desc, usEmojis, convertNoisyInfosToUserStoryInfos)).toBeNull()
})

test("invalid estimated time in description", () => {
	const desc = `:eyes:
To break free
:book:
Quick description
of the user story
:pencil:
- This
- And this
:hourglass: 1.5`

	expect(extractMainInfosFromCardDesc(desc, usEmojis, convertNoisyInfosToUserStoryInfos)).toBeNull()
})

test("should only extract lines with alphanumeric", () => {
	expect(extractMeaningulArrayFromString(classicUserStory)).toEqual([
		"#I want :eyes:",
		"To break free",
		"#Description :book:",
		"Quick description",
		"of the user story",
		"#Definition of Done :pencil:",
		"- This",
		"- And this",
		"1.5 J/H :hourglass:"
	])
})

test("should extract nothing because there aren't any lines with alphanumeric", () => {
	expect(extractMeaningulArrayFromString(`
	--
	__
	()
`)).toEqual([])
})

/** @type {import('#types/trello').Card} */
const templateCard = {
	desc: `
#Je veux :eyes:
...

---

#Description :book:
...

---

#Definition of Done :pencil:
- ...
- ...

---

... J/H :hourglass:
---
`,
	isTemplate: true
}

const expectedUserStoryProperties = Object.freeze(["wantTo", "description", "DoD", "estimatedTime"])
const expectedIndexProperties = Object.freeze(["description", "cards"])

// test("should extract user story related emoji from the template card description", () => {
// 	expect(extractUserStoryPropertiesEmojiFromTemplateCard(templateCard)).toEqual({
// 		wantTo: "eyes",
// 		description: "book",
// 		DoD: "pencil",
// 		estimatedTime: "hourglass",
// 	})
// })

test("shouldn't extract user story related emoji because emojis are missing", () => {
	expect(extractEmojisFromDescription({description: `
		:eyes:
		:book:
		:paperclip:
		:paperclip:
	`, expectedProperties: expectedUserStoryProperties})).toBeNull()
})

test("should extract index list related emoji", () => {
	expect(extractEmojisFromDescription({
		description: `
#Description :book:
...

---

#Cartes :paperclip:
1. ...
2. ...
3. ...
	`, expectedProperties: expectedIndexProperties
	})).toEqual({
		description: "book",
		cards: "paperclip"
	})
})