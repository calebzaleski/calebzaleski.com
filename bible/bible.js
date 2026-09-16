let URL = 'https://proxy.calebzaleski.com'

async function searchDef(query) {
    // Backend URL for searching the bible; the proxy attaches BIBLE_API_KEY server-side
    const url = `${URL}/bible/search_def?string=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        console.log('searchBible response:', data);
        return data;
    } catch (err) {
        console.error('Error searching bible:', err);
    }
}

async function searchContext(query, type) {
    let query_content = []
    if (type !== "strict") {
        query_content.push(...query.split(' '));
        query_content.push(query.replace(/\s+/g, ''));
        query_content.push(query);
    }
    else {
        query_content.push(query);
    }
    let data = []
    for (const x of query_content) {
        const url = `${URL}/bible/search_content_${type}?string=${encodeURIComponent(x)}`;

        try {
            const response = await fetch(url, {method: 'POST'});
            const content = await response.json();
            console.log('searchBible response:', content);
            data.push(content);
        } catch (err) {
            console.error('Error searching bible:', err);
        }
    }
    return data;
}

async function fetchVerse(book, chapter, verse) {
    const url = `${URL}/bible/verse?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&verse=${encodeURIComponent(verse)}`;

    try {
        const response = await fetch(url, { method: 'POST' });
        return await response.json();
    } catch (err) {
        console.error('Error fetching verse:', err);
    }
}

async function fetchVerses(book, chapter, verse_s, verse_e) {
    const  url = `${URL}/bible/verses?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&verse_s=${encodeURIComponent(verse_s)}&verse_e=${encodeURIComponent(verse_e)}`;
    try {
        const response = await fetch(url, { method: 'POST' });
        return await response.json();
    }
    catch (err) {
        console.error('Error fetching verse:', err);
    }
}

async function fetchChapter(book, chapter) {
    const url = `${URL}/bible/chapter?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`;

    try {
        const response = await fetch(url, { method: 'POST' });
        return await response.json();
    }
    catch (err) {
        console.error('Error fetching chapter:', err);
    }
}

// Dedupe result rows down to one entry per book/chapter/verse, since
// search_def can return multiple word-level matches for the same verse.
function dedupeByReference(results) {
    const seen = new Set();
    const deduped = [];
    for (const r of results) {
        const key = `${r.book}|${r.chapter}|${r.verse}`;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(r);
    }
    return deduped;
}

function clearResults() {
    document.getElementById('passageText').innerHTML = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('verseDetail').innerHTML = '';
    document.getElementById('verseDetail').classList.remove('open');
}

// Renders a range/chapter as one continuous block of plain reading text,
// with small superscript verse numbers, above the per-verse breakdown.
function renderPassageText(verses) {
    const container = document.getElementById('passageText');
    if (!verses || verses.length === 0) {
        container.innerHTML = '';
        return;
    }
    const html = verses
        .map((v) => `<sup class="passageVerseNum">${v.verse}</sup>${v.kjv}`)
        .join(' ');
    container.innerHTML = `<p class="passageParagraph">${html}</p>`;
}

// Runs `worker` over `items` with at most `limit` calls in flight at once.
async function runWithConcurrency(items, limit, worker) {
    let next = 0;
    async function runNext() {
        const i = next++;
        if (i >= items.length) return;
        await worker(items[i], i);
        await runNext();
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
}

function renderResultsList(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';

    if (!results || results.length === 0) {
        container.innerHTML = '<p class="noResults">No results found.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'verseList';

    const deduped = dedupeByReference(results);
    const pendingText = [];

    deduped.forEach((r) => {
        const item = document.createElement('li');
        item.className = 'verseListItem';

        const ref = document.createElement('span');
        ref.className = 'verseRef';
        ref.textContent = `${r.book} ${r.chapter}:${r.verse}`;

        const text = document.createElement('span');
        text.className = 'verseText';

        if (r.kjv) {
            text.textContent = r.kjv;
        } else {
            // search_def results don't include KJV text, so backfill it from /verse
            // to match the layout of the content search results.
            text.textContent = '';
            text.classList.add('loading');
            pendingText.push({ r, span: text });
        }

        item.appendChild(ref);
        item.appendChild(text);
        item.addEventListener('click', () => openVerseDetail(r.book, r.chapter, r.verse, item));

        list.appendChild(item);
    });

    container.appendChild(list);

    runWithConcurrency(pendingText, 5, async ({ r, span }) => {
        const data = await fetchVerse(r.book, r.chapter, r.verse);
        span.classList.remove('loading');
        span.textContent = data && data.kjv ? data.kjv.text : '';
    });
}

function fieldRow(label, value) {
    if (value === null || value === undefined || value === '') return '';
    return `<div class="wordField"><span class="wordFieldLabel">${label}</span><span class="wordFieldValue">${value}</span></div>`;
}

async function openVerseDetail(book, chapter, verse, itemEl) {
    document.querySelectorAll('.verseListItem.active').forEach((el) => el.classList.remove('active'));
    if (itemEl) itemEl.classList.add('active');

    const detail = document.getElementById('verseDetail');
    detail.classList.add('open');
    detail.innerHTML = '<p class="loading">Loading verse...</p>';
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const data = await fetchVerse(book, chapter, verse);
    if (!data || (!data.kjv && !data.hebrew)) {
        detail.innerHTML = '<p class="noResults">Could not load verse details.</p>';
        return;
    }

    const kjvText = data.kjv ? data.kjv.text : '';
    const originalText = data.hebrew ? data.hebrew.text : '';
    const wordInfo = data.wordinfo || [];

    let html = `
        <button id="closeVerseDetail" class="closeBtn" aria-label="Close">&times;</button>
        <h3 class="verseDetailRef">${book} ${chapter}:${verse}</h3>
        <p class="verseDetailKjv">${kjvText}</p>
    `;

    if (originalText) {
        html += `<p class="verseDetailOriginal">${originalText}</p>`;
    }

    if (wordInfo.length > 0) {
        html += '<div class="wordInfoList">';
        wordInfo.forEach((w) => {
            html += `
                <div class="wordInfoCard">
                    <div class="wordInfoHeader">
                        <span class="wordOriginal">${w.hebrew || ''}</span>
                        ${w.transliteration ? `<span class="wordTranslit">(${w.transliteration})</span>` : ''}
                    </div>
                    ${fieldRow('Short gloss', w.short_gloss)}
                    ${fieldRow('Gloss', w.gloss)}
                    ${fieldRow('Definition', w.definition)}
                    ${fieldRow('Headword', w.headword)}
                    ${fieldRow('Part of speech', w.pos)}
                    ${fieldRow('Parsing', w.parsing)}
                    ${fieldRow('Morphology', w.morph)}
                    ${fieldRow('Strong\'s', w.strongs)}
                    ${fieldRow('Segmented', w.segmented)}
                </div>
            `;
        });
        html += '</div>';
    }

    detail.innerHTML = html;
    document.getElementById('closeVerseDetail').addEventListener('click', () => {
        detail.classList.remove('open');
        detail.innerHTML = '';
        document.querySelectorAll('.verseListItem.active').forEach((el) => el.classList.remove('active'));
    });
}

const searchModeSelect = document.getElementById('bibleSearchMode');
const searchQueryInput = document.getElementById('bibleSearchQuery');
const strictToggleWrap = document.getElementById('strictToggleWrap');
const searchHint = document.getElementById('searchHint');

function updateSearchModeUI() {
    const isDef = searchModeSelect.value === 'def';
    strictToggleWrap.hidden = isDef;
    searchQueryInput.placeholder = isDef ? 'example: Spirit' : 'example: and He wept';
    searchHint.textContent = isDef
        ? 'Query a word or sentence from the original-language definition.'
        : 'Search for a word, phrase or sentence from the KJV Bible.';
}

searchModeSelect.addEventListener('change', updateSearchModeUI);
updateSearchModeUI();

async function runSearch() {
    const query = searchQueryInput.value.trim();
    if (!query) return;
    clearResults();

    let results;
    if (searchModeSelect.value === 'def') {
        const data = await searchDef(query);
        results = data ? data.results : [];
    } else {
        const type = document.getElementById('bibleContentSearchType').checked ? 'strict' : 'loose';
        const data = await searchContext(query, type);
        results = (data || []).flatMap((d) => (d && d.results) || []);
    }
    renderResultsList(results);
}

document.getElementById('bibleSearchBtn').addEventListener('click', runSearch);
searchQueryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });

// Passage lookup (single verse / verse range / whole chapter)

const getModeSelect = document.getElementById('bibleGetMode');
const getBookInput = document.getElementById('bibleGetBook');
const getChapterInput = document.getElementById('bibleGetChapter');
const getVerseStartInput = document.getElementById('bibleGetVerseStart');
const getVerseEndInput = document.getElementById('bibleGetVerseEnd');
const getHint = document.getElementById('getHint');

function updateGetModeUI() {
    const mode = getModeSelect.value;
    getVerseStartInput.hidden = mode === 'chapter';
    getVerseEndInput.hidden = mode !== 'verses';
    document.getElementById('refSepColon').hidden = mode === 'chapter';
    document.getElementById('refSepDash').hidden = mode !== 'verses';
    getVerseStartInput.placeholder = mode === 'verses' ? 'e.g. 3' : 'e.g. 16';
    if (mode === 'verse') {
        getHint.textContent = 'Look up a single verse.';
    } else if (mode === 'verses') {
        getHint.textContent = 'Look up a range of verses within one chapter.';
    } else {
        getHint.textContent = 'Look up an entire chapter.';
    }
}

getModeSelect.addEventListener('change', updateGetModeUI);
updateGetModeUI();

// /bible/verses and /bible/chapter return arrays of full verse objects
// (same shape as /bible/verse); flatten them to match the {book, chapter,
// verse, kjv} shape the search endpoints return so renderResultsList works.
function normalizeVerseData(list, book) {
    return (list || [])
        .filter((d) => d && d.kjv)
        .map((d) => ({ book, chapter: d.kjv.chapter, verse: d.kjv.verse, kjv: d.kjv.text }));
}

async function runGet() {
    const mode = getModeSelect.value;
    const book = getBookInput.value.trim();
    const chapter = getChapterInput.value.trim();
    if (!book || !chapter) return;

    clearResults();

    if (mode === 'verse') {
        const verse = getVerseStartInput.value.trim();
        if (!verse) return;
        await openVerseDetail(book, chapter, verse);
        return;
    }

    if (mode === 'verses') {
        const verseStart = getVerseStartInput.value.trim();
        const verseEnd = getVerseEndInput.value.trim();
        if (!verseStart || !verseEnd) return;
        const data = await fetchVerses(book, chapter, verseStart, verseEnd);
        const normalized = normalizeVerseData(data, book);
        renderPassageText(normalized);
        renderResultsList(normalized);
        return;
    }

    const data = await fetchChapter(book, chapter);
    const normalized = normalizeVerseData(data, book);
    renderPassageText(normalized);
    renderResultsList(normalized);
}

document.getElementById('bibleGetBtn').addEventListener('click', runGet);
[getBookInput, getChapterInput, getVerseStartInput, getVerseEndInput].forEach((el) => {
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') runGet(); });
});

async function fetchQuiz() {
    const url = `${URL}/bible/quiz`;

    try {
        const response = await fetch(url, { method: 'POST' });
        return await response.json();
    } catch (err) {
        console.error('Error fetching quiz:', err);
    }
}

let quizAnswer = {};
let quizMisses = 0;

async function loadQuiz() {
    quizAnswer = await fetchQuiz();
    quizMisses = 0;
    document.getElementById('quizBook').textContent = `Book: ${quizAnswer.book}`;
    document.getElementById('quizAuthor').value = '';
    document.getElementById('quizAuthorbtn').checked = false;
}

async function resetQuiz() {
    document.getElementById('quizAuthor').value = '';
    document.getElementById('quizAuthorbtn').checked = false;
}


function submitQuiz() {
    const testamentGuess = document.getElementById('quizAuthorbtn').checked ? 'NT' : 'OT';
    const author = document.getElementById('quizAuthor').value.trim().toLowerCase().split("/").map(s => s.trim());
    const correct = testamentGuess === quizAnswer.testament && author.some(a => a.trim() === quizAnswer.author.toLowerCase());

    if (correct === true) {
        document.getElementById('quizResult').textContent = 'Correct!';
        resetQuiz();
        setTimeout(loadQuiz, 1000);
        return;
    }

    quizMisses++;
    if (quizMisses >= 2) {
        document.getElementById('quizResult').textContent = `Answer: ${quizAnswer.testament} / ${quizAnswer.author}`;
        resetQuiz();
        setTimeout(loadQuiz, 100);
    } else {
        document.getElementById('quizResult').textContent = 'Try again.';
    }
}

document.getElementById('quizSubmitBtn').addEventListener('click', submitQuiz);

document.getElementById('quizAuthor').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitQuiz(); });

document.getElementById('quizAuthorbtn').addEventListener('keydown', (e) => {if (e.key === 'Enter') submitQuiz();});

loadQuiz();

// Search / Get a passage tabs
const tabs = [
    { btn: document.getElementById('tabSearchBtn'), panel: document.getElementById('tabPanelSearch') },
    { btn: document.getElementById('tabGetBtn'), panel: document.getElementById('tabPanelGet') },
];

function activateTab(target) {
    tabs.forEach(({ btn, panel }) => {
        const active = btn === target;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
        panel.hidden = !active;
    });
}

tabs.forEach(({ btn }) => btn.addEventListener('click', () => activateTab(btn)));
