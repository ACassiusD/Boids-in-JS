// util.js
class Util {
    getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'); // Ensure 6 digits
    }
}

export default Util;
