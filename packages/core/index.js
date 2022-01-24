const log = require('./src/log')
const strings = require('./src/string')
const saveJson = require('./src/saveJson')
const invertObject = require('./src/invertObject')

module.exports = {
	log,
	...strings,
	...saveJson,
	...invertObject,
}