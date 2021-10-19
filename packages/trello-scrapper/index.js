require('dotenv').config()

const fetch = require('node-fetch')
const { log } = require('@pld-builder/core')
const { saveJsonOnDisk } = require('#src/saveJson')

const trelloCredentials = `key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_SERVER_TOKEN}`
const apiBaseUrl = "https://api.trello.com/1"


/**
 * 
 * @param {object} _
 * @param {string} _.elements - name in the uri (example: lists/cards/...)
 * @param {string} _.parents - name in the uri (example: boards/lists/...)
 * @param {string} _.parentID - id of the parent to fetch from
 * @returns {Promise<any[]>}
 */
async function fetchElementsFromParent({ elements, parents, parentID }) {
	try {
		const json = await fetch(`${apiBaseUrl}/${parents}/${parentID}/${elements}?${trelloCredentials}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}).then(response => {
			log.trace(
				`Response: ${response.status} ${response.statusText}`
			);
			return response.json();
		})

		return json;
	} catch (e) {
		console.error(e)
		return null
	}
}

async function fetchElementFromId(element, id) {
	try {
		const json = await fetch(`${apiBaseUrl}/${element}/${id}?${trelloCredentials}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}).then(response => {
			log.trace(
				`Response: ${response.status} ${response.statusText}`
			);
			return response.json();
		})

		return json;
	} catch (e) {
		console.error(e)
		return null
	}
}

/**
 *
 * @returns {Promise<import('#types/trello').Board[]>}
 */
async function fetchAllBoards() {
	return fetchElementsFromParent({
		elements: "boards",
		parents: "members",
		parentID: "me",
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

/**
 *
 * @param {string} boardID
 * @returns {Promise<import('#types/trello').List[]>}
 */
async function fetchListsFromBoard(boardID) {
	return fetchElementsFromParent({
		parents: "boards",
		parentID: boardID,
		elements: "lists"
	})
}

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

async function fetchLabelsFromBoard(boardID) {
	return fetchElementsFromParent({
		parents: "boards",
		parentID: boardID,
		elements: "labels"
	})
}


// (async function () {
// 	const boardID = process.env.PLD_BOARD_ID

// 	const lists = await fetchListsFromBoard(boardID)
// 	console.log(lists)
// 	console.log()

// 	// saveJsonOnDisk(JSON.stringify(lists), "boardLists")

// 	const cards = await fetchCardsFromBoard(boardID)
// 	console.log(cards)
// 	console.log()

// 	const descriptionDelims = {
// 		iWant: ":eyes:",
// 		description: ":book:",
// 		DoD: ":pencil:",
// 		time: ":hourglass:",
// 	}

// 	// if (!lists) return;
// 	// lists.forEach(list => {
// 	// 	const cards = await fetchCardsFromList(list.id)
// 	// })
// })();


const boardID = "61484cc01d592e86a2505fb1";

(async function () {

	// const boards = await fetchAllBoards()
	// log.info(boards)

	// const board = boards.find((b) => b.name === process.env.PLD_BOARD_NAME)
	// if (!board) {
	// 	log.fatal(`Can't find a board named "${process.env.PLD_BOARD_NAME}" in your Trello account`)
	// }

	// const lists = await fetchListsFromBoard(board.id)
	// lists.forEach(list => {
	// 	list.
	// })

	const card = await fetchElementFromId("Cards", "61484cc01d592e86a2505fb1")

	saveJsonOnDisk(JSON.stringify(card), "__tests__/res/validCard")

	// console.log(card)
	// console.log(card.desc)
	// console.log(card.badges)
})();


/*
#Je veux :eyes:
Avoir une batterie de test qui est appelé à chacun de mes commit pour véfirier la validité de mon code

---

#Description :book:
A chaque commit, une série de test écrite au préalable est réalisé au sein de Gitlab pour s’assurer que mon code est valide

---

#Definition of Done :pencil:
- Avoir au moins 60% de coverage du code aussi bien sur le script de Scrapping que le Builder
- Tests au moment de commit sur Gitlab

---

1.5 J/H :hourglass:
---
*/