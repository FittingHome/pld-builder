require('dotenv').config()

const fetch = require('node-fetch')
const { log } = require('@pld-builder/core')
const { saveJsonOnDisk } = require('#src/saveJson')
const { convertTrelloIndexCardToData,
	convertTrelloCardToAssignedUserStory } = require('#src/trelloConverter')

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

async function fetchMembersFromBoard(boardID) {
	return fetchElementsFromParent({
		parents: "boards",
		parentID: boardID,
		elements: "members"
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


const boardID = "614a11b9e985b2565009fcdf";

const jsonFileName = "pldData.json";

(async function () {


	const boards = await fetchAllBoards()

	// const board = await fetchElementFromId({
	// 	element: "boards",
	// 	id: boardID
	// })
	// console.log(board)

	const board = boards.find((b) => b.name === process.env.PLD_BOARD_NAME)
	if (!board) {
		log.fatal(`Can't find a board named "${process.env.PLD_BOARD_NAME}" in your Trello account`)
	}
	// console.log(board)

	const members = await fetchMembersFromBoard(board.id)
	console.log(members)

	/** @type {import('@pld-builder/core/types/data').PldData} */
	const pldData = {
		logo: "./assets/logo.png",
		deliverables: []
	};

	const lists = await fetchListsFromBoard(board.id)
	for (const list of lists) {
		const cards = await fetchCardsFromList(list.id)

		if (list.name.startsWith("[[")) {
			pldData.name = list.name.replace('[[', '').replace(']]', '')

			cards.forEach(card => {
				if (card.name === "Index") {
					const data = convertTrelloIndexCardToData(card, false)
					if (!data) {
						throw `Can't find "Index" card of the list ${list.name}`
					}
					pldData.promotionYear = data.school
				}
				return
			})
		} else {
			try {
				if (list.name.startsWith("[")) {
					/** @type {import('@pld-builder/core/types/data').Deliverable} */
					const deliverable = {
						sections: []
					}
					deliverable.name = list.name.replace('[', '').replace(']', '')

					cards.forEach(card => {
						if (card.name === "Index") {
							const data = convertTrelloIndexCardToData(card, true)
							if (!data) {
								throw `Can't find "Index" card of the list ${list.name}`
							}
							data.sections.forEach(section => {
								deliverable.sections.push({
									name: section,
									stories: []
								})
							})
						} else {
							log.debug("nb sections:", deliverable.sections)
							const aus = convertTrelloCardToAssignedUserStory(card, members)
							deliverable.sections[aus.secId - 1].stories.push(aus)
						}
					})
					pldData.deliverables.push(deliverable)
				}
			} catch (e) {
				log.error(e)
			}
		}
	}

	if (!pldData.name) {
		log.error(`Failed to create "${jsonFileName}" because some mandatory informations are missing in the trello board`)
		return
	}

	saveJsonOnDisk(JSON.stringify(pldData), "pldData")
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