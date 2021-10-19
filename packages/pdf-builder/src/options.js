const { Command, Option } = require('commander')

function parseOptions() {
	const program = new Command()

	const now = new Date()

	program
		.allowUnknownOption()
		.addOption(new Option('-i, --input <file.json>', 'json with enough information to build the pld'))
		.addOption(new Option('-v, --version <version>', 'which version of the PLD is it').choices(['KO', 'FU', 'D']).default('KO'))
		.addOption(new Option('-d, --date <YYYY/MM>', 'what date is it').default(`${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, "0")}`, 'current date'))
		.addOption(new Option('--verbose <level>', 'verbose log level to filter from').choices(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'))

	program.parse(process.argv)
	return program.opts()
}

const options = parseOptions()

module.exports = options