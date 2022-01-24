const { savePdfOnDisk } = require('./savePdf');
const log = require('#src/utils/log')

/**
 * @typedef PldNameParams
 * @prop {import('@pld-builder/core/types/data').MonthDate} date
 * @prop {string} name
 * @prop {number} promotionYear
 * @prop {string} version
 */

/**
 * @param {PldNameParams} _
 */
function computePldFilename({ name, promotionYear, date, version }) {
	return `${promotionYear}_PLD_${name.split(' ').join('_')}_${date.year}${date.month}${version}`
}

/**
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {PldNameParams} pldNameParams
 */
async function savePld(pdfDoc, pldNameParams) {
	log.trace(pldNameParams)

	const filename = computePldFilename(pldNameParams)

	await savePdfOnDisk(pdfDoc, filename)
}


module.exports = {
	savePld,

	computePldFilename
}