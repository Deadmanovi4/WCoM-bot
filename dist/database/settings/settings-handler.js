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
exports.getSettings = getSettings;
exports.getSetting = getSetting;
exports.setSetting = setSetting;
const database_handler_1 = require("../database-handler");
const settings_types_1 = require("./settings-types");
const settings_json_1 = __importDefault(require("../../../data/settings.json"));
const settingsDatabase = new settings_types_1.SettingsDatabase(settings_json_1.default, "data/settings.json");
function getSettings() {
    return settingsDatabase.settings;
}
function getSetting(id) {
    return settingsDatabase.settings.get(id);
}
function setSetting(id, value) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!settingsDatabase.settings.has(id))
            throw new Error("Такой настройки нет");
        const setting = settingsDatabase.settings.get(id);
        settingsDatabase.settings.set(id, Object.assign(Object.assign({}, setting), { value: value }));
        yield (0, database_handler_1.save)(settingsDatabase);
        return settingsDatabase.settings.get(id);
    });
}