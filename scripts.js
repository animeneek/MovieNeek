const apiKey = 'e3afd4c89e3351edad9e875ff7a01f0c';
const imagePlaceholder = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0XyKGX9nAiX03Elxmng_nAjDqAP2dkTOmss79ZfTUyJiZtEBheTPEKepCBBFTMLUQrdmhFaqOw6381J61SBV1GrBov1vtaZmJay5mZ_QNbs5BAePbR86cH5Gtvs2qxe8d55_5Ft0vNapAR5q9dpf8jSTpQv8IQV-sK7Xn1vDQ9RKSiSjrKH_pnq7NsnY/s4608/Black%20and%20White%20Modern%20Coming%20soon%20Poster.png';

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

document.getElementById('searchBox').addEventListener('input', () => {
    currentPage = 1;
    searchMovies();
});

document.getElementById('typeFilter').addEventListener('change', () => {
    currentPage = 1;
    searchMovies();
});

document.getElementById('yearFilter').addEventListener('change', () => {
    currentPage = 1;
    searchMovies();
});

document.getElementById('genreFilter').addEventListener('change', () => {
    currentPage = 1;
    searchMovies();
});

window.addEventListener('scroll', () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight && !isLoading && currentPage < totalPages) {
        currentPage++;
        searchMovies();
    }
});

function searchMovies() {
    isLoading = true;
    const query = document.getElementById('searchBox').value;
    const type = document.getElementById('typeFilter').value;
    const year = document.getElementById('yearFilter').value;
    const genres = Array.from(document.querySelectorAll('#genreFilter input:checked')).map(cb => cb.value).join(',');
    
    const url = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${currentPage}&with_genres=${genres}&year=${year}&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            totalPages = data.total_pages;
            renderResults(data.results);
            isLoading = false;
        })
        .catch(error => {
            console.error('Error:', error);
            isLoading = false;
        });
}

function renderResults(results) {
    const container = document.getElementById('results');
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <img src="${result.poster_path ? 'https://image.tmdb.org/t/p/w500' + result.poster_path : imagePlaceholder}" alt="${result.title || result.name}">
            <h3>${result.title || result.name}</h3>
            <button onclick="openModal(${JSON.stringify(result)})">View Details</button>
        `;
        container.appendChild(div);
    });
}
