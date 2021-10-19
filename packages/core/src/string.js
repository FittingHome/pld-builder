/**
 * Return [baseStr] with the extension added if it wasn't there in the first place
 * @type {import('./string')}
 */
function optionalAppend(baseStr, appendedStr) {
    return !baseStr.endsWith(appendedStr)
        ? baseStr + appendedStr
        : baseStr
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
 * @param {string} s
 * @returns {boolean}
 */
function isCharacterALetter(char) {
    return char.toLowerCase() != char.toUpperCase()
}

module.exports = {
    optionalAppend,
    isCharacterALetter,

    // For testing purposes
    stringIsUrl
}