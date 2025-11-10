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
const accounts_database_1 = require("../../database/accounts/accounts-database");
const api_error_handler_1 = require("../api.error-handler");
const auth_1 = require("../middleware/auth");
const validate_dto_1 = require("../middleware/validate-dto");
const accounts_schema_1 = require("../../database/accounts/accounts.schema");
const router = (0, express_1.Router)();
const endpoint = "/accounts";
router.get(endpoint, (req, res) => {
    const accounts = (0, accounts_database_1.getAccountsJSON)();
    res.json(accounts);
});
router.get(`${endpoint}/:id`, (req, res) => {
    const userId = req.params.id;
    if (!(0, accounts_database_1.hasAccount)(userId)) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
    }
    const account = (0, accounts_database_1.getAccountsJSON)()[userId];
    res.json(account);
});
router.post(endpoint, (0, validate_dto_1.validateDto)(accounts_schema_1.validateAccount), auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(501).json({ message: "Такой функции пока нет" });
}));
router.patch(`${endpoint}/:id`, (0, validate_dto_1.validateDto)(accounts_schema_1.validateAccount), auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        res.status(501).json({ message: "Такой функции пока нет" });
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
router.delete(`${endpoint}/:id`, auth_1.validJWTNeeded, auth_1.mustBeOwner, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!(0, accounts_database_1.hasAccount)(userId)) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
    }
    try {
        (0, accounts_database_1.emptyAccount)(userId, "all");
        res.status(204).json({ message: "Пользователь успешно удален" });
    }
    catch (error) {
        (0, api_error_handler_1.handleError)(error, res);
    }
}));
exports.default = router;