import BaseController from "../helpers/BaseController";
import { FilterBar$SearchEvent, FilterBar$ClearEvent } from "sap/ui/comp/filterbar/FilterBar";
import Control from "sap/ui/core/Control";
import Input from "sap/m/Input";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import Model from "sap/ui/model/Model";
import MultiComboBox from "sap/m/MultiComboBox";
import { ListBase$UpdateFinishedEvent } from "sap/m/ListBase";
import Title from "sap/m/Title";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace de.santos.employees.controller
 */
export default class Master extends BaseController {

    public onInit(): void {

    };

    public onFilterBarGoSearch(event: FilterBar$SearchEvent): void {
        const controls = event.getParameter("selectionSet") as Control[];
        const input = controls[0] as Input;
        const multiComboBox = controls[1] as MultiComboBox;
        const employee = input.getValue() as String;
        const countrySelections = multiComboBox.getSelectedKeys() as Array<string>;
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

        countrySelections.forEach((countryKey: string) => {
            filters.push(new Filter("Country", FilterOperator.EQ, countryKey))
        }); 

        const table = this.byId("idEmployeesTable") as Table;
        const binding = table.getBinding("items") as ListBinding;
        binding.filter(filters); 
    };

    public onFilterBarClear(event: FilterBar$ClearEvent) {
        const controls = event.getParameter("selectionSet") as Control[];
        const input = controls[0] as Input;
        const multiComboBox = controls[1] as MultiComboBox;        
        
        input.setValue("");
        multiComboBox.setSelectedKeys([]);
        this.onFilterBarGoSearch(event);
    };

    public onFilterGeneric(): void {
        const model = this.getModelHelper("filtersModel") as Model;
        const employee = model.getProperty("/Employee");
        const countrySelections = model.getProperty("/Country");       
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

        countrySelections.forEach((countryKey: string) => {
            filters.push(new Filter("Country", FilterOperator.EQ, countryKey));            
        }); 

        const table = this.byId("idEmployeesTable") as Table;
        const binding = table.getBinding("items") as ListBinding;
        binding.filter(filters); 
    };

    public onEmployeesTableUpdateFinished(event: ListBase$UpdateFinishedEvent) {
        const total = event.getParameter("total");
        const headerTitle = this.byId("idEmployeesListTitle") as Title
        const i18n = this.getResourceBundleHelper() as ResourceBundle;
        const text = `${i18n.getText("employeesList")} (${total})`;
        
        headerTitle.setProperty("text", text);
    };
}