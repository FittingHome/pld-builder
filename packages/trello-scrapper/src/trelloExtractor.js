const { log, isCharacterALetter } = require('@pld-builder/core')

/**
 * 
 * @param {string} line
 * @returns {string?}
 */
function extractFirstMarkdownEmojiFromLine(line) {
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

	return null
}

// const userStoryBinding = {
// 	eyes: "wantTo",
// 	book: "description",
// 	pencil: "DoD",
// 	hourglass: "estimatedTime",
// }

/**
 * Start from a string and split it on '\n' then remove all lines without any text
 * @param {string} str 
 * @returns {string[]}
 */
function extractMeaningulArrayFromString(str) {
	return str.split('\n')
		.filter(line => line.match(/[a-z0-9]+/i))
}

/**
 * 
 * @param {string} desc
 * @param {object} emojisToProp
 * @param {Function} cleanerFunc
 */
function extractMainInfosFromCardDesc(desc, emojisToProp, cleanerFunc) {
	const result = {}

	const txt = extractMeaningulArrayFromString(desc)
	// log.debug(txt);

	let currentEmoji = ""
	let currentProperty = ""
	for (const line of txt) {
		const newEmoji = extractFirstMarkdownEmojiFromLine(line)
		if (newEmoji) {
			currentEmoji = newEmoji
			currentProperty = emojisToProp[currentEmoji]
			if (!currentProperty) {
				log.warn(`${currentEmoji} isn't recognized as a valid emoji by the scrapper`)
			}

			result[currentProperty] = []
		}

		// - Ignore any line that is not under a recognized emoji
		if (!currentProperty) continue

		result[currentProperty].push(line)
	}

	log.debug(result)

	return cleanerFunc(result)
}

const _errorMsg = (name) => {
	log.error(`Card named ${name} must have a name formatted like so: "x.y name" where x and y are positive digits`)
	return null
}

/**
 * 
 * @param {string} name 
 * @returns {{
 * id: number,
 * secId: number,
 * name: string
 * }?}
 */
function extractUserStoryIdAndNameFromCardName(name) {
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

/**
 * @param {object} propertiesToEmoji
 * @param {readonly string[]} expectedProperties
 * @returns {boolean}
 */
function _checkPropertiesToEmojisAreValid(propertiesToEmoji, expectedProperties) {
	let nbEmojiMissing = 0
	expectedProperties.forEach(prop => {
		if (propertiesToEmoji[prop] === undefined) {
			nbEmojiMissing++
		}
	})
	if (nbEmojiMissing > 0) {
		const numberConjugation = nbEmojiMissing === 1 ? " is" : "s are"
		log.warn(`${nbEmojiMissing} emoji${numberConjugation} missing in description. ${expectedProperties.length} emoji${numberConjugation} expected`)
		return false
	}

	const emojisSet = new Set(Object.values(propertiesToEmoji))
	if (emojisSet.size !== expectedProperties.length) {
		log.warn(`There are ${expectedProperties.length - emojisSet.size} duplicate emojis in description`)
		return false
	}

	return true
}

/**
 * @param {object} _
 * @param {string} _.description
 * @param {readonly string[]} _.expectedProperties
 * @returns {import('#types/pld').PropertiesEmoji?}
 */
function extractEmojisFromDescription({description, expectedProperties}) {
	const result = {}
	const txt = extractMeaningulArrayFromString(description)

	let i = 0
	txt.forEach(line => {
		const emoji = extractFirstMarkdownEmojiFromLine(line)
		if (emoji) {
			result[expectedProperties[i]] = emoji
			i++
		}
	})

	if (!_checkPropertiesToEmojisAreValid(result, expectedProperties)) {
		return null
	}

	return result
}

module.exports = {
	extractUserStoryIdAndNameFromCardName,
	extractFirstMarkdownEmojiFromLine,
	extractMainInfosFromCardDesc,
	extractMeaningulArrayFromString,
	// extractUserStoryPropertiesEmojiFromTemplateCard,
	extractEmojisFromDescription,
}