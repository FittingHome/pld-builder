/**
 * It's not ideal but this function also populate the assignments property of each member as it goes through the userStories
 * @param {object} _
 * @param {import('@pld-builder/core/types/data').Deliverable[]} _.deliverables
 * @param {import('@pld-builder/core/types/data').Member[]} _.members
 */
function switchAllAssignedToIdsToTheirName({ deliverables, members }) {
	if (!deliverables) {
		return
	}

	for (const del of deliverables) {
		for (const sec of del.sections) {
			for (const us of sec.stories) {
				const assignedMember = members.find(m => m.id === us.assignedTo)
				if (!assignedMember) {
					// log.warn(`Don't know user with id ${us.assignedTo}`)
					continue
				}

				us.assignedTo = assignedMember.fullname

				// - As said above its not ideal to put that here but it's convenient right now to log how many days of work every one have
				assignedMember.timeAssigned += us.estimatedTime

			}
		}
	}
}

module.exports = {
	switchAllAssignedToIdsToTheirName
}