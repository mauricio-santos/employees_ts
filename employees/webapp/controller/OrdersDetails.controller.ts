import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Signature from "../control/Signature";

/**
 * @namespace de.santos.employees.controller
 */
export default class OrderDetails extends BaseController {

    private signature: Signature

    public onInit(): void {
        const router = this.getRouterHelper();
        router.getRoute("RouteOrdersDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
    };

    private onObjectMatched(event: Route$PatternMatchedEvent): void {
        const routeParam = event.getParameter("arguments") as any;
        const orderId = routeParam.orderId;
        const layoutViewModel = this.getModelHelper("layoutViewModel") as JSONModel;
        const view = this.getView() as View;
        
        //Changing layout layout to EndColumnFullScreen
        layoutViewModel.setProperty("/layout", "EndColumnFullScreen");

        //Binding on new View
        view.bindElement({
            path: `/Orders(${orderId})`,
            model: 'northwindModel'
        });
    };

    public onButtonSaveSignaturePress(): void {
        
    };

    public onButtonClearSignaturePress(): void {
        const signature = this.byId("idSignature") as Signature;
        signature.clear();
    };

    public onButtonRefreshSignaturePress(): void {

    };
}