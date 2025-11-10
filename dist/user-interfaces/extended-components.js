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
exports.ExtendedUserSelectMenuComponent = exports.ExtendedRoleSelectMenuComponent = exports.ExtendedChannelSelectMenuComponent = exports.ExtendedSelectMenuComponent = exports.ExtendedStringSelectMenuComponent = exports.ExtendedButtonComponent = exports.ExtendedComponent = void 0;
exports.showConfirmationModal = showConfirmationModal;
exports.showEditModal = showEditModal;
const discord_js_1 = require("discord.js");
const settings_types_1 = require("../database/settings/settings-types");
class ExtendedComponent {
    constructor() {
        this.collector = null;
    }
    createCollector(response) {
        var _a, _b;
        const filter = (interaction) => interaction.customId === this.customId;
        const collector = (_b = (_a = response.resource) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.createMessageComponentCollector({ componentType: this.componentType, time: this.time, filter });
        this.collector = collector;
        if (collector == undefined)
            return;
        collector.on('collect', (interaction) => this.onCollect(interaction));
        collector.on('end', (collected) => this.onEnd(collected));
    }
    destroyCollector() {
        if (this.collector == null)
            return;
        this.collector.stop();
        this.collector = null;
    }
    getComponent() {
        return this.component;
    }
    toggle(enabled) {
        if (enabled == undefined)
            enabled = !this.component.data.disabled;
        this.component.setDisabled(!enabled);
    }
}
exports.ExtendedComponent = ExtendedComponent;
class ExtendedButtonComponent extends ExtendedComponent {
    constructor({ customId, time, label, emoji, style, disabled }, callback) {
        super();
        this.componentType = discord_js_1.ComponentType.Button;
        this.customId = customId;
        this.component = new discord_js_1.ButtonBuilder()
            .setStyle(style)
            .setDisabled(disabled !== null && disabled !== void 0 ? disabled : false)
            .setCustomId(customId);
        if (label)
            this.component.setLabel(label);
        if (emoji)
            this.component.setEmoji(emoji);
        this.callback = callback;
        this.time = time;
    }
    onCollect(interaction) {
        this.callback(interaction);
    }
    onEnd(collected) { }
}
exports.ExtendedButtonComponent = ExtendedButtonComponent;
class ExtendedStringSelectMenuComponent extends ExtendedComponent {
    constructor({ customId, placeholder, time }, map, callback) {
        super();
        this.componentType = discord_js_1.ComponentType.StringSelect;
        this.customId = customId;
        this.map = map;
        this.component = this.createSelectMenu(customId, placeholder, map);
        this.callback = callback;
        this.time = time;
    }
    onCollect(interaction) {
        if (!interaction.isStringSelectMenu())
            return;
        const selected = this.map.get(interaction.values[0]);
        if (selected == undefined)
            return;
        this.callback(interaction, selected);
    }
    onEnd(collected) { }
    createSelectMenu(id, placeholder, map) {
        const selectMenu = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(id)
            .setPlaceholder(placeholder)
            .addOptions(this.getStringSelectOptions(map));
        return selectMenu;
    }
    getStringSelectOptions(map) {
        const options = [];
        map.forEach((value, key) => {
            const label = (typeof value === 'string') ? value : value.name.removeCustomEmojis().ellipsis(100);
            const option = new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setValue(key);
            if (typeof value !== 'string' && !(0, settings_types_1.isSetting)(value) && value.emoji != '')
                option.setEmoji(value.emoji);
            options.push(option);
        });
        return options;
    }
    updateMap(map) {
        this.map = map;
        this.component.setOptions(this.getStringSelectOptions(map));
    }
}
exports.ExtendedStringSelectMenuComponent = ExtendedStringSelectMenuComponent;
class ExtendedSelectMenuComponent extends ExtendedComponent {
    constructor({ customId, time }, callback) {
        super();
        this.customId = customId;
        this.callback = callback;
        this.time = time;
    }
    onCollect(interaction) {
        const selected = interaction.values[0];
        if (selected == undefined)
            return;
        this.callback(interaction, selected);
    }
    onEnd(collected) { }
}
exports.ExtendedSelectMenuComponent = ExtendedSelectMenuComponent;
class ExtendedChannelSelectMenuComponent extends ExtendedSelectMenuComponent {
    constructor({ customId, placeholder, time, channelTypes }, callback) {
        super({ customId, time }, callback);
        this.componentType = discord_js_1.ComponentType.ChannelSelect;
        this.component = new discord_js_1.ChannelSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder);
        if (channelTypes)
            this.component.setChannelTypes(channelTypes);
    }
}
exports.ExtendedChannelSelectMenuComponent = ExtendedChannelSelectMenuComponent;
class ExtendedRoleSelectMenuComponent extends ExtendedSelectMenuComponent {
    constructor({ customId, placeholder, time }, callback) {
        super({ customId, time }, callback);
        this.componentType = discord_js_1.ComponentType.RoleSelect;
        this.component = new discord_js_1.RoleSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder);
    }
}
exports.ExtendedRoleSelectMenuComponent = ExtendedRoleSelectMenuComponent;
class ExtendedUserSelectMenuComponent extends ExtendedSelectMenuComponent {
    constructor({ customId, placeholder, time }, callback) {
        super({ customId, time }, callback);
        this.componentType = discord_js_1.ComponentType.UserSelect;
        this.component = new discord_js_1.UserSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder);
    }
}
exports.ExtendedUserSelectMenuComponent = ExtendedUserSelectMenuComponent;
function showConfirmationModal(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const modalId = 'confirmation-modal';
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(modalId)
            .setTitle('⚠️ Уверены?');
        const confirmationInput = new discord_js_1.TextInputBuilder()
            .setCustomId('confirm-empty-input')
            .setLabel('Это действие откатить не выйдет')
            .setPlaceholder('Введите \'да\' для подтверждения')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(confirmationInput));
        yield interaction.showModal(modal);
        const filter = (interaction) => interaction.customId === modalId;
        const modalSubmit = yield interaction.awaitModalSubmit({ filter, time: 120000 });
        if (!modalSubmit.isFromMessage())
            return [modalSubmit, false];
        yield modalSubmit.deferUpdate();
        return [modalSubmit, modalSubmit.fields.getTextInputValue('confirm-empty-input').toLowerCase().substring(0, 2) == 'да'];
    });
}
function showEditModal(interaction_1, _a) {
    return __awaiter(this, arguments, void 0, function* (interaction, { edit, previousValue, required, minLength, maxLength }) {
        const editNormalized = `${edit.toLocaleLowerCase().replaceSpaces('-')}`;
        const modalId = `edit-${editNormalized}-modal`;
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(modalId)
            .setTitle(`Изменить ${edit}`);
        const input = new discord_js_1.TextInputBuilder()
            .setCustomId(`${editNormalized}-input`)
            .setLabel(`Изменить ${edit}`)
            .setPlaceholder(previousValue !== null && previousValue !== void 0 ? previousValue : edit)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(required !== null && required !== void 0 ? required : true)
            .setMaxLength(maxLength !== null && maxLength !== void 0 ? maxLength : 120)
            .setMinLength(minLength !== null && minLength !== void 0 ? minLength : 0);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(input));
        yield interaction.showModal(modal);
        const filter = (interaction) => interaction.customId === modalId;
        const modalSubmit = yield interaction.awaitModalSubmit({ filter, time: 120000 });
        if (!modalSubmit.isFromMessage())
            return [modalSubmit, ''];
        yield modalSubmit.deferUpdate();
        return [modalSubmit, modalSubmit.fields.getTextInputValue(`${editNormalized}-input`)];
    });
}