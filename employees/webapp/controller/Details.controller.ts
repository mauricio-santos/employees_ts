import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";

/**
 * @namespace de.santos.employees.controller
 */

export default class Details extends BaseController {

    public onInit(): void {
        const router = this.getRouterHelper();
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
    };

    private onObjectMatched(event : Route$PatternMatchedEvent): void {
        const modelView = this.getModelHelper("layoutViewModel") as JSONModel;
        const args = event.getParameter("arguments") as any;
        const index = args.index;
        const view = this.getView() as View;
        
        modelView.setProperty("/layout", "TwoColumnsBeginExpanded");

        view.bindElement({
            path:`/Employees/${index}`,
            model: 'employeesModel',
            events: {
                dataRequested: function() {
                    console.log("dataRequested");
                },
                dataReceived: function() {
                    console.log("dataReceived");
                }
            }
        });



    };
};