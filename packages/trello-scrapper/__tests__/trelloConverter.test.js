const {
	convertTrelloCardToRankedUserStory,
	_getIdAndNameOfCard
} = require('../src/trelloConverter')

// test('append if not present at the end', () => {
// 	const card = require('./res/validCard.json')

	
// 	expect(optionalAppend('foo', '.jpg')).toEqual('foo.jpg')
// 	expect(optionalAppend('foo.jpge', '.jpg')).toEqual('foo.jpge.jpg')
// })

test('must find both id', () => {
	expect(_getIdAndNameOfCard("1.2 Choose the best tools")).toEqual({
		secId: 1,
		id: 2,
		name: "Choose the best tools"
	})
})

test('must fail to parse and return null', () => {
	expect(_getIdAndNameOfCard("1.2.3 Choose the best tools")).toEqual(null)

})