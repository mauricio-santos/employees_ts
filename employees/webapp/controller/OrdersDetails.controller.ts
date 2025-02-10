import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "../helpers/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Signature from "../control/Signature";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import UploadSet, { UploadSet$AfterItemRemovedEvent, UploadSet$BeforeItemAddedEvent, UploadSet$UploadCompletedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem from "sap/m/upload/UploadSetItem";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";

/**
 * @namespace de.santos.employees.controller
 */
export default class OrderDetails extends BaseController {

    private onObjectMatched(event: Route$PatternMatchedEvent): void {
        const routeParam = event.getParameter("arguments") as any;
        const orderId = routeParam.orderId;
        const layoutViewModel = this.getModelHelper("layoutViewModel") as JSONModel;
        const view = this.getView() as View;
        const objectPageLayout = this.byId("idOrderObjectPageLayout") as ObjectPageLayout
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
                    objectPageLayout.setBusy(false);
                    $this.searchFiles();
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

    // ###### UPLOAD ######
    private searchFiles() : void {         
        const bindContext = this.getView()?.getBindingContext("northwindModel") as Context;
        const orderId = bindContext.getProperty("OrderID").toString();
        const employeeId = bindContext.getProperty("EmployeeID").toString();
        const sapId = new Utils(this).getEmail();
        const uploadSet = this.byId("idUploadSet") as UploadSet;

        uploadSet.setBusy(true);
        
        const bindingInfoItems = {
            path: 'zIncidences>/FilesSet',
            filters: [
                new Filter("OrderId", FilterOperator.EQ, orderId,),
                // new Filter("SapId", FilterOperator.EQ, sapId),
                // new Filter("EmployeeId", FilterOperator.EQ, employeeId)
            ],
            template: new UploadSetItem({
                fileName: "{zIncidences>FileName}",
                mediaType: "{zIncidences>MimeType}",
                visibleEdit: false,
                url: { //Download URL
                    path: "zIncidences>__metadata/media_src", // Full URL for media_src
                    formatter: function (mediaSrc: string) {
                        return mediaSrc ? mediaSrc.replace(/^https?:\/\/[^/]+/, "") : "";
                    }
                }
            })
        };
        uploadSet.bindAggregation("items",bindingInfoItems);
        uploadSet.getBinding("items")?.refresh(true)
        uploadSet.setBusy(false);
    };

    public onUploadSetBeforeUploadStarts(event: UploadSet$BeforeItemAddedEvent): void {
        const item = event.getParameter("item") as UploadSetItem;
        const fileName = item.getFileName();
        const bindContext = this.getView()?.getBindingContext("northwindModel") as Context;
        const orderId = bindContext.getProperty("OrderID").toString();
        const employeeId = bindContext.getProperty("EmployeeID").toString();
        const sapId = new Utils(this).getEmail();
        
        const slug = `${orderId};${sapId};${employeeId};${fileName}`;
        const encodedSlug = encodeURIComponent(slug);
        const customerHeaderSlug = new Item({
            key: "slug",
            text: slug
        });
        
        const zIncidences = this.getModelHelper("zIncidences") as ODataModel;
        const csrfToken = zIncidences.getSecurityToken();
        const cunstomerHeaderToken = new Item({
            key: "X-CSRF-Token",
            text: csrfToken
        });
        item.addHeaderField(customerHeaderSlug);
        item.addHeaderField(cunstomerHeaderToken);
    };

    public onUploadSetUploadCompleted(event: UploadSet$UploadCompletedEvent): void {
        const uploadSetItem = event.getSource();
        uploadSetItem.getBinding("items")?.refresh();
    };

    public async onUploadSetAfterItemRemoved(event: UploadSet$AfterItemRemovedEvent): Promise<void> {
        const item = event.getParameter("item") as UploadSetItem;
        const bindContext = item.getBindingContext("zIncidences") as Context;
        const path = bindContext.getPath();
        const utils = new Utils(this);

        const data = {
            url: path,
        };
        await utils.crud("delete", new JSONModel(data), false, true) as any;

        const uploadSet = this.byId("idUploadSet") as UploadSet;
        uploadSet.getBinding("items")?.refresh();
    };
}