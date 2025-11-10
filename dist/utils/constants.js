"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.EMOJI_REGEX = void 0;
exports.EMOJI_REGEX = /<a?:.+?:\d{18,}>|\p{Extended_Pictographic}/gu;
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["InvalidSubcommand"] = "Неизвестная функция";
    ErrorMessages["NoShops"] = "Магазинов нет.\n-# Используйте `/shops-manage create` для создания";
    ErrorMessages["InsufficientParameters"] = "Недостаточно аргументов";
    ErrorMessages["NoCurrencies"] = "Нет счетов.\n-# Используйте `/currencies-manage create` для создания";
    ErrorMessages["NotOnlyEmojisInName"] = "Название не может содержать только эмодзи";
    ErrorMessages["NoProducts"] = "В выбранном магазине нет товара";
})(ErrorMessages || (exports.ErrorMessages = ErrorMessages = {}));