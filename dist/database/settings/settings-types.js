"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDatabase = void 0;
exports.isSetting = isSetting;
const utils_1 = require("../../utils/utils");
const database_types_1 = require("../database-types");
const settingTypes = ["string", "bool", "number", "channelId", "roleId", "userId", "enum"];
function isSetting(setting) {
    return typeof setting === "object" && setting !== null && "id" in setting && "name" in setting && "value" in setting && "type" in setting;
}
function isSettingType(type) {
    return settingTypes.includes(type);
}
class SettingsDatabase extends database_types_1.Database {
    constructor(databaseRaw, path) {
        super(databaseRaw, path);
        this.settings = new Map();
        this.settings = this.parseRaw(databaseRaw);
    }
    toJSON() {
        const settingsJSON = {};
        this.settings.forEach((setting) => {
            settingsJSON[setting.id] = Object.assign(Object.assign({}, setting), { type: setting.type, value: (setting.value === undefined) ? null : setting.value });
        });
        return settingsJSON;
    }
    parseRaw(databaseRaw) {
        const settings = new Map();
        for (const [id, setting] of Object.entries(databaseRaw)) {
            if (!(isSettingType(setting.type)))
                throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidSettingType);
            const name = setting.name;
            const value = setting.value;
            if (settings.has(id))
                throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.DuplicateSettingName);
            if (value === null) {
                if (setting.type === "enum") {
                    settings.set(id, Object.assign(Object.assign({}, setting), { value: undefined }));
                }
                else {
                    settings.set(id, { id, name, value: undefined, type: setting.type });
                }
                continue;
            }
            switch (setting.type) {
                case "channelId":
                case "roleId":
                case "userId":
                    if (!(typeof value === "string"))
                        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidSettingType);
                    settings.set(id, { id, name, value: value, type: setting.type });
                    break;
                case "string":
                    if (!(typeof value === "string"))
                        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidSettingType);
                    settings.set(id, { id, name, value: value, type: setting.type });
                    break;
                case "bool":
                    if (!(typeof value === "boolean"))
                        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidSettingType);
                    settings.set(id, { id, name, value: value, type: setting.type });
                    break;
                case "number":
                    if (!(typeof value === "number"))
                        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidSettingType);
                    settings.set(id, { id, name, value: value, type: setting.type });
                    break;
                case "enum":
                    if (!(typeof value === "string") || setting.options === undefined)
                        throw new database_types_1.DatabaseError(database_types_1.DatabaseErrors.InvalidSettingType);
                    settings.set(id, { id, name, value: value, options: setting.options, type: setting.type });
                    break;
                default:
                    (0, utils_1.assertNeverReached)(setting.type);
            }
        }
        return settings;
    }
}
exports.SettingsDatabase = SettingsDatabase;