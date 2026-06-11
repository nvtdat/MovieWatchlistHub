const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NDM5Y2M2N2QzMjEyMmFmNzRjZjFlMzQ2MmZmOGI1YSIsIm5iZiI6MTc4MDE0Mzk1MC4xOTM5OTk4LCJzdWIiOiI2YTFhZDc0ZWNmZWRmMmM1M2M5NzM1NWIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ciFURILaFKwpker0qZR9RBba9ye5ZhrE6P8sMfMmgDQ'; // Insert your TMDB API token here
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
//Cấu hình các tùy chọn cho yêu cầu API, bao gồm phương thức và tiêu đề với token xác thực
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_TOKEN}`
    }
};

//Hàm tìm kiếm phim dựa trên truy vấn người dùng
export async function searchMovies(query) {
    if(!query || query.trim() === '') {
        return [];
    }
    try {
        const response = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`, options);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results;
    }

    catch(error) {
        console.error('Error searching movies: ', error);
        return [];
    }
}
export async function getPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?language=en-US&page=1`, options);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results;

    }

    catch(error) {
        console.error('Error fetching popular movies: ', error);
        return [];
    }
}
