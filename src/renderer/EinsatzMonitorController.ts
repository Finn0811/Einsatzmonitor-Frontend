import settings from "electron-settings";
import EinsatzMonitorModel from "./EinsatzMonitor";
import DisplayManager from "./DisplayManager";
import AlarmReceiverWebsocket from "./AlarmReceiverWebsocket";
import AlarmReceiverHttp from "./AlarmReceiverHttp";
import AlarmReceiverAlamos from "./AlarmReceiverAlamos";
import mapBindingHandler from "../knockoutBindingHandlers/mapBindingHandler";
import * as ko from 'knockout';
import AlarmReceiverHttpServer from "./AlarmReceiverHttpServer";
import AlarmReceiverMqtt from "./AlarmReceiverMqtt";

class EinsatzMonitorController {
    einsatzMonitorModel: EinsatzMonitorModel;
    displayManager: DisplayManager;

    constructor() {
        this.einsatzMonitorModel = new EinsatzMonitorModel();
        this.displayManager = new DisplayManager(this.einsatzMonitorModel);

        if (settings.getSync("einsatz.fetch") === "websocket") {
            new AlarmReceiverWebsocket(this.einsatzMonitorModel);
        }

        if (settings.getSync("einsatz.fetch") === "http") {
            new AlarmReceiverHttp(this.einsatzMonitorModel);
        }

        if (settings.getSync("alamos.alarmInput.enabled")) {
            new AlarmReceiverAlamos(this.einsatzMonitorModel);
        }

        if (settings.getSync("webserver.alarmInput.enabled")) {
            new AlarmReceiverHttpServer(this.einsatzMonitorModel);
        }

        if (settings.getSync("mqtt.alarmInput.enabled")) {
            new AlarmReceiverMqtt(this.einsatzMonitorModel);
        }

        let resizeTimer: NodeJS.Timeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Recalculate grister if window size changed
                this.einsatzMonitorModel.board().gridsterInfo.recalculate_faux_grid();
            }, 250);
        });

        (<any>ko.bindingHandlers).map = mapBindingHandler;
        ko.applyBindings(this.einsatzMonitorModel);

        this.einsatzMonitorModel.loaded();
    }
}

interface KnockoutBindingHandlers {
    map: KnockoutBindingHandler;
}

export default EinsatzMonitorController