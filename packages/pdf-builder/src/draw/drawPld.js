const { PageSizes } = require('pdf-lib');
const { drawPldFlowchart } = require('./drawFlowchart')
const { drawPldDeliveryCard } = require('#src/draw/drawDeliveryCard')
const { drawPldUserStory } = require('#src/draw/drawUserStory')
const { embedImg } = require('#src/utils/index')
const { drawTextCenter } = require('./drawTextCenter')
const { validateDeliverable, validateSection, validateUserStory } = require("#src/validator")
const chalk = require('chalk')
const fs = require('fs')
const log = require('#src/utils/log')


/**
 * Draw all the pages of the pld inside the pdf
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {import('pdf-lib').PDFFont} font
 * @param {{name: string, image: string}} _
 */
async function drawMainPage(pdfDoc, font, { name, image }) {
	const page = pdfDoc.addPage(PageSizes.Letter)
	const { width, height } = page.getSize()

	// const pdfImg = await embedImg(pdfDoc, 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg')
	const pdfImg = await embedImg(pdfDoc, image)

	drawTextCenter(page, `${name}\nProject Log Document`, {
		x: width / 2,
		y: height - height / 10,
		font,
		fontSize: 30,
	})

	let imgDims = pdfImg.scale(1)
	// - Resize the image to fill half the width of the page
	if (imgDims.width > width / 2) {
		imgDims = pdfImg.scale((width/2)/imgDims.width)
	}

	page.drawImage(pdfImg, {
		x: width / 2 - imgDims.width / 2,
		y: height / 2 - imgDims.height / 2,
		width: imgDims.width,
		height: imgDims.height
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

/**
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 * @returns {import('@pld-builder/core/types/data').RankedUserStory[]}
 */
function retrieveAllUserStories(pldData) {

	/**
	 * @type {import('@pld-builder/core/types/data').RankedUserStory[]} userStories
	 */
	const userStories = [];

	const { deliverables } = pldData;
	if (!deliverables) {
		return log.error(chalk.red("Can't construct user stories if there aren't any deliverable..."))
	}

	deliverables.forEach((del, i) => {
		if (!validateDeliverable(del)) {
			return
		}

		del.sections.forEach((sec, j) => {
			if (!validateSection(sec)) {
				return
			}

			sec.stories.forEach((us, k) => {
				if (!validateUserStory(us)) {
					return
				}

				userStories.push({...us,
					delId: i + 1,
					secId: j + 1,
					id: k + 1
				})
			})
		})
	})

	return userStories;
}

/**
 * Draw all the pages of the pld inside the pdf
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {import('pdf-lib').PDFFont} font
 * @param {import('../types/data').PldData} pldData
 */
async function drawPld(pdfDoc, {font, pldData}) {
	await drawMainPage(pdfDoc, font, { name: pldData.name, image: pldData.logo })
	drawFlowchartPage(pdfDoc, font, pldData)
	drawDeliveryCardPages(pdfDoc, font, pldData)
	drawUserStoryPages(pdfDoc, font, pldData)
}

module.exports = {
	drawPld
}