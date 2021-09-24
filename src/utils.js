const { rgb, TextAlignment } = require('pdf-lib')

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

/**
 * 
 * @param {import('pdf-lib').PDFPage} page 
 * @param {string} text
 * @param {object} _
 * @param {number} _.x center x position
 * @param {number} _.y center y position
 * @param {number} _.size
 * @param {number} _.maxWidth
 * @param {import('pdf-lib').RGB} _.color
 * @param {import('pdf-lib').PDFFont} _.font
 */
function drawTextCenter(page, text, { x, y, color, size, font, maxWidth }) {
	// const textWidth = font.widthOfTextAtSize(text, size);
	const textHeight = font.heightAtSize(size);
	const lineHeight = 1.14

	text = breakLinesPdf(text, font, size, maxWidth)
	const paragraphHeight = (text.length - 1) * (textHeight * lineHeight ) + textHeight

	for (let i = text.length - 1; i >= 0; i--) {
		console.log( text[i] )
		page.drawText(text[i], {
			x: x - font.widthOfTextAtSize(text[i], size) / 2,
			y: y - paragraphHeight / 2 + (text.length - i - 1) * (lineHeight * textHeight),
			color,
			size,
			font
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
					newParagraph[i].splice(-1) // retira a ultima palavra
					newParagraph[++i] = []
					newParagraph[i].push(word)
				}
			}
			paragraphs[index] = newParagraph.map((p) => p.join(' ')).join('\n')
		}
	}
	console.log({paragraphs})
	return paragraphs.join('\n').split('\n')
}


module.exports = {
	optionalAppend,
	rgbCustom,
	drawTextCenter,
	breakLinesPdf
}