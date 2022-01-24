const path = require('path')
const { log } = require('@pld-builder/core')

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
} = require('#src/trelloFetcher')

/**
 * @param {import('#types/trello').Card} card
 */
async function convertTrelloMainIndexCardToData(card) {
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

	const attachments = await fetchAttachmentsFromCard(card.id)
	for (const attachment of attachments) {
		if (attachment.name === "logo" && (attachment.mimeType === "image/jpeg" || attachment.mimeType === "image/png")) {
			await downloadImageFromAttachment(attachment.url, "logo")
			result.logo = `./assets/logo${path.parse(attachment.fileName).ext}`
			break
		}
	}

	return result
}

/**
 * @param {import('#types/trello').Card} card
 * @param {object} emojisToProp
 */
async function convertTrelloDeliverableIndexCardToData(card, emojisToProp) {
	const mainInfos = extractMainInfosFromCardDesc(card.desc, emojisToProp, convertNoisyInfosToIndexListInfos)
	if (!mainInfos) return null

	return mainInfos
}

/**
 * @param {import('#types/trello').Card} card
 * @param {string?} alreadyAssignedMemberId
 * @param {object} emojisToProp
 * @returns {import('@pld-builder/core/types/data').AssignedUserStory?}
 */
function convertTrelloCardToAssignedUserStory(card, alreadyAssignedMemberId, emojisToProp) {
	if (!card) return null

	const nameIds = extractUserStoryIdAndNameFromCardName(card.name)
	if (!nameIds) return null

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
const expectedIndexProperties = Object.freeze(["description", "sections"])


/**
 * @param {import('#types/trello').List} list - its name must be of the form '[[name]]'
 * @returns {Promise<{
 * name: string,
 * promotionYear: number,
 * logo: string,
 * usEmojis: import('#types/pld').UserStoryPropertiesEmoji,
 * indexEmojis: import('#types/pld').IndexListPropertiesEmoji
 * }>}
 * @throws {string}
 */
async function convertMainListToData(list) {
	const { name, id } = list
	const cards = await fetchCardsFromList(list.id)

	const result = {
		name: name.replace('[[', '').replace(']]', '')
	}

	for (const card of cards) {
		log.debug(card.name)
		if (card.name === "Index") {
			const data = await convertTrelloMainIndexCardToData(card)
			log.info(data)
			if (!data) {
				throw `Can't find "Index" card of the list ${name} or some informations are missing`
			}
			result.promotionYear = data.school
			result.logo = data.logo
		}
		else if (card.name === "Index List Template") {
			const emojis = extractEmojisFromDescription({ description: card.desc, expectedProperties: expectedIndexProperties})
			if (!emojis) {
				throw `Can't find index list emoji templated card in the list ${name} or some informations are missing`
			}
			result.indexEmojis = emojis
		}
		else if (card.name === "User Story Template") {
			const emojis = extractEmojisFromDescription({description: card.desc, expectedProperties: expectedUserStoryProperties})
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
async function convertTrelloListToDeliverable({list, usEmojis, indexEmojis}) {
	try {
		const sections = []
		const name = list.name.replace('[', '').replace(']', '')

		
		const cards = await fetchCardsFromList(list.id)
		log.info(`There are ${cards.length} cards in ${list.name} (list)`)
		
		/** @type {string?} */
		let sectionAssignedMemberId = null
		for (const card of cards) {
			if (card.name === "Index") {
				const data = await convertTrelloDeliverableIndexCardToData(card, indexEmojis)
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
				log.info(`There are ${sections.length} sections in "${card.name}" (card)`)
				const aus = convertTrelloCardToAssignedUserStory(card, sectionAssignedMemberId, usEmojis)
				if (aus) {
					sections[aus.secId - 1].stories.push(aus)
				}
			}
		}
		return {
			name,
			sections,
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
 * @returns {import('#types/pld').IndexListDescriptionProperties?}
 */
function convertNoisyInfosToIndexListInfos({ description, sections }) {

	if (!sections) {
		log.warn("Can't convert infos to index list infos, informations are missing")
		return null
	}

	if (description) {
		description.shift()
	}
	sections.shift()

	return {
		description: description ? description.join('\n') : null,
		sections: sections.map(line => {

			const sectionArr = line.split(' ')
			sectionArr.shift()
			return sectionArr.join(' ')
		})
	}
}

module.exports = {
	convertTrelloMainIndexCardToData,
	convertTrelloDeliverableIndexCardToData,
	convertTrelloCardToAssignedUserStory,
	convertMainListToData,
	convertTrelloListToDeliverable,

	convertNoisyInfosToUserStoryInfos,
	convertNoisyInfosToIndexListInfos,
}