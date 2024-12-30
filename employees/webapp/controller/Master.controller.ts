import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace de.santos.employees.controller
 */
export default class Master extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.loadEmployees();
        this.loadCountries();
    };

    private loadEmployees(): void {
        const model = new JSONModel();
        model.loadData("../model/Employees.json");
        this.setModelHelper(model, "employeesModel");
    };

    private loadCountries(): void {
        const model = new JSONModel();
        model.loadData("../model/Countries.json");
        this.setModelHelper(model, "countriesModel");
    }
}