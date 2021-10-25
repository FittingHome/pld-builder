// Used by all the packages
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	moduleNameMapper: {
		"^#src(.*)$": "<rootDir>/src$1",
		"^#types(.*)$": "<rootDir>/types$1"
	}
};

module.exports = config;