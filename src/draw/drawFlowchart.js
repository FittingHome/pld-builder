const { rgb } = require('pdf-lib')
const { rgbCustom, breakLinesPdf, computeHorizontalChartDimension } = require('../utils')
const { drawTextCenter } = require('./drawTextCenter')

const elements = {
	app: { r: 52, g: 89, b: 156 },
	delivery: { r: 61, g: 103, b: 177 },
	links: { r: 109, g: 137, b: 203 },
}

/**
 * 
 * @param {import('pdf-lib').PDFPage} page
 * @param {object} _
 * @param {number} _.x	bottom left corner of the rectangle
 * @param {number} _.y	bottom left corner of the rectangle
 * @param {string} _.text
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {{height: number, width: number}} _.rectangleDimension
 * @param {boolean} _.isMainRectangle
 */
function drawFlowchartRectangle(page, {text, font, isMainRectangle, x, y, rectangleDimension: {width, height}}) {
	const fontSizeRatio = isMainRectangle ? 3.5 : 4
	const color = isMainRectangle ? rgbCustom(elements.app) : rgbCustom(elements.delivery)

	// Main rectangle
	page.drawRectangle({
		x,
		y,
		width,
		height,
		color
	})

	// Main name
	drawTextCenter(page, text, {
		x: x + width / 2,
		y: y + height / 2,
		color: rgb(1, 1, 1),
		font,
		fontSize: height / fontSizeRatio,
		maxWidth: width,
	})
}

function computeFlowchartDimension(page, nbRectangles) {
	const width = page.getWidth()
	const xMargin = width * 0.05
	const xGap = xMargin * 0.8

	const spaceToFill = width - xMargin * 2
	const rectangle = {
		height: xMargin * 1.6,
		width: (spaceToFill - (xGap * (nbRectangles - 1))) / nbRectangles
	}

	return {
		xMargin, xGap, rectangle,
	}
}

/**
 * Draw the flowchart row of rectangle
 * @param {import('pdf-lib').PDFPage} page
 * @param {object} _
 * @param {import('../types/data').PldData} _.data
 * @param {import('pdf-lib').PDFFont} _.font
 * @param {number} _.yPos - The top position of the chart
 */
function drawPldFlowchart(page, {data, font, yPos}) {

	const width = page.getWidth()
	const nbRectangles = data.deliverables.length
	const { xMargin, xGap, rectangle } = computeFlowchartDimension(page, nbRectangles)

	// - Draw main rectangle
	drawFlowchartRectangle(page, {
		text: data.name,
		font,
		rectangleDimension: rectangle,
		y: yPos - rectangle.height,
		x: width / 2 - rectangle.width / 2,
		isMainRectangle: true,
	})


	const barThickness = xGap / 12

	// Middle vertical bar
	page.drawLine({
		start: {
			x: width / 2,
			y: yPos - rectangle.height - 1
		},
		end: {
			x: width / 2,
			y: yPos - rectangle.height - xGap / 2
		},
		thickness: barThickness,
		color: rgbCustom(elements.links)
	})

	// Horizontal bar
	page.drawLine({
		start: {
			x: xMargin + rectangle.width / 2,
			y: yPos - rectangle.height - xGap / 2
		},
		end: {
			x: width - (xMargin + rectangle.width / 2),
			y: yPos - rectangle.height - xGap / 2
		},
		thickness: barThickness,
		color: rgbCustom(elements.links)
	})

	for (let i = 0; i < nbRectangles; i++) {
		const x = xMargin + rectangle.width * i + xGap * i
		const y = yPos - rectangle.height * 2 - xGap

		drawFlowchartRectangle(page, {
			text: `${i} ${data.deliverables[i].name}`,
			x, y,
			font,
			rectangleDimension: rectangle,
			isMainRectangle: false
		})

		// - Draw top-center vertical line
		page.drawLine({
			start: {
				x: x + rectangle.width / 2,
				y: y + rectangle.height + 1
			},
			end: {
				x: x + rectangle.width / 2,
				y: y + rectangle.height + xGap / 2
			},
			thickness: barThickness,
			color: rgbCustom(elements.links)
		})
	}

	page.drawSquare({
		x: width / 2,
		y: yPos,
		color: rgb(1, 0, 0),
		size: 1
	})
}

module.exports = {
	drawPldFlowchart
}