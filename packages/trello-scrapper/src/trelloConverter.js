const { log, isCharacterALetter } = require('@pld-builder/core')

/**
 * @param {import('#types/trello').List} list
 * @returns {import('@pld-builder/core/types/data').Deliverable}
 */

function convertTrelloListToDeliverable(list) {

}

/**
 * @param {import('#types/trello').Card} card
 * @param {boolean} isDeliveryCard
 */

function convertTrelloIndexCardToData(card, isDeliveryCard) {
	if (!card) return null

	const result = {}

	const txt = _extractMeaningulArrayFromString(card.desc)

	if (!isDeliveryCard) {
		txt.forEach(line => {
			const newEmoji = _extractFirstMarkdownEmojiFromLine(line)
			if (!newEmoji) {
				return
			}

			result[newEmoji] = parseInt(line)
		})

		if (!result.school || isNaN(result.school)) return null

		return result
	} else {

		let emojiFound = false
		result.paperclip = []
		const currentEmoji = ""
		txt.forEach(line => {
			const newEmoji = _extractFirstMarkdownEmojiFromLine(line)
			if (newEmoji && !emojiFound) {
				emojiFound = true
				return;
			}
			if (!newEmoji && !emojiFound) {
				return
			}
			
		
			const section = line.split(' ')
			section.shift()
			result.paperclip.push(section.join(' '))
		})
		
		log.debug({sections: result.paperclip})
		
		return {
			sections: result.paperclip
		}
	}
}

/**
 * @param {import('#types/trello').Card} card
 * @param {import('#types/trello').Member[]} members

 * @returns {import('@pld-builder/core/types/data').AssignedUserStory?}
 */
function convertTrelloCardToAssignedUserStory(card, members) {
	if (!card || !members) return null

	const nameIds = _extractIdsAndNameFromCardName(card.name)
	if (!nameIds) return null

	const mainInfos = _extractMainInfosFromCardDesc(card.desc)
	if (!mainInfos) return null

	if (card.labels.length !== 1) {
		log.warn(`You must have a single label on "${card.name}" (card) to indicate who it is for`)
		return null;
	}
	const as = card.labels[0].name
	
	if (card.idMembers.length !== 1) {
		log.warn(`You must have a single member assigned to "${card.name}" (card)`)
		return null;
	}
	const assignedTo = members.find(member => member.id === card.idMembers[0]).fullname

	return { ...nameIds, ...mainInfos, as, assignedTo	}
}

/**
 * 
 * @param {string} line 
 * @returns {string}
 */
function _extractFirstMarkdownEmojiFromLine(line) {

	let i = 0
	while (true) {
		const firstColonPos = line.indexOf(':', i)

		if (firstColonPos === -1) return null

		for (i = firstColonPos + 1; line[i]; i++) {
			if (line[i] === ':') {
				return line.substr(firstColonPos + 1, i - firstColonPos - 1)
			}

			if (!isCharacterALetter(line[i])) {
				break
			}
		}
	}
}

const userStoryBinding = {
	eyes: "wantTo",
	book: "description",
	pencil: "DoD",
	hourglass: "estimatedTime",
}

/**
 * Start from a string and split it on '\n' then remove all lines without any text
 * @param {string} str 
 * @returns {string[]}
 */
function _extractMeaningulArrayFromString(str) {
	return str.split('\n')
			.filter(line => line.match(/[a-z0-9]+/i))
}

/**
 * 
 * @param {string} desc
 */
function _extractMainInfosFromCardDesc(desc) {
	const result = {
		wantTo: [],
		description: [],
		DoD: [],
		estimatedTime: [],
	}

	const txt = _extractMeaningulArrayFromString(desc)
	log.debug(txt);

	let currentEmoji = ""
	txt.forEach(line => {
		const newEmoji = _extractFirstMarkdownEmojiFromLine(line)
		if (newEmoji) {
			currentEmoji = newEmoji
		}

		const property = userStoryBinding[currentEmoji]
		if (!property) {
			log.warn(`${currentEmoji} isn't recognized as a valid emoji by the scrapper`)
			return
		}
		result[property].push(line)
	})

	if (result.wantTo.length === 0
		|| result.description.length === 0
		|| result.DoD.length === 0
		|| result.estimatedTime.length === 0) {
		log.warn("Informations are missing in the card")
		return null
	}

	const estimatedTime = parseFloat(result.estimatedTime[0])
	if (isNaN(estimatedTime)) {
		log.warn("You must attribute an estimated time to your user story")
		return null
	}

	result.wantTo.shift()
	result.description.shift()
	result.DoD.shift()

	return {
		wantTo: result.wantTo.join('\n'),
		description: result.description.join('\n'),
		DoD: result.DoD,
		estimatedTime
	}
}



const _errorMsg = (name) => {
	log.error(`Card named ${name} must have a name formatted like so: "x.y name" where x and y are positive digits`)
	return null
}

/**
 * 
 * @param {string} name 
 */
function _extractIdsAndNameFromCardName(name) {
	const result = {}

	const spaceId = name.indexOf(' ')

	const ids = name.substr(0, spaceId)
	const idsSplit = ids.split('.')

	if (idsSplit.length > 2) return _errorMsg(name)

	result.secId = parseInt(idsSplit[0])
	if (isNaN(result.secId)) return _errorMsg(name)

	result.id = parseInt(idsSplit[1])
	if (isNaN(result.id)) return _errorMsg(name)

	result.name = name.substr(spaceId + 1)
	return result
}

module.exports = {
	// convertTrelloListToDelivery,
	convertTrelloIndexCardToData,
	convertTrelloCardToAssignedUserStory,

	// For tests purpose
	_extractIdsAndNameFromCardName,
	_extractFirstMarkdownEmojiFromLine,
	_extractMainInfosFromCardDesc
}