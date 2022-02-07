const fs = require('fs-extra')
const fetch = require('node-fetch')
const path = require('path')
const { log, optionalAppend } = require('@pld-builder/core')

const apiBaseUrl = "https://api.trello.com/1"
const trelloCredentials = `key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_SERVER_TOKEN}`

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
			)
			return response.json()
		})

		return json
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
			)
			return response.json()
		})

		return json
	} catch (e) {
		console.error(e)
		return null
	}
}

/**
 * 
 * @param {string} downloadUrl
 * @param {object} _
 * @param {string} _.imgName
 * @param {string} [_.folderPath]
 * @returns {Promise<boolean>} works or not
 */
async function downloadImageFromAttachment(downloadUrl, {imgName, folderPath}) {
	// - Put default value to folderPath if it wasn't pass as parameter
	folderPath = !folderPath ? "./" : folderPath

	try {
		const json = await fetch(`${downloadUrl}?${trelloCredentials}`, {
			method: 'GET',
			headers: {
				'Authorization': `OAuth oauth_consumer_key="${process.env.TRELLO_API_KEY}, oauth_token="${process.env.TRELLO_SERVER_TOKEN}"`
			}
		}).then(response => {
			log.trace(
				`Response: ${response.status} ${response.statusText}`
			)
			fs.ensureDirSync(folderPath)
			response.body.pipe(fs.createWriteStream(`${optionalAppend(folderPath, '/')}${imgName}${path.parse(downloadUrl).ext}`))
			return true
		})
	} catch (e) {
		console.error(e)
		return false
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

async function fetchLabelsFromBoard(boardID) {
	return fetchElementsFromParent({
		parents: "boards",
		parentID: boardID,
		elements: "labels"
	})
}

/**
 *
 * @param {string} boardID
 * @returns {Promise<import('#types/trello').Member[]>}
 */
async function fetchMembersFromBoard(boardID) {
	return fetchElementsFromParent({
		parents: "boards",
		parentID: boardID,
		elements: "members"
	})
}

/**
 *
 * @param {string} cardId
 * @returns {Promise<import('#types/trello').Attachment[]>}
 */
async function fetchAttachmentsFromCard(cardId) {
	return fetchElementsFromParent({
		parents: "cards",
		parentID: cardId,
		elements: "attachments"
	})
}

module.exports = {
	fetchElementsFromParent,
	fetchElementFromId,
	fetchAllBoards,
	fetchLabelsFromBoard,
	fetchListsFromBoard,
	fetchMembersFromBoard,
	fetchAttachmentsFromCard,
	downloadImageFromAttachment,
}