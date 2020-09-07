const fs = require('fs')
const utils = require('./utils.js')
const { exit } = require('process')
const Is = utils.Is
const args = process.argv.slice(2)



if (!args[0]) {
    console.log("choices: phones languages summary json data keys filter")
}

let data = fs.getFileAsLines("phoible/phoible.csv").map(line => line.split(",").map(cell => cell.slice(1, -1)))
let keys = data.shift()


let languages = {}
let phones = []
data.each(line => {
    if (!languages[line[3]]) languages[line[3].toTitleCase()] = []
    languages[line[3].toTitleCase()].push(line[6])
    phones.push(line[6])
})
phones = phones.unique()

// data = data.map(line => line.pluck([3, 5]))


let json = data.map(function(line) {
    let res = {}
    keys.each(function(key, i) {
        res[key] = line[i]
    })
    return res
})


if (args[0] === "phones") phones.each(phone => console.log(phone))
else if (args[0] === "keys") keys.each((key) => console.log(key))
else if (args[0] === "languages") Object.keys(languages).each(language => console.log(language))
else if (args[0] === "map") {
    languages.each(language => {
        language[1].each(phone => {
            console.log(language[0], phone)
        })
    })
}
else if (args[0] === "summary") {
    languages.each(language => {
        console.log(language[0], ":", language[1].join(","))
    })
}
else if (args[0] === "json") {
    console.log(json)
}
else if (args[0] === "data")  {
    if (args[1]) {
        data = data.filter(line => line[0] === args[1])
    }
    data.map(line => console.log(line.join(",")))
}
else if (args[0] === "filter")  {
    let conds = args.slice(1)
    for(let i = 0; i < conds.length; i+=2) {
        json = json.filter(line => line[conds[i]] === conds[i+1])
    }
    json.map(line => console.log(Object.values(line).join(",")))
}
else if (args[0] === "stats") {
    let result = {}
    languages.each(function(language) {
        if (language[1].includes(args[1])) {
            result[language[0]] = language[1]
        }
    })

    result.each(language => console.log(language.join(",")))
    console.log(result.size()+" out of "+languages.size()+" languages have the phone "+args[1])
}