// main.js for Conlang Generator
// Requires chance.js to be loaded first

const selectedConsonants = new Set();
const selectedVowels = new Set();
const selectedDiphthongs = new Set();
let phonotacticRules = [];
let selectedTones = new Set();
const defaultTones = [
    { tone: '˥', description: 'High' },
    { tone: '˧', description: 'Mid' },
    { tone: '˩', description: 'Low' },
    { tone: '˩˥', description: 'Rising' },
    { tone: '˥˩', description: 'Falling' },
    { tone: '˩˧˩', description: 'Dipping' }
];

function populateGrid(containerId, matrix, selectedSet) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    matrix.forEach(row => {
        row.forEach(cell => {
            const div = document.createElement('div');
            div.className = 'char';
            if (cell) {
                div.textContent = cell;
                div.onclick = () => {
                    div.classList.toggle('selected');
                    selectedSet.has(cell) ? selectedSet.delete(cell) : selectedSet.add(cell);
                };
            } else {
                div.style.border = 'none';
            }
            container.appendChild(div);
        });
    });
}

// Insert default rules for phonotactic patterns
const phonotacticTagEditor = document.getElementById('tagEditor');
const phonotacticInput = document.getElementById('tagInput');
['CV', 'CVC', 'VC'].forEach(rule => {
    phonotacticRules.push(rule);
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = rule;
    const btn = document.createElement('button');
    btn.textContent = 'x';
    btn.onclick = () => {
        span.remove();
        phonotacticRules = phonotacticRules.filter(p => p !== rule);
    };
    span.appendChild(btn);
    phonotacticTagEditor.insertBefore(span, phonotacticInput);
});

// Event listener for phonotactic rules
phonotacticInput.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && phonotacticInput.innerText.trim() !== '') {
        e.preventDefault();
        const value = phonotacticInput.innerText.trim().toUpperCase();
        if (!phonotacticRules.includes(value)) {
            phonotacticRules.push(value);
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = value;
            const btn = document.createElement('button');
            btn.textContent = 'x';
            btn.onclick = () => {
                span.remove();
                phonotacticRules = phonotacticRules.filter(p => p !== value);
            };
            span.appendChild(btn);
            phonotacticTagEditor.insertBefore(span, phonotacticInput);
        }
        phonotacticInput.innerText = '';
    }
});

function updateToneOptions() {
    const count = parseInt(document.getElementById('toneCount').value);
    const container = document.getElementById('toneOptions');
    container.innerHTML = '';
    selectedTones.clear();
    const toneMap = {
         '5':  '˥',  '4':  '˦',  '3':  '˧',  '2':  '˨',  '1':  '˩',
        '55': '˥˥', '44': '˦˦', '33': '˧˧', '22': '˨˨', '11': '˩˩',
        '53': '˥˧', '31': '˧˩', '51': '˥˩', '13': '˩˧', '35': '˧˥'
    };
    for (let i = 0; i < count && i < defaultTones.length; i++) {
        const toneObj = defaultTones[i];
        const tone = toneObj.tone;

        const btn = document.createElement('div');
        btn.className = 'tone-button active';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.onclick = (e) => {
            e.stopPropagation();
            btn.classList.toggle('active', checkbox.checked);
            const val = span.textContent.trim();
            checkbox.checked ? selectedTones.add(val) : selectedTones.delete(val);
        };

        const span = document.createElement('span');
        span.textContent = tone;
        span.contentEditable = true;
        span.onblur = () => {
            const val = span.textContent.trim();
            const mapped = toneMap[val] || val;
            span.textContent = mapped;
            checkbox.checked = true;
            btn.classList.add('active');
            selectedTones.add(mapped);
        };

        const desc = document.createElement('span');
        desc.className = 'tone-description';
        desc.contentEditable = true;
        desc.textContent = toneObj.description || '';

        btn.appendChild(checkbox);
        btn.appendChild(span);
        btn.appendChild(desc);
        container.appendChild(btn);
        selectedTones.add(tone);
    }
}
function updateAccentUI() {
    const type = document.getElementById('accentType').value || 'stress';
    if (!['stress', 'tone'].includes(type)) return;
    document.getElementById('stressSettings').style.display = (type === 'stress') ? '' : 'none';
    const toneSelect = document.getElementById('toneCount')?.parentNode;
    if (toneSelect) toneSelect.style.display = (type === 'tone') ? '' : 'none';
    const toneBox = document.getElementById('toneOptions');
    if (toneBox) toneBox.style.display = (type === 'tone') ? '' : 'none';
}
// updateAccentUI();
updateToneOptions();

function generateWord() {
    const c = Array.from(selectedConsonants);
    const v = Array.from(selectedVowels);
    if (!c.length || !v.length || !phonotacticRules.length) return '[Missing elements]';

    // Use chance.js for random selection
    const pattern = chance.pickone(phonotacticRules);
    const syllableCount = parseInt(document.getElementById('syllableCount').value) || 1;

    // Check if tone system is enabled
    const accentType = document.getElementById('accentType').value;
    const toneCount = parseInt(document.getElementById('toneCount').value);
    const useTones = accentType === 'tone' && toneCount > 0;
    let tones = [];
    if (useTones) {
        tones = Array.from(selectedTones);
        if (!tones.length) {
            // fallback to defaultTones if none selected
            tones = defaultTones.slice(0, toneCount).map(t => t.tone);
        }
    }

    // Helper to pick a phoneme for a symbol or group
    const phoneme = ch => {
        if (ch === 'C') return chance.pickone(c) || '';
        if (ch === 'V') return chance.pickone(v) || '';
        // If ch is a group (e.g., Cʰ), pick each in sequence
        if (/^[CV]+$/.test(ch)) return ch.split('').map(phoneme).join('');
        // If ch is a literal phoneme (e.g., ŋ, ʰ, etc.)
        return ch;
    };

    // Expand a pattern string with support for:
    // - (X): optional single element (already supported)
    // - [XYZ]: optional group (choose to include or not)
    // - {X}: repeatable group (0-2 times)
    // - Cʰ: complex segment (e.g., affricate or aspirated)
    function expandPattern(patt) {
        let out = '';
        let i = 0;
        while (i < patt.length) {
            if (patt[i] === '(') { // Optional single element
                let j = patt.indexOf(')', i);
                if (j > i) {
                    const group = patt.slice(i + 1, j);
                    if (chance.bool()) out += expandPattern(group);
                    i = j + 1;
                } else {
                    out += patt[i++];
                }
            } else if (patt[i] === '[') { // Optional group
                let j = patt.indexOf(']', i);
                if (j > i) {
                    const group = patt.slice(i + 1, j);
                    if (chance.bool()) out += expandPattern(group);
                } else {
                    out += patt[i++];
                }
            } else if (patt[i] === '{') { // Repeatable group (0-2 times)
                let j = patt.indexOf('}', i);
                if (j > i) {
                    const group = patt.slice(i + 1, j);
                    const reps = chance.integer({ min: 0, max: 2 });
                    for (let k = 0; k < reps; k++) out += expandPattern(group);
                    i = j + 1;
                } else {
                    out += patt[i++];
                }
            } else {
                // Handle complex segments (e.g., Cʰ, Cw, etc.)
                // If next char is a modifier, treat as a group
                let seg = patt[i];
                let j = i + 1;
                while (j < patt.length && /[ʰʷʲːˑⁿˡʔŋ]/.test(patt[j])) {
                    seg += patt[j];
                    j++;
                }
                out += phoneme(seg);
                i = j;
            }
        }
        return out;
    }

    const buildSyllable = () => {
        const syl = expandPattern(pattern);
        let result = syl;
        // If using tones, append a random tone to the syllable
        if (useTones && tones.length) {
            result += chance.pickone(tones);
        }
        return result;
    };

    const syllables = Array.from({ length: syllableCount }, buildSyllable);
    if (accentType === 'stress' && document.getElementById('enableStress').checked) {
        const rule = document.getElementById('stressRule').value;
        let stressIndex = 0;
        if (rule === 'last') stressIndex = syllables.length - 1;
        else if (rule === 'penult') stressIndex = Math.max(0, syllables.length - 2);
        syllables[stressIndex] = 'ˈ' + syllables[stressIndex];
    }
    return syllables.join('');
}

function generateConlang() {
    syncSelectedPhonemes();
    const output = document.getElementById('output');
    let result = `Conlang Type: Experimental\n\n`;
    if (!selectedConsonants.size || !selectedVowels.size || !phonotacticRules.length) {
        result += 'Missing consonants, vowels, or rules.';
        output.textContent = result;
        return;
    }
    // Get selected output types
    const outputTypeSelect = document.getElementById('outputType');
    const selectedTypes = Array.from(outputTypeSelect.selectedOptions).map(opt => opt.value);
    if (!selectedTypes.length) {
        result += 'No output type selected.';
        output.textContent = result;
        return;
    }
    if (selectedTypes.includes('swadesh')) {
        result += '\nSwadesh List:\n';
        for (let i = 0; i < 20; i++) result += `${generateWord()}\n`;
    }
    if (selectedTypes.includes('udhr')) {
        result += '\nUniversal Declaration of Human Rights (sample):\n';
        for (let i = 0; i < 5; i++) result += `${generateWord()} ...\n`;
    }
    if (selectedTypes.includes('basics')) {
        result += '\nBasic Sentences (sample):\n';
        for (let i = 0; i < 5; i++) result += `${generateWord()}?\n`;
    }
    output.textContent = result;
}

function setupIPAButtons() {
    // Consonants
    document.querySelectorAll('#consonantTable .ipa-btn').forEach(btn => {
        if (!btn.textContent.trim()) return;
        btn.addEventListener('click', function () {
            const chars = btn.textContent.split(/\s|<br>|<BR>/i).map(s => s.trim()).filter(Boolean);
            chars.forEach(ch => {
                if (selectedConsonants.has(ch)) {
                    selectedConsonants.delete(ch);
                    btn.classList.remove('selected');
                } else {
                    selectedConsonants.add(ch);
                    btn.classList.add('selected');
                }
            });
        });
    });
    // Vowels
    document.querySelectorAll('#vowelTable .ipa-btn').forEach(btn => {
        if (!btn.textContent.trim()) return;
        btn.addEventListener('click', function () {
            const chars = btn.textContent.split(/\s|<br>|<BR>/i).map(s => s.trim()).filter(Boolean);
            chars.forEach(ch => {
                if (selectedVowels.has(ch)) {
                    selectedVowels.delete(ch);
                    btn.classList.remove('selected');
                } else {
                    selectedVowels.add(ch);
                    btn.classList.add('selected');
                }
            });
        });
    });
}
setupIPAButtons();

document.addEventListener('DOMContentLoaded', function () {
    // Helper: get all IPA buttons for consonants and vowels
    const consonantBtns = Array.from(document.querySelectorAll('#consonantTable .ipa-btn')).filter(btn => btn.textContent.trim());
    const vowelBtns = Array.from(document.querySelectorAll('#vowelTable .ipa-btn')).filter(btn => btn.textContent.trim());

    // Deselect all first (in case of reload)
    consonantBtns.forEach(btn => btn.classList.remove('selected'));
    vowelBtns.forEach(btn => btn.classList.remove('selected'));
    if (window.selectedConsonants) selectedConsonants.clear();
    if (window.selectedVowels) selectedVowels.clear();

    // --- Weighted selection using PHOIBLE (if available) ---
    // We'll use a small sample of PHOIBLE-like frequencies for demo if no data loaded
    const defaultConsonantFreq = {
        'p': 0.98, 'b': 0.85, 't': 0.99, 'd': 0.89, 'k': 0.97, 'g': 0.87, 'm': 0.96, 'n': 0.97, 's': 0.93, 'l': 0.82, 'r': 0.75, 'f': 0.65, 'v': 0.45, 'ʃ': 0.35, 'ʒ': 0.15, 'h': 0.85, 'ŋ': 0.45, 'θ': 0.25, 'ð': 0.15, 'z': 0.65, 'ʔ': 0.55
        // ...add more as needed
    };
    const defaultVowelFreq = {
        'i': 0.99, 'e': 0.95, 'a': 0.99, 'o': 0.95, 'u': 0.98, 'ɯ': 0.15, 'y': 0.12, 'ø': 0.08, 'ɨ': 0.10, 'ʉ': 0.07, 'ɤ': 0.09, 'ɵ': 0.06, 'ə': 0.25, 'ɛ': 0.45, 'œ': 0.05, 'ɜ': 0.04, 'ɞ': 0.03, 'ʌ': 0.12, 'ɔ': 0.35, 'æ': 0.18, 'ɑ': 0.55, 'ɒ': 0.09, 'ɘ': 0.03, 'o̞': 0.02, 'e̞': 0.02, 'ø̞': 0.01, 'ɤ̞': 0.01, 'ɐ': 0.08
        // ...add more as needed
    };

    // Try to use loaded phoibleData if available
    let consonantWeights = {};
    let vowelWeights = {};
    if (window.phoibleData && phoibleData.length > 1) {
        // Count frequencies
        let cCounts = {}, vCounts = {}, cTotal = 0, vTotal = 0;
        phoibleData.slice(1).forEach(row => {
            const [lang, type, phoneme] = row;
            if (type === 'consonant') {
                cCounts[phoneme] = (cCounts[phoneme] || 0) + 1; cTotal++;
            }
            if (type === 'vowel') {
                vCounts[phoneme] = (vCounts[phoneme] || 0) + 1; vTotal++;
            }
        });
        consonantWeights = cCounts;
        vowelWeights = vCounts;
        // Normalize
        Object.keys(consonantWeights).forEach(k => consonantWeights[k] /= cTotal);
        Object.keys(vowelWeights).forEach(k => vowelWeights[k] /= vTotal);
    } else {
        consonantWeights = defaultConsonantFreq;
        vowelWeights = defaultVowelFreq;
    }

    // Weighted random selection helper
    function weightedSample(btns, weightsObj, n) {
        // Build array of {btn, weight}
        const arr = btns.map(btn => {
            const txt = btn.textContent.trim();
            return { btn, w: weightsObj[txt] || 0.01 };
        });
        // Normalize weights
        const total = arr.reduce((s, x) => s + x.w, 0);
        arr.forEach(x => x.w /= total);
        // Weighted sampling without replacement
        const chosen = [];
        for (let i = 0; i < n && arr.length; i++) {
            let r = Math.random();
            let acc = 0;
            for (let j = 0; j < arr.length; j++) {
                acc += arr[j].w;
                if (r <= acc) {
                    chosen.push(arr[j].btn);
                    arr.splice(j, 1);
                    break;
                }
            }
        }
        return chosen;
    }

    // Select consonants and vowels using weighted sampling
    const randConsonants = weightedSample(consonantBtns, consonantWeights, Math.min(5, consonantBtns.length));
    const randVowels = weightedSample(vowelBtns, vowelWeights, Math.min(3, vowelBtns.length));

    randConsonants.forEach(btn => {
        btn.classList.add('selected');
        if (window.selectedConsonants) selectedConsonants.add(btn.textContent.trim());
    });
    randVowels.forEach(btn => {
        btn.classList.add('selected');
        if (window.selectedVowels) selectedVowels.add(btn.textContent.trim());
    });

    // After random selection, trigger a UI update to ensure sets are populated
    // and the generateConlang button works immediately
    setTimeout(() => {
        // Defensive: ensure sets are not empty
        if (selectedConsonants.size && selectedVowels.size && phonotacticRules.length) {
            // Optionally, auto-generate a conlang on load:
            // generateConlang();
        }
    }, 0);

    // Fix expand/collapse logic for affricates, glides, nonpulmonic
    const sectionMap = [
        { btn: 'toggle-affricates', section: 'affricates' },
        { btn: 'toggle-glides', section: 'glides' },
        { btn: 'toggle-nonpulmonic', section: 'nonpulmonic' }
    ];
    sectionMap.forEach(({ btn, section }) => {
        const button = document.getElementById(btn);
        const rows = document.querySelectorAll(`#consonantTable tr.collapsible-row[data-section='${section}']`);
        if (button && rows.length) {
            // Only initialize once
            if (!button.dataset.sectionName) {
                // Try to extract from text (e.g., '+ Show Affricates' -> 'Affricates')
                const match = button.textContent.match(/[+\-]\s*(Show\s*)?(.*)/i);
                button.dataset.sectionName = match ? match[2].trim() : button.textContent.trim();
                // Set initial state: collapsed
                rows.forEach(row => row.style.display = 'none');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '+ ' + button.dataset.sectionName;
                button.addEventListener('click', function () {
                    const isHidden = Array.from(rows).every(row => row.style.display === 'none' || getComputedStyle(row).display === 'none');
                    rows.forEach(row => row.style.display = isHidden ? '' : 'none');
                    button.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
                    button.textContent = (isHidden ? '− ' : '+ ') + button.dataset.sectionName;
                });
            }
        }
    });

    const randomizeBtn = document.getElementById('randomize-features');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', randomizeFeaturesByWALS);
    }

    // Remove Onset/Nucleus/Coda inputs
    ['onsetConstraint', 'nucleusConstraint', 'codaConstraint'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentNode) {
            el.parentNode.style.display = 'none';
        }
    });

    // Enable IPA button selection for glides and nonpulmonic tables
    document.querySelectorAll('#glideTable .ipa-btn, #nonpulmonicTable .ipa-btn').forEach(btn => {
        if (!btn.textContent.trim()) return;
        btn.addEventListener('click', function () {
            btn.classList.toggle('selected');
        });
    });
});

async function initializeWALS() {
    try {
        const res = await fetch('wals_data.json');
        const data = await res.json();
        walsData = data;
        populateDropdown(data.languages);
        document.getElementById('language-select').addEventListener('change', onLanguageChange);
        if (data.languages && data.languages.length > 0) {
            document.getElementById('language-select').value = data.languages[0].name;
            onLanguageChange();
        }
    } catch (err) {
        const select = document.getElementById('language-select');
        select.innerHTML = '<option value="">(Failed to load languages)</option>';
    }
}

// Patch: ensure selectedConsonants/selectedVowels are always in sync with UI before generating
function syncSelectedPhonemes() {
    selectedConsonants.clear();
    selectedVowels.clear();
    document.querySelectorAll('#consonantTable .ipa-btn.selected').forEach(btn => selectedConsonants.add(btn.textContent.trim()));
    document.querySelectorAll('#vowelTable .ipa-btn.selected').forEach(btn => selectedVowels.add(btn.textContent.trim()));
}

function updateConsonantTable(consonants) {
    const cells = document.querySelectorAll('#consonantTable .ipa-btn');
    // Remove 'selected' from all first
    cells.forEach(cell => cell.classList.remove('selected'));
    // Add 'selected' only to those matching the consonants (normalize for IPA variants)
    cells.forEach(cell => {
        const cellText = cell.textContent.trim();
        if (consonants.some(c => c === cellText || c.normalize('NFC') === cellText || c.normalize('NFD') === cellText)) {
            cell.classList.add('selected');
        }
    });
    // Update selectedConsonants set to match UI
    selectedConsonants.clear();
    cells.forEach(cell => {
        if (cell.classList.contains('selected')) selectedConsonants.add(cell.textContent.trim());
    });
}

function updateVowelTable(vowels) {
    const cells = document.querySelectorAll('#vowelTable .ipa-btn');
    cells.forEach(cell => cell.classList.remove('selected'));
    cells.forEach(cell => {
        const cellText = cell.textContent.trim();
        if (vowels.some(v => v === cellText || v.normalize('NFC') === cellText || v.normalize('NFD') === cellText)) {
            cell.classList.add('selected');
        }
    });
    // Update selectedVowels set to match UI
    selectedVowels.clear();
    cells.forEach(cell => {
        if (cell.classList.contains('selected')) selectedVowels.add(cell.textContent.trim());
    });
}

function updatePhonotacticsFromLanguage(lang) {
    // Clear current phonotactic rules
    phonotacticRules = [];
    // Remove all tags except the tag-input
    const tagEditor = document.getElementById('tagEditor');
    Array.from(tagEditor.querySelectorAll('.tag')).forEach(tag => tag.remove());
    // Set rules based on syllable_structure
    if (lang.features.syllable_structure === 'simple') {
        ['CV', 'VC', 'V'].forEach(rule => addPhonotacticRuleTag(rule));
    } else if (lang.features.syllable_structure === 'complex') {
        ['CCV', 'CVC', 'CVCC', 'CCVC', 'CV', 'VC', 'V'].forEach(rule => addPhonotacticRuleTag(rule));
    } else {
        // Default fallback
        ['CV', 'CVC', 'VC'].forEach(rule => addPhonotacticRuleTag(rule));
    }
}

function addPhonotacticRuleTag(rule) {
    phonotacticRules.push(rule);
    const input = document.querySelector('.tag-input');
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = rule;
    const btn = document.createElement('button');
    btn.textContent = 'x';
    btn.onclick = () => {
        span.remove();
        phonotacticRules = phonotacticRules.filter(p => p !== rule);
    };
    span.appendChild(btn);
    input.parentNode.insertBefore(span, input);
}

function onLanguageChange() {
    const selected = document.getElementById('language-select').value;
    const lang = walsData.languages.find(l => l.name === selected);
    if (lang) {
        updateConsonantTable(lang.features.consonants);
        updateVowelTable(lang.features.vowels);
        updateLanguageFeatures(lang);
        // Map WALS features to UI controls
        // Tone -> Tone System
        if (lang.features.tone === 'yes') {
            document.getElementById('accentType').value = 'tone';
            document.getElementById('toneCount').value = lang.features.tone_count || '2';
        } else {
            document.getElementById('accentType').value = 'stress';
            document.getElementById('toneCount').value = '0';
        }
        updateAccentUI();
        updateToneOptions();
        // Stress -> Stress and Prosody
        if (lang.features.stress) {
            // Try to map to UI options
            const stressRule = document.getElementById('stressRule');
            if (lang.features.stress === 'initial') stressRule.value = 'first';
            else if (lang.features.stress === 'final') stressRule.value = 'last';
            else if (lang.features.stress === 'penult') stressRule.value = 'penult';
            else if (lang.features.stress === 'variable') stressRule.value = 'variable';
            // Enable/disable stress marking
            document.getElementById('enableStress').checked = lang.features.stress !== 'none';
        }
        // Syllable Structure -> Phonotactic Rules
        updatePhonotacticsFromLanguage(lang);
        // Morphology -> Language Typology
        if (lang.features.morphology) {
            document.getElementById('typology').value = lang.features.morphology;
        }
        if (lang.features.word_order) {
            document.getElementById('wordOrder').value = lang.features.word_order;
        }
    }
}

function updateLanguageFeatures(language) {
    const featuresTable = document.getElementById('features-table').querySelector('tbody');
    featuresTable.innerHTML = '';
    if (!language || !language.features) return;
    const features = language.features;
    const featureLabels = {
        phoneme_inventory_size: 'Phoneme Inventory Size',
        tone: 'Tone',
        tone_count: 'Number of Tones',
        stress: 'Stress',
        syllable_structure: 'Syllable Structure',
        word_order: 'Word Order',
        morphology: 'Morphology',
        case_marking: 'Case Marking',
        definiteness: 'Definiteness',
        gender: 'Gender'
    };
    Object.keys(featureLabels).forEach(key => {
        if (features[key] !== undefined) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = featureLabels[key];
            const td = document.createElement('td');
            td.textContent = features[key];
            tr.appendChild(th);
            tr.appendChild(td);
            featuresTable.appendChild(tr);
        }
    });
}

function populateDropdown(languages) {
    const select = document.getElementById('language-select');
    select.innerHTML = '';
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.name;
        option.textContent = lang.name;
        select.appendChild(option);
    });
}

function weightedRandomChoice(freqMap) {
    const total = Object.values(freqMap).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [val, freq] of Object.entries(freqMap)) {
        if (r < freq) return val;
        r -= freq;
    }
    // fallback
    return Object.keys(freqMap)[0];
}

function computeFeatureFrequencies(languages, feature) {
    const freq = {};
    languages.forEach(lang => {
        const val = lang.features[feature];
        if (val !== undefined) freq[val] = (freq[val] || 0) + 1;
    });
    return freq;
}

function randomizeFeaturesByWALS() {
    if (!walsData) return;
    const langs = walsData.languages;
    // Features to randomize and their UI mapping
    const featureMap = {
        'morphology': { el: 'typology' },
        'tone': { el: 'accentType', map: v => v === 'yes' ? 'tone' : 'stress' },
        'tone_count': { el: 'toneCount' },
        'stress': { el: 'stressRule', map: v => v === 'initial' ? 'first' : v === 'final' ? 'last' : v === 'penult' ? 'penult' : 'first' },
        'syllable_structure': { el: 'allowClusters', map: v => v === 'complex' },
    };
    // Compute and set each feature
    Object.keys(featureMap).forEach(f => {
        const freq = computeFeatureFrequencies(langs, f);
        const val = weightedRandomChoice(freq);
        const map = featureMap[f].map;
        const el = document.getElementById(featureMap[f].el);
        if (!el) return;
        if (featureMap[f].el === 'allowClusters') {
            el.checked = !!(map ? map(val) : val);
        } else if (featureMap[f].el === 'accentType') {
            el.value = map ? map(val) : val;
            updateAccentUI();
        } else if (featureMap[f].el === 'toneCount') {
            el.value = val || '0';
            updateToneOptions();
        } else if (featureMap[f].el === 'stressRule') {
            el.value = map ? map(val) : val;
        } else {
            el.value = map ? map(val) : val;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Helper: get all IPA buttons for consonants and vowels
    const consonantBtns = Array.from(document.querySelectorAll('#consonantTable .ipa-btn')).filter(btn => btn.textContent.trim());
    const vowelBtns = Array.from(document.querySelectorAll('#vowelTable .ipa-btn')).filter(btn => btn.textContent.trim());

    // Deselect all first (in case of reload)
    consonantBtns.forEach(btn => btn.classList.remove('selected'));
    vowelBtns.forEach(btn => btn.classList.remove('selected'));
    if (window.selectedConsonants) selectedConsonants.clear();
    if (window.selectedVowels) selectedVowels.clear();

    // --- Weighted selection using PHOIBLE (if available) ---
    // We'll use a small sample of PHOIBLE-like frequencies for demo if no data loaded
    const defaultConsonantFreq = {
        'p': 0.98, 'b': 0.85, 't': 0.99, 'd': 0.89, 'k': 0.97, 'g': 0.87, 'm': 0.96, 'n': 0.97, 's': 0.93, 'l': 0.82, 'r': 0.75, 'f': 0.65, 'v': 0.45, 'ʃ': 0.35, 'ʒ': 0.15, 'h': 0.85, 'ŋ': 0.45, 'θ': 0.25, 'ð': 0.15, 'z': 0.65, 'ʔ': 0.55
        // ...add more as needed
    };
    const defaultVowelFreq = {
        'i': 0.99, 'e': 0.95, 'a': 0.99, 'o': 0.95, 'u': 0.98, 'ɯ': 0.15, 'y': 0.12, 'ø': 0.08, 'ɨ': 0.10, 'ʉ': 0.07, 'ɤ': 0.09, 'ɵ': 0.06, 'ə': 0.25, 'ɛ': 0.45, 'œ': 0.05, 'ɜ': 0.04, 'ɞ': 0.03, 'ʌ': 0.12, 'ɔ': 0.35, 'æ': 0.18, 'ɑ': 0.55, 'ɒ': 0.09, 'ɘ': 0.03, 'o̞': 0.02, 'e̞': 0.02, 'ø̞': 0.01, 'ɤ̞': 0.01, 'ɐ': 0.08
        // ...add more as needed
    };

    // Try to use loaded phoibleData if available
    let consonantWeights = {};
    let vowelWeights = {};
    if (window.phoibleData && phoibleData.length > 1) {
        // Count frequencies
        let cCounts = {}, vCounts = {}, cTotal = 0, vTotal = 0;
        phoibleData.slice(1).forEach(row => {
            const [lang, type, phoneme] = row;
            if (type === 'consonant') {
                cCounts[phoneme] = (cCounts[phoneme] || 0) + 1; cTotal++;
            }
            if (type === 'vowel') {
                vCounts[phoneme] = (vCounts[phoneme] || 0) + 1; vTotal++;
            }
        });
        consonantWeights = cCounts;
        vowelWeights = vCounts;
        // Normalize
        Object.keys(consonantWeights).forEach(k => consonantWeights[k] /= cTotal);
        Object.keys(vowelWeights).forEach(k => vowelWeights[k] /= vTotal);
    } else {
        consonantWeights = defaultConsonantFreq;
        vowelWeights = defaultVowelFreq;
    }

    // Weighted random selection helper
    function weightedSample(btns, weightsObj, n) {
        // Build array of {btn, weight}
        const arr = btns.map(btn => {
            const txt = btn.textContent.trim();
            return { btn, w: weightsObj[txt] || 0.01 };
        });
        // Normalize weights
        const total = arr.reduce((s, x) => s + x.w, 0);
        arr.forEach(x => x.w /= total);
        // Weighted sampling without replacement
        const chosen = [];
        for (let i = 0; i < n && arr.length; i++) {
            let r = Math.random();
            let acc = 0;
            for (let j = 0; j < arr.length; j++) {
                acc += arr[j].w;
                if (r <= acc) {
                    chosen.push(arr[j].btn);
                    arr.splice(j, 1);
                    break;
                }
            }
        }
        return chosen;
    }

    // Select consonants and vowels using weighted sampling
    const randConsonants = weightedSample(consonantBtns, consonantWeights, Math.min(5, consonantBtns.length));
    const randVowels = weightedSample(vowelBtns, vowelWeights, Math.min(3, vowelBtns.length));

    randConsonants.forEach(btn => {
        btn.classList.add('selected');
        if (window.selectedConsonants) selectedConsonants.add(btn.textContent.trim());
    });
    randVowels.forEach(btn => {
        btn.classList.add('selected');
        if (window.selectedVowels) selectedVowels.add(btn.textContent.trim());
    });

    // After random selection, trigger a UI update to ensure sets are populated
    // and the generateConlang button works immediately
    setTimeout(() => {
        // Defensive: ensure sets are not empty
        if (selectedConsonants.size && selectedVowels.size && phonotacticRules.length) {
            // Optionally, auto-generate a conlang on load:
            // generateConlang();
        }
    }, 0);

    // Fix expand/collapse logic for affricates, glides, nonpulmonic
    const sectionMap = [
        { btn: 'toggle-affricates', section: 'affricates' },
        { btn: 'toggle-glides', section: 'glides' },
        { btn: 'toggle-nonpulmonic', section: 'nonpulmonic' }
    ];
    sectionMap.forEach(({ btn, section }) => {
        const button = document.getElementById(btn);
        const rows = document.querySelectorAll(`#consonantTable tr.collapsible-row[data-section='${section}']`);
        if (button && rows.length) {
            // Only initialize once
            if (!button.dataset.sectionName) {
                // Try to extract from text (e.g., '+ Show Affricates' -> 'Affricates')
                const match = button.textContent.match(/[+\-]\s*(Show\s*)?(.*)/i);
                button.dataset.sectionName = match ? match[2].trim() : button.textContent.trim();
                // Set initial state: collapsed
                rows.forEach(row => row.style.display = 'none');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '+ ' + button.dataset.sectionName;
                button.addEventListener('click', function () {
                    const isHidden = Array.from(rows).every(row => row.style.display === 'none' || getComputedStyle(row).display === 'none');
                    rows.forEach(row => row.style.display = isHidden ? '' : 'none');
                    button.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
                    button.textContent = (isHidden ? '− ' : '+ ') + button.dataset.sectionName;
                });
            }
        }
    });

    const randomizeBtn = document.getElementById('randomize-features');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', randomizeFeaturesByWALS);
    }

    // Remove Onset/Nucleus/Coda inputs
    ['onsetConstraint', 'nucleusConstraint', 'codaConstraint'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentNode) {
            el.parentNode.style.display = 'none';
        }
    });

    // Enable IPA button selection for glides and nonpulmonic tables
    document.querySelectorAll('#glideTable .ipa-btn, #nonpulmonicTable .ipa-btn').forEach(btn => {
        if (!btn.textContent.trim()) return;
        btn.addEventListener('click', function () {
            btn.classList.toggle('selected');
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Only call initializeWALS once
    if (!window._walsInitialized) {
        window._walsInitialized = true;
        initializeWALS();
    }
});
