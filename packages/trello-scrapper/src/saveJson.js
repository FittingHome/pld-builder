const fs = require('fs');
const { optionalAppend } = require('@pld-builder/core/src/string');

/**
 * @param {string} json
 * @param {string} path
 */
function saveJsonOnDisk(json, path) {
	if (!json) {
		console.log("Can't save an empty json")
	}

	const fullpath = optionalAppend(path, ".json")

	const callback = (err) => {
		if (err) throw err;
		console.log(`${fullpath} has been saved!`)
	}
	fs.writeFile(fullpath, json, 'utf8', callback);
}

module.exports = {
	saveJsonOnDisk
}