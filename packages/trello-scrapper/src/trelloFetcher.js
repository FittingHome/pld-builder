const trelloAnyFetcher = require('#src/fetch/trelloAnyFetcher')
const trelloCardFetcher = require('#src/fetch/trelloCardFetcher')

module.exports = {
	...trelloAnyFetcher,
	...trelloCardFetcher
}