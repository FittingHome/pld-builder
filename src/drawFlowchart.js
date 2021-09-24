const { rgb } = require('pdf-lib')
const { rgbCustom, drawTextCenter, breakLinesPdf } = require('./utils')

const elements = {
	app: { r: 52, g: 89, b: 156 },
	delivery: { r: 61, g: 103, b: 177 },
	links: { r: 109, g: 137, b: 203 },
}

/**
 * Draw the flowchart row of rectangle
 * @param {import('pdf-lib').PDFPage} page
 * @param {object} _
 * @param {import('../types/data').PldData} _.data
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {number} _.yPos
 */
function drawPldFlowchart(page, {data, font, yPos}) {
	const width = page.getWidth()
	const xMargin = width * 0.05
	const widthBetweenRectangle = xMargin * 0.8
	const nbRectangles = data.deliverables.length

	const spaceToFill = width - xMargin * 2
	const rectangle = {
		height: xMargin * 1.6,
		width: (spaceToFill - (widthBetweenRectangle * (nbRectangles - 1))) / nbRectangles
	}


	// Main rectangle
	page.drawRectangle({
		x: width / 2 - rectangle.width / 2,
		y: yPos,
		width: rectangle.width,
		height: rectangle.height,
		color: rgbCustom(elements.app)
	})

	// page.drawSquare({
	// 	x: width / 2,
	// 	y: yPos + rectangle.height,
	// 	size: 10,
	// 	color: rgb(1,0,0)
	// })

	page.drawText("Oof", {
		x: width / 2,
		y: yPos + rectangle.height,
		color: rgb(0,0,0),
		font
	})


	// drawTextCenter(page, data.name, {
	// 	x: width / 2,
	// 	y: yPos + rectangle.height,
	// 	color: rgb(1,1,1),
	// 	size: rectangle.height / 3.5,
	// 	font,
	// 	maxWidth: rectangle.width
	// })

	const barThickness = widthBetweenRectangle / 12

	// Middle vertical bar
	page.drawLine({
		start: {
			x: width / 2,
			y: yPos - 1
		},
		end: {
			x: width / 2,
			y: yPos - widthBetweenRectangle / 2
		},
		thickness: barThickness,
		color: rgbCustom(elements.links)
	})

	// Horizontal bar
	page.drawLine({
		start: {
			x: xMargin + rectangle.width / 2,
			y: yPos - widthBetweenRectangle / 2
		},
		end: {
			x: width - (xMargin + rectangle.width / 2),
			y: yPos - widthBetweenRectangle / 2
		},
		thickness: barThickness,
		color: rgbCustom(elements.links)
	})

	for (let i = 0; i < nbRectangles; i++) {
		const x = xMargin + rectangle.width * i + widthBetweenRectangle * i
		const y = yPos - rectangle.height - widthBetweenRectangle
		page.drawRectangle({
			x,
			y,
			width: rectangle.width,
			height: rectangle.height,
			color: rgbCustom(elements.delivery),
		})
		drawTextCenter(page, `${i} ${data.deliverables[i].name}`, {
			x: x + rectangle.width / 2,
			y: y + rectangle.height / 2,
			color: rgb(1, 1, 1),
			size: rectangle.height / 4,
			font,
			maxWidth: rectangle.width
		})

		page.drawLine({
			start: {
				x: x + rectangle.width / 2,
				y: y + rectangle.height + 1
			},
			end: {
				x: x + rectangle.width / 2,
				y: y + rectangle.height + widthBetweenRectangle / 2
			},
			thickness: barThickness,
			color: rgbCustom(elements.links)
		})
	}

}

module.exports = {
	drawPldFlowchart
}