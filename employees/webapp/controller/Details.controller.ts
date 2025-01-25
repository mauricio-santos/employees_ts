import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import Panel from "sap/m/Panel";
import { Button$PressEvent } from "sap/m/Button";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";

/**
 * @namespace de.santos.employees.controller
 */

export default class Details extends BaseController {

    private fragmentPanel: Panel;

    private loadFormModel() {
        const model = new JSONModel([]) as JSONModel;
        this.getView()?.setModel(model, "formModel");
    }

    public onInit(): void {
        const router = this.getRouterHelper();
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));

        this.loadFormModel();
    };

    private onObjectMatched(event : Route$PatternMatchedEvent): void {
        const modelView = this.getModelHelper("layoutViewModel") as JSONModel;
        const args = event.getParameter("arguments") as any;
        const index = args.index;
        const view = this.getView() as View;

        this.removeAllPanelContent();
        
        modelView.setProperty("/layout", "TwoColumnsMidExpanded");

        view.bindElement({
            path:`/Employees(${index})`,
            model: 'northwindModel',
            events: {
                dataRequested: function() {
                    // console.log("dataRequested");
                },
                dataReceived: function() {
                    // console.log("dataReceived");
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
        
        const formModel = this.getModelHelper("formModel") as JSONModel;
        const data = formModel.getData() as Array<Object>;
        const index = data.length;
        
        data.push({Index: index + 1});
        formModel.refresh();

        this.fragmentPanel.bindElement({
            path: "formModel>/" + index,
            model: "formModel"
        });
        
        panel.addContent(this.fragmentPanel);
    };

    public async onButtonSaveIncidencePress(event: Button$PressEvent): Promise<void> {
        const fragmentPanel = event.getSource()?.getParent()?.getParent() as Panel;
        const form = fragmentPanel.getBindingContext("formModel") as Context;
        const northwind = this.getView()?.getBindingContext("northwindModel") as Context;
        const utils = new Utils(this);

        const data = {
            url: "/IncidentsSet",
            data: {
                SapId: utils.getEmail(),
                EmployeeId: northwind.getProperty("EmployeeID").toString(),
                CreationDate: form.getProperty("CreationDate"),
                Type: form.getProperty("Type"),
                Reason: form.getProperty("Reason")
            }
        };
        const model = new JSONModel(data);
        utils.crud("create", model) ;
    };
};