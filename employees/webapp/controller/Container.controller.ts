import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace de.santos.employees.controller
 */

export default class Container extends BaseController{
  
    public onInit(): void {
        this.loadEmployees();
        this.loadCountries();
        this.loadFilters();
    };

    private loadEmployees(): void {
        const model = new JSONModel() as JSONModel;
        model.loadData("../model/Employees.json");
        this.setModelHelper(model, "employeesModel");
    };

    private loadCountries(): void {
        const model = new JSONModel() as JSONModel;
        model.loadData("../model/Countries.json");
        this.setModelHelper(model, "countriesModel");
    };

    private loadFilters(): void {
        const data: {Employee: string, Country: Array<string>} = {
            Employee: "",
            Country: []
        } ;
        const model = new JSONModel(data) as JSONModel;
        this.setModelHelper(model, "filtersModel");
        
    }
    
};