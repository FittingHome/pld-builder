# PLD-Builder 👷

Monorepository that contains three packages :

### Core ⚛️
> Package that contains functions and interfaces used in other packages

### Trello-scrapper 🧲
> Utility that fetch all the meaningful content of a Trello board and constructs a .json with it

### Pdf-builder 🏗️
> Utility that builds a PLD pdf using a .json file as input.


## Installation

> Prerequisites: nodejs, yarn

1. Run `yarn` to install lerna

1. Run `yarn bootstrap` to install the dependencies and construct symbolic links in the packages


## Usage

Go into each package folder to execute them independently
OR
Execute the script.sh at the root to extract a json from Trello and build the pld as a pdf

## Tests

Run `yarn test` in each projects or in the root to trigger test suites

## Notes

To migrate this project to a monorepository approach i've used [this medium article](https://medium.com/@simonpeyou/de-lint%C3%A9r%C3%AAt-et-l-usage-d-un-mono-repository-dans-une-startup-fd461bb1760d) (warning: it's in french)