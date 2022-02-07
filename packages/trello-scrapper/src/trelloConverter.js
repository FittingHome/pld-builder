/**
 * File that contains high level functions that need functions from all other files to work
 */

const path = require('path')
const { log, invertObject } = require('@pld-builder/core')

const {
	extractFirstMarkdownEmojiFromLine,
	extractUserStoryIdAndNameFromCardName,
	extractMainInfosFromCardDesc,
	extractMeaningulArrayFromString,
	extractEmojisFromDescription,
	// extractUserStoryPropertiesEmojiFromTemplateCard,
} = require('#src/trelloExtractor')

const {
	fetchCardsFromList,
	fetchAttachmentsFromCard,
	downloadImageFromAttachment,
	fetchMembersFromBoard,
	fetchListsFromBoard,
} = require('#src/trelloFetcher')

const { switchAllAssignedToIdsToTheirName } = require('#src/trelloSanitizer')

/**
 * @param {import('#types/trello').Card} card
 * @param {object} options
 * @param {string} [options.downloadAttachmentsFolder]

 */
async function convertTrelloMainIndexCardToData(card, { downloadAttachmentsFolder }) {
	if (!card) return null

	const result = {}

	const txt = extractMeaningulArrayFromString(card.desc)
	txt.forEach(line => {
		const newEmoji = extractFirstMarkdownEmojiFromLine(line)
		if (!newEmoji) {
			return
		}

		result[newEmoji] = parseInt(line)
	})

	if (!result.school || isNaN(result.school)) return null

	if (downloadAttachmentsFolder) {
		const attachments = await fetchAttachmentsFromCard(card.id)
		for (const attachment of attachments) {
			log.info({ attachment })
			if (attachment.name === "logo" && (attachment.mimeType === "image/jpeg" || attachment.mimeType === "image/png")) {
				const downloadedSucessfully = await downloadImageFromAttachment(attachment.url, {imgName: "logo", folderPath: downloadAttachmentsFolder})
				log.info({ downloadedSucessfully })
				result.logo = `./assets/logo${path.parse(attachment.fileName).ext}`
				break
			}
		}
	}

	return result
}

/**
 * @param {import('#types/trello').Card} card
 * @param {object} emojisToProp
 */
function convertTrelloDeliverableIndexCardToData(card, emojisToProp) {
	return extractMainInfosFromCardDesc(card.desc, emojisToProp, convertNoisyInfosToIndexListInfos)
	// const mainInfos = extractMainInfosFromCardDesc(card.desc, emojisToProp, convertNoisyInfosToIndexListInfos)
	// if (!mainInfos) return null

	// return mainInfos
}

/**
 * @param {import('#types/trello').Card} card
 * @param {string?} alreadyAssignedMemberId
 * @param {object} emojisToProp
 * @returns {import('@pld-builder/core/types/data').AssignedUserStory?}
 */
function convertTrelloCardToAssignedUserStory(card, alreadyAssignedMemberId, emojisToProp) {
	if (!card) return null

	// - The card is in the backlog
	if (card.cover.color === "purple") return null

	const nameIds = extractUserStoryIdAndNameFromCardName(card.name)
	if (!nameIds) {
		console.log({ card })
		return null
	}

	const mainInfos = extractMainInfosFromCardDesc(card.desc, emojisToProp, convertNoisyInfosToUserStoryInfos)
	if (!mainInfos) return null

	if (card.labels.length !== 1) {
		log.warn(`You must have a single label on "${card.name}" (card) to indicate who it is for`)
		return null;
	}
	const as = card.labels[0].name

	let assignedTo = alreadyAssignedMemberId
	if (card.idMembers.length === 1) {
		assignedTo = card.idMembers[0]
	}

	if (!assignedTo) {
		log.warn(`You must have one (and only one) member assigned to "${card.name}" (card)`)
		return null;
	}

	return { ...nameIds, ...mainInfos, as, assignedTo }
}

const expectedUserStoryProperties = Object.freeze(["wantTo", "description", "DoD", "estimatedTime"])
const expectedIndexProperties = Object.freeze(["description", "sections", "features"])


/**
 * @param {import('#types/trello').List} list - its name must be of the form '[[name]]'
 * @param {object} options
 * @param {string} [options.downloadAttachmentsFolder]
 * @returns {Promise<{
 * name: string,
 * promotionYear: number,
 * logo: string,
 * usEmojis: import('#types/pld').UserStoryPropertiesEmoji,
 * indexEmojis: import('#types/pld').IndexListPropertiesEmoji
 * }>}
 * @throws {string}
 */
async function convertMainListToData(list, {downloadAttachmentsFolder}) {
	const { name, id } = list
	const cards = await fetchCardsFromList(list.id)

	const result = {
		name: name.replace('[[', '').replace(']]', '')
	}

	for (const card of cards) {
		log.debug(card.name)
		if (card.name === "Index") {
			const data = await convertTrelloMainIndexCardToData(card, { downloadAttachmentsFolder })
			log.info(data)
			if (!data) {
				throw `Can't find "Index" card of the list ${name} or some informations are missing`
			}
			result.promotionYear = data.school
			result.logo = data.logo
		}
		else if (card.name === "Index List Template") {
			const emojis = extractEmojisFromDescription({ description: card.desc, expectedProperties: expectedIndexProperties })
			if (!emojis) {
				throw `Can't find index list emoji templated card in the list ${name} or some informations are missing`
			}
			result.indexEmojis = emojis
		}
		else if (card.name === "User Story Template") {
			const emojis = extractEmojisFromDescription({ description: card.desc, expectedProperties: expectedUserStoryProperties })
			if (!emojis) {
				throw `Can't find user story emoji templated card in the list ${name} or some informations are missing`
			}
			result.usEmojis = emojis
		}
	}

	return result
}

/**
 * Might return null if there are informations missing
 * @param {object} _
 * @param {import('#types/trello').List} _.list 
 * @param {object} _.usEmojis 
 * @param {object} _.indexEmojis,
 * @returns {Promise<import('@pld-builder/core/types/data').Deliverable?>}
 */
async function convertTrelloListToDeliverable({ list, usEmojis, indexEmojis }) {
	try {
		const sections = []
		const name = list.name.replace('[', '').replace(']', '')
		const features = []


		const cards = await fetchCardsFromList(list.id)
		log.info(`There are ${cards.length} cards in ${list.name} (list)`)

		/** @type {string?} */
		let sectionAssignedMemberId = null
		for (const card of cards) {
			if (card.name === "Index") {
				const data = convertTrelloDeliverableIndexCardToData(card, indexEmojis)
				if (!data) {
					throw `"Index" card of the list ${list.name} is incomplete`
				}
				data.sections.forEach(section => {
					sections.push({
						name: section,
						stories: []
					})
				})

				if (card.idMembers.length === 1) {
					sectionAssignedMemberId = card.idMembers[0]
				}
			} else {
				// log.info(`There are ${sections.length} sections in "${card.name}" (card)`)
				const aus = convertTrelloCardToAssignedUserStory(card, sectionAssignedMemberId, usEmojis)
				if (aus) {
					sections[aus.secId - 1].stories.push(aus)
				}
			}
		}
		return {
			name,
			sections,
			features
		}
	} catch (e) {
		log.error(e, `\nFail to build deliverable named ${list.name}`)
		return null
	}
}

/**
 * 
 * @param {object} _
 * @param {string[]} _.wantTo
 * @param {string[]} _.description
 * @param {string[]} _.DoD
 * @param {string[]} _.estimatedTime
 * @returns {import('#types/pld').UserStoryDescriptionProperties?}
 */
function convertNoisyInfosToUserStoryInfos({ wantTo, description, DoD, estimatedTime }) {

	if (!wantTo || !description || !DoD || !estimatedTime) {
		log.warn("Can't convert infos to user story infos, informations are missing")
		return null
	}

	const estimatedTimeParsed = parseFloat(estimatedTime[0])
	if (isNaN(estimatedTimeParsed)) {
		log.warn("You must attribute an estimated time to your user story")
		return null
	}

	wantTo.shift()
	description.shift()
	DoD.shift()

	return {
		wantTo: wantTo.join('\n'),
		description: description.join('\n'),
		DoD,
		estimatedTime: estimatedTimeParsed
	}
}

/**
 * 
 * @param {object} _
 * @param {string[]} _.description
 * @param {string[]} _.sections
 * @param {string[]} _.features
 * @returns {import('#types/pld').IndexListDescriptionProperties?}
 */
function convertNoisyInfosToIndexListInfos({ description, sections, features }) {

	if (!sections) {
		log.warn("Can't convert infos to index list infos, sections are missing")
		return null
	}
	sections.shift()

	if (description) {
		description.shift()
	}

	if (description) {
		description.shift()
	}

	return {
		description: description ? description.join('\n') : null,
		sections: sections.map(line => {
			// - Remove the '1.' before each section
			const sectionArr = line.split(' ')
			sectionArr.shift()
			return sectionArr.join(' ')
		}),
		features,
	}
}

/**
 * 
 * @param {import('#types/trello').Member} trelloMember
 * @returns {import('@pld-builder/core/types/data').Member}
 */
function convertTrelloMemberToCustomMember({ id, fullName, username }) {
	return {
		id,
		at: username,
		fullname: fullName,
		pseudo: fullName,
		timeAssigned: 0
		// assignments: []
	}
}

/**
 * From the trello board id, extract a complete pld data (if the Trello board is well formatted)
 * @param {string} boardId
 * @param {object} options
 * @param {string} [options.downloadAttachments]
 * @returns {Promise<import('@pld-builder/core/types/data').PldData?>}
 */
async function convertTrelloBoardToPldData(boardId, { downloadAttachments: downloadAttachmentsFolder }) {
	const boardMembers = await fetchMembersFromBoard(boardId)

	/** @type {import('@pld-builder/core/types/data').PldData} */
	const pldData = {
		promotionYear: 0,
		name: "",
		logo: "",
		deliverables: [],
		members: boardMembers.map(m => convertTrelloMemberToCustomMember(m))
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
				const { name, promotionYear, logo, usEmojis, indexEmojis } = await convertMainListToData(list, {downloadAttachmentsFolder})
				pldData.name = name
				pldData.promotionYear = promotionYear
				pldData.logo = logo
				myUSEmojis = invertObject(usEmojis)
				myIndexEmojis = invertObject(indexEmojis)
				log.info({ indexEmojis, usEmojis })
			} catch (e) {
				log.fatal(e)
				return null
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
			membersName = await convertProgressReportListToMembers(list)
		}
	}

	if (membersName) {
		// - Add the fullname to every members
		pldData.members = pldData.members.map(m => {
			const memberName = membersName.find(mn => mn.id === m.id)
			if (!memberName) return m
			return { ...m, fullname: memberName.name }
		})

		switchAllAssignedToIdsToTheirName(pldData)
	}

	return pldData
}


/**
 * 
 * @param {import('#types/trello').List} list
 */
async function convertProgressReportListToMembers(list) {
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

module.exports = {
	convertTrelloMainIndexCardToData,
	convertTrelloDeliverableIndexCardToData,
	convertTrelloCardToAssignedUserStory,
	convertTrelloMemberToCustomMember,
	convertMainListToData,
	convertTrelloListToDeliverable,

	convertTrelloBoardToPldData,

	convertNoisyInfosToUserStoryInfos,
	convertNoisyInfosToIndexListInfos,
}