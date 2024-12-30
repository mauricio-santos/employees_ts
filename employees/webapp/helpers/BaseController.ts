import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

/**
 * @namespace de.santos.employees
 */

export default class BaseController extends Controller {
    public getRouterHelper(): Router {
        return (this.getOwnerComponent() as UIComponent).getRouter();
    };

    public getModelHelper(modelName: string): Model {
        return this.getView()?.getModel(modelName) as Model;
    };

    public setModelHelper(model: Model, modelName: string): View | undefined {
        return this.getView()?.setModel(model, modelName);
    };

    public getResourceBundleHelper(): ResourceBundle {
        return ((this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }
}