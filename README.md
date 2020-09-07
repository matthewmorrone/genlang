# genlang
procedural conlang generation

## description
use WALS data to generate realistic phonetics and phonology systems.

## prerequisites
node.js

## instructions
see text files of similar name for example output. 

```node phoible.js phones```
displays the full set of phones

```node phoible.js languages```
displays the full set of languages

```node phoible.js map```
displays a 1:1 of every language in each phonedisplays the full set of phones

```node phoible.js summary```
same as map but in a more readable form

```node phoible.js keys```
shows the data column names

```node phoible.js filter```
filter data by specific key values. examples:

+ ```node phoible.js SegmentClass consonant > consonants.txt```
+ ```node phoible.js filter LanguageName Korean```
+ ```node phoible.js filter LanguageName Korean SegmentClass consonant```

```node phoible.js stats l```
1072 out of 2489 languages have the phone l


## next: 
+ calculate phonological intersection
+ random weighted selection
+ display data output in table format


Dryer, Matthew S. & Haspelmath, Martin (eds.) 2013. The World Atlas of Language Structures Online. Jena: Max Planck Institute for the Science of Human History. (Available online at https://wals.info)
