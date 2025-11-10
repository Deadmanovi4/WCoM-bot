"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.DatabaseError = exports.DatabaseErrors = void 0;
var DatabaseErrors;
(function (DatabaseErrors) {
    DatabaseErrors["ShopDoesNotExist"] = "Магазин не существует";
    DatabaseErrors["ShopAlreadyExists"] = "Магазин уже существует";
    DatabaseErrors["InvalidPosition"] = "Неверная позиция";
    DatabaseErrors["CurrencyDoesNotExist"] = "Счет/валюта не существует";
    DatabaseErrors["CurrencyAlreadyExists"] = "Счет/валюта уже существует";
    DatabaseErrors["ProductDoesNotExist"] = "Товар не существует";
    DatabaseErrors["AccountDoesNotExist"] = "Аккаунт не существует";
    DatabaseErrors["InvalidSettingType"] = "Тип настройки приведен не верно";
    DatabaseErrors["DuplicateSettingName"] = "Тип настройки уже существует";
})(DatabaseErrors || (exports.DatabaseErrors = DatabaseErrors = {}));
class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = "DatabaseError";
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}
exports.DatabaseError = DatabaseError;
class Database {
    constructor(databaseRaw, path) {
        this.path = path;
    }
}
exports.Database = Database;