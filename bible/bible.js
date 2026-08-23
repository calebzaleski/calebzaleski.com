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
    const url = `${URL}/bible/search_content_${type}?string=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        console.log('searchBible response:', data);
        return data;
    } catch (err) {
        console.error('Error searching bible:', err);
    }
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
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('verseDetail').innerHTML = '';
    document.getElementById('verseDetail').classList.remove('open');
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

async function runDefSearch() {
    const query = document.getElementById('bibleDefQuery').value.trim();
    if (!query) return;
    clearResults();
    const data = await searchDef(query);
    renderResultsList(data ? data.results : []);
}

async function runContentSearch() {
    const query = document.getElementById('bibleContentQuery').value.trim();
    if (!query) return;
    const type = document.getElementById('bibleContentSearchType').checked ? 'strict' : 'loose';
    clearResults();
    const data = await searchContext(query, type);
    renderResultsList(data ? data.results : []);
}

document.getElementById('bibleDefSearchBtn').addEventListener('click', runDefSearch);
document.getElementById('bibleDefQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') runDefSearch(); });

document.getElementById('bibleContentSearchBtn').addEventListener('click', runContentSearch);
document.getElementById('bibleContentQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') runContentSearch(); });

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


function submitQuiz() {
    const testamentGuess = document.getElementById('quizAuthorbtn').checked ? 'NT' : 'OT';
    const author = document.getElementById('quizAuthor').value.trim().toLowerCase();
    const correct = testamentGuess === quizAnswer.testament && author === quizAnswer.author.toLowerCase();

    if (correct === true) {
        document.getElementById('quizResult').textContent = 'Correct!';
        setTimeout(loadQuiz, 1000);
        return;
    }

    quizMisses++;
    if (quizMisses >= 2) {
        document.getElementById('quizResult').textContent = `Answer: ${quizAnswer.testament} / ${quizAnswer.author}`;
        setTimeout(loadQuiz, 1000);
    } else {
        document.getElementById('quizResult').textContent = 'Try again.';
    }
}

document.getElementById('quizSubmitBtn').addEventListener('click', submitQuiz);

document.getElementById('quizAuthor').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitQuiz(); });

document.getElementById('quizAuthorbtn').addEventListener('keydown', (e) => {if (e.key === 'Enter') submitQuiz();});

loadQuiz();
