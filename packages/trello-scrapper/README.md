# Trello-scrapper 🧲

Utility that fetch all the meaningful content of a Trello board and constructs a .json with it


## How to format your Trello board?

Pour que la board soit scrappable par ce programme, elle doit réunir plusieurs conditions :

- Avoir une liste dont le nom est entouré de 2 crochets comme ceci : [[name]]
  - Cette liste peut contenir une carte nommé "Index"
    - Elle peut contenir un link "logo" représentant l'image
- Avoir jusqu'à 5 listes dont le nom est entouré d'un crochet comme ceci: [name]. Une liste représente un livrable
  - La liste doit contenir une carte nommée "Index", elle doit contenir une liste ordonnées nommant les différentes sections du livrable
  - Each card in the list must be formatted in a very specific way:
    - The name: "x.y Name_of_the_user_story" //x must be the id of the section and y the id of the user story
    - The body: 4 words (markdown emojis actually) are used inside the body to separate main parts of the user story:
        - :eyes: -> for the 'i want' part
        - :book: -> for the 'description' part
        - :pencil: -> for the 'definition of done' part
        - :hourglass: -> for the 'estimated time' part
    - The label: you must use Trello label to define the 'as' part of the user story
    - The member: their must one and only one person following a card (he's assigned to it)


## Usage

- Add a .env file at the root with at least 3 informations:
  1. TRELLO_API_KEY=<your_key>        // access it on https://trello.com/app-key (only works if you are logged in)
  2. TRELLO_SERVER_TOKEN=<your_token> // access it on the same page as above but you need to click a link
  3. PLD_BOARD_NAME=<your_board_name> // the name of the Trello board that represents a PLD

- Launch the program with node:
```sh
node index.js
```