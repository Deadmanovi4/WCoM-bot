"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencies = getCurrencies;
exports.getCurrencyId = getCurrencyId;
exports.getCurrencyName = getCurrencyName;
exports.createCurrency = createCurrency;
exports.removeCurrency = removeCurrency;
exports.updateCurrency = updateCurrency;
const uuid_1 = require("uuid");
const currencies_json_1 = __importDefault(require("../../../data/currencies.json"));
const database_handler_1 = require("../database-handler");
const database_types_1 = require("../database-types");
const currencies_types_1 = require("./currencies-types");
const currenciesDatabase = new currencies_types_1.CurrenciesDatabase(currencies_json_1.default, 'data/currencies.json');
function getCurrencies() {
    return currenciesDatabase.currencies;
}
function getCurrencyId(currencyName) {
    let currencyId = undefined;
    currenciesDatabase.currencies.forEach(currency => {
        if (currency.name == currencyName)
            currencyId = currency.id;
    });
    return currencyId;
}
function getCurrencyName(currencyId) {
    if (!currencyId)
        return undefined;
    const currency = getCurrencies().get(currencyId);
    if (!currency)
        return undefined;
    return `${currency.emoji != '' ? `${currency.emoji} ` : ''}${currency.name}`;
}
function createCurrency(currencyName, emoji) {
    return __awaiter(this, void 0, void 0, function* () {
        if (currenciesDatabase.currencies.has(getCurrencyId(currencyName) || ''))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.CurrencyAlreadyExists);
        const newCurrencyId = (0, uuid_1.v4)();
        currenciesDatabase.currencies.set(newCurrencyId, { id: newCurrencyId, name: currencyName, emoji });
        (0, database_handler_1.save)(currenciesDatabase);
    });
}
function removeCurrency(currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currenciesDatabase.currencies.has(currencyId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.CurrencyDoesNotExist);
        currenciesDatabase.currencies.delete(currencyId);
        (0, database_handler_1.save)(currenciesDatabase);
    });
}
function updateCurrency(currencyId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currenciesDatabase.currencies.has(currencyId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.CurrencyDoesNotExist);
        const { name, emoji } = options;
        const currency = currenciesDatabase.currencies.get(currencyId);
        if (name)
            currency.name = name;
        if (emoji)
            currency.emoji = emoji;
        yield (0, database_handler_1.save)(currenciesDatabase);
    });
}