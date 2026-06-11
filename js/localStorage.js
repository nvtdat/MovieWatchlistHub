const WATCHLIST_KEY = 'watchlist';

//Hàm thêm phim
export function getWatchList() {
    const watchlist = localStorage.getItem(WATCHLIST_KEY);
    return watchlist ? JSON.parse(watchlist) : [];
}

/**
 * 2. Thêm một bộ phim mới vào Watchlist
 * @param {Object} movie - Đối tượng phim cần lưu (lấy từ API TMDB)
 * @returns {boolean} True nếu thêm thành công, False nếu phim đã tồn tại
 */
//Hàm thêm phim vào danh sách
export function addToWatchList(movie) {
    const watchlist = getWatchList();
    //Kiểm tra nếu phim đã tồn tại trong danh sách
    const isExist = watchlist.some(item => item.id === movie.id);
    if (!isExist) {
        watchlist.push(movie);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        return true; //Thêm thành công
    }
    return false; //Phim đã tồn tại trong danh sách
}

//Hàm xóa phim khỏi danh sách
export function removeFromWatchList(movieId) {
    const watchlist = getWatchList();
    //Lọc bỏ và chỉ giữ lại các phim có id khác với movieId cần xóa
    const updatedWatchlist = watchlist.filter(item => item.id !== movieId);
    //Lưu lại danh sách đã được cập nhật vào localStorage
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
}