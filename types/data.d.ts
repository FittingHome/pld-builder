export interface PldData {
	name: string
	logo: string
	members: Member[]
	deliverables: Deliverable[]
}

export interface Member {
	pseudo: string
	fullname: string
}

export interface Deliverable {
	name: string
	sections: Section[]
}

export interface Section {
	name: string
	userStories: UserStory[]
}

export interface UserStory {
	name: string
	as: string
	wantTo: string
	description: string
	DoD: string[]
	estimatedTime: number
}