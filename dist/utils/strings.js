"use strict";
String.prototype.ellipsis = function (max) {
    const str = this;
    if (str.length > max)
        return `${str.substring(0, max - 1)}…`;
    return str;
};
String.prototype.removeCustomEmojis = function () {
    const str = this;
    return str.replace(/<:[a-zA-Z0-9_]{2,32}:[0-9]{17,19}>/g, '');
};
String.prototype.replaceSpaces = function (by) {
    const str = this;
    return str.replace(/[\s ]/g, ' ');
};