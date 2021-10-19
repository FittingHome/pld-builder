const { log } = require('@pld-builder/core')

/**
 * @param {import('#types/trello').Card} card
 * @returns {import('@pld-builder/core/types/data').RankedUserStory?}
 */
function convertTrelloCardToRankedUserStory(card) {
	if (!card) return null



	/** @type {import('@pld-builder/core/types/data').RankedUserStory} */
	// const rus = {
	// 	secId: 

	// }
}

const errorMsg = (name) => {
	log.error(`Card named ${name} must have a name formatted like so: "x.y name" where x and y are positive digits`)
	return null
}

/**
 * 
 * @param {string} name 
 */
function _getIdAndNameOfCard(name) {
	const result = {}

	const spaceId = name.indexOf(' ')

	const ids = name.substr(0, spaceId)
	const idsSplit = ids.split('.')

	if (idsSplit.length > 2) return errorMsg(name)

	result.secId = parseInt(idsSplit[0])
	if (isNaN(result.secId)) return errorMsg(name)

	result.id = parseInt(idsSplit[1])
	if (isNaN(result.id)) return errorMsg(name)

	result.name = name.substr(spaceId + 1)
	return result
}

module.exports = {
	convertTrelloCardToRankedUserStory,

	_getIdAndNameOfCard
}