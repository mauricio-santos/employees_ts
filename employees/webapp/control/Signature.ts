import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import { MetadataOptions } from "sap/ui/core/Element";
import SignaturePad from "signature_pad";

/**
 * @namespace de.santos.employees.control
 */

export default class Signature extends Control {
  
    /* @ui5/ts-interface-generator - needed to create interfaces
        To start the generator, run where .eslintrc folder is present : npx @ui5/ts-interface-generator --watch
        The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
    */ 
    constructor(idOrSettings?: string | $SignatureSettings);
    constructor(id?: string, settings?: $SignatureSettings);
    constructor(id?: string, settings?: $SignatureSettings) { super(id, settings); }

    private signaturePad: SignaturePad;
    private flag: boolean = false;

    public init(): void {
        // this.setAggregation("_toolbar", new Toolbar({
        //     design: 'Info',
        //     content: [
        //         new ToolbarSpacer(),
        //         new Button({
        //             icon: 'sap-icon://decline',
        //             press: this.clear.bind(this)
        //         })
        //     ]
        // }));
    };

    public static readonly metadata: MetadataOptions = {
        properties: {
            width: {
                type: 'sap.ui.core.CSSSize',
                defaultValue: '300px'
            },
            height: {
                type: 'sap.ui.core.CSSSize',
                defaultValue: '150px'
            },
            bgColorPad: {
                type: 'sap.ui.core.CSSColor',
                defaultValue: 'rgb(221, 214, 214)'
            }
        },
        // aggregations: {
        //     _toolbar: {
        //         type: 'sap.m.Toolbar',
        //         multiple: false,
        //         visibility: 'hidden',  
        //     }
        // }
    };

    public renderer = {
        apiVersion: 4,
        render: (rm: RenderManager, control: Signature) => {
            rm.openStart("div", control); // <div
            // rm.class("signatureDiv"); // class="signatureDiv"
            rm.style("width", control.getProperty("width")); // width
            rm.style("height", control.getProperty("height")); // height
            rm.style("border", "3px solid black");
            rm.style("border-radius", "10%");
            rm.openEnd(); // >
                rm.openStart("canvas", control); // <canvas
                    rm.style("width", control.getProperty("width")); // width
                    rm.style("height", control.getProperty("height")); // height
                    rm.style("background", control.getProperty("bgColorPad")); // background
                    rm.style("border-radius", "10%");
                rm.openEnd(); // >
                rm.close("canvas"); // </canvas/>
                // rm.renderControl(control.getAggregation("_toolbar") as Control);
            rm.close("div"); // <div/>
        }
    };

    public onAfterRendering(oEvent: jQuery.Event): void {
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.signaturePad = new SignaturePad(canvas);
        // this.signaturePad.minWidth = 5;
        // this.signaturePad.maxWidth = 10;
        this.signaturePad.penColor = "rgb(66, 133, 244)";

        canvas.addEventListener("pointerdown", () => {
            this.flag = true;
        });
    };

    public isFill(): boolean {
        return this.flag;
    };

    public clear(): void {
        try {
            this.flag = false;
            this.signaturePad.clear();  
        } catch (error) {}
    };

    public getSignature(): string {
        return this.signaturePad.toDataURL();
    };

    public setSignature(dataUrl: string): void {     
        try {
            this.signaturePad.fromDataURL(dataUrl, {width: 300, height: 150});
        } catch (error) {}
    };

};
