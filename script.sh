#!/bin/sh

cd packages/trello-scrapper
node index.js
cd ../pdf-builder
node index.js -i ../trello-scrapper/pldData.json
mv *.pdf ../../