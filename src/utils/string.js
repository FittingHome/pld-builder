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

module.exports = {
    optionalAppend,

    // For testing purposes
    stringIsUrl
}