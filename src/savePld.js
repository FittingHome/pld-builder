const { savePdfOnDisk } = require('./savePdf');
const log = require('./log')

/**
 * @typedef PldNameParams
 * @prop {string} date - formatted like so : YYYY/MM or MM/YYYY
 * @prop {string} name
 * @prop {number} promotionYear
 * @prop {string} version
 */

/**
 * @param {PldNameParams} _
 */
function computePldFilename({ name, promotionYear, date, version }) {
	const [year, month] = date.split('/')

	const formattedDate = year.length === 4 ? `${year}${month}` : `${month}${year}`

	return `${promotionYear}_PLD_${name.split(' ').join('_')}_${formattedDate}${version}`
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