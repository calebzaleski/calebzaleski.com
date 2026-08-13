URL = "https://proxy.calebzaleski.com"

async function searchBible(query) {
    // Backend URL for searching the bible; the proxy attaches BIBLE_API_KEY server-side
    const url = `${URL}/bible/search?string=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        console.log('searchBible response:', data);
        return data;
    } catch (err) {
        console.error('Error searching bible:', err);
    }
}

document.getElementById('bibleSearchBtn').addEventListener('click', async () => {
    const query = document.getElementById('bibleQuery').value;
    const data = await searchBible(query);
    document.getElementById("searchResults").textContent = JSON.stringify(data);
});