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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shops_database_1 = require("../../database/shops/shops-database");
const shops_schema_1 = require("../../database/shops/shops.schema");
const auth_1 = require("../middleware/auth");
const validate_dto_1 = require("../middleware/validate-dto");
const api_error_handler_1 = require("../api.error-handler");
const router = (0, express_1.Router)();
const endpoint = "/shops";
router.get(endpoint, (req, res) => {
    const shops = (0, shops_database_1.getShopsJSON)();
    res.json(shops);
});
router.get(`${endpoint}/:id`, (req, res) => {
    const shopId = req.params.id;
    if (!(0, shops_database_1.getShops)().has(shopId)) {
        res.status(404).json({ message: "Магазин не найден" });
        return;
    }
    const account = (0, shops_database_1.getShopsJSON)()[shopId];
    res.json(account);
});
router.post(endpoint, (0, validate_dto_1.validateDto)(shops_schema_1.validateShop), auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(501).json({ message: "Такой функции пока нет" });
}));
router.patch(`${endpoint}/:id`, (0, validate_dto_1.validateDto)(shops_schema_1.validateShopOptional), auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shopId = req.params.id;
    try {
        res.status(501).json({ message: "Такой функции пока нет" });
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
router.delete(`${endpoint}/:id`, auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shopId = req.params.id;
    if (!(0, shops_database_1.getShops)().has(shopId)) {
        res.status(404).json({ message: "Магазин не найден" });
        return;
    }
    try {
        (0, shops_database_1.removeShop)(shopId);
        res.status(204).json({ message: "Магазин успешно удален" });
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
exports.default = router;