const {
	extractUserStoryIdAndNameFromCardName,
	extractMainInfosFromCardDesc,
	extractMeaningulArrayFromString,
	// extractUserStoryPropertiesEmojiFromTemplateCard,
} = require('#src/trelloExtractor')

const {
	convertNoisyInfosToIndexListInfos,
	convertNoisyInfosToUserStoryInfos,
} = require('#src/trelloConverter')

const usEmojis = require('../res/usEmojis')
const indexEmojis = require('../res/indexEmojis')

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