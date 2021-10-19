
interface Labels {
	green: string
	yellow: string
	orange: string
	red: string
	purple: string
	blue: string
	sky: string
	lime: string
	pink: string
	black: string
}

export interface Member {
	id: string
	fullname: string
	username: string
}

export interface Board {
	id: string
	name: string
	labelNames: Labels
}

export interface List {
	id: string
	name: string

	idBoard: string
}

export interface Label {
	id: string
	idBoard: string
	name: string
	color: string
}

export interface Card {
	id: string
	name: string
	
	// Description
	desc: string

	idBoard: string
	idList: string
	idMembers: string[]
	idLabels: string[]
	labels: Label[]
	cover: CardCover
}

export interface CardCover {
	idAttachment: string
	color: string
}