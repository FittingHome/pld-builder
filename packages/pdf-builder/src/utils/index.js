const { rgb, TextAlignment } = require('pdf-lib')
const chalk = require('chalk')
const log = require('#src/utils/log')
const { stringIsUrl } = require('@pld-builder/core');


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
			const newParagraph = [[]]
			let i = 0
			let w = 0
			while (w < words.length) {
				const word = words[w]
				newParagraph[i].push(word)

				const newParagraphLength = font.widthOfTextAtSize(newParagraph[i].join(' '), fontSize)
				if (newParagraphLength > maxWidth) {
					// - Cas ultra spécifique du lien hypertexte trop long
					if (newParagraph[i].length === 1) {
						// const charWidth = newParagraphLength / newParagraph[i][0].length
						const nbCharToSplice = Math.floor(newParagraph[i][0].length * maxWidth / newParagraphLength)
						newParagraph[i][0] = word.substr(0, nbCharToSplice)
						words.splice(w + 1, 0, word.slice(nbCharToSplice))
						w++
					} else {
						newParagraph[i].splice(-1)
					}
					newParagraph[++i] = []
					continue
				}
				w++
			}
			paragraphs[index] = newParagraph.map((p) => p.join(' ')).join('\n')
		}
	}
	return paragraphs.join('\n').split('\n')
}



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
	rgbCustom,
	breakLinesPdf,
	embedImg,

	warning,
}