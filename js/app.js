import {getPopularMovies, searchMovies} from './tmdb.js';
import {debounce} from './debounce.js';
import {getWatchList, addToWatchList, removeFromWatchList} from './localStorage.js';

const moviegrid = document.getElementById('movie-grid');
const statusContainer = document.getElementById('status-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const watchlistgrid = document.getElementById('watchlist-container');


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
                        <img src="assets/ribbon.png" alt="Add to Watchlist" class = "ribbon-icon">
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
    const watchlist = getWatchList();
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

    if (moviegrid) {
        moviegrid.addEventListener('click', (event) => {
            const target = event.target.closest('.btn-watchlist');
            if (!target) return;

            const movieId = target.id.replace('watchlist-btn-', '');
            const selectedMovie = movies.find(m => m.id.toString() === movieId);
        
            if(selectedMovie) {
                const isAdded = addToWatchList(selectedMovie);
                if(isAdded) {
                    target.querySelector('.ribbon-icon').src = 'assets/ribbon-filled.png';
                    alert('Movie added to your watchlist!');
                }
                else {
                    alert('This movie is already in your watchlist!');
                }
            }
        });
    }
    //Render watchlist khi người dùng truy cập trang watchlist
    renderWatchlist();
}
document.addEventListener('DOMContentLoaded', initApp);