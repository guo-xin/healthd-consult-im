module.exports = (function () {
    if (typeof console !== 'undefined' && console.log) {
        return function () {
            console.log.apply(window.console, arguments);
        };
    } else {
        return function () {
        };
    }
}());