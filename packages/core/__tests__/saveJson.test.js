const fs = require('fs')
const {
	saveJsonOnDisk
} = require("#src/saveJson")

function clearTestSideEffect() {
	try {
		fs.unlinkSync(__dirname + "/data.json")
	} catch(e) {
	}
}

beforeEach(() => clearTestSideEffect())
afterEach(() => clearTestSideEffect())

test("should save a json in a data.json", () => {
	saveJsonOnDisk(`{"oof":"test"}`, __dirname + "/data")
	expect(fs.existsSync(__dirname + "/data.json")).toBeTruthy()
})
