const { Command, Option } = require('commander')

function parseOptions() {
	const program = new Command()

	const now = new Date()

	program
		.addOption(new Option('-d, --download-attachments <folder>', 'download Trello cards attachments inside specified folder'))

	program.parse(process.argv)
	return program.opts()
}

const options = parseOptions()

module.exports = options