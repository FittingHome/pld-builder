# Trello-scrapper 🧲

Utilitary that fetch all the meaningful content of a Trello board and constructs a .json with it



## How to format your Trello board?

Pour que la board soit scrappable par ce programme, elle doit réunir plusieurs conditions :

- Avoir une liste dont le nom est entouré de 2 crochets comme ceci : [[name]]
  - Cette liste peut contenir une carte nommé "Index"
    - Elle peut contenir un link "logo" représentant l'image
- Avoir jusqu'à 5 listes dont le nom est entouré d'un crochet comme ceci: [name]. Une liste représente un livrable
  - La liste doit contenir une carte nommée "Index", elle doit contenir une liste ordonnées nommant les différentes sections du livrable
  - Chacune des cartes de la liste doit être formaté d'une manière bien spécifique
    - Le nom: "x.y Name_of_the_user_story" //x must be the id of the section and y the id of the user story
    - Le corps: 4 mot vont venir délimiter les parties de la description:
        - :eyes: -> for the 'i want' part
        - :book: -> for the 'description' part
        - :pencil: -> for the 'definition of done' part
        - :hourglass: -> for the 'estimated time' part
    - The label: you must use Trello label to define the 'as' part of the user story
    - The member: their must one and only one person following a card (he's assigned to it)