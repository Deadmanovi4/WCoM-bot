"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrenciesDatabase = void 0;
const database_types_1 = require("../database-types");
class CurrenciesDatabase extends database_types_1.Database {
    constructor(databaseRaw, path) {
        super(databaseRaw, path);
        this.currencies = this.parseRaw(databaseRaw);
    }
    toJSON() {
        const currencies = Object.fromEntries(this.currencies);
        return currencies;
    }
    parseRaw(databaseRaw) {
        return new Map(Object.entries(databaseRaw));
    }
}
exports.CurrenciesDatabase = CurrenciesDatabase;