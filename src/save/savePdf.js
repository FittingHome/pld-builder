const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { optionalAppend } = require('../utils');
const log = require('../utils/log')

/**
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {string} path 
 */
async function savePdfOnDisk(pdfDoc, path) {
	const fullpath = optionalAppend(path, ".pdf");

	const pdfBytes = await pdfDoc.save()

	const callback = (err) => {
		if (err) throw err;
		log.info(`${fullpath} has been saved!`);
	}
	fs.writeFile(fullpath, Buffer.from(pdfBytes), callback);
}

module.exports = {
	savePdfOnDisk
}