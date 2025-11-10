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
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const pretty_log_1 = require("../utils/pretty-log");
const settings_handler_1 = require("../database/settings/settings-handler");
exports.name = 'ready';
exports.once = true;
function execute(client) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client.user)
            return;
        const activity = getActivity();
        if (activity !== undefined) {
            client.user.setActivity(activity);
        }
        pretty_log_1.PrettyLog.logLoadStep(`Бот подключен к пользователю:`, `${client.user.username}`);
        pretty_log_1.PrettyLog.logLoadSuccess();
    });
}
function getActivity() {
    var _a, _b;
    const activityMessage = (_a = (0, settings_handler_1.getSetting)('activityMessage')) === null || _a === void 0 ? void 0 : _a.value;
    if (typeof activityMessage !== 'string')
        return undefined;
    const activityTypeName = (_b = (0, settings_handler_1.getSetting)('activityType')) === null || _b === void 0 ? void 0 : _b.value;
    const activityType = activityTypeName == "Playing" ? discord_js_1.ActivityType.Playing :
        activityTypeName == "Streaming" ? discord_js_1.ActivityType.Streaming :
            activityTypeName == "Listening" ? discord_js_1.ActivityType.Listening :
                activityTypeName == "Watching" ? discord_js_1.ActivityType.Watching :
                    activityTypeName == "Competing" ? discord_js_1.ActivityType.Competing :
                        undefined;
    return activityType ? { name: activityMessage, type: activityType } : undefined;
}