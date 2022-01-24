const { fetchElementsFromParent } = require('#src/fetch/trelloAnyFetcher')

/**
 * 
 * @param {string} boardID 
 * @returns {Promise<import('#types/trello').Card[]>}
 */
async function fetchCardsFromBoard(boardID) {
	return fetchElementsFromParent({
		parents: "boards",
		parentID: boardID,
		elements: "cards"
	})
}

/**
 *
 * @param {string} listID
 * @returns {Promise<import('#types/trello').Card[]>}
 */
async function fetchCardsFromList(listID) {
	return fetchElementsFromParent({
		elements: "cards",
		parents: "lists",
		parentID: listID,
	})
}

module.exports = {
	fetchCardsFromBoard,
	fetchCardsFromList,
}