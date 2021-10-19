const {
    validateUserStory
} = require("#src/validator")

/**
 * @type {import('@pld-builder/core/types/data').UserStory}
 */
const us = {
    name: "Lorem ipsum",
    as: "dolor",
    wantTo: "sit amet",
    description: "Nemo auditur propriam turpitudinem allegans",
    DoD: [
        "Panem",
        "Et",
        "Circenses"
    ],
    estimatedTime: 1
}

test('return true', () => {
    expect(validateUserStory(us)).toEqual(true)
})