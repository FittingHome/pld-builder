require('dotenv').config()

const { log, saveJsonOnDisk } = require('@pld-builder/core')

const { fetchAllBoards } = require('#src/trelloFetcher')
const { convertTrelloBoardToPldData } = require('#src/trelloConverter')

const jsonFileName = "pldData.json"

const options = require('./src/options');

	; (async function () {
		const boards = await fetchAllBoards()

		// - Find the targeted pld board from all the boards fetched
		const board = boards.find((b) => b.name === process.env.PLD_BOARD_NAME)
		if (!board) {
			log.fatal(`Can't find a board named "${process.env.PLD_BOARD_NAME}" in your Trello account.
Check that the value given to PLD_BOARD_NAME in your .env file matches the name of an existing board in your Trello workspace.`)
			return
		}

		const pldData = await convertTrelloBoardToPldData(board.id, { ...options })

		// - These two lines might appear redundant but they are actually used as a last resort if the member didn't assigned himself on its Trello progress card yet
		// - So it gives him its account full name as a temporary fix instead of its user id
		// const members = await fetchMembersFromBoard(board.id)
		// switchAllAssignedToIdsToTheirName(pldData, members.map(({ id, fullName }) => ({ id, name: fullName })))

		if (!pldData?.name || !pldData?.promotionYear) {
			log.error(`Failed to create "${jsonFileName}" because some mandatory informations are missing in the trello board`)
			return
		}

		saveJsonOnDisk(JSON.stringify(pldData), jsonFileName)

		logPldDataSummary(pldData)
	})();


/**
 * 
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 */
function logPldDataSummary({ promotionYear, name, logo, deliverables, members }) {
	const loggedData = { name, promotionYear, logo, nbMembers: members.length, nbDeliverables: deliverables.length }
	console.table(loggedData)
	console.table(members.reduce((acc, cur) =>
		({ ...acc, ...{ [cur.fullname]: { "timeAssigned": cur.timeAssigned } } })
		, {}))
}