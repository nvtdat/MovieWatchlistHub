export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        //Clear the previos timeout if the function is called again before the delay has passed
        if(timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}