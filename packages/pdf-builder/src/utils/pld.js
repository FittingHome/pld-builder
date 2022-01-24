const { validateDeliverable, validateSection, validateUserStory } = require("#src/validator")


/**
 *
 * @param {string} version
 * @returns {string}
 */
function versionTagToFullName(version) {
	if (version === "KO") return "Kick off"
	if (version === "FU") return "Follow up"
	if (version === "D") return "Delivery"
	return ""
}

/**
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 * @returns {import('@pld-builder/core/types/data').CompleteUserStory[]}
 */
function retrieveAllUserStories(pldData) {

	/** @type {import('@pld-builder/core/types/data').CompleteUserStory[]} */
	const userStories = [];

	const { deliverables } = pldData;
	if (!deliverables) {
		return log.error(chalk.red("Can't construct user stories if there aren't any deliverable..."))
	}

	deliverables.forEach((del, i) => {
		if (!validateDeliverable(del)) {
			return
		}

		del.sections.forEach((sec, j) => {
			if (!validateSection(sec)) {
				return
			}

			sec.stories.forEach((us, k) => {
				if (!validateUserStory(us)) {
					return
				}

				userStories.push({
					...us,
					delId: i + 1,
					secId: j + 1,
					id: k + 1
				})
			})
		})
	})

	return userStories;
}

/**
 * 
 * @param {import('@pld-builder/core/types/data').PldData} pldData
 * @returns {Map<string, number>}
 */
function retrieveAllAssignedMembersWithTheirWorkTime(pldData) {
	const userStories = retrieveAllUserStories(pldData)

	const members = new Map()
	for (const us of userStories) {
		const { timeAssigned, userStories } = members.get(us.assignedTo) || {}
		members.set(us.assignedTo, {
			timeAssigned: us.estimatedTime + (timeAssigned === undefined ? 0 : timeAssigned),
			userStories: userStories === undefined ? [] : [...userStories, us]
		})
	}

	return members
}

module.exports = {
	versionTagToFullName,
	retrieveAllUserStories,
	retrieveAllAssignedMembersWithTheirWorkTime
}