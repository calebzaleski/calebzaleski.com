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

document.getElementById('bibleDefSearchBtn').addEventListener('click', async () => {
    const query = document.getElementById('bibleDefQuery').value;
    const data = await searchDef(query);
    document.getElementById("searchResults").textContent = JSON.stringify(data);
});

document.getElementById('bibleContentSearchBtn').addEventListener('click', async () => {
    const query = document.getElementById('bibleContentQuery').value;
    const type = document.getElementById('bibleContentSearchType').checked ? 'strict' : 'loose';
    const data = await searchContext(query, type);
    document.getElementById("searchResults").textContent = JSON.stringify(data);
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
}


function submitQuiz() {
    const testament = document.getElementById('quizTestament').value.trim().toUpperCase();
    let author = document.getElementById('quizAuthor').value.trim().toLowerCase();
    const correct = testament === quizAnswer.testament && author === quizAnswer.author.toLowerCase();

    if (correct === true) {
        document.getElementById('quizResult').textContent = 'Correct!';
        document.getElementById('quizAuthor').value = ''
        document.getElementById('quizTestament').value = ''
        setTimeout(loadQuiz, 1000);
        document.getElementById('quizResult').value = ''

        return;
    }

    quizMisses++;
    if (quizMisses >= 2) {
        document.getElementById('quizResult').textContent = `Answer: ${quizAnswer.testament} / ${quizAnswer.author}`;
        document.getElementById('quizAuthor').value = ''
        document.getElementById('quizTestament').value = ''
        setTimeout(loadQuiz, 1000);
        document.getElementById('quizResult').value = ''


    } else {
        document.getElementById('quizResult').textContent = 'Try again.';
    }
}

document.getElementById('quizSubmitBtn').addEventListener('click', submitQuiz);

document.getElementById('quizTestament').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitQuiz();});

document.getElementById('quizAuthor').addEventListener('keydown', (e) => {if (e.key === 'Enter') submitQuiz();});

loadQuiz();
