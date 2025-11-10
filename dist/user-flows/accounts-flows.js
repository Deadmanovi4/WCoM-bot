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
exports.AccountTakeFlow = exports.BulkAccountGiveFlow = exports.AccountGiveFlow = void 0;
const discord_js_1 = require("discord.js");
const accounts_database_1 = require("../database/accounts/accounts-database");
const currencies_database_1 = require("../database/currencies/currencies-database");
const database_types_1 = require("../database/database-types");
const extended_components_1 = require("../user-interfaces/extended-components");
const constants_1 = require("../utils/constants");
const discord_1 = require("../utils/discord");
const user_flow_1 = require("./user-flow");
class AccountGiveFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'account-give';
        this.components = new Map();
        this.selectedCurrency = null;
        this.target = null;
        this.amount = null;
		this.log = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencies = (0, currencies_database_1.getCurrencies)();
			load tiers = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/tiers.json'), 'utf8'));	
            if (!currencies.size)
                return (0, discord_1.replyErrorMessage)(interaction, `Не удалось выдать очки. ${constants_1.ErrorMessages.NoCurrencies}`);
			if (ballCurrencyIds.includes(currencyId)) {const currentTotal = account.totalPoints || 0;const limit = tiers[account.rank || 1].limit;
				if (currentTotal + amount > limit) {interaction.followUp({ content: 'Достигнут лимит ранга, баллы сгорели. Требуется повышение ранга.', ephemeral: true });
				return;}
			account.totalPoints = currentTotal + amount;
			this.log = log;
			account.log.push({ date: new Date().toISOString(), by: interaction.user.id, cat: currencyId, amount, comment: interaction.options.getString('comment') || '', type: 'give' });
            const target = interaction.options.getUser('target');
            const amount = interaction.options.getNumber('amount');
            if (!target || !amount)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            this.target = target;
            this.amount = amount;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Выдать ${(0, discord_js_1.bold)(`${this.amount} [${(0, currencies_database_1.getCurrencyName)((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите счет'}]`)} to ${(0, discord_js_1.bold)(`${this.target}`)}`;
    }
    initComponents() {
        const currencySelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({ customId: `${this.id}+select-currency`, placeholder: 'Select a currency', time: 120000 }, (0, currencies_database_1.getCurrencies)(), (interaction, selectedCurrency) => {
            this.selectedCurrency = selectedCurrency;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Применить',
            emoji: '✅',
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
            time: 120000,
        }, (interaction) => this.success(interaction));
        this.components.set(currencySelectMenu.customId, currencySelectMenu);
        this.components.set(submitButton.customId, submitButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitButton.toggle(this.selectedCurrency != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.disableComponents();
            try {
                if (!this.selectedCurrency || !this.target || !this.amount)
                    return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const currentBalance = ((_a = (yield (0, accounts_database_1.getOrCreateAccount)(this.target.id)).currencies.get(this.selectedCurrency.id)) === null || _a === void 0 ? void 0 : _a.amount) || 0;
                yield (0, accounts_database_1.setAccountCurrencyAmount)(this.target.id, this.selectedCurrency.id, currentBalance + this.amount);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно выдали ${(0, discord_js_1.bold)(`${this.amount}`)} ${(0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id)} пользователю ${(0, discord_js_1.userMention)(this.target.id)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.AccountGiveFlow = AccountGiveFlow;
class BulkAccountGiveFlow extends AccountGiveFlow {
    constructor() {
        super(...arguments);
        this.targetRole = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencies = (0, currencies_database_1.getCurrencies)();
			load tiers = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/tiers.json'), 'utf8'));
            if (!currencies.size)
                return (0, discord_1.replyErrorMessage)(interaction, `Не удалось выдать очки. ${constants_1.ErrorMessages.NoCurrencies}`);
            const targetRole = interaction.options.getRole('role');
            const amount = interaction.options.getNumber('amount');
            if (!targetRole || !amount)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
			if (ballCurrencyIds.includes(currencyId)) {const currentTotal = account.totalPoints || 0;const limit = tiers[account.rank || 1].limit;
				if (currentTotal + amount > limit) {interaction.followUp({ content: 'Достигнут лимит ранга, баллы сгорели. Требуется повышение ранга.', ephemeral: true });
				return;}
			account.totalPoints = currentTotal + amount;
			this.log = log;
			account.log.push({ date: new Date().toISOString(), by: interaction.user.id, cat: currencyId, amount, comment: interaction.options.getString('comment') || '', type: 'givebulk' });
            this.targetRole = targetRole;
            this.amount = amount;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        const roleString = this.targetRole ? (0, discord_js_1.roleMention)(this.targetRole.id) : (0, discord_js_1.bold)('Выберите роль');
        return `Выдать ${(0, discord_js_1.bold)(`${this.amount} [${(0, currencies_database_1.getCurrencyName)((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите счет'}]`)} всем пользователям с ролью ${roleString}`;
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            this.disableComponents();
            try {
                if (!this.selectedCurrency || !this.targetRole || !this.amount)
                    return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const targetUsersIds = ((_b = (yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.fetch(this.targetRole.id)))) === null || _b === void 0 ? void 0 : _b.members.map(m => m.user.id)) || [];
                for (const userId of targetUsersIds) {
                    const currentBalance = ((_c = (yield (0, accounts_database_1.getOrCreateAccount)(userId)).currencies.get(this.selectedCurrency.id)) === null || _c === void 0 ? void 0 : _c.amount) || 0;
                    yield (0, accounts_database_1.setAccountCurrencyAmount)(userId, this.selectedCurrency.id, currentBalance + this.amount);
                }
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно выдали ${(0, discord_js_1.bold)(`${this.amount}`)} ${(0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id)} всем пользователям с ролью ${(0, discord_js_1.roleMention)(this.targetRole.id)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.BulkAccountGiveFlow = BulkAccountGiveFlow;
class AccountTakeFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'account-take';
        this.components = new Map();
        this.selectedCurrency = null;
        this.target = null;
        this.amount = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencies = (0, currencies_database_1.getCurrencies)();
            if (!currencies.size)
                return (0, discord_1.replyErrorMessage)(interaction, `Не удалось забрать очки. ${constants_1.ErrorMessages.NoCurrencies}`);
            const target = interaction.options.getUser('target');
            const amount = interaction.options.getNumber('amount');
            if (!target || !amount)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
			account.log.push({ date: new Date().toISOString(), by: interaction.user.id, cat: currencyId, amount, comment: interaction.options.getString('comment') || '', type: 'take' });
            this.target = target;
            this.amount = amount;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Забрать ${(0, discord_js_1.bold)(`${this.amount} [${(0, currencies_database_1.getCurrencyName)((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите счет'}]`)} очков у пользователя ${(0, discord_js_1.bold)(`${this.target}`)}`;
    }
    initComponents() {
        const currencySelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({ customId: `${this.id}+select-currency`, placeholder: 'Select a currency', time: 120000 }, (0, currencies_database_1.getCurrencies)(), (interaction, selectedCurrency) => {
            this.selectedCurrency = selectedCurrency;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Применить',
            emoji: '✅',
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
            time: 120000,
        }, (interaction) => this.success(interaction));
        const takeAllButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+take-all`,
            label: 'Забрать весь счет',
            emoji: '🔥',
            style: discord_js_1.ButtonStyle.Danger,
            disabled: true,
            time: 120000,
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.selectedCurrency || !this.target)
                return this.updateInteraction(interaction);
            this.amount = ((_a = (yield (0, accounts_database_1.getOrCreateAccount)(this.target.id)).currencies.get(this.selectedCurrency.id)) === null || _a === void 0 ? void 0 : _a.amount) || 0;
            this.success(interaction);
        }));
        const emptyAccountButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+empty-account`,
            label: 'Обнулить аккаунт',
            emoji: '🗑️',
            style: discord_js_1.ButtonStyle.Danger,
            time: 120000,
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            const [modalSubmitInteraction, confirmed] = yield (0, extended_components_1.showConfirmationModal)(interaction);
            if (!confirmed)
                return this.updateInteraction(modalSubmitInteraction);
            yield (0, accounts_database_1.emptyAccount)(this.target.id, 'currencies');
            yield (0, discord_1.updateAsSuccessMessage)(modalSubmitInteraction, `You successfully emptied ${(0, discord_js_1.bold)(`${this.target}`)} account`);
        }));
        this.components.set(currencySelectMenu.customId, currencySelectMenu);
        this.components.set(submitButton.customId, submitButton);
        this.components.set(takeAllButton.customId, takeAllButton);
        this.components.set(emptyAccountButton.customId, emptyAccountButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (submitButton instanceof extended_components_1.ExtendedButtonComponent) {
            submitButton.toggle(this.selectedCurrency != null);
        }
        const takeAllButton = this.components.get(`${this.id}+take-all`);
        if (takeAllButton instanceof extended_components_1.ExtendedButtonComponent) {
            takeAllButton.toggle(this.selectedCurrency != null && this.target != null);
        }
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.disableComponents();
            try {
                if (!this.selectedCurrency)
                    return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const currentBalance = ((_a = (yield (0, accounts_database_1.getOrCreateAccount)(this.target.id)).currencies.get(this.selectedCurrency.id)) === null || _a === void 0 ? void 0 : _a.amount) || 0;
                const newBalance = Math.max(currentBalance - this.amount, 0);
                yield (0, accounts_database_1.setAccountCurrencyAmount)(this.target.id, this.selectedCurrency.id, newBalance);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно забрали ${(0, discord_js_1.bold)(`${this.amount}`)} ${(0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id)} у ${(0, discord_js_1.bold)(`${this.target}`)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.AccountTakeFlow = AccountTakeFlow;