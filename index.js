const fs = require('fs')
const utils = require('./utils.js')
const args = process.argv.slice(2)

let details = fs.getFileAsLines("wals-details.tsv").map(line => line.split("\t"))
let detailHeaders = details.shift().map(detailHeader => detailHeader.toLowerCase())
details = details.map(detail => {
    let obj = {}
    detailHeaders.each((header, index) => obj[header] = detail[index])
    return obj
})

let stats = fs.getFileAsLines("wals-stats.tsv").map(line => line.split("\t"))
let statHeaders = stats.shift().map(statHeader => statHeader.toLowerCase())
stats = stats.map(stat => {
    let obj = {}
    statHeaders.each((header, index) => obj[header] = stat[index])
    return obj
})

let features = {}
details.each(detail => features[detail.feature] = [])
stats.each(stat => features[stat.feature].push(stat))

let detailMap = {}
details.each(detail => detailMap[detail.feature] = detail)

detailMap.each(detail => {
    detailMap[detail[0]].entries = features[detail[0]]
})

JSON.stringify()
if (args[0] === "json") console.log(JSON.stringify(detailMap, null, 2))
if (args[0] === "text") {
    detailMap.each(detail => {
        console.log(`${detail[1].description} (${detail[0]}):`)
        detail[1].entries.each(entry => {
            let percent = ((entry.count/entry.total)*100).round(2).toFixed(2).padStart(5, 0)
            console.log(`  ${percent}%: ${entry.description}`)
        })
    })
}


