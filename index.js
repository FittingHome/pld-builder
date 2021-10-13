const fs = require('fs');
const { exit } = require('process');

const log = require('./src/log');
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
const { optionalAppend, rgbCustom, drawTextCenter } = require('./src/utils');
const { drawPldFlowchart } = require('./src/drawFlowchart');

const { drawPld } = require('./src/drawPld');
const { savePld } = require('./src/savePld');

const elements = {
	name:	{ r: 91, g: 155, b: 213 },
	p1:		{ r: 189, g: 214, b: 238 },
	p2:		{ r: 222, g: 235, b: 247 },
}

/**
 * 
 * @param {import('./types/data').PldData} pldData 
 * @param {string} date 
 */
async function buildPld(pldData, { date, version }) {
	const nbDeliverables = pldData.deliverables.length;
	log.trace({ nbDeliverables });

	const pdfDoc = await PDFDocument.create()
	const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

	await drawPld(pdfDoc, helveticaFont, pldData);

	await savePld(pdfDoc, {
		name: pldData.name,
		promotionYear: pldData.promotionYear,
		date, version
	})
}

const options = require('./src/options');
log.trace({ options })
if (!options.input) {
	log.fatal("Input option is missing. Launch with '-h' for more info")
	exit(1)
}

fs.readFile(options.input, 'utf8', async (err, data) => {
	if (err) {
		log.error(err)
		return
	}
	try {
		await buildPld(JSON.parse(data), {
			date: options.date,
			version: options.version
		})
	} catch (err) {
		log.error(err)
	}
})