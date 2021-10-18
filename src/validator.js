const log = require("#src/utils/log")

/**
 * 
 * @param {string} str - str to print
 * @param {boolean} falseAlarm - if falseAlarm, do nothing... 
 */
function _warn(str, falseAlarm) {
    if (!falseAlarm) {
        log.warn(str)
    }
}

function _error(str) {
    log.error(str)
    return false
}

/**
 *
 * @param {import('#types/data').Deliverable} del
 * @param {boolean} printWarning
 * @returns {boolean} is the deliverable valid?
 */
function validateDeliverable(del, printWarning = true) {
    if (!del) {
        return _error("The delivery is null")
    }
    if (!del.name) {
        return _error("A delivery must have a name")
    }
    if (!del.sections) {
        return _error(`${del.name} (delivery) must have sections`)
    }

    return true
} 

/**
 *
 * @param {import('#types/data').Section} sec
 * @param {boolean} printWarning
 * @returns {boolean} is the section valid?
 */
function validateSection(sec, printWarning = true) {
    if (!sec) {
        return _error("The section is null")
    }
    if (!sec.name) {
        return _error("A section must have a name")
    }
    if (!sec.stories) {
        return _error(`${del.name} (section) must have user stories`)
    }

    return true
}

/**
 * 
 * @param {import('#types/data').UserStory} us
 * @param {boolean} printWarning
 * @returns {boolean} is the user story valid?
 */
function validateUserStory(us, printWarning = true) {
    if (!us) {
        return _error("The user story is null")
    }
    if (!us.name) {
        return _error("A user story must have a name")
    }

    if (!us.estimatedTime || us.estimatedTime <= 0) {
        return _error(`${us.name} (user story) must have an estimated time superior than 0`)
    }

    if (!us.as) {
        _warn(`${us.name} (user story) should specify who is it for`, !printWarning)
    }

    if (!us.description) {
        _warn(`${us.name} (user story) should specify a description of itself`, !printWarning)
    }
    
    // if (us.description.length < 100) {
    //     _warn(`${us.name} (user story) should have a longer description. Expected > 100 but got ${us.description.length}`, !printWarning)
    // }

    return true;
}

module.exports = {
    validateUserStory,
    validateSection,
    validateDeliverable,
    // validatePldData,
}