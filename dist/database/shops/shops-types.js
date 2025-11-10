"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsDatabase = exports.PRODUCT_ACTION_TYPE = void 0;
exports.createProductAction = createProductAction;
exports.isProductActionType = isProductActionType;
const currencies_database_1 = require("../currencies/currencies-database");
const database_types_1 = require("../database-types");
exports.PRODUCT_ACTION_TYPE = {
    GiveRole: 'give-role',
    GiveCurrency: 'give-currency'
};
function createProductAction(type, options) {
    return {
        type,
        options
    };
}
function isProductActionType(actionType) {
    return Object.values(exports.PRODUCT_ACTION_TYPE).includes(actionType);
}
class ShopsDatabase extends database_types_1.Database {
    constructor(databaseRaw, path) {
        super(databaseRaw, path);
        this.shops = this.parseRaw(databaseRaw);
    }
    toJSON() {
        const shopsJSON = {};
        this.shops.forEach((shop, shopId) => {
            shopsJSON[shopId] = Object.assign(Object.assign({}, shop), { products: Object.fromEntries(shop.products), currencyId: shop.currency.id });
        });
        return shopsJSON;
    }
    parseRaw(databaseRaw) {
        const shops = new Map();
        for (const [shopId, shop] of Object.entries(databaseRaw)) {
            if (!(0, currencies_database_1.getCurrencies)().has(shop.currencyId))
                continue;
            const products = new Map(Object.entries(shop.products).map(([id, product]) => {
                let action = undefined;
                if (product.action && isProductActionType(product.action.type)) {
                    action = createProductAction(product.action.type, product.action.options);
                }
                return [id, Object.assign(Object.assign({}, product), { action })];
            }));
            shops.set(shopId, Object.assign(Object.assign({}, shop), { products, currency: (0, currencies_database_1.getCurrencies)().get(shop.currencyId) }));
        }
        return shops;
    }
}
exports.ShopsDatabase = ShopsDatabase;