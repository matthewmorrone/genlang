const fs = require('fs')
const utils = require('./utils.js')
const Is = utils.Is
const args = process.argv.slice(2)

let data = fs.getFileAsLines("phoible/phoible.csv").map(line => line.split(",").map(cell => cell.slice(1, -1)))
data.shift()

let languages = {}
let phones = []
data.each(line => {
    if (!languages[line[3]]) languages[line[3].toTitleCase()] = []
    languages[line[3].toTitleCase()].push(line[6])
    phones.push(line[6])
})
phones = phones.unique()


if (args[0] === "phones") phones.each(phone => console.log(phone))
if (args[0] === "languages") Object.keys(languages).each(language => console.log(language))
if (args[0] === "map") {
    languages.each(language => {
        language[1].each(phone => {
            console.log(language[0], phone)
        })
    })
}
if (args[0] === "summary") {
    languages.each(language => {
        console.log(language[0], ":", language[1].join(","))
    })
}


