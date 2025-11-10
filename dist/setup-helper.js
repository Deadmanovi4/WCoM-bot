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
const node_readline_1 = __importDefault(require("node:readline"));
const config_json_1 = __importDefault(require("../config/config.json"));
const node_fs_1 = __importDefault(require("node:fs"));
const deploy_commands_1 = require("./deploy-commands");
const pretty_log_1 = require("./utils/pretty-log");
const rl = node_readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.on('close', () => {
    node_fs_1.default.writeFileSync('./config/config.json', JSON.stringify(config_json_1.default, null, 2));
});
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\n\n———————————————————————————\n');
        pretty_log_1.PrettyLog.info('Dependencies installed, please enter your bot credentials', false);
        const id = yield questionWithCondition(`\nBot client ID: `, id => /^\d{17,20}$/.test(id), 'Client ID not valid');
        config_json_1.default.clientId = id;
        const token = yield questionWithCondition(`\nBot token: `, token => token.length > 0, 'Please enter a token');
        config_json_1.default.token = token;
        const resetData = yield questionWithCondition('\nReset data? (y/n): ', answer => answer === 'y' || answer === 'n');
        if (resetData === 'y') {
            node_fs_1.default.writeFileSync('./data/shops.json', JSON.stringify({}, null, 2));
            node_fs_1.default.writeFileSync('./data/accounts.json', JSON.stringify({}, null, 2));
            node_fs_1.default.writeFileSync('./data/currencies.json', JSON.stringify({}, null, 2));
        }
        rl.close();
        console.log('\n———————————————————————————\n');
        pretty_log_1.PrettyLog.info('Deploying commands', false);
        yield (0, deploy_commands_1.appDeployCommands)();
        console.log('\n———————————————————————————\n');
        pretty_log_1.PrettyLog.success('Setup complete', false);
        pretty_log_1.PrettyLog.info(`You can now start the bot using ${pretty_log_1.PrettyLog.italic('npm run serve')}`, false);
    });
}
setup();
function questionWithCondition(question, condition, errorMessage) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            if (condition(answer)) {
                resolve(answer);
            }
            else {
                pretty_log_1.PrettyLog.warning(errorMessage !== null && errorMessage !== void 0 ? errorMessage : 'Answer not valid', false);
                resolve(questionWithCondition(question, condition));
            }
        });
    });
}