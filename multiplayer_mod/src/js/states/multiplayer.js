import { MultiplayerPacketTypes, FlagPacketFlags } from "../multiplayer/multiplayer_packets";
import { MultiplayerConnection } from "./multiplayer_ingame";

const cachebust = shapezAPI.exports.cachebust;
const isSupportedBrowser = shapezAPI.exports.isSupportedBrowser;
const startFileChoose = shapezAPI.exports.startFileChoose;
const waitNextFrame = shapezAPI.exports.waitNextFrame;
const removeAllChildren = shapezAPI.exports.removeAllChildren;
const makeButton = shapezAPI.exports.makeButton;
const makeDiv = shapezAPI.exports.makeDiv;
const getApplicationSettingById = shapezAPI.exports.getApplicationSettingById;
const formatSecondsToTimeAgo = shapezAPI.exports.formatSecondsToTimeAgo;
const generateFileDownload = shapezAPI.exports.generateFileDownload;
const GameLoadingOverlay = shapezAPI.exports.GameLoadingOverlay;

const ReadWriteProxy = shapezAPI.exports.ReadWriteProxy;
const HUDModalDialogs = shapezAPI.exports.HUDModalDialogs;
const THIRDPARTY_URLS = shapezAPI.exports.THIRDPARTY_URLS;
const A_B_TESTING_LINK_TYPE = shapezAPI.exports.A_B_TESTING_LINK_TYPE;
const EnumSetting = shapezAPI.exports.EnumSetting;
const FormElementInput = shapezAPI.exports.FormElementInput;
const SavegameMetadata = shapezAPI.exports.SavegameMetadata;
const DialogWithForm = shapezAPI.exports.DialogWithForm;
const Dialog = shapezAPI.exports.Dialog;

const globalConfig = shapezAPI.exports.globalConfig;
const trim = require("trim");
const io = require("socket.io-client");
const wrtc = require("wrtc");
const Peer = require("simple-peer");

export class MultiplayerState extends shapezAPI.exports.GameState {
        constructor() {
            super("MultiplayerState");
        }

        getInnerHTML() {
                const bannerHtml = `
            <h3>${shapezAPI.translations.demoBanners.title}</h3>
            <p>${shapezAPI.translations.demoBanners.intro}</p>
            <a href="#" class="steamLink ${A_B_TESTING_LINK_TYPE}" target="_blank">Get the shapez.io standalone!</a>
        `;

                const showDemoBadges = this.app.restrictionMgr.getIsStandaloneMarketingActive();

                return `
            <div class="topButtons">
                <button class="languageChoose" data-languageicon="${this.app.settings.getLanguage()}"></button>
                <button class="settingsButton"></button>
                ${this.getExtraTopButtons()}
            ${
				G_IS_STANDALONE || G_IS_DEV
					? `
                <button class="exitAppButton"></button>
            `
					: ""
			}
            </div>

            <video autoplay muted loop class="fullscreenBackgroundVideo">
                <source src="${cachebust("res/bg_render.webm")}" type="video/webm">
            </video>

            <div class="logo">
                <img src="${cachebust("res/logo.png")}" alt="shapez.io Logo">
                <span class="updateLabel">v${G_BUILD_VERSION}</span>
            </div>

            <div class="mainWrapper ${showDemoBadges ? "demo" : "noDemo"}">
                <div class="sideContainer">
                    ${showDemoBadges ? `<div class="standaloneBanner">${bannerHtml}</div>` : ""}
                </div>

                <div class="mainContainer">
                    ${isSupportedBrowser() ? "" : `<div class="browserWarning">${shapezAPI.translations.mainMenu.browserWarning}</div>`}
                    <div class="buttons"></div>
                </div>
			</div>
			<div class="footer"></div>
        `;
	}

	getExtraTopButtons() {
		let html = "";
		for (let i = 0; i < MultiplayerState.extraTopButtons.length; i++) {
			const extraButton = MultiplayerState.extraTopButtons[i];
			html += `<button class="${extraButton.htmlClass}" ${extraButton.htmlData}></button>`;
		}
		return html;
	}

	/**
	 * Asks the user to import a savegame
	 */
	requestImportSavegame() {
		if (this.app.savegameMgr.getSavegamesMetaData().length > 0 && !this.app.restrictionMgr.getHasUnlimitedSavegames()) {
			this.app.analytics.trackUiClick("importgame_slot_limit_show");
			this.showSavegameSlotLimit();
			return;
		}

		// Create a 'fake' file-input to accept savegames
		startFileChoose(".bin").then((file) => {
			if (file) {
				const closeLoader = this.dialogs.showLoadingDialog();
				waitNextFrame().then(() => {
					this.app.analytics.trackUiClick("import_savegame");
					const reader = new FileReader();
					reader.addEventListener("load", (event) => {
						const contents = event.target.result;
						let realContent;

						try {
							realContent = ReadWriteProxy.deserializeObject(contents);
						} catch (err) {
							closeLoader();
							this.dialogs.showWarning(shapezAPI.translations.dialogs.importSavegameError.title, shapezAPI.translations.dialogs.importSavegameError.text + "<br><br>" + err);
							return;
						}

						this.app.savegameMgr.importSavegame(realContent).then(
							() => {
								closeLoader();
								this.dialogs.showWarning(shapezAPI.translations.dialogs.importSavegameSuccess.title, shapezAPI.translations.dialogs.importSavegameSuccess.text);

								this.renderMainMenu();
								this.renderSavegames();
							},
							(err) => {
								closeLoader();
								this.dialogs.showWarning(shapezAPI.translations.dialogs.importSavegameError.title, shapezAPI.translations.dialogs.importSavegameError.text + ":<br><br>" + err);
							}
						);
					});
					reader.addEventListener("error", (error) => {
						this.dialogs.showWarning(shapezAPI.translations.dialogs.importSavegameError.title, shapezAPI.translations.dialogs.importSavegameError.text + ":<br><br>" + error);
					});
					reader.readAsText(file, "utf-8");
				});
			}
		});
	}

	onBackButton() {
		this.app.platformWrapper.exitApp();
	}

	onEnter(payload) {
		this.dialogs = new HUDModalDialogs(null, this.app);
		const dialogsElement = document.body.querySelector(".modalDialogParent");
		this.dialogs.initializeToElement(dialogsElement);

		if (payload.loadError) {
			this.dialogs.showWarning(shapezAPI.translations.dialogs.gameLoadFailure.title, shapezAPI.translations.dialogs.gameLoadFailure.text + "<br><br>" + payload.loadError);
		}

		const qs = this.htmlElement.querySelector.bind(this.htmlElement);

		if (G_IS_DEV && globalConfig.debug.fastGameEnter) {
			const games = this.app.savegameMgr.getSavegamesMetaData();
			if (games.length > 0 && globalConfig.debug.resumeGameOnFastEnter) {
				this.resumeGame(games[0]);
			} else {
				this.onPlayButtonClicked();
			}
		}

		// Initialize video
		this.videoElement = this.htmlElement.querySelector("video");
		this.videoElement.playbackRate = 0.9;
		this.videoElement.addEventListener("canplay", () => {
			if (this.videoElement) {
				this.videoElement.classList.add("loaded");
			}
		});

		for (let i = 0; i < MultiplayerState.extraTrackClicks.length; i++) {
			const trackClick = MultiplayerState.extraTrackClicks[i];
			this.trackClicks(this.htmlElement.querySelector(trackClick.htmlElement), trackClick.action(this), trackClick.options);
		}
		this.trackClicks(qs(".settingsButton"), this.onSettingsButtonClicked);
		this.trackClicks(qs(".languageChoose"), this.onLanguageChooseClicked);

		if (G_IS_STANDALONE) {
			this.trackClicks(qs(".exitAppButton"), this.onExitAppButtonClicked);
		}

		this.renderMainMenu();
		this.renderSavegames();
	}

	renderMainMenu() {
		const buttonContainer = this.htmlElement.querySelector(".mainContainer .buttons");
		removeAllChildren(buttonContainer);
		// Join game
		const joinButton = makeButton(buttonContainer, ["joinButton", "styledButton"], shapezAPI.translations.multiplayer.join);
		this.trackClicks(joinButton, this.onJoinButtonClicked);

		// Back game
		const backButton = makeButton(buttonContainer, ["backButton", "styledButton"], shapezAPI.translations.multiplayer.back);
		this.trackClicks(backButton, this.onBackButtonClicked);

		for (let i = 0; i < MultiplayerState.extraSmallButtons.length; i++) {
			const extraButton = MultiplayerState.extraSmallButtons[i];
			const button = makeButton(this.htmlElement.querySelector(".mainContainer .outer"), [extraButton.htmlClass, "styledButton"], extraButton.text);
			this.trackClicks(button, extraButton.action(this));
		}
	}

	onSteamLinkClicked() {
		this.app.analytics.trackUiClick("main_menu_steam_link_" + A_B_TESTING_LINK_TYPE);
		this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.standaloneStorePage + "?ref=mmsl2&prc=" + A_B_TESTING_LINK_TYPE);

		return false;
	}

	onExitAppButtonClicked() {
		this.app.platformWrapper.exitApp();
	}

	onChangelogClicked() {
		this.moveToState("ChangelogState");
	}

	onRedditClicked() {
		this.app.analytics.trackUiClick("main_menu_reddit_link");
		this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.reddit);
	}

	onLanguageChooseClicked() {
		this.app.analytics.trackUiClick("choose_language");
		const setting = /** @type {EnumSetting} */ (getApplicationSettingById("language"));

		const { optionSelected } = this.dialogs.showOptionChooser(shapezAPI.translations.settings.labels.language.title, {
			active: this.app.settings.getLanguage(),
			options: setting.options.map((option) => ({
				value: setting.valueGetter(option),
				text: setting.textGetter(option),
				desc: setting.descGetter(option),
				iconPrefix: setting.iconPrefix,
			})),
		});

		optionSelected.add((value) => {
			this.app.settings.updateLanguage(value).then(() => {
				if (setting.restartRequired) {
					if (this.app.platformWrapper.getSupportsRestart()) {
						this.app.platformWrapper.performRestart();
					} else {
						this.dialogs.showInfo(shapezAPI.translations.dialogs.restartRequired.title, shapezAPI.translations.dialogs.restartRequired.text, ["ok:good"]);
					}
				}

				if (setting.changeCb) {
					setting.changeCb(this.app, value);
				}
			});

			// Update current icon
			this.htmlElement.querySelector("button.languageChoose").setAttribute("data-languageIcon", value);
		}, this);
	}

	get savedGames() {
		return this.app.savegameMgr.getSavegamesMetaData();
	}

	renderSavegames() {
		const oldContainer = this.htmlElement.querySelector(".mainContainer .savegames");
		if (oldContainer) {
			oldContainer.remove();
		}
		const games = this.savedGames;
		if (games.length > 0) {
			const parent = makeDiv(this.htmlElement.querySelector(".mainContainer"), null, ["savegames"]);

			for (let i = 0; i < games.length; ++i) {
				const elem = makeDiv(parent, null, ["savegame"]);

				makeDiv(elem, null, ["playtime"], formatSecondsToTimeAgo((new Date().getTime() - games[i].lastUpdate) / 1000.0));

				makeDiv(elem, null, ["level"], games[i].level ? shapezAPI.translations.mainMenu.savegameLevel.replace("<x>", "" + games[i].level) : shapezAPI.translations.mainMenu.savegameLevelUnknown);

				const name = makeDiv(elem, null, ["name"], "<span>" + (games[i].name ? games[i].name : shapezAPI.translations.mainMenu.savegameUnnamed) + "</span>");

				const deleteButton = document.createElement("button");
				deleteButton.classList.add("styledButton", "deleteGame");
				elem.appendChild(deleteButton);

				const downloadButton = document.createElement("button");
				downloadButton.classList.add("styledButton", "downloadGame");
				elem.appendChild(downloadButton);

				const renameButton = document.createElement("button");
				renameButton.classList.add("styledButton", "renameGame");
				name.appendChild(renameButton);

				const resumeButton = document.createElement("button");
				resumeButton.classList.add("styledButton", "resumeGame");
				elem.appendChild(resumeButton);

				this.trackClicks(deleteButton, () => this.deleteGame(games[i]));
				this.trackClicks(downloadButton, () => this.downloadGame(games[i]));
				this.trackClicks(resumeButton, () => this.resumeGame(games[i]));
				this.trackClicks(renameButton, () => this.requestRenameSavegame(games[i]));
			}
		}
	}

	/**
	 * @param {SavegameMetadata} game
	 */
	requestRenameSavegame(game) {
		const regex = /^[a-zA-Z0-9_\- ]{1,20}$/;

		const nameInput = new FormElementInput({
			id: "nameInput",
			label: null,
			placeholder: "",
			defaultValue: game.name || "",
			validator: (val) => val.match(regex) && trim(val).length > 0,
		});
		const dialog = new DialogWithForm({
			app: this.app,
			title: shapezAPI.translations.dialogs.renameSavegame.title,
			desc: shapezAPI.translations.dialogs.renameSavegame.desc,
			formElements: [nameInput],
			buttons: ["cancel:bad:escape", "ok:good:enter"],
		});
		this.dialogs.internalShowDialog(dialog);

		// When confirmed, save the name
		dialog.buttonSignals.ok.add(() => {
			game.name = trim(nameInput.getValue());
			this.app.savegameMgr.writeAsync();
			this.renderSavegames();
		});
	}

	/**
	 * @param {SavegameMetadata} game
	 */
	resumeGame(game) {
		const hostInput = new FormElementInput({
			id: "hostInput",
			label: null,
			placeholder: "",
			defaultValue: "",
			validator: (val) => trim(val).length > 0,
		});
		const hostDialog = new DialogWithForm({
			app: this.app,
			title: shapezAPI.translations.multiplayer.createMultiplayerGameHost.title,
			desc: shapezAPI.translations.multiplayer.createMultiplayerGameHost.desc,
			formElements: [hostInput],
			buttons: ["cancel:bad:escape", "ok:good:enter"],
		});
		this.dialogs.internalShowDialog(hostDialog);
		hostDialog.buttonSignals.ok.add(() => {
			this.app.analytics.trackUiClick("resume_game");

			this.app.adProvider.showVideoAd().then(() => {
				this.app.analytics.trackUiClick("resume_game_adcomplete");
				const host = trim(hostInput.getValue());
				const savegame = this.app.savegameMgr.getSavegameById(game.internalId);
				savegame
					.readAsync()
					.then(() => {
						this.moveToState("InMultiplayerGameState", {
							savegame,
							host: host,
						});
					})
					.catch((err) => {
						this.dialogs.showWarning(shapezAPI.translations.dialogs.gameLoadFailure.title, shapezAPI.translations.dialogs.gameLoadFailure.text + "<br><br>" + err);
					});
			});
		});
	}

	/**
	 * @param {SavegameMetadata} game
	 */
	deleteGame(game) {
		this.app.analytics.trackUiClick("delete_game");

		const signals = this.dialogs.showWarning(shapezAPI.translations.dialogs.confirmSavegameDelete.title, shapezAPI.translations.dialogs.confirmSavegameDelete.text.replace("<savegameName>", game.name || shapezAPI.translations.mainMenu.savegameUnnamed).replace("<savegameLevel>", String(game.level)), ["cancel:good", "delete:bad:timeout"]);

		signals.delete.add(() => {
			this.app.savegameMgr.deleteSavegame(game).then(
				() => {
					this.renderSavegames();
					if (this.savedGames.length <= 0) this.renderMainMenu();
				},
				(err) => {
					this.dialogs.showWarning(shapezAPI.translations.dialogs.savegameDeletionError.title, shapezAPI.translations.dialogs.savegameDeletionError.text + "<br><br>" + err);
				}
			);
		});
	}

	/**
	 * @param {SavegameMetadata} game
	 */
	downloadGame(game) {
		this.app.analytics.trackUiClick("download_game");

		const savegame = this.app.savegameMgr.getSavegameById(game.internalId);
		savegame.readAsync().then(() => {
			const data = ReadWriteProxy.serializeObject(savegame.currentData);
			const filename = (game.name || "unnamed") + ".bin";
			generateFileDownload(filename, data);
		});
	}

	/**
	 * Shows a hint that the slot limit has been reached
	 */
	showSavegameSlotLimit() {
		const { getStandalone } = this.dialogs.showWarning(shapezAPI.translations.dialogs.oneSavegameLimit.title, shapezAPI.translations.dialogs.oneSavegameLimit.desc, ["cancel:bad", "getStandalone:good"]);
		getStandalone.add(() => {
			this.app.analytics.trackUiClick("visit_steampage_from_slot_limit");
			this.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.standaloneStorePage + "?reF=ssll");
		});
	}

	onSettingsButtonClicked() {
		this.moveToState("SettingsState");
	}

	onTranslationHelpLinkClicked() {
		this.app.analytics.trackUiClick("translation_help_link");
		this.app.platformWrapper.openExternalLink("https://github.com/tobspr/shapez.io/blob/master/translations");
	}

	onJoinButtonClicked() {
		//host regex
		const host = /wss:\/\/[a-z]{2,}\.[a-z]{2,}?:[0-9]{4,5}\/?/i;

		const hostInput = new FormElementInput({
			id: "hostInput",
			label: null,
			placeholder: "",
			defaultValue: "",
			validator: (val) => trim(val).length > 0,
		});
		const hostDialog = new DialogWithForm({
			app: this.app,
			title: shapezAPI.translations.multiplayer.joinMultiplayerGameHost.title,
			desc: shapezAPI.translations.multiplayer.joinMultiplayerGameHost.desc,
			formElements: [hostInput],
			buttons: ["cancel:bad:escape", "ok:good:enter"],
		});
		this.dialogs.internalShowDialog(hostDialog);

		// When confirmed, create connection
		hostDialog.buttonSignals.ok.add(() => {
			var host = trim(hostInput.getValue());

			//UUID v4 regex
			const uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

			const connectIdInput = new FormElementInput({
				id: "connectIdInput",
				label: null,
				placeholder: "",
				defaultValue: "",
				validator: (val) => val.match(uuid) && trim(val).length > 0,
			});
			const dialog = new DialogWithForm({
				app: this.app,
				title: shapezAPI.translations.multiplayer.joinMultiplayerGame.title,
				desc: shapezAPI.translations.multiplayer.joinMultiplayerGame.desc,
				formElements: [connectIdInput],
				buttons: ["cancel:bad:escape", "ok:good:enter"],
			});
			this.dialogs.internalShowDialog(dialog);

			// When confirmed, create connection
			dialog.buttonSignals.ok.add(() => {
				let connectionId = trim(connectIdInput.getValue());

				// @ts-ignore
				var socket = io(host, { transport: ["websocket"] });
				var socketId = undefined;
				var socketConnectionId = undefined;
				var peerId = undefined;

				socket.on("connect", () => {
					console.log("Connected to the signalling server");
					socket.on("id", (id) => {
						socketId = id;
						console.log("Got id: " + id);
						socket.emit("joinRoom", connectionId, socketId);
					});
					socket.on("error", () => {
						this.dialogs.showWarning(shapezAPI.translations.multiplayer.multiplayerGameError.title, shapezAPI.translations.multiplayer.multiplayerGameError.desc + "<br><br>");
					});

					const config = {
						iceServers: [
							{
								urls: "stun:stun.1.google.com:19302",
							},
							{
								url: "turn:numb.viagenie.ca",
								credential: "muazkh",
								username: "webrtc@live.com",
							},
						],
					};
					const pc = new Peer({ initiator: false, wrtc: wrtc, config: config });
					socket.on("signal", (signalData) => {
						if (socketId !== signalData.receiverId) return;
						console.log("Received signal");
						console.log(signalData);

						peerId = signalData.peerId;
						socketConnectionId = signalData.senderId;
						pc.signal(signalData.signal);
					});
					pc.on("signal", (signalData) => {
						console.log("Send signal");
						console.log({
							receiverId: socketConnectionId,
							peerId: peerId,
							signal: signalData,
							senderId: socketId,
						});
						socket.emit("signal", {
							receiverId: socketConnectionId,
							peerId: peerId,
							signal: signalData,
							senderId: socketId,
						});
					});

					var gameDataState = -1;
					var gameData = "";

					var canceled = (title, description) => {
						pc.destroy();
						this.loadingOverlay.removeIfAttached();
						//Show uuid of room
						let dialog = new Dialog({
							app: this.app,
							title: title,
							contentHTML: description,
							buttons: ["ok:good"],
						});
						this.dialogs.internalShowDialog(dialog);
					};

					var onMessage = (data) => {
						var packet = JSON.parse(data);

						//When data ends
						if (packet.type === MultiplayerPacketTypes.FLAG && packet.flag === FlagPacketFlags.ENDDATA) {
							gameDataState = 1;
							let gameDataJson = JSON.parse(gameData);
							console.log(gameDataJson);

							for (let i = 0; i < shapezAPI.modOrder.length; i++) {
								const modId = shapezAPI.modOrder[i];
								if (!gameDataJson.mods.includes(modId)) return canceled(shapezAPI.translations.multiplayer.notSameMods.title, shapezAPI.translations.multiplayer.notSameMods.desc);
							}
							for (let i = 0; i < gameDataJson.mods.length; i++) {
								const modId = gameDataJson.mods[i];
								if (!shapezAPI.modOrder.includes(modId)) return canceled(shapezAPI.translations.multiplayer.notSameMods.title, shapezAPI.translations.multiplayer.notSameMods.desc);
							}

							var connection = new MultiplayerConnection(pc, gameDataJson);
							this.moveToState("InMultiplayerGameState", {
								connection,
								connectionId,
							});
						}

						//When data recieved
						if (packet.type === MultiplayerPacketTypes.DATA && gameDataState === 0) gameData = gameData + packet.data;

						//When start data
						if (packet.type === MultiplayerPacketTypes.FLAG && packet.flag === FlagPacketFlags.STARTDATA) {
							gameDataState = 0;
							this.loadingOverlay = new GameLoadingOverlay(this.app, this.getDivElement());
							this.loadingOverlay.showBasic();
						}
					};

					pc.on("data", onMessage);
				});
			});
		});
	}

	onPlayButtonClicked() {
		if (this.app.savegameMgr.getSavegamesMetaData().length > 0 && !this.app.restrictionMgr.getHasUnlimitedSavegames()) {
			this.app.analytics.trackUiClick("startgame_slot_limit_show");
			this.showSavegameSlotLimit();
			return;
		}

		this.app.analytics.trackUiClick("startgame");
		this.app.adProvider.showVideoAd().then(() => {
			const savegame = this.app.savegameMgr.createNewSavegame();

			this.moveToState("InMultiplayerGameState", {
				savegame,
			});
			this.app.analytics.trackUiClick("startgame_adcomplete");
		});
	}

	onBackButtonClicked() {
		this.moveToState("MainMenuState");
	}

	onContinueButtonClicked() {
		let latestLastUpdate = 0;
		let latestInternalId;
		this.app.savegameMgr.currentData.savegames.forEach((saveGame) => {
			if (saveGame.lastUpdate > latestLastUpdate) {
				latestLastUpdate = saveGame.lastUpdate;
				latestInternalId = saveGame.internalId;
			}
		});

		const savegame = this.app.savegameMgr.getSavegameById(latestInternalId);
		savegame.readAsync().then(() => {
			this.moveToState("InMultiplayerGameState", {
				savegame,
			});
		});
	}

	onLeave() {
		this.dialogs.cleanup();
	}
}

MultiplayerState.extraTopButtons = [];
MultiplayerState.extraSmallButtons = [];
MultiplayerState.extraTrackClicks = [];

export function addMultiplayerButton(modid) {
	shapezAPI.states.MainMenuState.extraSmallButtons.push({
		text: "Multiplayer",
		htmlClass: "mainMenuMultiplayer",
		action: (mainMenuState) => () => {
			mainMenuState.moveToState("MultiplayerState");
		},
	});
}