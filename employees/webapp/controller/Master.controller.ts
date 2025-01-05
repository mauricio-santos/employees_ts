import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import { FilterBar$SearchEvent, FilterBar$ClearEvent } from "sap/ui/comp/filterbar/FilterBar";
import Control from "sap/ui/core/Control";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";

/**
 * @namespace de.santos.employees.controller
 */
export default class Master extends BaseController {

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
    };

    public onFilterBarGoSearch(event: FilterBar$SearchEvent): void {
        const controls = event.getParameter("selectionSet") as Control[];
        const input = controls[0] as Input;
        const comboBox = controls[1] as ComboBox;
        const employee = input.getValue() as String;
        const country = comboBox.getSelectedKey() as String;

        const filters = [];

        if (employee) {
            filters.push(new Filter({
                filters: [
                    new Filter("EmployeeID", FilterOperator.EQ, employee),
                    new Filter({
                        filters: [
                            new Filter("FirstName", FilterOperator.Contains, employee),
                            new Filter("LastName", FilterOperator.Contains, employee)
                        ],
                        and: false
                    })
                ],
                and: false
            }));
        }

        country && filters.push(new Filter("Country", FilterOperator.EQ, country))

        const table = this.byId("idEmployeesTable") as Table;
        const binding = table.getBinding("items") as ListBinding;
        binding.filter(filters); 
    };

    public onFilterBarClear(event: FilterBar$ClearEvent) {
        const controls = event.getParameter("selectionSet") as Control[];
        const input = controls[0] as Input;
        const comboBox = controls[1] as ComboBox;
        
        input.setValue("");
        comboBox.setSelectedKey("");
        this.onFilterBarGoSearch(event);

    };
}