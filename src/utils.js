const { rgb, TextAlignment } = require('pdf-lib')
const chalk = require('chalk')
const log = require('./log')


/**
 * Return {str} with the extension added if it wasn't there in the first place
 * @param {string} baseStr
 * @param {string} appendedStr
 */
function optionalAppend(baseStr, appendedStr) {
	return !baseStr.endsWith(appendedStr)
		? baseStr + appendedStr
		: baseStr
}

/**
 * Returns a pdf-lib rgb object from an object containing the color properties
 * @param {{r: number, g: number, b: number}} e
 * @returns {import('pdf-lib').RGB}
 */
function rgbCustom(e) {
	return rgb(
		(e.r ? e.r : 0) / 255,
		(e.g ? e.g : 0) / 255,
		(e.b ? e.b : 0) / 255);
}

const centerOptions = Object.freeze({
	HORIZONTALLY: 1,
	VERTICALLY: 2,
	BOTH: 3
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
 */
function drawTextCenter(page, text, { x, y, color, font, fontSize, maxWidth, lineHeight, debug, centerOption }) {
	const textShrinkHeight = font.heightAtSize(fontSize, {descender: false})
	const textHeight = font.heightAtSize(fontSize, {descender: true})

	x = x !== undefined ? x : page.getWidth() / 2
	y = y !== undefined ? y : page.getHeight() / 2
	color = color ? color : rgb(0, 0, 0)
	lineHeight = lineHeight ? lineHeight : 1.14
	centerOption = centerOption !== undefined ? centerOption : centerOptions.BOTH

	text = breakLinesPdf(text, font, fontSize, maxWidth)
	const paragraphHeight = (text.length - 1) * (textHeight * lineHeight ) + textHeight

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
			size : fontSize,
		})

		if (debug) {
			page.drawRectangle({
				x: pX,
				y: pY,
				borderWidth: 1,
				borderColor: rgb(0,0,1),
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

/**
 * 
 * @param {string} text 
 * @param {import('pdf-lib').PDFFont} font 
 * @param {number} fontSize 
 * @param {number} maxWidth 
 * @returns {string[]}
 */
function breakLinesPdf (
	text,
	font,
	fontSize,
	maxWidth
) {	
	const paragraphs = text.split('\n')
	if (!maxWidth) {
		return paragraphs
	} 
	for (let index = 0; index < paragraphs.length; index++) {
		const paragraph = paragraphs[index]
		if (font.widthOfTextAtSize(paragraph, fontSize) > maxWidth) {
			const words = paragraph.split(' ')
			/** @type {string[][]} */
			const newParagraph = []
			let i = 0
			newParagraph[i] = []
			for (const word of words) {
				newParagraph[i].push(word)
				if (font.widthOfTextAtSize(newParagraph[i].join(' '), fontSize) > maxWidth) {
					newParagraph[i].splice(-1)
					newParagraph[++i] = []
					newParagraph[i].push(word)
				}
			}
			paragraphs[index] = newParagraph.map((p) => p.join(' ')).join('\n')
		}
	}
	return paragraphs.join('\n').split('\n')
}

const URL = require("url").URL;
/**
 * @param {string} s
 * @returns {boolean}
 */
function stringIsUrl(s) {
	try {
		new URL(s);
		return true;
	} catch (_) {
		return false;
	}
};

/**
 * 
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {string} imgExtension 
 * @param {*} data 
 * @returns {Promise<import('pdf-lib').PDFImage>}
 */
async function _embedImg(pdfDoc, imgExtension, data) {
	if (imgExtension === ".png") {
		return await pdfDoc.embedPng(data)
	} else {
		return await pdfDoc.embedJpg(data)
	}
}

const fs = require('fs')
const fetch = require('node-fetch')
/**
 * Simple utilitary function to embed both jpg and png images (doesn't support base64 encoded string)
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @param {string} imgUri
 * @returns {Promise<import('pdf-lib').PDFImage>}
 */
async function embedImg(pdfDoc, imgUri) {
	const dotIdx = imgUri.lastIndexOf('.')
	if (dotIdx === -1) {
		log.error(imgUri, "isn't a valid image")
		return;
	}
	const imgExtension = imgUri.substr(dotIdx);

	if (stringIsUrl(imgUri)) {
		try {
			const buffer = await fetch(imgUri).then(res => res.arrayBuffer())
			return await _embedImg(pdfDoc, imgExtension, buffer)
		} catch (err) {
			log.error(err)
		}	
	}
	
	try {
		const data = fs.readFileSync(imgUri)
		return await _embedImg(pdfDoc, imgExtension, data)
	} catch (err) {
		log.error(err)
	}
}

// Orange
const warning = chalk.hex('#FFA500')

module.exports = {
	optionalAppend,
	rgbCustom,
	drawTextCenter,
	breakLinesPdf,
	embedImg,

	warning,
	centerOptions,

	// For testing purposes
	stringIsUrl,
}