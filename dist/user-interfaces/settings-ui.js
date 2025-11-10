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
exports.SettingsInterface = void 0;
const discord_js_1 = require("discord.js");
const settings_handler_1 = require("../database/settings/settings-handler");
const utils_1 = require("../utils/utils");
const extended_components_1 = require("./extended-components");
const user_interfaces_1 = require("./user-interfaces");
class SettingsInterface extends user_interfaces_1.PaginatedEmbedUserInterface {
    constructor() {
        super(...arguments);
        this.id = 'settings-ui';
        this.components = new Map();
        this.embed = null;
        this.response = null;
        this.selectedSetting = null;
        this.page = 0;
        this.MAX_FIELDS_PER_PAGE = 12;
    }
    getMessage() {
        return '';
    }
    getInputSize() {
        return (0, settings_handler_1.getSettings)().size;
    }
    initComponents() {
        const settingSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({ customId: 'settings-select-menu', placeholder: 'Edit a setting', time: 120000 }, (0, settings_handler_1.getSettings)(), (interaction, selected) => {
            this.selectedSetting = selected;
            this.updateInteraction(interaction);
        });
        this.components.set('settings-select-menu', settingSelectMenu);
        return;
    }
    updateComponents() {
        this.destroyComponentsCollectors();
        this.clearEditComponents();
        if (!this.selectedSetting) {
            if (this.response)
                this.createComponentsCollectors(this.response);
            return;
        }
        const settingEditorComponents = this.getSettingEditorComponents(this.selectedSetting);
        for (const component of settingEditorComponents) {
            this.components.set(component.customId, component);
        }
        if (!this.response)
            return;
        this.createComponentsCollectors(this.response);
        return;
    }
    initEmbeds(interaction) {
        const settingsEmbed = new discord_js_1.EmbedBuilder()
            .setTitle('⚙️ Настройки')
            .setDescription('Вы можете изменить настройки здесь')
            .setColor(discord_js_1.Colors.DarkButNotBlack);
        settingsEmbed.addFields(this.getPageEmbedFields());
        this.embed = settingsEmbed;
    }
    updateEmbeds() {
        if (!this.embed)
            return;
        this.embed.setFields(this.getPageEmbedFields());
    }
    getEmbedFields() {
        const settings = (0, settings_handler_1.getSettings)();
        const fields = [];
        settings.forEach(setting => {
            const { name, type, value } = setting;
            if (value === undefined || value === "") {
                fields.push({ name, value: "Не выбрано", inline: true });
                return;
            }
            const displayValue = type === 'string' ? value :
                type === 'bool' ? (value ? '✅' : '❌') :
                    type === 'number' ? `${value}` :
                        type === 'enum' ? value :
                            type === 'channelId' ? (0, discord_js_1.channelMention)(value) :
                                type === 'roleId' ? (0, discord_js_1.roleMention)(value) :
                                    type === 'userId' ? (0, discord_js_1.userMention)(value) :
                                        (0, utils_1.assertNeverReached)(type);
            fields.push({ name, value: displayValue, inline: true });
        });
        return fields;
    }
    getSettingEditorComponents(setting) {
        let components = [];
        switch (setting.type) {
            case 'string':
                const showStringEditModalButton = new extended_components_1.ExtendedButtonComponent({
                    customId: 'edit-setting+string',
                    label: `Изменить ${setting.name}`,
                    emoji: '📝',
                    style: discord_js_1.ButtonStyle.Primary,
                    time: 120000
                }, (interaction) => __awaiter(this, void 0, void 0, function* () {
                    const [modalSubmit, newValue] = yield (0, extended_components_1.showEditModal)(interaction, { edit: setting.name, previousValue: setting.value });
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, newValue);
                    this.updateInteraction(modalSubmit);
                }));
                components.push(showStringEditModalButton);
                break;
            case 'bool':
                const toggleButton = new extended_components_1.ExtendedButtonComponent({
                    customId: 'edit-setting+bool',
                    label: `${setting.value ? 'Выкл' : 'Вкл'} ${setting.name}`,
                    emoji: setting.value ? '✖️' : '✅',
                    style: setting.value ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success,
                    time: 120000
                }, (interaction) => __awaiter(this, void 0, void 0, function* () {
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, !setting.value);
                    this.updateInteraction(interaction);
                }));
                components.push(toggleButton);
                break;
            case 'number':
                const showNumberEditModalButton = new extended_components_1.ExtendedButtonComponent({
                    customId: 'edit-setting+number',
                    label: `Изменить ${setting.name}`,
                    emoji: '📝',
                    style: discord_js_1.ButtonStyle.Primary,
                    time: 120000
                }, (interaction) => __awaiter(this, void 0, void 0, function* () {
                    const [modalSubmit, newValue] = yield (0, extended_components_1.showEditModal)(interaction, { edit: setting.name, previousValue: (0, utils_1.toStringOrUndefined)(setting.value) });
                    if (!newValue && newValue == "")
                        return this.updateInteraction(interaction);
                    const newValueAsNumber = Number(newValue);
                    if (isNaN(newValueAsNumber))
                        return this.updateInteraction(interaction);
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, newValue);
                    this.updateInteraction(modalSubmit);
                }));
                components.push(showNumberEditModalButton);
                break;
            case 'channelId':
                const channelSelectMenu = new extended_components_1.ExtendedChannelSelectMenuComponent({
                    customId: 'edit-setting+channel',
                    placeholder: `Выберите канал для ${setting.name}`,
                    time: 120000,
                    channelTypes: [discord_js_1.ChannelType.GuildText]
                }, (interaction, selectedChannelId) => __awaiter(this, void 0, void 0, function* () {
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, selectedChannelId);
                    this.updateInteraction(interaction);
                }));
                components.push(channelSelectMenu);
                break;
            case 'roleId':
                const roleSelectMenu = new extended_components_1.ExtendedRoleSelectMenuComponent({
                    customId: 'edit-setting+role',
                    placeholder: `Выберите роль для ${setting.name}`,
                    time: 120000
                }, (interaction, selectedRoleId) => __awaiter(this, void 0, void 0, function* () {
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, selectedRoleId);
                    this.updateInteraction(interaction);
                }));
                components.push(roleSelectMenu);
                break;
            case 'userId':
                const userSelectMenu = new extended_components_1.ExtendedUserSelectMenuComponent({
                    customId: 'edit-setting+user',
                    placeholder: `Выберите пользователя для ${setting.name}`,
                    time: 120000
                }, (interaction, selectedUserId) => __awaiter(this, void 0, void 0, function* () {
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, selectedUserId);
                    this.updateInteraction(interaction);
                }));
                components.push(userSelectMenu);
                break;
            case 'enum':
                const optionSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
                    customId: 'edit-setting+enum',
                    placeholder: `Выберите опцию для ${setting.name}`,
                    time: 120000
                }, new Map(setting.options.map(option => [option, option])), (interaction, selectedOption) => __awaiter(this, void 0, void 0, function* () {
                    this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, selectedOption);
                    this.updateInteraction(interaction);
                }));
                components.push(optionSelectMenu);
                break;
            default:
                (0, utils_1.assertNeverReached)(setting);
        }
        const resetSettingButton = new extended_components_1.ExtendedButtonComponent({
            customId: 'edit-setting+reset-button',
            label: `Перезапустить ${setting.name}`,
            emoji: '🗑️',
            style: discord_js_1.ButtonStyle.Danger,
            time: 120000
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            this.selectedSetting = yield (0, settings_handler_1.setSetting)(setting.id, undefined);
            this.updateInteraction(interaction);
        }));
        const returnButton = new extended_components_1.ExtendedButtonComponent({
            customId: 'edit-setting+return-button',
            label: 'Вернуться',
            emoji: '⬅️',
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            this.selectedSetting = null;
            this.updateInteraction(interaction);
        }));
        components.push(resetSettingButton);
        components.push(returnButton);
        return components;
    }
    clearEditComponents() {
        const editSettingsComponentsIds = [...this.components.keys()].filter(id => id.startsWith('edit-setting'));
        if (editSettingsComponentsIds.length === 0)
            return;
        for (const id of editSettingsComponentsIds) {
            this.components.delete(id);
        }
    }
}
exports.SettingsInterface = SettingsInterface;