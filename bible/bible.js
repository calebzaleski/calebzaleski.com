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

async function searchContext(query) {
const url = `${URL}/bible/search_content?string=${encodeURIComponent(query)}`;

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
    const data = await searchContext(query);
    document.getElementById("searchResults").textContent = JSON.stringify(data);
});