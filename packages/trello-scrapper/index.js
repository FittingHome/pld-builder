require('dotenv').config()

const { log, saveJsonOnDisk, invertObject } = require('@pld-builder/core')
const {
	convertTrelloMainIndexCardToData,
	convertTrelloDeliverableIndexCardToData,
	convertTrelloListToDeliverable,
	convertMainListToData,
} = require('#src/trelloConverter')
const { fetchListsFromBoard,
	fetchCardsFromList,
	fetchAllBoards,
	fetchMembersFromBoard, 
} = require('#src/trelloFetcher')

const jsonFileName = "pldData.json"

;(async function () {
	const boards = await fetchAllBoards()

	// - Find the targeted pld board from all the boards fetched
	const board = boards.find((b) => b.name === process.env.PLD_BOARD_NAME)
	if (!board) {
		log.fatal(`Can't find a board named "${process.env.PLD_BOARD_NAME}" in your Trello account`)
		return
	}

	const members = await fetchMembersFromBoard(board.id)
	log.info({members})

	const pldData = await extractPldDataFromBoard(board.id)

	// - This function might appear wrong but it is actually used as a last resort if the member didn't assigned himself on its progress card yet
	// - So it gives him its account full name as a temporary fix
	switchAllAssignedToIdsToTheirName(pldData, members.map(({ id, fullName }) => ({ id, name: fullName })))

	if (!pldData.name) {
		log.error(`Failed to create "${jsonFileName}" because some mandatory informations are missing in the trello board`)
		return
	}

	saveJsonOnDisk(JSON.stringify(pldData), "pldData")
})();

/**
 * 
 * @param {string} boardId 
 * @returns {Promise<import('@pld-builder/core/types/data').PldData>}
 */
async function extractPldDataFromBoard(boardId) {
	/** @type {import('@pld-builder/core/types/data').PldData} */
	const pldData = {
		logo: "",
		deliverables: []
	};

	let myUSEmojis = null
	let myIndexEmojis = null

	/** @type {{id: string, name: string}[]?} */
	let membersName = null
	const lists = await fetchListsFromBoard(boardId)
	for (const list of lists) {
		// - We're on the main list of the EIP (it must be the first)
		if (list.name.startsWith("[[")) {
			try {
				const { name, promotionYear, logo, usEmojis, indexEmojis } = await convertMainListToData(list)
				pldData.name = name
				pldData.promotionYear = promotionYear
				pldData.logo = logo
				myUSEmojis = invertObject(usEmojis)
				myIndexEmojis = invertObject(indexEmojis)
				log.info({ indexEmojis, usEmojis })
			} catch (e) {
				log.fatal(e)
				return
			}
		}
		// - We're on a deliverable list
		else if (list.name.startsWith("[")) {
			const deliverable = await convertTrelloListToDeliverable({ list, usEmojis: myUSEmojis, indexEmojis: myIndexEmojis })
			if (deliverable) {
				pldData.deliverables.push(deliverable)
			}
		}
		// - We're on the progress report list. Right now it is used to retrieve real name of every member of the board
		else if (list.name === "Rapport d'avancement") {
			membersName = await extractRealNameFromProgressReportList(list)
		}
	}

	if (membersName) {
		switchAllAssignedToIdsToTheirName(pldData, membersName)
	}

	return pldData
}

/**
 * 
 * @param {import('#types/trello').List} list
 */
async function extractRealNameFromProgressReportList(list) {
	const cards = await fetchCardsFromList(list.id)
	log.info(`There are ${cards.length} cards in ${list.name} (list)`)

	const members = []
	for (const card of cards) {
		if (card.idMembers.length !== 1) {
			log.warn(`Can't determine to who '${card.name}' progress card belongs in the board. There should be exactly one member following the card`)
			continue
		}

		members.push({
			id: card.idMembers[0],
			name: card.name
		})
	}
	return members
}

/**
 * 
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 * @param {import('@pld-builder/core/types/data').User[]} membersName 
 */
function switchAllAssignedToIdsToTheirName(pldData, membersName) {
	const { deliverables } = pldData;
	if (!deliverables) {
		return
	}

	for (const del of deliverables) {
		for (const sec of del.sections) {
			for (const us of sec.stories) {
				const assignedMember = membersName.find(m => m.id === us.assignedTo)
				if (!assignedMember) {
					// log.warn(`Don't know user with id ${us.assignedTo}`)
					continue
				}

				us.assignedTo = assignedMember.name
			}
		}
	}
}