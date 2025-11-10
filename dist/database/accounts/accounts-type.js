"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsDatabase = void 0;
const currencies_database_1 = require("../currencies/currencies-database");
const database_types_1 = require("../database-types");
const shops_database_1 = require("../shops/shops-database");
class AccountsDatabase extends database_types_1.Database {
    constructor(databaseRaw, path) {
        super(databaseRaw, path);
        this.accounts = this.parseRaw(databaseRaw);
    }
    toJSON() {
        const accountsJSON = {};
        this.accounts.forEach((account, userId) => {
            const currencies = Object.fromEntries(Array.from(account.currencies.entries()).map(([id, balance]) => [id, { item: balance.item.id, amount: balance.amount }]));
            const inventory = Object.fromEntries(Array.from(account.inventory.entries()).map(([id, balance]) => [id, { item: { id: balance.item.id, shopId: balance.item.shopId }, amount: balance.amount }]));
            accountsJSON[userId] = { currencies, inventory };
        });
        return accountsJSON;
    }
    parseRaw(databaseRaw) {
        const accounts = new Map();
        for (const [userId, { currencies: currenciesJSON, inventory: inventoryJSON }] of Object.entries(databaseRaw)) {
            const currenciesArray = Array.from(Object.entries(currenciesJSON)).filter(([id, _]) => (0, currencies_database_1.getCurrencies)().has(id)).map(([id, balance]) => [id, { item: (0, currencies_database_1.getCurrencies)().get(id), amount: balance.amount }]);
            const inventoryArray = Array.from(Object.entries(inventoryJSON)).filter(([id, balance]) => (0, shops_database_1.getShops)().has(balance.item.shopId) && (0, shops_database_1.getProducts)(balance.item.shopId).has(id)).map(([id, balance]) => [id, { item: (0, shops_database_1.getProducts)(balance.item.shopId).get(id), amount: balance.amount }]);
            accounts.set(userId, { currencies: new Map(currenciesArray), inventory: new Map(inventoryArray) });
        }
        return accounts;
    }
}
exports.AccountsDatabase = AccountsDatabase;