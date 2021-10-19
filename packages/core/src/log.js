const levelsSymbol = Object.freeze({
	fatal: '❗',//💀
	error: '🛑',
	warn: '🔶',
	info: '🟦',
	debug: '🟣',
	trace: '◻️ ',
});

const logger = require('console-log-level')({
	prefix: (lvl) => levelsSymbol[lvl],
	level: process.env.LOG_VERBOSITY
		? process.env.LOG_VERBOSITY
		: "info"
})

module.exports = logger;