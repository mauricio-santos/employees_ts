import Controller from "sap/ui/core/mvc/Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";

/**
 * @namespace de.santos.employees.utils.controller
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

    public async crud(action: string, model: JSONModel, signature = false): Promise<void | ODataListBinding> {
        const resourceBundle = this.resourceBundle;
        const _this = this;

        //adding the filters attribute to perform reading in all CRUD operations
        const data = model.getProperty("/data");
        let filters = [];

        !signature
            ? filters.push(new Filter("EmployeeId", FilterOperator.EQ, data.EmployeeId))
            : filters.push(new Filter("OrderId", FilterOperator.EQ, data.OrderId));

        filters.push(new Filter("SapId", FilterOperator.EQ, data.SapId));
        model.setProperty("/filters", filters);

        return new Promise((resolve, reject) => {
            MessageBox.confirm(resourceBundle.getText("question") || "no text defined", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: async function(selectedAction: string) {
                    if (selectedAction === MessageBox.Action.OK){
                        switch(action) {
                            case 'create': resolve(await _this.create(model)); break;
                            case 'update': resolve(await _this.update(model)); break;
                            case 'delete': resolve(await _this.delete(model)); break;
                        }
                    }
                }
            });
        });
    };

    private async create(model: JSONModel): Promise<void | ODataListBinding> {
        const url = model.getProperty("/url");
        const data = model.getProperty("/data");
        const i18n = this.resourceBundle;
        const _this = this;

        return new Promise((resolve, reject) => {
            this.model.create(url, data, {
                success: async function() {
                    MessageBox.success(i18n.getText("success") || "no text defined");
                    resolve(await _this.read(model));               
                },
                error: function(e: any) {
                    MessageBox.error(i18n.getText("error") || "no text defined");
                    reject();
                }
            });
        });
    };

    public async read(data: JSONModel, signature?: boolean): Promise<void  | ODataListBinding> {
        const model = this.model;
        const url = !signature ? data.getProperty("/url").split("(")[0] : data.getProperty("/url");
        const filters = data.getProperty("/filters");
       
        return new Promise((resolve, reject) => {
            model.read(url, {
                filters: filters,
                success: function(data: ODataListBinding) {
                    // console.log(data);
                    resolve(data);
                },
                error: function() {
                    reject();
                }
            });
        });
    };

    private async update(model: JSONModel): Promise<void | ODataListBinding> {
        const url = model.getProperty("/url");
        const data = model.getProperty("/data");
        const i18n = this.resourceBundle;
        const _this = this;

        return new Promise((resolve, reject) => {
            this.model.update(url, data, {
                success: async function() {
                    MessageBox.success(i18n.getText("successUpdate") || "no text defined");
                    resolve(await _this.read(model));
                },
                error: function(e: any) {
                    MessageBox.error(i18n.getText("errorUpdate") || "no text defined");
                    console.log(e);
                }
            });
        });
    };

    private async delete(model: JSONModel): Promise<void | ODataListBinding> {
        let url = model.getProperty("/url");
        const i18n = this.resourceBundle;
        const _this = this;
    
        return new Promise((resolve, reject) => {
            this.model.remove(url, {
                success: async function() {
                    MessageBox.success(i18n.getText("successDelete") || "no text defined");
                    resolve(await _this.read(model));
                },
                error: function() {
                    MessageBox.error(i18n.getText("errorDelete") || "no text defined");
                    reject();
                }
            });
        });
    };
};