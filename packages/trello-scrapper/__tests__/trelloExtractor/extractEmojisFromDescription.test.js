const {
	extractEmojisFromDescription,
} = require('#src/trelloExtractor')

const indexTemplateCard = `
#Description :book:
...

---

#Sections :paperclip:
1. ...
1. ...
1. ...

---

#Features :art:
- ...
- ...
`

const userStoryTemplateCard = `
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
`

const expectedIndexProperties = Object.freeze(["description", "cards", "features"])
const expectedUserStoryProperties = Object.freeze(["wantTo", "description", "DoD", "estimatedTime"])

// test("should extract user story related emoji from the template card description", () => {
// 	expect(extractUserStoryPropertiesEmojiFromTemplateCard(templateCard)).toEqual({
// 		wantTo: "eyes",
// 		description: "book",
// 		DoD: "pencil",
// 		estimatedTime: "hourglass",
// 	})
// })

test("shouldn't extract user story related emoji because emojis are missing", () => {
	expect(extractEmojisFromDescription({
		description: `
		:eyes:
		:book:
		:paperclip:
		:paperclip:
	`, expectedProperties: expectedUserStoryProperties
	})).toBeNull()
})

test("should extract user story related emoji", () => {
	expect(extractEmojisFromDescription({
		description: userStoryTemplateCard,
		expectedProperties: expectedUserStoryProperties
	})).toEqual({
		wantTo: "eyes",
		description: "book",
		DoD: "pencil",
		estimatedTime: "hourglass"
	})
})

// test("should extract index list related emoji", () => {
// 	expect(extractEmojisFromDescription({
// 		description: indexTemplateCard,
// 		expectedProperties: expectedIndexProperties
// 	})).toEqual({
// 		description: "book",
// 		cards: "paperclip",
// 		features: "art"
// 	})
// })

// test("should extract index list related emoji even if emojis are missing", () => {
// 	expect(extractEmojisFromDescription({
// 		description: `
// 		:book:
// 		:paperclip:
// 	`, expectedProperties: expectedIndexProperties,
// 		acceptMissingEmojis: true
// 	})).toEqual({
// 		description: "book",
// 		cards: "paperclip"
// 	})
// })