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

document.getElementById('genres').addEventListener('change', () => {
    currentPage = 1;
    searchMovies();
});

document.getElementById('scrollToTop').addEventListener('click', scrollToTop);

const butterflyToggle = document.getElementById('butterfly-toggle');
let includeAdult = false;

butterflyToggle.addEventListener('click', () => {
    butterflyToggle.classList.toggle('active');
    includeAdult = !includeAdult;
    currentPage = 1;
    searchMovies();
});

async function searchMovies() {
    if (isLoading) return;
    isLoading = true;

    const query = document.getElementById('searchBox').value.trim();
    const type = document.getElementById('typeFilter').value;
    const year = document.getElementById('yearFilter').value;
    const genres = Array.from(document.querySelectorAll('#genres input:checked')).map(el => el.value);

    let url = '';
    if (query) {
        url = https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${currentPage}&include_adult=${includeAdult};
    } else {
        if (type === 'all') {
            url = https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${currentPage}&language=en-US&include_adult=${includeAdult};
            if (year && year !== 'all') {
                url += &primary_release_year=${year};
            }
            if (genres.length) {
                url += &with_genres=${genres.join(',')};
            }
        } else {
            url = https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&page=${currentPage}&language=en-US&include_adult=${includeAdult};
            if (year && year !== 'all') {
                if (type === 'movie') {
                    url += &primary_release_year=${year};
                } else if (type === 'tv') {
                    url += &first_air_date_year=${year};
                }
            }
            if (genres.length) {
                url += &with_genres=${genres.join(',')};
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
        item.innerHTML = 
            <img src="${result.poster_path ? 'https://image.tmdb.org/t/p/w500' + result.poster_path : imagePlaceholder}" alt="${result.title || result.name}">
            <div class="result-title">${result.title || result.name}</div>
        ;
        item.addEventListener('click', () => openModal(result));
        resultsContainer.appendChild(item);
    });

    // Show "Scroll to Top" button if not at the top
    window.addEventListener('scroll', () => {
        document.getElementById('scrollToTop').style.display = window.scrollY > 200 ? 'block' : 'none';
    });
}

async function openModal(result) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modal.style.display = 'block';

    const type = result.media_type || (result.title ? 'movie' : 'tv');
    let content = '';

    // Fetch additional sources based on the result ID
    const additionalSources = getAdditionalSources(result.id, type);

    if (type === 'movie') {
        content = 
            <iframe allowfullscreen='true' src="https://vidsrc.pro/embed/movie/${result.id}" frameborder="0" width="100%" height="315"></iframe>
            <div class="sources">
                <button onclick="changeSource('https://vidsrc.pro/embed/movie/${result.id}')">Source 1</button>
                <button onclick="changeSource('https://vidsrc.me/embed/movie?tmdb=${result.id}')">Source 2</button>
                ${additionalSources}
            </div>
            <div class="details">
                <img src="${result.poster_path ? 'https://image.tmdb.org/t/p/w500' + result.poster_path : imagePlaceholder}" alt="${result.title || result.name}">
                <div class="info">
                    <h2>${result.title || result.name}</h2>
                    <p><strong>Original Title:</strong> ${result.original_title || result.original_name}</p>
                    <p><strong>Type:</strong> Movie</p>
                    <p><strong>Rating:</strong> ${result.vote_average}</p>
                    <p><strong>Genre:</strong> ${await fetchGenres(result.genre_ids)}</p>
                    <p><strong>Synopsis:</strong> ${result.overview}</p>
                </div>
            </div>
        ;
    } else if (type === 'tv') {
        content = 
            <iframe allowfullscreen='true' src="https://vidsrc.pro/embed/tv/${result.id}/1/1" frameborder="0" width="100%" height="315"></iframe>
            <div class="season-episode">
                <div>
                    <label for="season1">Source 1:</label>
                    <select id="season1" class="dropdown">
                        <!-- Seasons will be populated here -->
                    </select>
                    <select id="episode1" class="dropdown">
                        <!-- Episodes will be populated here -->
                    </select>
                    <button onclick="playEpisode('https://vidsrc.pro/embed/tv/${result.id}/' + document.getElementById('season1').value + '/' + document.getElementById('episode1').value)">Play</button>
                </div>
                <div>
                    <label for="season2">Source 2:</label>
                    <select id="season2" class="dropdown">
                        <!-- Seasons will be populated here -->
                    </select>
                    <select id="episode2" class="dropdown">
                        <!-- Episodes will be populated here -->
                    </select>
                    <button onclick="playEpisode('https://vidsrc.me/embed/tv?tmdb=${result.id}&season=' + document.getElementById('season2').value + '&episode=' + document.getElementById('episode2').value)">Play</button>
                </div>
                ${additionalSources}
            </div>
            <div class="details">
                <img src="${result.poster_path ? 'https://image.tmdb.org/t/p/w500' + result.poster_path : imagePlaceholder}" alt="${result.title || result.name}">
                <div class="info">
                    <h2>${result.title || result.name}</h2>
                    <p><strong>Original Title:</strong> ${result.original_title || result.original_name}</p>
                    <p><strong>Type:</strong> Series</p>
                    <p><strong>Rating:</strong> ${result.vote_average}</p>
                    <p><strong>Genre:</strong> ${await fetchGenres(result.genre_ids)}</p>
                    <p><strong>Synopsis:</strong> ${result.overview}</p>
                </div>
            </div>
        ;
    }

    modalBody.innerHTML = content;

    // Populate season and episode dropdowns for series
    if (type === 'tv') {
        await populateSeasons(result.id, 'season1');
        await populateSeasons(result.id, 'season2');
    }
}

function getAdditionalSources(id, type) {
    const dataContainer = document.querySelector('#movie-data');
    const sources = Array.from(dataContainer.querySelectorAll(.tmdb${type === 'movie' ? 'movie' : 'series'}[data-tmdb-id='${id}'] .tmdbm));

    return sources.map(source => {
        const embedLink = source.getAttribute('data-embed-link');
        const videoId = source.getAttribute('data-videoid');
        const sourceName = source.getAttribute('data-source');
        const urlMap = {
            'streamtape': //streamtape.to/e/${videoId},
            'streamwish': //streamwish.to/e/${videoId},
            'mp4upload': //mp4upload.com/v/${videoId},
            'other1': //other1.com/e/${videoId},
            'other2': //other2.com/e/${videoId},
            // Add other sources here if needed
        };
        const url = urlMap[embedLink];
        return <button onclick="changeSource('${url}')">${sourceName}</button>;
    }).join('');
}



function getEmbedUrl(embedLink, videoId) {
    const baseUrls = {
        'streamtape': 'https://streamtape.to/e/',
        'streamwish': 'https://streamwish.to/e/',
        'mp4upload': 'https://mp4upload.com/v/',
        'otherone': 'https://other1.com/e/',
        'othertwo': 'https://other2.com/e/',
        'otherthree': 'https://other3.com/e/',
        'otherfour': 'https://other4.com/e/',
        'otherfive': 'https://other5.com/e/',
        'othersix': 'https://other6.com/e/'
    };
    return baseUrls[embedLink] + videoId;
}



function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.querySelector('#modal-body iframe').src = ''; // Stop video playback
}

function changeSource(url) {
    document.querySelector('#modal-body iframe').src = url;
}

function playEpisode(url) {
    document.querySelector('#modal-body iframe').src = url;
}

async function fetchGenres(genreIds) {
    const response = await fetch(https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey});
    const data = await response.json();
    const genres = data.genres;
    return genres.filter(genre => genreIds.includes(genre.id)).map(genre => genre.name).join(', ');
}

async function populateSeasons(tvId, selectId) {
    try {
        const response = await fetch(https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey});
        const data = await response.json();
        const seasons = data.seasons;
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Season</option>';
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = Season ${season.season_number};
            select.appendChild(option);
        });
        select.addEventListener('change', () => populateEpisodes(tvId, selectId));
    } catch (error) {
        console.error('Error fetching seasons:', error);
    }
}

async function populateEpisodes(tvId, selectId) {
    const seasonNumber = document.getElementById(selectId).value;
    if (!seasonNumber) return;
    try {
        const response = await fetch(https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey});
        const data = await response.json();
        const episodes = data.episodes;
        const select = document.getElementById(selectId === 'season1' ? 'episode1' : 'episode2');
        select.innerHTML = '<option value="">Select Episode</option>';
        episodes.forEach(episode => {
            const option = document.createElement('option');
            option.value = episode.episode_number;
            option.textContent = Episode ${episode.episode_number}: ${episode.name};
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching episodes:', error);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadYears() {
    const currentYear = new Date().getFullYear();
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '<option value="all">All Years</option>'; // Ensure "All Years" is added first
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

async function loadGenres() {
    try {
        const response = await fetch(https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey});
        const data = await response.json();
        const genres = data.genres;
        const genresContainer = document.getElementById('genres');
        genresContainer.innerHTML = '';
        genres.forEach(genre => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = genre-${genre.id};
            checkbox.value = genre.id;
            checkbox.addEventListener('change', () => {
                currentPage = 1;
                searchMovies();
            });

            const label = document.createElement('label');
            label.htmlFor = genre-${genre.id};
            label.textContent = genre.name;

            genresContainer.appendChild(checkbox);
            genresContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

loadGenres();
loadYears();

// Existing code

// Add this at the end of your script or in a suitable place
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && currentPage <= totalPages) {
        searchMovies();
    }
});
