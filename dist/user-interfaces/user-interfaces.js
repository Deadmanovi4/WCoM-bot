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
exports.PaginatedMultipleEmbedUserInterface = exports.MultipleEmbedUserInterface = exports.PaginatedEmbedUserInterface = exports.EmbedUserInterface = exports.MessageUserInterface = exports.UserInterface = void 0;
const discord_js_1 = require("discord.js");
const discord_1 = require("../utils/discord");
const extended_components_1 = require("./extended-components");
const selectMenuComponents = [discord_js_1.ComponentType.MentionableSelect, discord_js_1.ComponentType.StringSelect, discord_js_1.ComponentType.RoleSelect, discord_js_1.ComponentType.UserSelect, discord_js_1.ComponentType.ChannelSelect];
class UserInterface {
    getComponentRows() {
        const rows = [];
        const paginationRow = new discord_js_1.ActionRowBuilder();
        this.components.forEach((component) => {
            var _a;
            if (component.customId.endsWith('page')) {
                paginationRow.addComponents(component.getComponent());
            }
            else if (component.componentType == discord_js_1.ComponentType.Button) {
                if (rows.length == 0) {
                    rows.push(new discord_js_1.ActionRowBuilder().addComponents(component.getComponent()));
                }
                else {
                    const lastRow = rows[rows.length - 1];
                    const lastRowFirstComponentType = (_a = lastRow.components[0]) === null || _a === void 0 ? void 0 : _a.data.type;
                    if (lastRowFirstComponentType && selectMenuComponents.includes(lastRowFirstComponentType)) {
                        rows.push(new discord_js_1.ActionRowBuilder().addComponents(component.getComponent()));
                    }
                    else {
                        lastRow.addComponents(component.getComponent());
                    }
                }
            }
            else if (selectMenuComponents.includes(component.componentType)) {
                rows.push(new discord_js_1.ActionRowBuilder().addComponents(component.getComponent()));
            }
        });
        if (paginationRow.components.length > 0) {
            rows.push(paginationRow);
        }
        return rows;
    }
    getInteractionUpdateOptions() {
        return { content: this.getMessage(), components: this.getComponentRows() };
    }
    updateInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateComponents();
            if (interaction.deferred) {
                yield interaction.editReply(this.getInteractionUpdateOptions());
                return;
            }
            try {
                if (interaction.isMessageComponent() || (interaction.isModalSubmit() && interaction.isFromMessage())) {
                    interaction.update(this.getInteractionUpdateOptions());
                    return;
                }
                interaction.editReply(this.getInteractionUpdateOptions());
            }
            catch (error) {
                if (interaction.replied) {
                    (0, discord_1.updateAsErrorMessage)(interaction);
                }
                else {
                    (0, discord_1.replyErrorMessage)(interaction);
                }
            }
        });
    }
    createComponentsCollectors(response) {
        this.components.forEach((component) => {
            component.createCollector(response);
        });
    }
    destroyComponentsCollectors() {
        this.components.forEach((component) => {
            component.destroyCollector();
        });
    }
    disableComponents() {
        this.components.forEach((component) => {
            component.toggle(false);
        });
    }
}
exports.UserInterface = UserInterface;
class MessageUserInterface extends UserInterface {
    predisplay(interaction) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setup(_interaction) {
        this.initComponents();
        this.updateComponents();
    }
    display(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.predisplay(interaction);
            this.setup(interaction);
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
}
exports.MessageUserInterface = MessageUserInterface;
class EmbedUserInterface extends MessageUserInterface {
    setup(interaction) {
        this.initComponents();
        this.initEmbeds(interaction);
        this.updateComponents();
        this.updateEmbeds();
    }
    reset() { }
    display(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.predisplay(interaction);
            this.setup(interaction);
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), embeds: this.getEmbeds(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getInteractionUpdateOptions() {
        return { content: this.getMessage(), components: this.getComponentRows(), embeds: this.getEmbeds() };
    }
    updateInteraction(interaction) {
        const _super = Object.create(null, {
            updateInteraction: { get: () => super.updateInteraction }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.updateEmbeds();
            _super.updateInteraction.call(this, interaction);
        });
    }
    getEmbeds() {
        return this.embed ? [this.embed] : [];
    }
}
exports.EmbedUserInterface = EmbedUserInterface;
function Paginated(Base) {
    class Paginated extends Base {
        constructor() {
            super(...arguments);
            this.MAX_FIELDS_PER_PAGE = 9;
        }
        setup(interaction) {
            super.setup(interaction);
            this.paginationUpdate();
        }
        reset() {
            super.reset();
            this.page = 0;
        }
        display(interaction) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.predisplay(interaction);
                this.setup(interaction);
                const response = yield interaction.reply({ embeds: this.getEmbeds(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
                this.createComponentsCollectors(response);
                this.response = response;
                return;
            });
        }
        updateInteraction(interaction) {
            const _super = Object.create(null, {
                updateInteraction: { get: () => super.updateInteraction }
            });
            return __awaiter(this, void 0, void 0, function* () {
                this.paginationUpdate();
                _super.updateInteraction.call(this, interaction);
            });
        }
        getPaginationButtons() {
            return [
                new extended_components_1.ExtendedButtonComponent({
                    customId: `${this.id}+previous-page`,
                    time: 120000,
                    emoji: '⬅️',
                    style: discord_js_1.ButtonStyle.Secondary,
                }, (interaction) => this.previousPage(interaction)),
                new extended_components_1.ExtendedButtonComponent({
                    customId: `${this.id}+next-page`,
                    time: 120000,
                    emoji: { name: '➡️' },
                    style: discord_js_1.ButtonStyle.Secondary,
                }, (interaction) => this.nextPage(interaction))
            ];
        }
        getPageEmbedFields() {
            return this.getEmbedFields().slice(this.page * this.MAX_FIELDS_PER_PAGE, (this.page + 1) * this.MAX_FIELDS_PER_PAGE);
        }
        paginationUpdate() {
            const pageCount = this.getPageCount();
            if (this.embed) {
                if (pageCount > 1) {
                    this.embed.setFooter({ text: `Страница ${this.page + 1}/${pageCount}` });
                }
                else {
                    this.embed.setFooter(null);
                }
                this.embed.setFields(this.getPageEmbedFields());
            }
            const paginationButtons = this.getPaginationButtons();
            if (pageCount > 1) {
                if (this.response) {
                    this.destroyComponentsCollectors();
                }
                paginationButtons[0].toggle(this.page > 0);
                paginationButtons[1].toggle(this.page < pageCount - 1);
                this.components.set(paginationButtons[0].customId, paginationButtons[0]);
                this.components.set(paginationButtons[1].customId, paginationButtons[1]);
                if (this.response) {
                    this.createComponentsCollectors(this.response);
                }
            }
            else {
                if (this.response) {
                    this.destroyComponentsCollectors();
                }
                this.components.delete(paginationButtons[0].customId);
                this.components.delete(paginationButtons[1].customId);
                if (this.response) {
                    this.createComponentsCollectors(this.response);
                }
            }
        }
        previousPage(interaction) {
            if (this.page == 0)
                return this.updateInteraction(interaction);
            this.page -= 1;
            return this.updateInteraction(interaction);
        }
        nextPage(interaction) {
            const pageCount = this.getPageCount();
            if (this.page == pageCount - 1)
                return this.updateInteraction(interaction);
            this.page += 1;
            return this.updateInteraction(interaction);
        }
        getPageCount() {
            return Math.max(Math.ceil(this.getInputSize() / this.MAX_FIELDS_PER_PAGE), 1);
        }
    }
    return Paginated;
}
function Multiple(Base) {
    class Multiple extends Base {
        changeDisplayMode(interaction, newMode) {
            this.mode = newMode;
            this.reset();
            if (!this.embedByMode.has(this.mode))
                throw new Error(`Нет связи для режима ${this.mode}`);
            this.embed = this.embedByMode.get(this.mode);
            this.embed.setFields(this.getEmbedFields());
            this.updateEmbeds();
            this.updateComponents();
            this.updateInteraction(interaction);
        }
        setup(interaction) {
            super.setup(interaction);
            if (!this.mode) {
                this.mode = this.modes[Object.keys(this.modes)[0]];
            }
        }
    }
    return Multiple;
}
exports.PaginatedEmbedUserInterface = Paginated(EmbedUserInterface);
exports.MultipleEmbedUserInterface = Multiple(EmbedUserInterface);
exports.PaginatedMultipleEmbedUserInterface = Paginated(Multiple(EmbedUserInterface));