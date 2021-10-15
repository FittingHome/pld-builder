
const {
	rgbCustom,
	breakLinesPdf
} = require('#src/utils/index')
const {
	optionalAppend,
	stringIsUrl,
} = require("#src/utils/string")
let pdfDoc;
let pdfFont


beforeAll(() => {
	const { PDFDocument, StandardFonts } = require('pdf-lib')
	return new Promise(async resolve => {
		pdfDoc = await PDFDocument.create()
		pdfFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
		resolve()
	});
});

test('append if not present at the end', () => {
	expect(optionalAppend('foo', '.jpg')).toEqual('foo.jpg')
	expect(optionalAppend('foo.jpge', '.jpg')).toEqual('foo.jpge.jpg')
})

test("doesn't append if already present", () => {
	expect(optionalAppend('foo.jpg', '.jpg')).toEqual('foo.jpg')
	expect(optionalAppend('oofoo', 'foo')).toEqual('oofoo')
})

test("check that string is a valid url", () => {
	expect(stringIsUrl("https://google.com")).toBeTruthy()
	expect(stringIsUrl("https://www.google.com")).toBeTruthy()
	expect(stringIsUrl("https://www.google.com/img?q=dog")).toBeTruthy()
})

test("check that string isn't a valid url", () => {
	expect(stringIsUrl("google.com")).toBeFalsy()
	expect(stringIsUrl("/www.google.com")).toBeFalsy()
})

test("rgb is correct with 255 based values", () => {
	const white = rgbCustom({r: 255, g: 255, b: 255})
	expect(white.red).toEqual(1)
	expect(white.green).toEqual(1)
	expect(white.blue).toEqual(1)

	const black = rgbCustom({r: 0, g: 0, b: 0})
	expect(black.red).toEqual(0)
	expect(black.green).toEqual(0)
	expect(black.blue).toEqual(0)
})

test("break lines pdf", () => {
	const paragraphs = breakLinesPdf("The quick brown fox", pdfFont, 20, 100)
	console.log({paragraphs})
	expect(paragraphs.length).toBeGreaterThan(1)
})

test("it should return the same string in an array", () => {
	const paragraphs = breakLinesPdf("The lazy dog", pdfFont, 20)
	expect(paragraphs).toEqual(["The lazy dog"])
})