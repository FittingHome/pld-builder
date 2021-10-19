export interface PldData {
	promotionYear: number
	name: string
	logo: string
	deliverables: Deliverable[]
	members: Member[]
}

export interface Member {
	pseudo: string
	fullname: string
	attributions: string[] // Example ["1.1", "2.4", "4.2"]
}

export interface Deliverable {
	name: string
	sections: Section[]
}

export interface Section {
	name: string
	stories: UserStory[]
}

export interface UserStory {
	name: string
	as: string
	wantTo: string
	description: string
	DoD: string[]
	estimatedTime: number
}

export interface RankedUserStory extends UserStory {
	delId: number
	secId: number
	id: number
}

export interface AssignedUserStory extends UserStory {
	secId: number
	id: number
	assignedTo: string
}

export interface TextSection {
	text: string
	x: number
	y: number
	width: number
	height: number
	color: import('pdf-lib').RGB
	font: import('pdf-lib').PDFFont
	fontSize: number
	fontColor: import('pdf-lib').RGB
	fontHeightFactor: number,
	lineHeight: number
}