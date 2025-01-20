import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import Panel from "sap/m/Panel";

/**
 * @namespace de.santos.employees.controller
 */

export default class Details extends BaseController {

    private fragmentPanel: Panel;

    public onInit(): void {
        const router = this.getRouterHelper();
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
    };

    private onObjectMatched(event : Route$PatternMatchedEvent): void {
        const modelView = this.getModelHelper("layoutViewModel") as JSONModel;
        const args = event.getParameter("arguments") as any;
        const index = args.index;
        const view = this.getView() as View;

        this.removeAllPanelContent()
        
        modelView.setProperty("/layout", "TwoColumnsMidExpanded");

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

    public onButtonCloseViewPress(): void {
        const modelView = this.getModelHelper("layoutViewModel") as JSONModel;
        const router = this.getRouterHelper() as Router;
        
        modelView.setProperty("/layout", "OneColumn");
        router.navTo("RouteMaster");
    };

    public removeAllPanelContent(): void {
        const panel = this.byId("idTableIncidencePanel") as Panel;
        panel.removeAllContent();
    };

    public async onCreateButtonPress(): Promise<void> {
        const panel = this.byId("idTableIncidencePanel") as Panel;

        this.fragmentPanel = await <Promise<Panel>> this.loadFragment({
            name: "de.santos.employees.fragments.NewIncidenceFrag",
            id: Date.now().toString() //unique IDs
        });       

        panel.addContent(this.fragmentPanel);
    };
};