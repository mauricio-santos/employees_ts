import Controller from "sap/ui/core/mvc/Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";

/**
 * @namespace de.santos.employees.controller
 */
export default class Utils {

    private controller: Controller;
    private model: ODataModel;
    private resourceBundle: ResourceBundle;

    constructor(controller: Controller) {
        this.controller = controller;
        this.model = (controller.getOwnerComponent() as UIComponent).getModel("zIncidences") as ODataModel;
        this.resourceBundle = ((controller.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    };

    public getEmail(): string {
        return "mauricio.vieira@email.de"
    };

    public async crud(action: string, model?: JSONModel): Promise<void> {
        const resourceBundle = this.resourceBundle;
        const _this = this;

        MessageBox.confirm(resourceBundle.getText("question") || "no text defined", {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function(selectedAction: string) {
                if (selectedAction === MessageBox.Action.OK){
                    switch(action) {
                        case 'create': _this.create(model);
                        case 'update': break;
                        case 'delete': break;
                    }
                }
            }
        });
    };

    private async create(model?: JSONModel): Promise<void> {
        const url = model?.getProperty("/url");
        const data = model?.getProperty("/data");
        const i18n = this.resourceBundle;

        this.model.create(url, data, {
            success: function() {
                MessageBox.success(i18n.getText("success") || "no text defined");
            },
            error: function(e: any) {
                MessageBox.error(i18n.getText("error") || "no text defined");
                console.log(e);
            }
        }) 
    };
}