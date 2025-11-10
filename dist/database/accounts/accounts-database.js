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
exports.getOrCreateAccount = getOrCreateAccount;
exports.setAccountCurrencyAmount = setAccountCurrencyAmount;
exports.setAccountItemAmount = setAccountItemAmount;
exports.emptyAccount = emptyAccount;
exports.getAccountsWithCurrency = getAccountsWithCurrency;
exports.takeCurrencyFromAccounts = takeCurrencyFromAccounts;
const accounts_json_1 = __importDefault(require("../../../data/accounts.json"));
const currencies_database_1 = require("../currencies/currencies-database");
const database_handler_1 = require("../database-handler");
const database_types_1 = require("../database-types");
const accounts_type_1 = require("./accounts-type");
const accountsDatabase = new accounts_type_1.AccountsDatabase(accounts_json_1.default, 'data/accounts.json');
function getOrCreateAccount(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let account = accountsDatabase.accounts.get(id);
        if (!account) {
            accountsDatabase.accounts.set(id, { currencies: new Map(), inventory: new Map() });
            yield (0, database_handler_1.save)(accountsDatabase);
            account = accountsDatabase.accounts.get(id);
        }
        return account;
    });
}
function setAccountCurrencyAmount(id, currencyId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield getOrCreateAccount(id);
        if (!(0, currencies_database_1.getCurrencies)().has(currencyId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.CurrencyDoesNotExist);
        const currencyBalance = account.currencies.get(currencyId);
        if (!currencyBalance) {
            const currency = (0, currencies_database_1.getCurrencies)().get(currencyId);
            account.currencies.set(currencyId, {
                item: {
                    id: currencyId,
                    name: currency.name,
                    emoji: currency.emoji
                },
                amount: +amount.toFixed(2)
            });
        }
        else {
            currencyBalance.amount = +amount.toFixed(2);
        }
        yield (0, database_handler_1.save)(accountsDatabase);
    });
}
function setAccountItemAmount(id, product, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield getOrCreateAccount(id);
        let productBalance = account.inventory.get(product.id);
        if (!productBalance) {
            account.inventory.set(product.id, {
                item: product,
                amount
            });
        }
        else {
            productBalance.amount = amount;
        }
        yield (0, database_handler_1.save)(accountsDatabase);
    });
}
function emptyAccount(id, empty) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = accountsDatabase.accounts.get(id);
        if (!account)
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.AccountDoesNotExist);
        if (empty === 'currencies' || empty === 'all')
            account.currencies.clear();
        if (empty === 'inventory' || empty === 'all')
            account.inventory.clear();
        yield (0, database_handler_1.save)(accountsDatabase);
    });
}
function getAccountsWithCurrency(currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountsWithCurrency = new Map();
        accountsDatabase.accounts.forEach((account, id) => {
            if (account.currencies.has(currencyId))
                accountsWithCurrency.set(id, account);
        });
        return accountsWithCurrency;
    });
}
function takeCurrencyFromAccounts(currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountsWithCurrency = yield getAccountsWithCurrency(currencyId);
        accountsWithCurrency.forEach((account, id) => __awaiter(this, void 0, void 0, function* () {
            account.currencies.delete(currencyId);
        }));
        yield (0, database_handler_1.save)(accountsDatabase);
        return accountsWithCurrency;
    });
}