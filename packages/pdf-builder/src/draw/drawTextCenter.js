const { breakLinesPdf } = require('#src/utils/index')
const { rgb } = require('pdf-lib')
const log = require('#src/utils/log')

const centerOptions = Object.freeze({
	HORIZONTALLY: 1,
	VERTICALLY: 2,
	BOTH: 3
})

const anchorOptions = Object.freeze({
	CENTER: 1,
	TOPLEFT: 2,
})

/**
 * It draws text centered from the x and y position
 * @param {import('pdf-lib').PDFPage} page 
 * @param {string} text
 * @param {object} _
 * @param {number} _.x center x position, if not supplied its equal to the middle of the page
 * @param {number} _.y center y position, if not supplied its equal to the middle of the page
 * @param {number} _.fontSize
 * @param {number} _.maxWidth
 * @param {number} _.lineHeight
 * @param {import('pdf-lib').RGB} _.color
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {boolean} _.debug
 * @param {number} _.centerOption
 * @param {number} _.anchor
 * @returns {{top: number, left: number, width: number, height: number}}
 */
function drawTextCenter(page, text, { x, y, color, font, fontSize, maxWidth, lineHeight, debug, centerOption }) {
	const textShrinkHeight = font.heightAtSize(fontSize, { descender: false })
	const textHeight = font.heightAtSize(fontSize, { descender: true })
	const descenderHeight = textHeight - textShrinkHeight
	
	
	x = x !== undefined ? x : page.getWidth() / 2
	y = y !== undefined ? y : page.getHeight() / 2
	color = color ? color : rgb(0, 0, 0)
	lineHeight = lineHeight ? lineHeight : 1.14
	centerOption = centerOption !== undefined ? centerOption : centerOptions.BOTH
	
	text = breakLinesPdf(text, font, fontSize, maxWidth)
	const paragraphHeight = (text.length - 1) * (textHeight * lineHeight) + textHeight

	const yGap = ((lineHeight - 1) * textHeight)

	const fullHeight = (text.length) * paragraphHeight + (yGap * (text.length - 1))

	for (let i = text.length - 1; i >= 0; i--) {
		const paragraphWidth = font.widthOfTextAtSize(text[i], fontSize)

		const pX = centerOption === centerOptions.VERTICALLY
			? x
			: (x - paragraphWidth / 2)

		const pyAdd = (text.length - i - 1) * (lineHeight * textHeight)
		const pY = centerOption === centerOptions.HORIZONTALLY
			? y + pyAdd
			: y + pyAdd - paragraphHeight / 2

		const descenderHeight = textHeight - textShrinkHeight

		page.drawText(text[i], {
			x: pX,
			y: pY + (descenderHeight / 2),
			color,
			font,
			size: fontSize,
		})

		if (debug) {
			page.drawRectangle({
				x: pX,
				y: pY,
				borderWidth: 1,
				borderColor: rgb(0, 0, 1),
				width: paragraphWidth,
				height: textHeight,
			})
		}
	}

	if (debug) {
		page.drawSquare({
			x, y, size: 1, color: rgb(1, 0, 0)
		})
	}
}

module.exports = {
	drawTextCenter,
	centerOptions
}