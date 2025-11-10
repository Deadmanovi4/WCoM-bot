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
exports.getShops = getShops;
exports.getShopId = getShopId;
exports.getShopName = getShopName;
exports.createShop = createShop;
exports.removeShop = removeShop;
exports.updateShop = updateShop;
exports.updateShopCurrency = updateShopCurrency;
exports.getShopsWithCurrency = getShopsWithCurrency;
exports.updateShopPosition = updateShopPosition;
exports.createDiscountCode = createDiscountCode;
exports.removeDiscountCode = removeDiscountCode;
exports.getProducts = getProducts;
exports.addProduct = addProduct;
exports.removeProduct = removeProduct;
exports.updateProduct = updateProduct;
exports.getProductName = getProductName;
const uuid_1 = require("uuid");
const shops_json_1 = __importDefault(require("../../../data/shops.json"));
const currencies_database_1 = require("../currencies/currencies-database");
const database_handler_1 = require("../database-handler");
const database_types_1 = require("../database-types");
const shops_types_1 = require("./shops-types");
const shops_flows_1 = require("../../user-flows/shops-flows");
const shopsDatabase = new shops_types_1.ShopsDatabase(shops_json_1.default, 'data/shops.json');
// #region Shops
function getShops() {
    return shopsDatabase.shops;
}
function getShopId(shopName) {
    let shopId = undefined;
    shopsDatabase.shops.forEach(shop => {
        if (shop.name === shopName)
            shopId = shop.id;
    });
    return shopId;
}
function getShopName(shopId) {
    if (!shopId)
        return undefined;
    const shop = getShops().get(shopId);
    if (!shop)
        return undefined;
    return `${shop.emoji != '' ? `${shop.emoji} ` : ''}${shop.name}`;
}
function createShop(shopName, description, currencyId, emoji, reservedTo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (shopsDatabase.shops.has(getShopId(shopName) || ''))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopAlreadyExists);
        if (!(0, currencies_database_1.getCurrencies)().has(currencyId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.CurrencyDoesNotExist);
        const newShopId = (0, uuid_1.v4)();
        shopsDatabase.shops.set(newShopId, {
            id: newShopId,
            name: shopName,
            emoji,
            description,
            currency: (0, currencies_database_1.getCurrencies)().get(currencyId),
            discountCodes: {},
            reservedTo,
            products: new Map()
        });
        yield (0, database_handler_1.save)(shopsDatabase);
        return shopsDatabase.shops.get(newShopId);
    });
}
function removeShop(shopId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shopsDatabase.shops.has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        shopsDatabase.shops.delete(shopId);
        (0, database_handler_1.save)(shopsDatabase);
    });
}
function updateShop(shopId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shopsDatabase.shops.has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        const { name, description, emoji, reservedTo } = options;
        const shop = shopsDatabase.shops.get(shopId);
        if (name)
            shop.name = name;
        if (description)
            shop.description = description;
        if (emoji)
            shop.emoji = emoji;
        if (reservedTo)
            shop.reservedTo = reservedTo;
        if (reservedTo === shops_flows_1.NO_VALUE)
            shop.reservedTo = undefined;
        yield (0, database_handler_1.save)(shopsDatabase);
    });
}
function updateShopCurrency(shopId, currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shopsDatabase.shops.has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        if (!(0, currencies_database_1.getCurrencies)().has(currencyId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.CurrencyDoesNotExist);
        const shop = shopsDatabase.shops.get(shopId);
        shop.currency = (0, currencies_database_1.getCurrencies)().get(currencyId);
        yield (0, database_handler_1.save)(shopsDatabase);
    });
}
function getShopsWithCurrency(currencyId) {
    const shopsWithCurrency = new Map();
    shopsDatabase.shops.forEach((shop, shopId) => {
        if (shop.currency.id == currencyId) {
            shopsWithCurrency.set(shopId, shop);
        }
    });
    return shopsWithCurrency;
}
function updateShopPosition(shopId, index) {
    if (!shopsDatabase.shops.has(shopId))
        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
    if (index < 0 || index > shopsDatabase.shops.size - 1)
        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidPosition);
    const shopsArray = Array.from(shopsDatabase.shops.entries());
    const shopIndex = shopsArray.findIndex(([id, _shop]) => id === shopId);
    if (shopIndex === -1)
        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
    shopsArray.splice(index, 0, shopsArray.splice(shopIndex, 1)[0]);
    shopsDatabase.shops = new Map(shopsArray);
    (0, database_handler_1.save)(shopsDatabase);
}
function createDiscountCode(shopId, discountCode, discountAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shopsDatabase.shops.has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        shopsDatabase.shops.get(shopId).discountCodes[discountCode] = discountAmount;
        yield (0, database_handler_1.save)(shopsDatabase);
    });
}
function removeDiscountCode(shopId, discountCode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shopsDatabase.shops.has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        delete shopsDatabase.shops.get(shopId).discountCodes[discountCode];
        yield (0, database_handler_1.save)(shopsDatabase);
    });
}
// #endregion
// #region Products
function getProducts(shopId) {
    if (!getShops().has(shopId))
        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
    return getShops().get(shopId).products;
}
function addProduct(shopId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!getShops().has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        const id = (0, uuid_1.v4)();
        const product = Object.assign({ id, shopId }, options);
        getShops().get(shopId).products.set(id, product);
        yield (0, database_handler_1.save)(shopsDatabase);
        return getShops().get(shopId).products.get(id);
    });
}
function removeProduct(shopId, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!getShops().has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        getShops().get(shopId).products.delete(productId);
        yield (0, database_handler_1.save)(shopsDatabase);
    });
}
function updateProduct(shopId, productId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!getShops().has(shopId))
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ShopDoesNotExist);
        const { name, description, price, emoji, action, amount } = options;
        const product = getShops().get(shopId).products.get(productId);
        if (!product)
            throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.ProductDoesNotExist);
        if (name)
            product.name = name;
        if (description)
            product.description = description;
        if (price != undefined)
            product.price = price;
        if (emoji)
            product.emoji = emoji;
        if (action)
            product.action = action;
        if (amount != undefined) {
            if (amount == -1)
                product.amount = undefined;
            else
                product.amount = amount;
        }
        yield (0, database_handler_1.save)(shopsDatabase);
    });
}
function getProductName(shopId, productId) {
    var _a;
    if (!shopId || !productId)
        return undefined;
    const product = (_a = getShops().get(shopId)) === null || _a === void 0 ? void 0 : _a.products.get(productId);
    if (!product)
        return undefined;
    return `${product.emoji != '' ? `${product.emoji} ` : ''}${product.name}`;
}
// #endregion