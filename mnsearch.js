async function searchMovies() {
    if (isLoading) return;
    isLoading = true;

    const query = document.getElementById('searchBox').value.trim();
    const type = document.getElementById('typeFilter').value;
    const year = document.getElementById('yearFilter').value;
    const genres = Array.from(document.querySelectorAll('#genres input:checked')).map(el => el.value);

    let url = '';
    if (query) {
        url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${currentPage}&include_adult=${includeAdult}`;
    } else {
        if (type === 'all') {
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${currentPage}&language=en-US&include_adult=${includeAdult}`;
            if (year && year !== 'all') {
                url += `&primary_release_year=${year}`;
            }
            if (genres.length) {
                url += `&with_genres=${genres.join(',')}`;
            }
        } else {
            url = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&page=${currentPage}&language=en-US&include_adult=${includeAdult}`;
            if (year && year !== 'all') {
                if (type === 'movie') {
                    url += `&primary_release_year=${year}`;
                } else if (type === 'tv') {
                    url += `&first_air_date_year=${year}`;
                }
            }
            if (genres.length) {
                url += `&with_genres=${genres.join(',')}`;
            }
        }
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        totalPages = data.total_pages;

        if (currentPage === 1) {
            document.getElementById('results').innerHTML = '';
        }

        let filteredResults = data.results;

        // Apply additional filters for search results
        if (query) {
            if (type && type !== 'all') {
                filteredResults = filteredResults.filter(result => result.media_type === type);
            }

            if (year && year !== 'all') {
                filteredResults = filteredResults.filter(result => (result.release_date || result.first_air_date || "").startsWith(year));
            }

            if (genres.length) {
                filteredResults = filteredResults.filter(result => {
                    const resultGenreIds = result.genre_ids || [];
                    return genres.every(genreId => resultGenreIds.includes(parseInt(genreId)));
                });
            }
        }

        displayResults(filteredResults);
        currentPage++;
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        isLoading = false;
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    results.forEach(result => {
        const item = document.createElement('div');
        item.classList.add('result-item');
        item.innerHTML = `
            <img src="${result.poster_path ? 'https://image.tmdb.org/t/p/w500' + result.poster_path : imagePlaceholder}" alt="${result.title || result.name}">
            <div class="result-title">${result.title || result.name}</div>
        `;
        item.addEventListener('click', () => openModal(result));
        resultsContainer.appendChild(item);
    });

    // Show "Scroll to Top" button if not at the top
    window.addEventListener('scroll', () => {
        document.getElementById('scrollToTop').style.display = window.scrollY > 200 ? 'block' : 'none';
    });
}

async function fetchGenres(genreIds) {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    const genres = data.genres.filter(genre => genreIds.includes(genre.id)).map(genre => genre.name);
    return genres.join(', ');
}

async function populateSeasons(tvId) {
    // Function to populate season dropdowns
}

function playEpisode(url) {
    window.open(url, '_blank');
}

function changeSource(url) {
    document.querySelector('iframe').src = url;
}
