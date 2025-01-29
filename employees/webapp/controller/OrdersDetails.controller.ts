import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Signature from "../control/Signature";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";

/**
 * @namespace de.santos.employees.controller
 */
export default class OrderDetails extends BaseController {

    private onObjectMatched(event: Route$PatternMatchedEvent): void {
        const routeParam = event.getParameter("arguments") as any;
        const orderId = routeParam.orderId;
        const layoutViewModel = this.getModelHelper("layoutViewModel") as JSONModel;
        const view = this.getView() as View;
        const $this = this;

        
        //Changing layout layout to EndColumnFullScreen
        layoutViewModel.setProperty("/layout", "EndColumnFullScreen");

        //Binding on new View
        view.bindElement({
            path: `/Orders(${orderId})`,
            model: 'northwindModel',
            events: {
                change: function() {
                    $this.onButtonClearSignaturePress();
                    $this.readSignature();
                }
            }
        });
    };

    private async readSignature(): Promise<void | ODataListBinding> {
        const northwind = this.getView()?.getBindingContext("northwindModel") as Context;
        const orderId = northwind.getProperty("OrderID").toString();
        const employeeId = northwind.getProperty("EmployeeID").toString();
        const utils = new Utils(this);
        const sapId = utils.getEmail();
        const path = `/SignatureSet(OrderId='${orderId}',SapId='${sapId}',EmployeeId='${employeeId}')`;

        const data = {
            url: path,
            fitlers: []
        }
        
        const result = await utils.read(new JSONModel(data), true) as any;
        this.showSignature(result);
    };

    private showSignature(data: void | ODataListBinding): void {
        const result = data as any;
        const mediaContent = result.MediaContent as any;
        const base64 = "data:image/png;base64," + mediaContent;
        const signature = this.byId("idSignature") as Signature;
        signature.setSignature(base64);
    };

    public onInit(): void {
        const router = this.getRouterHelper();
        router.getRoute("RouteOrdersDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
    };

    public async onButtonSaveSignaturePress(): Promise<void> {
        const signature = this.byId("idSignature") as Signature;
        const i18n = this.getResourceBundleHelper();

        if (!signature.isFill()){
            MessageBox.error(i18n.getText("fillSignature") || "no text defined");
        }else {
            const base64 = signature.getSignature();
            const mediaContent = base64.replace("data:image/png;base64,", "");
            const northwind = this.getView()?.getBindingContext("northwindModel") as Context;
            const orderId = northwind.getProperty("OrderID").toString();
            const employeeId = northwind.getProperty("EmployeeID").toString();
            const utils = new Utils(this);
            const sapId = utils.getEmail();

            const body = {
                url: "/SignatureSet",
                data: {
                    MediaContent: mediaContent,
                    OrderId: orderId,
                    SapId: sapId,
                    EmployeeId: employeeId,
                    MimeType: "image/png"
                }
            };

            await utils.crud("create", new JSONModel(body), true);
        }
    };

    public onButtonClearSignaturePress(): void {
        const signature = this.byId("idSignature") as Signature;
        signature.clear();
    };

    public onButtonRefreshSignaturePress(): void {
        this.onButtonClearSignaturePress();
        this.readSignature();
    };
}