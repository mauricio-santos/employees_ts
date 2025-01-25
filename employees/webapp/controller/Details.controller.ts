import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Router from "sap/ui/core/routing/Router";
import Panel from "sap/m/Panel";
import { Button$PressEvent } from "sap/m/Button";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import { DatePicker$ChangeEvent } from "sap/m/DatePicker";
import { Input$LiveChangeEvent } from "sap/m/Input";
import { Select$ChangeEvent } from "sap/m/Select";


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
        const _this = this;

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
                    //Read Incidences
                    _this.readIncidences();
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
        const incidenceIsSet = form.getProperty("IncidenceId");
        const sapId = utils.getEmail();
        const employeeId = northwind.getProperty("EmployeeID").toString();

        if (!incidenceIsSet){
            //CREATE
            const data = {
                url: "/IncidentsSet",
                data: {
                    SapId: sapId,
                    EmployeeId: employeeId,
                    CreationDate: form.getProperty("CreationDate"),
                    Type: form.getProperty("Type"),
                    Reason: form.getProperty("Reason")
                }
            };
            const model = new JSONModel(data);
            const results = await utils.crud("create", model);
            this.showIncidents(results)
        }else{
            //UPDATE
            const incidenceId = form.getProperty("IncidenceId");
            const sapId = utils.getEmail();
            const employeeId = form.getProperty("EmployeeId")
            const url = `/IncidentsSet(IncidenceId='${incidenceId}',SapId='${sapId}',EmployeeId='${employeeId}')`;

            const data = {
                url,
                data: {
                    SapId: sapId,
                    EmployeeId: employeeId,
                    CreationDate: form.getProperty("CreationDate"),
                    CreationDateX: form.getProperty("CreationDateX"),
                    Type: form.getProperty("Type"),
                    TypeX: form.getProperty("TypeX"),
                    Reason: form.getProperty("Reason"),
                    ReasonX: form.getProperty("ReasonX")
                }
            };
            const model = new JSONModel(data);
            const results = await utils.crud("update", model);
            this.showIncidents(results);
        }
    };

    private async readIncidences(): Promise<void> {
        const utils = new Utils(this);
        const sapId = utils.getEmail();
        const northwindModel = this.getView()?.getBindingContext("northwindModel") as Context;
        const employeeId = northwindModel.getProperty("EmployeeID");

        const body = {
            url: "/IncidentsSet",
            filters: [
                new Filter("SapId", FilterOperator.EQ, sapId),
                new Filter("EmployeeId", FilterOperator.EQ, employeeId)
            ]
        }
        const data = new JSONModel(body);
        const result = await utils.read(data); //Returns all data, if it exists 
        
        this.showIncidents(result);
    };

    private async showIncidents(result: void | ODataListBinding): Promise<void> {      
        const objectResult = result as any;
        const arrayResult = objectResult.results;
        const formModel = this.getModelHelper("formModel") as JSONModel;

        // if (arrayResult.length == 0) {
        //     console.log("Não há incidências");
        //     return;
        // }

        //Removing previous incidences
        this.removeAllPanelContent();

        //Reset the results
        formModel.setData(arrayResult);
        
        //Maping
        arrayResult.forEach(async (incidence: any, index: number) => {
            const panel = this.byId("idTableIncidencePanel") as Panel;
            const newIncidence = await <Promise<Panel>> this.loadFragment({
                name: "de.santos.employees.fragments.NewIncidenceFrag",
                id: "incidenceFrag-" + Math.floor(10000 + Math.random() * 90000)
            });

            //Indexing incidences
            incidence.Index = index + 1;

            //Binding fragment
            newIncidence.bindElement("formModel>/" + index);
        
            //Add fragment on View
            panel.addContent(newIncidence);
        });
    };

    public onDatePickerChange(event: DatePicker$ChangeEvent): void {
        const context = event.getSource().getBindingContext("formModel") as Context;
        const objectContext = context.getObject() as any;
        objectContext.CreationDateX = true;
    };

    public onReasonInputChange(event: Input$LiveChangeEvent): void {
        const context = event.getSource().getBindingContext("formModel") as Context;
        const objectContext = context.getObject() as any;
        objectContext.ReasonX = true;
    };

    public onSelectChange(event: Select$ChangeEvent): void {
        const context = event.getSource().getBindingContext("formModel") as Context;
        const objectContext = context.getObject() as any;
        objectContext.TypeX = true;
    };

    public async onButtonRemoveIncidencePress(event: Button$PressEvent): Promise<void> {
        const panel = event.getSource().getParent()?.getParent() as Panel;
        const utils = new Utils(this);
        const form = panel.getBindingContext( "formModel") as Context;
        const northwind = this.getView()?.getBindingContext("northwindModel") as Context;
        const incidenceId = form.getProperty("IncidenceId");
        const sapId = utils.getEmail();
        const employeeId = northwind.getProperty("EmployeeID").toString();

        const object = {
            data: { //required for read
                SapId: sapId,
                EmployeeId: employeeId
            },
            url: `/IncidentsSet(IncidenceId='${incidenceId}',SapId='${sapId}',EmployeeId='${employeeId}')`
        }
        const model = new JSONModel(object);
        const results = await utils.crud("delete", model);
        this.showIncidents(results);
        
    }
};