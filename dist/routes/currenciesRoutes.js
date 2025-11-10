"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currencies_database_1 = require("../database/currencies/currencies-database");
const router = (0, express_1.Router)();
const endpoint = "/currencies";
router.get(endpoint, (req, res) => {
    const currencies = (0, currencies_database_1.getCurrenciesJSON)();
    res.json(currencies);
});
router.get(`${endpoint}/:id`, (req, res) => {
    const currencyId = req.params.id;
    if (!(0, currencies_database_1.getCurrencies)().has(currencyId)) {
        res.status(404).json({ message: "Счет/валюта не найдена" });
        return;
    }
    const currency = (0, currencies_database_1.getCurrenciesJSON)()[currencyId];
    res.json(currency);
});
router.post(endpoint, (req, res) => {
});
// router.patch(`${endpoint}/:id`, (req: Request, res: Response) => {
// });
// router.delete(`${endpoint}/:id}`, (req: Request, res: Response) => {
// });
exports.default = router;