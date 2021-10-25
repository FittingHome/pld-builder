const {
	convertTrelloCardToAssignedUserStory,
	convertTrelloIndexCardToData,
	_extractIdsAndNameFromCardName,
	_extractFirstMarkdownEmojiFromLine,
	_extractMainInfosFromCardDesc
} = require('#src/trelloConverter')

let validCard = {};
const members = Object.freeze([
	{
		id: "5aa949dc81bcf294a62212a2",
		fullname: "Vincent Faivre",
		username: "Krakor",
	}
])

beforeAll(() => {
	validCard = Object.freeze(require('./res/validCard.json'))
});

test('must find both id', () => {
	expect(_extractIdsAndNameFromCardName("1.2 Choose the best tools")).toEqual({
		secId: 1,
		id: 2,
		name: "Choose the best tools"
	})
})

test('must fail to parse and return null', () => {
	expect(_extractIdsAndNameFromCardName("1.2.3 Choose the best tools")).toBeNull()
	expect(_extractIdsAndNameFromCardName("a.2 Choose the best tools")).toBeNull()
	expect(_extractIdsAndNameFromCardName("1.b Choose the best tools")).toBeNull()
})

test("must return null cause it can't find the emoji", () => {
	expect(_extractFirstMarkdownEmojiFromLine("The quick brown fox")).toBeNull()
	expect(_extractFirstMarkdownEmojiFromLine("The quick: brown fox")).toBeNull()
	expect(_extractFirstMarkdownEmojiFromLine("The quick: brown: fox")).toBeNull()
})



test("_extractMainInfosFromCardDesc", () => {
	const desc = `#I want :eyes:
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

	expect(_extractMainInfosFromCardDesc(desc)).toEqual({
		wantTo: "To break free",
		description: "Quick description\nof the user story",
		DoD: [
			"- This",
			"- And this",
		],
		estimatedTime: 1.5
	})
})

test("_extractMainInfosFromCardDesc minimal requirements", () => {
	const desc = `:eyes:
To break free
:book:
Quick description
of the user story
:pencil:
- This
- And this
1.5 :hourglass:`

	expect(_extractMainInfosFromCardDesc(desc)).toEqual({
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

	expect(_extractMainInfosFromCardDesc(desc)).toEqual({
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

	expect(_extractMainInfosFromCardDesc(desc)).toBeNull()
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

	expect(_extractMainInfosFromCardDesc(desc)).toBeNull()
})


test("convertTrelloCardToAssignedUserStory", () => {
	const aus = convertTrelloCardToAssignedUserStory(validCard, members)

	expect(aus).not.toBeNull()
	expect(aus.secId).toEqual(1)
	expect(aus.id).toEqual(2)
	expect(aus.name).toEqual("Mise en place d'une CI/CD")
	expect(aus.assignedTo).toEqual("Vincent Faivre")
	expect(aus.estimatedTime).toEqual(1.5)
})