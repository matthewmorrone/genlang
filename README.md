1. Phonotactics Editor: pattern syntax, cluster toggles, onset/nucleus/coda constraints.
2. Phonological Rules: definable rules (e.g. devoicing, assimilation) applied to morphemes.
3. Stress and Prosody: stress toggle, fixed vs weight-based rules, tone integration.
4. Morphology Generator: templates based on typology, affix types, and grammatical categories.
5. Grammar Rules: SVO/SOV order, agreement types, negation, and case systems.
6. Orthography Designer: IPA vs user-defined glyph mapping.
7. Lexicon Expansion: semantic fields, PoS tagging, seed-based derivation, CSV/JSON export.
8. WALS Integration: realistic typological clustering from WALS patterns.

Now. I want to take WALS data and make the generated languages likely to follow along correlations of features across languages 
Tone yes, orthography design might be pushing it but intriguing
Want tone added as a clickable grid like the IPA one, or more automatic

9.  Phonotactics Editor
• Allow parenthesized specification (C)V means CV and V
• Add Option to allow/disallow consonant clusters
• Settings for onset, nucleus, coda constraints

1. Phonological Rules / Sound Changes
• Rules like final devoicing, nasal assimilation, etc.
• Could let you define rules in a simple DSL or UI
• Applies automatically to generated morphemes

1. Stress and Prosody
• Checkbox for displaying stress or not
• Add basic stress rules (fixed position, weight-sensitive, lexical)
• Could display marked stress in generated words
• Optional: pitch accent/tone interaction (later)

1. Morphology Templates and Generator. Generate morphemes based on:
• Typology (isolating, agglutinative, etc.): Add real typological flavor:
• Isolating = single morpheme per word
• Agglutinative = clean affix stacking
• Fusional = overlapping/mutated affixes
• Polysynthetic = generate sentence-words
• Affix slots (prefix/suffix/infix): User defines affix slots or lets it auto-generate them
• Grammatical categories (tense, case, number, etc.)
• Can auto-conjugate using generated stems + affixes

1. Grammar Rule Generation
• Subject-verb-object order (SVO, SOV, etc.)
• Agreement rules (none, number, gender)
• Negation strategy
• Case system toggle

1. Orthography Designer
• Toggle between IPA display vs conlang orthography
• Create your own glyph-to-phoneme mapping

1. Lexicon Expansion
• Export wordlist with part of speech tags
• Add semantic fields beyond Swadesh (e.g. emotions, colors, animals)
• Add semantic fields: colors, numbers, kinship, body parts
• Allow user to define a seed word and get related words
• Make word generation reflect basic morphosyntax
• Could export to .csv or .json eventually

1. WALS
• These rules auto-populate at load using a realistic cluster from WALS-style patterns