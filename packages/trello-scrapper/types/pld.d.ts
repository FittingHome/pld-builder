export interface PropertiesEmoji {

}

export interface IndexListPropertiesEmoji extends PropertiesEmoji {
	description: string
	cards: string
	features: string
}

export interface UserStoryPropertiesEmoji extends PropertiesEmoji {
	wantTo: string
	description: string
	DoD: string
	estimatedTime: string
}



export interface UserStoryDescriptionProperties {
	wantTo: string
	description: string
	DoD: string[]
	estimatedTime: number
}

export interface IndexListDescriptionProperties {
	description: string
	sections: string[]
	features: string[]
}