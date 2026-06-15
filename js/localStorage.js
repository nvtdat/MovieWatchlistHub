const WATCHLISTS_KEY = 'watchlists';
const DEFAULT_WATCHLIST_NAME = 'My Watchlist';

//Hàm lấy danh sách tất cả watchlist từ localStorage
export function getListOfWatchLists() {
    const watchlists = localStorage.getItem(WATCHLISTS_KEY);
    return watchlists ? JSON.parse(watchlists) : [];
}

//Hàm lấy một watchlist cụ thể theo id
export function getWatchListById(listId) {
    const watchlists = getListOfWatchLists();
    return watchlists.find(list => list.id === parseInt(listId));
}

//Hàm tạo mới một watchlist và lưu vào localStorage
export function createNewWatchList(name, description) {
    const newWatchList = {
        id: Date.now(), //Sử dụng timestamp làm ID duy nhất
        name: name,
        description: description,
        movies: [] //Mảng để lưu trữ các phim trong watchlist
    }
    const watchlists = getListOfWatchLists();
    watchlists.push(newWatchList);
    localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlists));
}

//Hàm lấy danh sách phim của một watchlist
export function getWatchList(listId) {
    const watchlist = getWatchListById(listId);
    return watchlist ? watchlist.movies : [];
}

/**
 * Thêm một bộ phim mới vào Watchlist cụ thể
 * @param {Object} movie - Đối tượng phim cần lưu (lấy từ API TMDB)
 * @param {number} listId - ID của watchlist
 * @returns {boolean} True nếu thêm thành công, False nếu phim đã tồn tại
 */
export function addToWatchList(movie, listId) {
    const watchlists = getListOfWatchLists();
    const watchlist = watchlists.find(list => list.id === parseInt(listId));
    
    if (!watchlist) return false;
    
    //Kiểm tra nếu phim đã tồn tại trong danh sách
    const isExist = watchlist.movies.some(item => item.id === movie.id);
    if (!isExist) {
        watchlist.movies.push(movie);
        localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlists));
        return true; //Thêm thành công
    }
    return false; //Phim đã tồn tại trong danh sách
}

//Hàm xóa phim khỏi một watchlist cụ thể
export function removeFromWatchList(movieId, listId) {
    const watchlists = getListOfWatchLists();
    const watchlist = watchlists.find(list => list.id === parseInt(listId));
    
    if (!watchlist) return;
    
    //Lọc bỏ và chỉ giữ lại các phim có id khác với movieId cần xóa
    watchlist.movies = watchlist.movies.filter(item => item.id !== movieId);
    //Lưu lại danh sách đã được cập nhật vào localStorage
    localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlists));
}

//Hàm xóa một watchlist theo id
export function deleteWatchList(listId) {
    const watchlists = getListOfWatchLists();
    //Lọc bỏ watchlist có id cần xóa
    const updatedWatchlists = watchlists.filter(list => list.id !== parseInt(listId));
    //Lưu lại mảng đã lọc vào localStorage
    localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(updatedWatchlists));
}