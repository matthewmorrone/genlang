const fs = require('fs')
const utils = require('./utils.js')
const Is = utils.Is
const args = process.argv.slice(2)

let details = fs.getFileAsLines("wals-details.tsv").map(line => line.split("\t"))
let detailHeaders = details.shift().map(detailHeader => detailHeader.toLowerCase())
details = details.map(detail => {
    let obj = {}
    detailHeaders.each((header, index) => obj[header] = detail[index])
    obj.group = obj.feature.slice(0, -1)
    return obj
})
let detailMap = {}
details.each(detail => detailMap[detail.feature] = detail)


let stats = fs.getFileAsLines("wals-stats.tsv").map(line => line.split("\t"))
let statHeaders = stats.shift().map(statHeader => statHeader.toLowerCase())
stats = stats.map(stat => {
    let obj = {}
    statHeaders.each((header, index) => obj[header] = stat[index])
    obj.group = obj.feature.slice(0, -1)

    return obj
})

let features = {}
details.each(detail => {
    features[detail.feature] = []
})

stats.each(stat => features[stat.feature].push(stat))

detailMap.each(detail => {
    detailMap[detail[0]].entries = features[detail[0]].sort(function(a, b) {
        return b.count - a.count
    })
})


let groupMap = {}
detailMap.each(detail => {
    if (!groupMap[detail[1].group]) {
        groupMap[detail[1].group] = []
    }
    groupMap[detail[1].group].push(detail[1])
})

let categoryMap = {}
detailMap.each(detail => {
    if (!categoryMap[detail[1].category]) {
        categoryMap[detail[1].category] = []
    }
    categoryMap[detail[1].category].push(detail[1])
})





categoryMap = {Phonology: categoryMap.Phonology}




if (args[0] === "json") console.log(JSON.stringify(categoryMap, null, 2))
if (args[0] === "text") {
    detailMap.each(detail => {
        if (detail[1].category !== "Phonology") return
        console.log(`${detail[1].description} across ${detail[1].total} languages (${detail[0]}):`)
        detail[1].entries.each(entry => {
            let percent = ((entry.count/entry.total)*100).round(2).toFixed(2).padStart(5, 0)
            console.log(`  ${percent}%: ${entry.description} (${entry.count}/${entry.total})`)
        })
    })
}


