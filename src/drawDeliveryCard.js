const { rgbCustom } = require('./utils')

const elements = {
	shadow: { r: 31, g: 55, b: 99 },
	delivery: { r: 47, g: 84, b: 150 },
	section: { r: 180, g: 198, b: 231 },
	userStory: { r: 217, g: 226, b: 243 },
}

function drawRectangleWithShadow(page, { x, y, color, width, height }) {
	page.drawRectangle({
		x: x+1, y: y-1, color: rgbCustom(elements.shadow), width, height
	})
	page.drawRectangle({
		x, y, color, width, height
	})
}

/**
 * Draw the flowchart row of rectangle
 * @param {import('pdf-lib').PDFPage} page
 * @param {object} _
 * @param {import('../types/data').Deliverable} _.data
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {number} _.yPos
 */
function drawPldDeliveryCard(page, { data, font, yPos }) {
	const { height, width } = page.getSize()
	const xMargin = width * 0.12

	const rectangleHeight = height * 0.02
	const nbSections = data.sections.length;

	drawRectangleWithShadow(page, {
		x: xMargin,
		y: height - 100,
		width: width - xMargin * 2,
		height: rectangleHeight,
		color: rgbCustom(elements.delivery)
	})

}

module.exports = {
	drawPldDeliveryCard
}