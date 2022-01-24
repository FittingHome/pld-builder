const {
	convertTrelloCardToAssignedUserStory,
} = require('#src/trelloConverter')

const usEmojis = require('./res/usEmojis.json')

/** @type {import('#types/trello').Card} */
let validCard;
const members = Object.freeze([
	{
		id: "5aa949dc81bcf294a62212a2",
		fullName: "Vincent Faivre",
		username: "Krakor",
	}
])

beforeAll(() => {
	validCard = Object.freeze(require('./res/validCard.json'))
});

test("convertTrelloCardToAssignedUserStory", () => {
	const aus = convertTrelloCardToAssignedUserStory(validCard, "", usEmojis)

	expect(aus).not.toBeNull()
	expect(aus.secId).toEqual(1)
	expect(aus.id).toEqual(2)
	expect(aus.name).toEqual("Mise en place d'une CI/CD")
	expect(aus.assignedTo).toEqual("5aa949dc81bcf294a62212a2")
	expect(aus.estimatedTime).toEqual(1.5)
})