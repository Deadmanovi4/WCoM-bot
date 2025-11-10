"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
const database_types_1 = require("../database/database-types");
function handleError(error, res) {
    if (error instanceof database_types_1.DatabaseError) {
        const { status, message } = error;
        res.status(status).json({ message });
        return;
    }
    res.status(400).json({ message: "Ошибка удаления счета" });
}