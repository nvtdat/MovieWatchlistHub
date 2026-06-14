import {getPopularMovies, searchMovies, getMovieDetails} from './tmdb.js';
import {debounce} from './debounce.js';
import {getWatchList, addToWatchList, removeFromWatchList, getListOfWatchLists, 
    getWatchListById, createNewWatchList} from './localStorage.js';

const moviegrid = document.getElementById('movie-grid');
const statusContainer = document.getElementById('status-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const watchlistgrid = document.getElementById('watchlist-container');
const createWatchlistForm = document.getElementById('create-watchlist-form');
const nameInput = document.getElementById('watchlist-name');
const descriptionInput = document.getElementById('watchlist-desc');
const createdWatchlistContainer = document.getElementById('created-watchlist');
const movieDetailsContainer = document.getElementById('movie-details-container');

let currentMovieDetails = null;

function getMovieIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('movieId');
}

//Hàm render chi tiết phim khi người dùng truy cập trang moviedetails.html với query parameter movieId
async function renderMovieDetails(movieId) {
    if(!movieDetailsContainer) return;

    movieDetailsContainer.innerHTML = '<p class = "loading-msg">Loading movie details...</p>';

    const movie = await getMovieDetails(movieId);

    if (!movie) {
        movieDetailsContainer.innerHTML = '<p class = "error-msg">Unable to load movie details.</p>';
        return;
    }

    currentMovieDetails = movie;

    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'placeholder.jpg';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
    const rating = movie.vote_average ? `${movie.vote_average}/10` : 'N/A';
    const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A';
    const detailsHTML = `
        <div class = "movie-details-card">
            <img src="${posterPath}" alt="${movie.title} poster" class = "movie-details-poster">    
            <div class = "movie-details-info">
                <h2 class = "movie-details-title">${movie.title}</h2>
                <span class = "movie-details-release">Release: ${releaseDate}</span>
                <span class = "movie-details-rating">Rating: ${rating}</span>   
                <span class = "movie-details-genres">Genres: ${genres}</span>
                <p class = "movie-details-overview">${movie.overview}</p>
            </div>
        </div>
        <div class = "movie-details-add-watchlist">
            <button id = "add-watchlist-btn" class = "add-watchlist-btn">Add to Watchlist</button>
        </div>
        <div id="watchlist-modal" class="modal-overlay">
    
            <div class="modal-content">
                <button id="close-btn" class="modal-close-btn">&times;</button>
                
                <h2>Select a Watchlist</h2>
                <p>Choose where you want to save <strong>${movie.title}</strong>.</p>
                <div class="watchlist-options">
                    ${renderWatchlistOptions()}
                </div>
            </div>
        </div>
    `;
    movieDetailsContainer.innerHTML = detailsHTML;
}

function renderWatchlistOptions() {
    const watchlists = getListOfWatchLists();

    if (watchlists.length === 0) {
        createNewWatchList('My Watchlist', 'Default watchlist for movies');
    }

    const availableWatchlists = getListOfWatchLists();

    return availableWatchlists.map(list => `
        <button type="button" class="watchlist-select-btn" data-list-id="${list.id}">
            ${list.name}
        </button>
    `).join('');
}

function openWatchlistModal() {
    const watchlistModal = document.getElementById('watchlist-modal');
    if (watchlistModal) {
        watchlistModal.style.display = 'flex';
    }
}

function closeWatchlistModal() {
    const watchlistModal = document.getElementById('watchlist-modal');
    if (watchlistModal) {
        watchlistModal.style.display = 'none';
    }
}

function handleMovieDetailsClick(event) {
    if (!movieDetailsContainer) return;

    if (event.target.id === 'watchlist-modal') {
        closeWatchlistModal();
        return;
    }

    const openButton = event.target.closest('#add-watchlist-btn');
    if (openButton) {
        openWatchlistModal();
        return;
    }

    const closeButton = event.target.closest('#close-btn');
    if (closeButton) {
        closeWatchlistModal();
        return;
    }

    const watchlistButton = event.target.closest('.watchlist-select-btn');
    if (watchlistButton && currentMovieDetails) {
        const listId = watchlistButton.dataset.listId;
        const selectedWatchlist = getWatchListById(listId);
        const isAdded = addToWatchList(currentMovieDetails, listId);

        if (isAdded) {
            alert(`Movie added to ${selectedWatchlist ? selectedWatchlist.name : 'your watchlist'}!`);
            closeWatchlistModal();
        } else {
            alert('This movie is already in your watchlist!');
        }
    }
}

//Lấy listId từ URL query parameter
function getListIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('listId');
}

//Lấy hoặc tạo watchlist mặc định
function getOrCreateDefaultWatchList() {
    let watchlists = getListOfWatchLists();
    if (watchlists.length === 0) {
        createNewWatchList('My Watchlist', 'Default watchlist for movies');
        watchlists = getListOfWatchLists();
    }
    return watchlists[0].id; // Trả về ID của watchlist đầu tiên
}
//Hàm render danh sách watchlist đã tạo
function renderCreatedWatchlist(watchlist) {
    if(!createdWatchlistContainer) return;
    
    createdWatchlistContainer.innerHTML = '';

    if(watchlist.length === 0) {
        createdWatchlistContainer.innerHTML = '<p class = "error-msg">No watchlists created yet.</p>';
        return;
    }   
    watchlist.forEach(list => {
        const watchlistCard = `
            <div class = "created-watchlist-card">
                <a href = "watchlist.html?listId=${list.id}" class = "watchlist-link">
                    <h3 class = "watchlist-name">${list.name}</h3>
                </a>
            </div>
        `;
        createdWatchlistContainer.innerHTML += watchlistCard;
    }); 
}
//Hàm xử lý sự kiện khi người dùng tạo watchlist mới
function handleCreateWatchList(event) {
    if(event) {
        event.preventDefault();
    }

    if(!nameInput || !descriptionInput) return;

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if(name === '') {
        alert('Please enter a name for your watchlist.');
        return;
    }

    createNewWatchList(name, description);
    alert('New watchlist created successfully!');
    nameInput.value = '';
    descriptionInput.value = '';

    renderCreatedWatchlist(getListOfWatchLists());

}
async function handleSearchButton(){
    if(!searchInput) return;

    const query = searchInput.value.trim();

    if(query === '') {
        const popularMovies = await getPopularMovies();
        renderMovies(popularMovies);
        return;
    }
    //Hiện trạng thái tìm kiếm khi người dùng nhập truy vấn
    if(statusContainer) {
        statusContainer.innerHTML = '<p class = "loading-msg">Searching movies...</p>';
    }

    const movies = await searchMovies(query);

    //Xóa thông báo tìm kiếm sau khi lấy danh sách phim
    if(statusContainer) {
        statusContainer.innerHTML = '';
    }
    //Render danh sách phim dựa trên kết quả tìm kiếm
    renderMovies(movies);
}

function renderMovies(movies) {
    if(!moviegrid) return;
    //Xóa nội dung hiện tại của lưới phim trước khi hiển thị phim mới
    moviegrid.innerHTML = '';

    if(!movies || movies.length === 0) {
        moviegrid.innerHTML = '<p class = "error-msg">No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'placeholder.jpg';
        const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
        //Rating
        const rating = movie.vote_average ? `${movie.vote_average}/10` : 'N/A';
        const movieCard = `
            <div class = "movie-card">
                <div class = "btn-watchlist" id = "watchlist-btn-${movie.id}">
                    <a href = "moviedetails.html?movieId=${movie.id}" class = "movie-detail-link">
                        <img src="assets/ribbon.png" alt="Add to Watchlist" class = "ribbon-icon">
                    </a>
                </div>
                <img src="${posterPath}" alt="${movie.title} poster" class = "movie-poster">
                <div class = "movie-info">
                    <h3 class = "movie-title">${movie.title}</h3>
                    <span class = "release-date">Release: ${releaseDate}</span>
                    <span class = "rating">Rating: ${rating}</span>
                </div>
            </div>
        `;
        moviegrid.innerHTML += movieCard;
    });
}

function renderWatchlist() {
    const listId = getListIdFromURL();
    let watchlist = [];
    
    if (listId) {
        // Nếu có listId từ URL, lấy phim của watchlist cụ thể
        watchlist = getWatchList(listId);
    } else {
        // Nếu ở index.html hoặc trang khác, lấy watchlist mặc định
        const defaultId = getOrCreateDefaultWatchList();
        watchlist = getWatchList(defaultId);
    }
    
    if(!watchlistgrid) return;
    watchlistgrid.innerHTML = '';

    if(watchlist.length === 0) {
        watchlistgrid.innerHTML = '<p class = "error-msg">Your watchlist is empty. <br> Start adding some movies!</p>';
        return;
    }

    watchlist.forEach(movie => {
        const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'placeholder.jpg';
        const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
        //Rating
        const rating = movie.vote_average ? `${movie.vote_average}/10` : 'N/A';
        const movieCard = `
            <div class = "movie-card">
                <div class = "btn-watchlist" id = "watchlist-btn-${movie.id}">
                    <img src="assets/ribbon.png" alt="Add to Watchlist" class = "ribbon-icon">
                </div>
                <img src="${posterPath}" alt="${movie.title} poster" class = "movie-poster">
                <div class = "movie-info">
                    <h3 class = "movie-title">${movie.title}</h3>
                    <span class = "release-date">Release: ${releaseDate}</span>
                    <span class = "rating">Rating: ${rating}</span>
                </div>
                <div class = "remove-btn" id = "remove-btn-${movie.id}"> 
                    <img src = "assets/Trash.png" alt = "remove from watchlist" class = "trash-icon">
                </div>
            </div>
        `;
        watchlistgrid.innerHTML += movieCard;
    });
}
async function initApp() {
    
    if(statusContainer) {
        statusContainer.innerHTML = '<p class = "loading-msg">Loading popular movies...</p>';
    }

    //Get popular movies from TMDB API
    const movies = await getPopularMovies();
    //Lưu trữ danh sách phim hiện tại để sử dụng khi thêm vào watchlist
    //Clear loading message
    if(statusContainer) {
        statusContainer.innerHTML = '';
    }

    renderMovies(movies);

    if(searchButton) {
        searchButton.addEventListener('click', handleSearchButton);
    }

    if(createWatchlistForm) {
        createWatchlistForm.addEventListener('submit', handleCreateWatchList);
    }

    //Render danh sách watchlist đã tạo
    const watchlist = getListOfWatchLists();
    renderCreatedWatchlist(watchlist);

    if (moviegrid) {
        moviegrid.addEventListener('click', (event) => {
            const target = event.target.closest('.btn-watchlist');
            if (!target) return;
        });
    }

    const movieId = getMovieIdFromURL();
    if (movieDetailsContainer && movieId) {
        await renderMovieDetails(movieId);
    }

    if (movieDetailsContainer) {
        movieDetailsContainer.addEventListener('click', handleMovieDetailsClick);
    }

    //Render watchlist khi người dùng truy cập trang watchlist
    renderWatchlist();

    if(watchlistgrid) {
        watchlistgrid.addEventListener('click', (event) => {
            const target = event.target.closest('.remove-btn');
            if (!target) return;

            const movieId = target.id.replace('remove-btn-', '');
            const confirmDelete = confirm('Are you sure you want to remove this movie from your watchlist?');
            if(confirmDelete) {
                const listId = getListIdFromURL() || getOrCreateDefaultWatchList();
                removeFromWatchList(parseInt(movieId), listId);
                renderWatchlist();
                alert('Movie removed from your watchlist!');
            }
        });
    }

    

}
document.addEventListener('DOMContentLoaded', initApp);