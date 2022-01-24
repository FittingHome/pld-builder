const { PageSizes, MissingPageContentsEmbeddingError } = require('pdf-lib');
const { drawPldFlowchart } = require('./drawFlowchart')
const { drawPldDeliveryCard } = require('#src/draw/drawDeliveryCard')
const { drawPldUserStory } = require('#src/draw/drawUserStory')
const { embedImg } = require('#src/utils/index')
const {
	versionTagToFullName,
	retrieveAllUserStories,
	retrieveAllAssignedMembersWithTheirWorkTime
} = require('#src/utils/pld')
const { drawTextCenter, centerOptions } = require('./drawTextCenter')
const { validateDeliverable, validateSection, validateUserStory } = require("#src/validator")
const chalk = require('chalk')
const fs = require('fs')
const log = require('#src/utils/log');
const { rgbCustom } = require('../utils');


/**
 * Draw all the pages of the pld inside the pdf
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {import('pdf-lib').PDFFont} font
 * @param {object} _
 * @param {import('@pld-builder/core/types/data').MonthDate} _.date
 * @param {string} _.name
 * @param {string} _.imagePath
 * @param {number} _.promotionYear
 * @param {string} _.version
 */
async function drawMainPage(pdfDoc, font, { date, name, imagePath, promotionYear, version }) {
	const page = pdfDoc.addPage(PageSizes.Letter)
	const { width, height } = page.getSize()

	// const pdfImg = await embedImg(pdfDoc, 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg')

	const finalImage = imagePath !== "" ? imagePath : "./assets/eip_logo.png"
	const pdfImg = await embedImg(pdfDoc, finalImage)
	let imgDims = pdfImg.scale(1)
	// - Resize the imagePath to fill half the width of the page
	if (imgDims.width > width / 2) {
		imgDims = pdfImg.scale((width/2)/imgDims.width)
	}
	
	page.drawImage(pdfImg, {
		x: width / 2 - imgDims.width / 2,
		y: height / 2 + imgDims.height / 2,
		width: imgDims.width,
		height: imgDims.height
	})

	drawTextCenter(page, name, {
		y: height / 2,
		font,
		fontSize: 50,
		centerOption: centerOptions.HORIZONTALLY
	})

	drawTextCenter(page,
`
Project Log Document
${versionTagToFullName(version)} - ${date.month}/${date.year}
`, {
		y: height / 3.5,
		font,
		fontSize: 30,
		lineHeight: 1.5,
		centerOption: centerOptions.HORIZONTALLY
	})

	drawTextCenter(page, `Promo ${promotionYear}`, {
		y: height / 4,
		font,
		fontSize: 20,
		centerOption: centerOptions.HORIZONTALLY
	})
}

/**
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {import('pdf-lib').PDFFont} font
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 */
function drawFlowchartPage(pdfDoc, font, pldData) {
	const page = pdfDoc.addPage(PageSizes.Letter)
	const { width, height } = page.getSize()

	drawPldFlowchart(page, {
		data: pldData,
		font,
		yPos: height / 2
	})
}

/**
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {import('pdf-lib').PDFFont} font
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 */
function drawDeliveryCardPages(pdfDoc, font, pldData) {
	const { deliverables } = pldData;
	if (!deliverables) {
		return log.error(chalk.red("Can't construct delivery cards if there aren't any deliverable..."))
	}

	deliverables.forEach(del => {
		if (!validateDeliverable(del)) {
			return
		}

		const page = pdfDoc.addPage(PageSizes.Letter)
		const { width, height } = page.getSize()

		drawPldDeliveryCard(page, {
			data: del,
			font,
			yPos: height - height / 10
		})
	})
}

/**
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {import('pdf-lib').PDFFont} font
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 */
function drawUserStoryPages(pdfDoc, font, pldData) {

	const userStories = retrieveAllUserStories(pldData)

	userStories.forEach((rus, i) => {

		const page = pdfDoc.addPage(PageSizes.Letter)
		const { width, height } = page.getSize()

		drawPldUserStory(page, {
			data: rus,
			font,
			yPos: height - height / 10
		})
	})
}

// function _versionTagToFullName(version) {
// 	if (version === "KO") return "Kick off"
// 	if (version === "FU") return "Follow-up"
// 	if (version === "D") return "Delivery"
// 	return ""
// }

// function drawKickOffProgressReportPage(pdfDoc, font, version) {
	
// 	// console.log(`${__dirname}/../../report.txt`)
// 	const data = fs.readFileSync(`${__dirname}/../../KO_report.txt`, 'utf8')
// 	try {
// 		const page = pdfDoc.addPage(PageSizes.Letter)
// 		const { width, height } = page.getSize()

// 		drawTextCenter(page, `Rapport d'avancement Kick-off`, {
// 			y: height - height / 8,
// 			fontSize: 20,
// 			font,
// 			maxWidth: width - width / 4,
// 		})


// 		drawTextCenter(page, data, {
// 			x: width / 8,
// 			y: height / 2,
// 			fontSize: 14,
// 			font,
// 			maxWidth: width - width / 4,
// 			centerOption: centerOptions.VERTICALLY
// 		})
// 	} catch (err) {
// 		log.error(err)
// 	}
// }

// function drawFollowUpProgressReportPage1(pdfDoc, font, version) {

// 	// console.log(`${__dirname}/../../report.txt`)
// 	const data = fs.readFileSync(`${__dirname}/../../FU_report1.txt`, 'utf8')
// 	try {
// 		const page = pdfDoc.addPage(PageSizes.Letter)
// 		const { width, height } = page.getSize()

// 		const versionFullname = versionTagToFullName(version)

// 		drawTextCenter(page, `Rapport d'avancement Follow-Up`, {
// 			y: height - height / 8,
// 			fontSize: 20,
// 			font,
// 			maxWidth: width - width / 4,
// 		})


// 		drawTextCenter(page, data, {
// 			x: width / 8,
// 			y: height / 2,
// 			fontSize: 14,
// 			font,
// 			maxWidth: width - width / 4,
// 			centerOption: centerOptions.VERTICALLY
// 		})
// 	} catch (err) {
// 		log.error(err)
// 	}
// }
// function drawFollowUpProgressReportPage2(pdfDoc, font, version) {

// 	// console.log(`${__dirname}/../../report.txt`)
// 	const data = fs.readFileSync(`${__dirname}/../../FU_report2.txt`, 'utf8')
// 	try {
// 		const page = pdfDoc.addPage(PageSizes.Letter)
// 		const { width, height } = page.getSize()

// 		const versionFullname = versionTagToFullName(version)

// 		drawTextCenter(page, data, {
// 			x: width / 8,
// 			y: height / 2,
// 			fontSize: 14,
// 			font,
// 			maxWidth: width - width / 4,
// 			centerOption: centerOptions.VERTICALLY
// 		})
// 	} catch (err) {
// 		log.error(err)
// 	}
// }

// function drawDeliveryProgressReportPage1(pdfDoc, font, version) {

// 	// console.log(`${__dirname}/../../report.txt`)
// 	const data = fs.readFileSync(`${__dirname}/../../D_report1.txt`, 'utf8')
// 	try {
// 		const page = pdfDoc.addPage(PageSizes.Letter)
// 		const { width, height } = page.getSize()

// 		const versionFullname = versionTagToFullName(version)

// 		drawTextCenter(page, `Rapport d'avancement ${versionFullname}`, {
// 			y: height - height / 8,
// 			fontSize: 20,
// 			font,
// 			maxWidth: width - width / 4,
// 		})


// 		drawTextCenter(page, data, {
// 			x: width / 8,
// 			y: height / 2,
// 			fontSize: 14,
// 			font,
// 			maxWidth: width - width / 4,
// 			centerOption: centerOptions.VERTICALLY
// 		})
// 	} catch (err) {
// 		log.error(err)
// 	}
// }
// function drawDeliveryProgressReportPage2(pdfDoc, font, version) {

// 	// console.log(`${__dirname}/../../report.txt`)
// 	const data = fs.readFileSync(`${__dirname}/../../D_report2.txt`, 'utf8')
// 	try {
// 		const page = pdfDoc.addPage(PageSizes.Letter)
// 		const { width, height } = page.getSize()

// 		const versionFullname = versionTagToFullName(version)

// 		drawTextCenter(page, data, {
// 			x: width / 8,
// 			y: height / 2,
// 			fontSize: 14,
// 			font,
// 			maxWidth: width - width / 4,
// 			centerOption: centerOptions.VERTICALLY
// 		})
// 	} catch (err) {
// 		log.error(err)
// 	}
// }

// function drawTasksDivisionPages(pdfDoc, font, pldData) {
// 	const members = retrieveAllAssignedMembersWithTheirWorkTime(pldData)

// 	console.log(members)
// }

function drawFooterOnAllPages(pdfDoc, font) {
	const pages = pdfDoc.getPages();
	const eipColor = rgbCustom({ r: 33, g: 150, b: 243 })

	for (const [i, page] of Object.entries(pages)) {
		if (i === "0") continue

		const { width } = page.getSize()

		const xMargin = width / 10
		page.drawRectangle({
			x: 0 + xMargin,
			y: xMargin / 1.2,
			color: eipColor,
			width: width - xMargin * 2,
			height: 1
		})

		page.drawText(`${+i + 1}`, {
			x: width / 2,
			y: xMargin / 2,
			size: 14,
			font,
			color: eipColor
		});
	}
}

/**
 * Draw all the pages of the pld inside the pdf
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {object} _
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {import('@pld-builder/core/types/data').PldData} _.pldData
 * @param {string} _.date
 * @param {string} _.version
 */
async function drawPld(pdfDoc, {font, pldData, date, version}) {
	console.log({ font, pldData, date, version})
	await drawMainPage(pdfDoc, font, {
		date, version,
		imagePath: pldData.logo,
		name: pldData.name,
		promotionYear: pldData.promotionYear,
	})
	drawFlowchartPage(pdfDoc, font, pldData)
	drawDeliveryCardPages(pdfDoc, font, pldData)
	drawUserStoryPages(pdfDoc, font, pldData)
	// drawTasksDivisionPages(pdfDoc, font, pldData)
	// drawKickOffProgressReportPage(pdfDoc, font, version)
	// drawFollowUpProgressReportPage1(pdfDoc, font, version)
	// drawFollowUpProgressReportPage2(pdfDoc, font, version)
	// drawDeliveryProgressReportPage1(pdfDoc, font, version)
	// drawDeliveryProgressReportPage2(pdfDoc, font, version)

	drawFooterOnAllPages(pdfDoc, font)
	console.log(pldData)
}

module.exports = {
	drawPld
}