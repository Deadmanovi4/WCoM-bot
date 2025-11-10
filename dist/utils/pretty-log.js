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
exports.PrettyLog = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const luxon_1 = require("luxon");
const path_1 = __importDefault(require("path"));
class PrettyLog {
    static logLoadStep(message, more) {
        console.log(`${this.stepX()} \x1b[32m${message}\x1b[0m \x1b[34m${more != undefined ? more : ''}\x1b[0m`);
        this.saveLogs(`✓ Шаг ${this.loadStepCount - 1} - ${message} ${more != undefined ? more : ''}`);
    }
    static logLoadSuccess() {
        console.log(`\n\x1b[7m ✓ \x1b[32m Loading finished after ${this.loadStepCount - 1} steps \x1b[0m\n`);
        this.saveLogs(`✓ Загрузка finished after ${this.loadStepCount - 1} steps`);
        this.loadStepCount = 1;
    }
    static error(message, save = true) {
        console.log(`\x1b[7m ✕ \x1b[31m Error \x1b[0m \x1b[31m${message}\x1b[0m`);
        if (!save)
            return;
        this.saveLogs(`✕ Ошибка - ${message}`);
    }
    static warning(message, save = true) {
        console.log(`\x1b[7m ! \x1b[33m Warning \x1b[0m \x1b[33m${message}\x1b[0m`);
        if (!save)
            return;
        this.saveLogs(`! Предупреждение - ${message}`);
    }
    static info(message, save = true) {
        console.log(`\x1b[7m ? \x1b[34m Info \x1b[0m ${message}`);
        if (!save)
            return;
        this.saveLogs(`? Информация - ${message}`);
    }
    static success(message, save = true) {
        console.log(`\x1b[7m ✓ \x1b[32m Success \x1b[0m \x1b[32m${message}\x1b[0m`);
        if (!save)
            return;
        this.saveLogs(`✓ Успешно - ${message}`);
    }
    static stepX() {
        this.loadStepCount++;
        return `\x1b[7m ✓ \x1b[32m Step ${this.loadStepCount - 1} \x1b[0m`;
    }
    static bold(message) {
        return `\x1b[1m${message}\x1b[0m`;
    }
    static underline(message) {
        return `\x1b[4m${message}\x1b[0m`;
    }
    static italic(message) {
        return `\x1b[3m${message}\x1b[0m`;
    }
    static saveLogs(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sanatizedMessage = message.replace(new RegExp('\x1b\\[\\d+m', 'gm'), '');
                yield promises_1.default.appendFile(path_1.default.join(__dirname, '..', '..', 'logs.txt'), `[${this.getNowTimeString()}] ${sanatizedMessage}\n`);
            }
            catch (error) {
                console.log(`Не удалось сохранить лог: ${error}`);
            }
        });
    }
    static getNowTimeString() {
        return luxon_1.DateTime.now().setZone('Europe/Paris').toSQL({ includeOffset: false });
    }
}
exports.PrettyLog = PrettyLog;
PrettyLog.loadStepCount = 1;