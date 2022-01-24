const fs = require('fs');
const { exit } = require('process');

const log = require('./src/utils/log');
const {
	PDFDocument,
	StandardFonts,
	PageSizes,
	rgb,
	degrees,
	grayscale,

	pushGraphicsState,
	moveTo,
	lineTo,
	closePath,
	setFillingColor,
	fill,
	popGraphicsState,
} = require('pdf-lib');

const { drawPld } = require('./src/draw/drawPld');
const { savePld } = require('./src/save/savePld');

/**
 * 
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 * @param {object} _
 * @param {import('@pld-builder/core/types/data').MonthDate} _.date
 * @param {string} _.version
 */
async function buildPld(pldData, { date, version }) {
	const nbDeliverables = pldData.deliverables.length;
	log.info({ nbDeliverables, date });

	const pdfDoc = await PDFDocument.create()
	const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

	await drawPld(pdfDoc, {
		date,
		font: helveticaFont,
		pldData,
		version
	});

	await savePld(pdfDoc, {
		name: pldData.name,
		promotionYear: pldData.promotionYear,
		date, version
	})
}

const options = require('./src/options');
const { rgbCustom } = require('./src/utils');
log.trace({ options })
if (!options.input) {
	log.fatal("Input option is missing. Launch with '-h' for more info")
	exit(1)
}

/**
 * @param {string} date
 * @returns {import('@pld-builder/core/types/data').MonthDate}
 */
function parseDate(date) {
	const [year, month] = date.split('/')

	const dateObj = year.length === 4 ? { year, month }
		: { year: month, month: year }

	dateObj.year = parseInt(dateObj.year)
	dateObj.month = parseInt(dateObj.month)

	if (Number.isNaN(dateObj.year) || Number.isNaN(dateObj.month) || month < 1 || month > 12) {
		throw `Invalid date. Run with --help for more info on how to format it`
	}

	return dateObj
}

fs.readFile(options.input, 'utf8', async (err, data) => {
	if (err) {
		log.error(err)
		return
	}
	try {
		await buildPld(JSON.parse(data), {
			date: parseDate(options.date),
			version: options.version
		})
	} catch (err) {
		log.error(err)
	}
})