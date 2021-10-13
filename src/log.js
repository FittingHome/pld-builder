const options = require('./options')

const levelsSymbol = Object.freeze({
	fatal: '❗',//💀
	error: '🛑',
	warn: '🔶',
	info: '🟦',
	debug: '🟣',
	trace: '◻️ ',
});

const log = require('console-log-level')({
	prefix: (level) => levelsSymbol[level],
	level: options.verbose
});

module.exports = log;