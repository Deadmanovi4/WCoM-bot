"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validJWTNeeded = validJWTNeeded;
exports.mustBeOwner = mustBeOwner;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_json_1 = __importDefault(require("../../../config/config.json"));
function validJWTNeeded(req, res, next) {
    if (!req.headers['authorization']) {
        res.status(401).send();
        return;
    }
    try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
            res.status(401).send();
            return;
        }
        res.locals.jwt = jsonwebtoken_1.default.verify(authorization[1], config_json_1.default.jwtSecret);
        next();
        return;
    }
    catch (err) {
        res.status(403).send();
        return;
    }
}
function mustBeOwner(req, res, next) {
    if (res.locals.jwt.userId !== config_json_1.default.ownerId) {
        res.status(403).send();
        return;
    }
    next();
}