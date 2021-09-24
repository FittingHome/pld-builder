const fs = require('fs');
const { exit } = require('process');

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
const { savePdfOnDisk } = require('./src/savePdf');
const { drawPldFlowchart } = require('./src/drawFlowchart');

const elements = {
	name:		{ r: 91, g: 155, b: 213 },
	p1:			{ r: 189, g: 214, b: 238 },
	p2:			{ r: 222, g: 235, b: 247 },
}

async function buildPld(pdfName, pldData) {
	const nbDeliverables = pldData.deliverables.length;
	console.log({ nbDeliverables });

	const pdfDoc = await PDFDocument.create()

	const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

	const page = pdfDoc.addPage(PageSizes.Letter);
	const { width, height } = page.getSize()
	// console.log("Letter: ", { width, height })

	drawTextCenter(page, 'Project Log Document', {
		x: width / 2,
		y: height - height / 10,
		size: 30,
		font: helveticaFont,
		color: rgb(0, 0, 0),
	})

	drawPldFlowchart(page, {
		data: pldData,
		font: helveticaFont,
		yPos: height/2
	})

	page.drawText("oof", {x: 0, y: 0})

	await savePdfOnDisk(pdfDoc, "pld");
}

const { options } = require('./src/options');
console.log({ options })
if (!options.input) {
	console.error("Input option is missing. Launch with '-h' for more info")
	exit(1)
}

fs.readFile(options.input, 'utf8', async (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	try {
		await buildPld("pld", JSON.parse(data))
	} catch (err) {
		console.error(err)
	}
})