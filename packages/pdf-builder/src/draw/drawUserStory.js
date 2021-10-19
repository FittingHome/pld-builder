const chalk = require('chalk')
const { rgb, drawText } = require('pdf-lib')
const { drawTextCenter, centerOptions } = require('./drawTextCenter')
const { rgbCustom, warning } = require('#src/utils/index')
const log = require('#src/utils/log')
const { breakLinesPdf } = require('#src/utils/index')

const elements = {
	name: { r: 91, g: 155, b: 213 },
	p1: { r: 189, g: 214, b: 238 },
	p2: { r: 222, g: 235, b: 247 },
}

/**
 * 
 * @param {import('pdf-lib').PDFPage} page 
 * @param {*} _
 * @param {number} _.x bottom left corner of the rectangle (not its shadow)
 * @param {number} _.y bottom left corner of the rectangle (not its shadow)
 * @param {number} _.width
 * @param {number} _.height
 */
// function drawRectangleWithShadow(page, { x, y, color, width, height }) {
// 	page.drawRectangle({
// 		x: x + 1, y: y - 2, color: rgbCustom(elements.shadow), width, height
// 	})
// 	page.drawRectangle({
// 		x, y, color, width, height
// 	})
// }


/**
 * Draw the flowchart row of rectangle
 * @param {import('pdf-lib').PDFPage} page
 * @param {object} _
 * @param {import('@pld-builder/core/types/data').RankedUserStory} _.data
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {number} _.yPos
 */
function drawPldUserStory(page, { data, font, yPos }) {
	const { height, width } = page.getSize()

	const xMargin = width * 0.12
	const totalWidth = width - xMargin * 2

	const xStart = width / 2 - totalWidth / 2
	const fontSize = 9

	let y = yPos

	/// Name
	y -= 1 + _drawSection(page, {
		text: `${data.secId}.${data.id} ${data.name}`,
		x: xStart,
		y,
		color: rgbCustom(elements.name),
		width: totalWidth,
		font,
		fontColor: rgb(1,1,1),
		fontSize,
		fontHeightFactor: 1.5
	})

	/// As ... I want to
	y -= 1 + _drawHorizontalTextSections(page, [
		{
			text: "En tant que :",
			x: xStart,
			y,
			color: rgbCustom(elements.p1),
			width: totalWidth / 3,
			font,
			fontSize,
			fontHeightFactor: 1.5
		},
		{
			text: "Je veux :",
			x: xStart + totalWidth / 3 + 1,
			y,
			color: rgbCustom(elements.p1),
			width: (totalWidth / 3) * 2 - 1,
			font,
			fontColor: rgb(0, 0, 0),
			fontSize
		}
	])
	y -= 1 + _drawHorizontalTextSections(page, [
		{
			text: `${data.as}`,
			x: xStart,
			y,
			color: rgbCustom(elements.p2),
			width: totalWidth / 3,
			font,
			fontSize,
			fontHeightFactor: 1.5
		},
		{
			text: `${data.wantTo}`,
			x: xStart + totalWidth / 3 + 1,
			y,
			color: rgbCustom(elements.p2),
			width: (totalWidth / 3) * 2 - 1,
			font,
			fontSize,
			fontHeightFactor: 1.5,
			// lineHeight: 1.3
		}
	])

	/// Description
	y -= 1 + _drawSection(page, {
		text: `Description :\n${data.description}`,
		x: xStart,
		y,
		color: rgbCustom(elements.p1),
		width: totalWidth,
		font,
		fontSize,
		fontHeightFactor: 1.1,
		lineHeight: 1.5
	})

	/// DoD
	y -= 1 + _drawSection(page, {
		text: `Definition Of Done :\n${data.DoD.join('\n')}`,
		x: xStart,
		y,
		color: rgbCustom(elements.p2),
		width: totalWidth,
		font,
		fontSize,
		fontHeightFactor: 1.1,
		lineHeight: 1.5
	})

	/// Estimated time
	y -= 1 + _drawHorizontalTextSections(page, [
		{
			text: "Charge estimée :",
			x: xStart,
			y,
			color: rgbCustom(elements.p1),
			width: totalWidth / 2 - 1,
			font,
			fontSize,
			fontHeightFactor: 1.5
		},
		{
			text: `${data.estimatedTime} J/H`,
			x: xStart + totalWidth / 2,
			y,
			color: rgbCustom(elements.p2),
			width: (totalWidth / 2),
			font,
			fontSize,
			fontHeightFactor: 1.5,
		}
	])

	/// Attribution
	y -= 1 + _drawHorizontalTextSections(page, [
		{
			text: "Personne en charge :",
			x: xStart,
			y,
			color: rgbCustom(elements.p1),
			width: totalWidth / 2 - 1,
			font,
			fontSize,
			fontHeightFactor: 1.5
		},
		{
			text: "???",
			x: xStart + totalWidth / 2,
			y,
			color: rgbCustom(elements.p2),
			width: (totalWidth / 2),
			font,
			fontSize,
			fontHeightFactor: 1.5,
		}
	])

}

/**
 * 
 * @param {string} text 
 * @param {object} _ 
 * @param {number} _.maxWidth - the max width the text can occupied
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {number} _.fontSize
 * @param {number} _.fontHeightFactor - the number of times the fontHeight must be multiplied during the height computation
 */
function computeHeightOfText(text, {maxWidth, font, fontSize, fontHeightFactor = 1}) {
	const fontHeight = font.heightAtSize(fontSize, { descender: true })
	const nbLines = breakLinesPdf(text, font, fontSize, maxWidth - fontSize).length

	return (fontHeight * fontHeightFactor) * nbLines
}

/**
 * 
 * @param {import('pdf-lib').PDFPage} page
 * @param {import('@pld-builder/core/types/data').TextSection} txtSection

 * @returns {number} height drawn
 */
function _drawSection(page, { text, x, y, width, height, color, font, fontSize, fontColor, fontHeightFactor = 1, lineHeight = 1.14 }) {

	if (!height) {
		height = computeHeightOfText(text, {
			maxWidth: width,
			font,
			fontSize,
			fontHeightFactor: fontHeightFactor * lineHeight
		})
	}

	text = breakLinesPdf(text, font, fontSize, width - fontSize).join('\n')

	page.drawRectangle({
		x,
		y: y - height,
		color,
		width,
		height
	})
	drawTextCenter(page, text, {
		x: x + fontSize / 2,
		y: y - height / 2,
		color: fontColor,
		font,
		fontSize,
		lineHeight,
		centerOption: centerOptions.VERTICALLY
	})

	return height
}

/**
 * @param {import('pdf-lib').PDFPage} page
 * @param {import('@pld-builder/core/types/data').TextSection[]} txtSections
 */
function _drawHorizontalTextSections(page, txtSections) {
	if (!txtSections) return;

	let maxHeight = 0;
	txtSections.forEach(({text, width, font, fontSize, fontHeightFactor}) => {
		const height = computeHeightOfText(text, {
			maxWidth: width,
			font,
			fontSize,
			fontHeightFactor
		})
		if (maxHeight < height) {
			maxHeight = height
		}
	})

	txtSections.forEach(txtSection => {
		log.debug(...txtSections)
		_drawSection(page, {...txtSection, height: maxHeight})
	})

	return maxHeight
}

module.exports = {
	drawPldUserStory,
}