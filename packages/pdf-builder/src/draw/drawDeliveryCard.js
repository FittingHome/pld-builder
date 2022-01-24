const chalk = require('chalk')
const { rgb, drawText } = require('pdf-lib')
const { drawTextCenter, centerOptions } = require('./drawTextCenter')
const { rgbCustom, warning } = require('#src/utils/index')
const log = require('#src/utils/log')
const { breakLinesPdf } = require('#src/utils/index')

const elements = {
	shadow: { r: 31, g: 55, b: 99 },
	delivery: { r: 47, g: 84, b: 150 },
	section: { r: 180, g: 198, b: 231 },
	userStory: { r: 217, g: 226, b: 243 },
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
function drawRectangleWithShadow(page, { x, y, color, width, height }) {
	page.drawRectangle({
		x: x+1, y: y-2, color: rgbCustom(elements.shadow), width, height
	})
	page.drawRectangle({
		x, y, color, width, height
	})
}


/**
 * Draw the flowchart row of rectangle
 * @param {import('pdf-lib').PDFPage} page
 * @param {object} _
 * @param {import('@pld-builder/core/types/data').Deliverable} _.data
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {number} _.yPos
 */
function drawPldDeliveryCard(page, { data, font, yPos }) {
	const { height, width } = page.getSize()

	const { name, sections } = data;
	if (!sections) {
		return log.warn((`Can't find any sections in deliverable '${chalk.bold(data.name)}'`))
	}

	// - Sometimes you only need one section so...
	// if (sections.length < 2) {
	// 	return log.warn((`'${chalk.bold(data.name)}' delivery must have at least two sections to appear in the PLD`))
	// }

	const { xMargin, xGap, rectangle, totalWidth } = _computeDeliveryCardDimension(page, sections.length)
	const bigRectangleHeight = rectangle.height * 1.2

	const xStart = width / 2 - totalWidth / 2
	drawRectangleWithShadow(page, {
		x: xStart,
		y: yPos - bigRectangleHeight,
		width: totalWidth - 1,
		height: bigRectangleHeight,
		color: rgbCustom(elements.delivery)
	})

	drawTextCenter(page, name, {
		y: yPos - bigRectangleHeight / 2,
		fontSize: 16,
		font,
		maxWidth: totalWidth,
		color: rgb(1,1,1),
	})

	const yGap = xGap * 2
	const fontSize = 9
	
	const y = yPos - bigRectangleHeight - yGap - rectangle.height

	
	sections.forEach((section, i) => {
		const x = xStart + rectangle.width * i + xGap * i

		drawRectangleWithShadow(page, {
			x, y, color: rgbCustom(elements.section),
			width: rectangle.width - 1,
			height: rectangle.height
		})

		drawTextCenter(page, `${i + 1} ${section.name}`, {
			x: x + fontSize,
			y: y + rectangle.height / 2,
			font,
			fontSize: fontSize + 2,
			color: rgb(0,0,0),
			centerOption: centerOptions.VERTICALLY
		})

		if (!section.stories) return;

		const yUs = y - (yGap * 0.6)
		const usFontHeight = font.heightAtSize(fontSize, { descender: true })
		const usMaxWidth = rectangle.width - 1 - fontSize
		let usHeightCombined = 0
		section.stories.forEach((us, j) => {
			const text = `${i + 1}.${j + 1} ${us.name}`
			const nbLines = breakLinesPdf(text, font, fontSize, usMaxWidth).length
			log.debug({nbLines})

			const totalHeight = usFontHeight * (nbLines + 2)
			usHeightCombined += totalHeight
			drawRectangleWithShadow(page, {
				x,
				y: yUs - (usHeightCombined + 3 * j),
				color: rgbCustom(elements.userStory),
				width: rectangle.width - 1,
				height: totalHeight
			})

			
			drawTextCenter(page, text, {
				x: x + fontSize,
				y: yUs - (usHeightCombined + 3 * j) + totalHeight / 2,
				font,
				fontSize: fontSize,
				color: rgb(0, 0, 0),
				maxWidth: usMaxWidth,
				lineHeight: 1.5,
				centerOption: centerOptions.VERTICALLY
			})
			
		})
	})
}

function _computeDeliveryCardDimension(page, nbRectangles) {
	if (nbRectangles > 4) {
		nbRectangles = 4
	}

	const { height, width } = page.getSize()
	const xMargin = width * 0.12
	const xGap = xMargin * 0.1
	
	const rectangle = {
		height: xMargin * 0.4,
		width: (width - (xMargin * 2) - (xGap * 3)) / 4
	}

	const totalWidth = rectangle.width * nbRectangles + xGap * (nbRectangles - 1)

	log.trace({ xMargin, xGap, rectangle, totalWidth})

	return {
		xMargin, xGap, rectangle, totalWidth
	}
}

module.exports = {
	drawPldDeliveryCard,
}