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
const validate_dto_1 = require("../middleware/validate-dto");
const api_error_handler_1 = require("../api.error-handler");
const auth_1 = require("../middleware/auth");
const currencies_database_1 = require("../../database/currencies/currencies-database");
const currencies_schemas_1 = require("../../database/currencies/currencies.schemas");
const router = (0, express_1.Router)();
const endpoint = "/currencies";
router.get(endpoint, (req, res) => {
    const currencies = (0, currencies_database_1.getCurrenciesJSON)();
    res.json(currencies);
});
router.get(`${endpoint}/:id`, (req, res) => {
    const currencyId = req.params.id;
    if (!(0, currencies_database_1.getCurrencies)().has(currencyId)) {
        res.status(404).json({ message: "Счет не найден" });
        return;
    }
    const currency = (0, currencies_database_1.getCurrenciesJSON)()[currencyId];
    res.json(currency);
});
router.post(endpoint, (0, validate_dto_1.validateDto)(currencies_schemas_1.validateCurrency), auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCurrency = yield (0, currencies_database_1.createCurrency)(req.body.name, req.body.emoji);
        res.status(201).json((0, currencies_database_1.getCurrenciesJSON)()[newCurrency.id]);
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
router.patch(`${endpoint}/:id`, (0, validate_dto_1.validateDto)(currencies_schemas_1.validateCurrencyOptional), auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currencyId = req.params.id;
    try {
        const currenciesOption = req.body;
        yield (0, currencies_database_1.updateCurrency)(currencyId, currenciesOption);
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
router.delete(`${endpoint}/:id`, auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currencyId = req.params.id;
    try {
        yield (0, currencies_database_1.removeCurrency)(currencyId);
        res.status(204).json({ message: "Счет успешно удален" });
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
exports.default = router;