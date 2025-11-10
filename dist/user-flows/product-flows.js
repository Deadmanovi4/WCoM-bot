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
exports.EditProductFlow = exports.EditProductOption = exports.RemoveProductFlow = exports.AddActionProductFlow = exports.AddProductFlow = void 0;
const discord_js_1 = require("discord.js");
const currencies_database_1 = require("../database/currencies/currencies-database");
const database_types_1 = require("../database/database-types");
const shops_database_1 = require("../database/shops/shops-database");
const shops_types_1 = require("../database/shops/shops-types");
const extended_components_1 = require("../user-interfaces/extended-components");
const constants_1 = require("../utils/constants");
const pretty_log_1 = require("../utils/pretty-log");
const discord_1 = require("../utils/discord");
const user_flow_1 = require("./user-flow");
const utils_1 = require("../utils/utils");
class AddProductFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = "add-product";
        this.components = new Map();
        this.productName = null;
        this.productPrice = null;
        this.productEmoji = null;
        this.productDescription = null;
        this.productAmount = null;
        this.selectedShop = null;
        this.response = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            const productName = (_a = interaction.options.getString('name')) === null || _a === void 0 ? void 0 : _a.replaceSpaces();
            const productDescription = ((_b = interaction.options.getString('description')) === null || _b === void 0 ? void 0 : _b.replaceSpaces()) || '';
            const productPrice = interaction.options.getNumber('price');
            const productEmojiOption = interaction.options.getString('emoji');
            const productEmoji = ((_c = productEmojiOption === null || productEmojiOption === void 0 ? void 0 : productEmojiOption.match(constants_1.EMOJI_REGEX)) === null || _c === void 0 ? void 0 : _c[0]) || '';
            const productAmount = interaction.options.getInteger('amount');
            if (!productName || productPrice == null)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            if (productName.removeCustomEmojis().length == 0)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NotOnlyEmojisInName);
            this.productName = productName;
            this.productPrice = +productPrice.toFixed(2);
            this.productEmoji = productEmoji;
            this.productDescription = productDescription;
            this.productAmount = productAmount;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            this.response = response;
            return;
        });
    }
    getMessage() {
        var _a, _b;
        const descString = (this.productDescription) ? `. Описание: ${(0, discord_js_1.bold)(this.productDescription.replaceSpaces())}` : '';
        const nameString = (0, discord_js_1.bold)(`${this.productEmoji ? `${this.productEmoji} ` : ''}${this.productName}`);
        return `Добавить товар: ${nameString} за **${this.productPrice} ${(0, currencies_database_1.getCurrencyName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.currency.id) || '[ ]'}** в **[${(0, shops_database_1.getShopName)((_b = this.selectedShop) === null || _b === void 0 ? void 0 : _b.id) || 'Выберите магазин'}]**${descString}`;
    }
    initComponents() {
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit-shop`,
            label: 'Добавить товар',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
            time: 120000
        }, (interaction) => this.success(interaction));
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitShopButton.customId, submitShopButton);
    }
    updateComponents() {
        const submitShopButton = this.components.get(`${this.id}+submit-shop`);
        if (!(submitShopButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitShopButton.toggle(this.selectedShop != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!(this.selectedShop && this.productName && this.productPrice))
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const newProduct = yield (0, shops_database_1.addProduct)(this.selectedShop.id, {
                    name: this.productName,
                    description: this.productDescription || '',
                    emoji: this.productEmoji || '',
                    price: this.productPrice,
                    amount: (_a = this.productAmount) !== null && _a !== void 0 ? _a : undefined
                });
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно добавили товар ${(0, discord_js_1.bold)((0, shops_database_1.getProductName)(this.selectedShop.id, newProduct.id) || '')} в магазин ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id) || '')}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.AddProductFlow = AddProductFlow;
var AddActionProductFlowStage;
(function (AddActionProductFlowStage) {
    AddActionProductFlowStage[AddActionProductFlowStage["SELECT_SHOP"] = 0] = "SELECT_SHOP";
    AddActionProductFlowStage[AddActionProductFlowStage["SETUP_ACTION"] = 1] = "SETUP_ACTION";
})(AddActionProductFlowStage || (AddActionProductFlowStage = {}));
class AddActionProductFlow extends AddProductFlow {
    constructor() {
        super(...arguments);
        this.id = "add-action-product";
        this.stage = AddActionProductFlowStage.SELECT_SHOP;
        this.componentsByStage = new Map();
        this.productActionType = null;
        this.productAction = null;
        this.actionSetupCompleted = false;
    }
    start(interaction) {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const productActionType = interaction.options.getString('action');
            if (productActionType != null && !(0, shops_types_1.isProductActionType)(productActionType))
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            this.productActionType = productActionType;
            return yield _super.start.call(this, interaction);
        });
    }
    getMessage() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        switch (this.stage) {
            case AddActionProductFlowStage.SELECT_SHOP:
                return super.getMessage();
            case AddActionProductFlowStage.SETUP_ACTION:
                const descString = (this.productDescription) ? `. Описание: ${(0, discord_js_1.bold)(this.productDescription.replaceSpaces())}` : '';
                const productNameString = (0, discord_js_1.bold)(`${this.productEmoji ? `${this.productEmoji} ` : ''}${this.productName}`);
                const productString = `Добавить товар: ${productNameString} за **${this.productPrice} ${(0, currencies_database_1.getCurrencyName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.currency.id) || '[ ]'}** в **[${(0, shops_database_1.getShopName)((_b = this.selectedShop) === null || _b === void 0 ? void 0 : _b.id) || 'Выберите магазин'}]**${descString}`;
                let actionString = '';
                switch (this.productActionType) {
                    case shops_types_1.PRODUCT_ACTION_TYPE.GiveRole:
                        const roleMentionString = ((_d = (_c = this.productAction) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.roleId) ? (0, discord_js_1.roleMention)(((_e = this.productAction) === null || _e === void 0 ? void 0 : _e.options).roleId) : 'Unset';
                        actionString = `выдает роль **[${roleMentionString}]**`;
                        break;
                    case shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency:
                        const productActionAsGiveCurrency = (_f = this.productAction) === null || _f === void 0 ? void 0 : _f.options;
                        const isProductActionGiveCurrency = this.productAction != null && ((_g = this.productAction) === null || _g === void 0 ? void 0 : _g.options) != undefined && ((_h = this.productAction) === null || _h === void 0 ? void 0 : _h.options).amount !== undefined && ((_j = this.productAction) === null || _j === void 0 ? void 0 : _j.options).currencyId !== undefined && productActionAsGiveCurrency != undefined;
                        const amountString = (isProductActionGiveCurrency && productActionAsGiveCurrency.amount >= 0) ? productActionAsGiveCurrency.amount : 'Unset';
                        const currency = (isProductActionGiveCurrency && productActionAsGiveCurrency.currencyId) ? (0, currencies_database_1.getCurrencies)().get(productActionAsGiveCurrency.currencyId) : undefined;
                        const currencyString = (0, currencies_database_1.getCurrencyName)(currency === null || currency === void 0 ? void 0 : currency.id) || '[ ]';
                        actionString = `выдает **[${amountString}]** ${currencyString}`;
                        break;
                    default:
                        break;
                }
                return `${productString}\nДействие: ${actionString}`;
        }
    }
    initComponents() {
        var _a, _b, _c, _d, _e;
        super.initComponents();
        this.componentsByStage.set(AddActionProductFlowStage.SELECT_SHOP, new Map(this.components));
        this.componentsByStage.set(AddActionProductFlowStage.SETUP_ACTION, new Map());
        switch (this.productActionType) {
            case shops_types_1.PRODUCT_ACTION_TYPE.GiveRole:
                const roleSelectMenu = new extended_components_1.ExtendedRoleSelectMenuComponent({
                    customId: `${this.id}+select-role`,
                    placeholder: 'Выберите роль',
                    time: 120000
                }, (interaction, selectedRoleId) => {
                    this.productAction = (0, shops_types_1.createProductAction)(shops_types_1.PRODUCT_ACTION_TYPE.GiveRole, { roleId: selectedRoleId });
                    this.actionSetupCompleted = true;
                    this.updateInteraction(interaction);
                });
                (_a = this.componentsByStage.get(AddActionProductFlowStage.SETUP_ACTION)) === null || _a === void 0 ? void 0 : _a.set(roleSelectMenu.customId, roleSelectMenu);
                break;
            case shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency:
                const currencySelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
                    customId: `${this.id}+select-currency`,
                    placeholder: 'Выберите счет',
                    time: 120000
                }, (0, currencies_database_1.getCurrencies)(), (interaction, selected) => {
                    this.productAction = (0, shops_types_1.createProductAction)(shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency, { currencyId: selected.id, amount: -1 });
                    this.updateInteraction(interaction);
                });
                const setAmountButton = new extended_components_1.ExtendedButtonComponent({
                    customId: `${this.id}+set-amount`,
                    label: 'Укажите стоимость',
                    emoji: { name: '🪙' },
                    style: discord_js_1.ButtonStyle.Secondary,
                    time: 120000
                }, (interaction) => __awaiter(this, void 0, void 0, function* () {
                    const [modalSubmit, input] = yield (0, extended_components_1.showEditModal)(interaction, { edit: 'Amount', previousValue: '0' });
                    const amount = parseInt(input);
                    if (isNaN(amount) || amount < 0)
                        return this.updateInteraction(modalSubmit);
                    this.productAction = (0, shops_types_1.createProductAction)(shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency, {
                        currencyId: this.productAction.options.currencyId,
                        amount
                    });
                    this.actionSetupCompleted = true;
                    this.updateInteraction(modalSubmit);
                }));
                (_b = this.componentsByStage.get(AddActionProductFlowStage.SETUP_ACTION)) === null || _b === void 0 ? void 0 : _b.set(currencySelectMenu.customId, currencySelectMenu);
                (_c = this.componentsByStage.get(AddActionProductFlowStage.SETUP_ACTION)) === null || _c === void 0 ? void 0 : _c.set(setAmountButton.customId, setAmountButton);
                break;
            default:
                break;
        }
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Применить',
            emoji: '✅',
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
            time: 120000
        }, (interaction) => this.success(interaction));
        const changeShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop`,
            label: 'Изменить магазин',
            emoji: { name: '📝' },
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000
        }, (interaction) => {
            this.selectedShop = null;
            this.productAction = null;
            this.actionSetupCompleted = false;
            this.changeStage(AddActionProductFlowStage.SELECT_SHOP);
            this.updateInteraction(interaction);
        });
        (_d = this.componentsByStage.get(AddActionProductFlowStage.SETUP_ACTION)) === null || _d === void 0 ? void 0 : _d.set(submitButton.customId, submitButton);
        (_e = this.componentsByStage.get(AddActionProductFlowStage.SETUP_ACTION)) === null || _e === void 0 ? void 0 : _e.set(changeShopButton.customId, changeShopButton);
    }
    updateComponents() {
        if (this.stage == AddActionProductFlowStage.SELECT_SHOP)
            super.updateComponents();
        if (this.stage == AddActionProductFlowStage.SETUP_ACTION) {
            const setAmountButton = this.components.get(`${this.id}+set-amount`);
            if (setAmountButton instanceof extended_components_1.ExtendedButtonComponent) {
                setAmountButton.toggle(this.productAction != null && this.productAction.type == shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency);
            }
            const submitButton = this.components.get(`${this.id}+submit`);
            if (submitButton instanceof extended_components_1.ExtendedButtonComponent) {
                submitButton.toggle(this.productAction != null && this.actionSetupCompleted);
            }
        }
    }
    changeStage(newStage) {
        this.stage = newStage;
        this.destroyComponentsCollectors();
        this.components = this.componentsByStage.get(newStage) || new Map();
        this.updateComponents();
        if (!this.response)
            return;
        this.createComponentsCollectors(this.response);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stage == AddActionProductFlowStage.SELECT_SHOP) {
                this.changeStage(AddActionProductFlowStage.SETUP_ACTION);
                return this.updateInteraction(interaction);
            }
            try {
                if (!(this.selectedShop && this.productName && this.productPrice != null && this.productAction))
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const newProduct = yield (0, shops_database_1.addProduct)(this.selectedShop.id, {
                    name: this.productName,
                    description: this.productDescription || '',
                    emoji: this.productEmoji || '',
                    price: this.productPrice,
                    action: this.productAction
                });
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно добавили товар ${(0, discord_js_1.bold)((0, shops_database_1.getProductName)(this.selectedShop.id, newProduct.id) || '')} в магазин ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id) || '')} с действием ${(0, discord_js_1.bold)(`${this.productActionType}`)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.AddActionProductFlow = AddActionProductFlow;
var RemoveProductFlowStage;
(function (RemoveProductFlowStage) {
    RemoveProductFlowStage[RemoveProductFlowStage["SELECT_SHOP"] = 0] = "SELECT_SHOP";
    RemoveProductFlowStage[RemoveProductFlowStage["SELECT_PRODUCT"] = 1] = "SELECT_PRODUCT";
})(RemoveProductFlowStage || (RemoveProductFlowStage = {}));
class RemoveProductFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = "remove-product";
        this.components = new Map();
        this.stage = RemoveProductFlowStage.SELECT_SHOP;
        this.componentsByStage = new Map();
        this.selectedShop = null;
        this.selectedProduct = null;
        this.response = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.response = response;
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a, _b, _c, _d;
        if (this.stage == RemoveProductFlowStage.SELECT_SHOP)
            return `Удалить товар из: **[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]**`;
        if (this.stage == RemoveProductFlowStage.SELECT_PRODUCT)
            return `Удалить товар: **[${(0, shops_database_1.getProductName)((_b = this.selectedShop) === null || _b === void 0 ? void 0 : _b.id, (_c = this.selectedProduct) === null || _c === void 0 ? void 0 : _c.id) || 'Выберите товар'}]** из ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)((_d = this.selectedShop) === null || _d === void 0 ? void 0 : _d.id) || '')}`;
        pretty_log_1.PrettyLog.warning(`Неизвестный этап: ${this.stage}`);
        return '';
    }
    initComponents() {
        var _a, _b, _c, _d, _e;
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit-shop`,
            time: 120000,
            label: 'Выбрать',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
        }, (interaction) => {
            if (this.selectedShop.products.size == 0)
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.NoProducts);
            this.changeStage(RemoveProductFlowStage.SELECT_PRODUCT);
            return this.updateInteraction(interaction);
        });
        this.componentsByStage.set(RemoveProductFlowStage.SELECT_SHOP, new Map());
        (_a = this.componentsByStage.get(RemoveProductFlowStage.SELECT_SHOP)) === null || _a === void 0 ? void 0 : _a.set(shopSelectMenu.customId, shopSelectMenu);
        (_b = this.componentsByStage.get(RemoveProductFlowStage.SELECT_SHOP)) === null || _b === void 0 ? void 0 : _b.set(submitShopButton.customId, submitShopButton);
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitShopButton.customId, submitShopButton);
        const productSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-product`,
            placeholder: 'Выберите товар',
            time: 120000
        }, new Map(), (interaction, selected) => {
            this.selectedProduct = selected;
            this.updateInteraction(interaction);
        });
        const submitRemoveButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+remove-product`,
            label: 'Удалить товар',
            emoji: { name: '⛔' },
            style: discord_js_1.ButtonStyle.Danger,
            disabled: true,
            time: 120000
        }, (interaction) => this.success(interaction));
        const changeShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop`,
            label: 'Изменить магазин',
            emoji: { name: '📝' },
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000
        }, (interaction) => {
            this.selectedShop = null;
            this.selectedProduct = null;
            this.changeStage(RemoveProductFlowStage.SELECT_SHOP);
            this.updateInteraction(interaction);
        });
        this.componentsByStage.set(RemoveProductFlowStage.SELECT_PRODUCT, new Map());
        (_c = this.componentsByStage.get(RemoveProductFlowStage.SELECT_PRODUCT)) === null || _c === void 0 ? void 0 : _c.set(productSelectMenu.customId, productSelectMenu);
        (_d = this.componentsByStage.get(RemoveProductFlowStage.SELECT_PRODUCT)) === null || _d === void 0 ? void 0 : _d.set(submitRemoveButton.customId, submitRemoveButton);
        (_e = this.componentsByStage.get(RemoveProductFlowStage.SELECT_PRODUCT)) === null || _e === void 0 ? void 0 : _e.set(changeShopButton.customId, changeShopButton);
    }
    updateComponents() {
        var _a;
        if (this.stage == RemoveProductFlowStage.SELECT_SHOP) {
            const submitShopButton = this.components.get(`${this.id}+submit-shop`);
            if (!(submitShopButton instanceof extended_components_1.ExtendedButtonComponent))
                return;
            submitShopButton.toggle(this.selectedShop != null);
        }
        if (this.stage == RemoveProductFlowStage.SELECT_PRODUCT) {
            const submitRemoveButton = this.components.get(`${this.id}+remove-product`);
            if (submitRemoveButton instanceof extended_components_1.ExtendedButtonComponent) {
                submitRemoveButton.toggle(this.selectedProduct != null);
            }
            const selectProductMenu = this.components.get(`${this.id}+select-product`);
            if (selectProductMenu instanceof extended_components_1.ExtendedStringSelectMenuComponent) {
                selectProductMenu.updateMap(((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.products) || new Map());
            }
        }
    }
    changeStage(newStage) {
        this.stage = newStage;
        this.destroyComponentsCollectors();
        this.components = this.componentsByStage.get(newStage) || new Map();
        this.updateComponents();
        if (!this.response)
            return;
        this.createComponentsCollectors(this.response);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableComponents();
            try {
                if (!this.selectedShop)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.selectedProduct)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const oldProductName = (0, shops_database_1.getProductName)(this.selectedShop.id, this.selectedProduct.id) || '';
                yield (0, shops_database_1.removeProduct)(this.selectedShop.id, this.selectedProduct.id);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно удалили товар ${(0, discord_js_1.bold)(oldProductName)} из магазина ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id) || '')}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.RemoveProductFlow = RemoveProductFlow;
var EditProductFlowStage;
(function (EditProductFlowStage) {
    EditProductFlowStage[EditProductFlowStage["SELECT_SHOP"] = 0] = "SELECT_SHOP";
    EditProductFlowStage[EditProductFlowStage["SELECT_PRODUCT"] = 1] = "SELECT_PRODUCT";
})(EditProductFlowStage || (EditProductFlowStage = {}));
var EditProductOption;
(function (EditProductOption) {
    EditProductOption["NAME"] = "name";
    EditProductOption["DESCRIPTION"] = "description";
    EditProductOption["PRICE"] = "price";
    EditProductOption["EMOJI"] = "emoji";
    EditProductOption["AMOUNT"] = "amount";
})(EditProductOption || (exports.EditProductOption = EditProductOption = {}));
class EditProductFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = "edit-product";
        this.components = new Map();
        this.stage = EditProductFlowStage.SELECT_SHOP;
        this.componentsByStage = new Map();
        this.updateOption = null;
        this.updateOptionValue = null;
        this.selectedShop = null;
        this.selectedProduct = null;
        this.response = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, `Нет магазинов с товарами./n-# Используйте \`/shops-manage create\` для создания нового магазина, и \`/products-manage add\` для добавление товара`);
            const subcommand = interaction.options.getSubcommand();
            if (!subcommand || !Object.values(EditProductOption).includes(subcommand))
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
            this.updateOption = subcommand;
            this.updateOptionValue = this.getUpdateValue(interaction, this.updateOption);
            if (this.updateOptionValue == null)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.response = response;
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a, _b, _c, _d;
        if (this.stage == EditProductFlowStage.SELECT_SHOP)
            return `Изменить товар в ${(0, discord_js_1.bold)(`[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]`)}.\nНовое значение ${(0, discord_js_1.bold)(`${this.updateOption}`)}: ${(0, discord_js_1.bold)(this.getUpdateValueString(this.updateOption))}`;
        if (this.stage == EditProductFlowStage.SELECT_PRODUCT)
            return `Изменить товар: ${(0, discord_js_1.bold)(`[${(0, shops_database_1.getProductName)((_b = this.selectedShop) === null || _b === void 0 ? void 0 : _b.id, (_c = this.selectedProduct) === null || _c === void 0 ? void 0 : _c.id) || 'Выберите товар'}]`)} из ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)((_d = this.selectedShop) === null || _d === void 0 ? void 0 : _d.id) || '')}. \nНовое значение ${(0, discord_js_1.bold)(`${this.updateOption}`)}: ${(0, discord_js_1.bold)(this.getUpdateValueString(this.updateOption))}`;
        pretty_log_1.PrettyLog.warning(`Неизвестный этап: ${this.stage}`);
        return '';
    }
    initComponents() {
        var _a, _b, _c, _d, _e;
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit-shop`,
            time: 120000,
            label: 'Выбрать',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
        }, (interaction) => {
            if (this.selectedShop.products.size == 0)
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.NoProducts);
            this.changeStage(EditProductFlowStage.SELECT_PRODUCT);
            return this.updateInteraction(interaction);
        });
        this.componentsByStage.set(EditProductFlowStage.SELECT_SHOP, new Map());
        (_a = this.componentsByStage.get(EditProductFlowStage.SELECT_SHOP)) === null || _a === void 0 ? void 0 : _a.set(shopSelectMenu.customId, shopSelectMenu);
        (_b = this.componentsByStage.get(EditProductFlowStage.SELECT_SHOP)) === null || _b === void 0 ? void 0 : _b.set(submitShopButton.customId, submitShopButton);
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitShopButton.customId, submitShopButton);
        const productSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-product`,
            placeholder: 'Выберите товар',
            time: 120000
        }, new Map(), (interaction, selected) => {
            this.selectedProduct = selected;
            this.updateInteraction(interaction);
        });
        const submitEditButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+edit-product`,
            time: 120000,
            label: 'Применить',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true
        }, (interaction) => this.success(interaction));
        const changeShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop`,
            time: 120000,
            label: 'Изменить магазин',
            emoji: { name: '📝' },
            style: discord_js_1.ButtonStyle.Secondary
        }, (interaction) => {
            this.selectedShop = null;
            this.selectedProduct = null;
            this.changeStage(EditProductFlowStage.SELECT_SHOP);
            this.updateInteraction(interaction);
        });
        this.componentsByStage.set(EditProductFlowStage.SELECT_PRODUCT, new Map());
        (_c = this.componentsByStage.get(EditProductFlowStage.SELECT_PRODUCT)) === null || _c === void 0 ? void 0 : _c.set(productSelectMenu.customId, productSelectMenu);
        (_d = this.componentsByStage.get(EditProductFlowStage.SELECT_PRODUCT)) === null || _d === void 0 ? void 0 : _d.set(submitEditButton.customId, submitEditButton);
        (_e = this.componentsByStage.get(EditProductFlowStage.SELECT_PRODUCT)) === null || _e === void 0 ? void 0 : _e.set(changeShopButton.customId, changeShopButton);
    }
    updateComponents() {
        var _a;
        if (this.stage == EditProductFlowStage.SELECT_SHOP) {
            const submitShopButton = this.components.get(`${this.id}+submit-shop`);
            if (!(submitShopButton instanceof extended_components_1.ExtendedButtonComponent))
                return;
            submitShopButton.toggle(this.selectedShop != null);
        }
        if (this.stage == EditProductFlowStage.SELECT_PRODUCT) {
            const submitRemoveButton = this.components.get(`${this.id}+edit-product`);
            if (submitRemoveButton instanceof extended_components_1.ExtendedButtonComponent) {
                submitRemoveButton.toggle(this.selectedProduct != null);
            }
            const selectProductMenu = this.components.get(`${this.id}+select-product`);
            if (selectProductMenu instanceof extended_components_1.ExtendedStringSelectMenuComponent) {
                selectProductMenu.updateMap(((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.products) || new Map());
            }
        }
    }
    changeStage(newStage) {
        this.stage = newStage;
        this.destroyComponentsCollectors();
        this.components = this.componentsByStage.get(newStage) || new Map();
        this.updateComponents();
        if (!this.response)
            return;
        this.createComponentsCollectors(this.response);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableComponents();
            try {
                if (!this.selectedShop)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.selectedProduct)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.updateOption || this.updateOptionValue == undefined)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const updateOption = {};
                updateOption[this.updateOption.toString()] = this.updateOptionValue;
                const oldName = (0, shops_database_1.getProductName)(this.selectedShop.id, this.selectedProduct.id) || '';
                yield (0, shops_database_1.updateProduct)(this.selectedShop.id, this.selectedProduct.id, updateOption);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно обновили товар ${(0, discord_js_1.bold)(oldName)} в магазине ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id) || '')}. \nНовое значение ${(0, discord_js_1.bold)(this.updateOption)}: ${(0, discord_js_1.bold)(this.getUpdateValueString(this.updateOption))}`);
            }
            catch (error) {
                yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
                return;
            }
        });
    }
    getUpdateValue(interaction, subcommand) {
        var _a, _b, _c, _d, _e;
        const option = `new-${subcommand}`;
        switch (subcommand) {
            case EditProductOption.NAME:
            case EditProductOption.DESCRIPTION:
                return (_b = (_a = interaction.options.getString(option)) === null || _a === void 0 ? void 0 : _a.replaceSpaces()) !== null && _b !== void 0 ? _b : null;
            case EditProductOption.PRICE:
                const priceString = (_c = interaction.options.getNumber(option)) === null || _c === void 0 ? void 0 : _c.toFixed(2);
                if (priceString == undefined)
                    return null;
                return +priceString;
            case EditProductOption.EMOJI:
                const emojiOption = interaction.options.getString(option);
                return (_e = (_d = emojiOption === null || emojiOption === void 0 ? void 0 : emojiOption.match(constants_1.EMOJI_REGEX)) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : null;
            case EditProductOption.AMOUNT:
                return interaction.options.getInteger(option);
            default:
                (0, utils_1.assertNeverReached)(subcommand);
        }
    }
    getUpdateValueString(subcommand) {
        var _a, _b, _c, _d;
        switch (subcommand) {
            case null:
                return 'unset';
            case EditProductOption.NAME:
            case EditProductOption.DESCRIPTION:
                return (_a = this.updateOptionValue) !== null && _a !== void 0 ? _a : 'unset';
            case EditProductOption.PRICE:
                return `${(_b = this.updateOptionValue) !== null && _b !== void 0 ? _b : 'unset'}`;
            case EditProductOption.EMOJI:
                return (_c = this.updateOptionValue) !== null && _c !== void 0 ? _c : 'unset';
            case EditProductOption.AMOUNT:
                if (this.updateOptionValue == -1)
                    return 'unlimited';
                return `${(_d = this.updateOptionValue) !== null && _d !== void 0 ? _d : 'unset'}`;
            default:
                (0, utils_1.assertNeverReached)(subcommand);
        }
    }
}
exports.EditProductFlow = EditProductFlow;