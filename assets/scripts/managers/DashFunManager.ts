import { _decorator,Component,EventTarget, System } from "cc";
import { NetworkManager } from "./NetworkManager";

const { ccclass, property } = _decorator;

export class UserProfile{
    id: string;
    channelId: string;
    displayName: string;
    userName: string;
    avatarUrl: string;
    from: number;
    createData: number;
    loginTime: number;
}

export enum PayItemType{
    Coin = 0,
    Diamond,
}

export class DashFunManager extends Component{

    //define getUserProfileResult event
    public static EVENT_GET_USER_PROFILE_RESULT = "getUserProfileResult";
    //define requestPaymentResult event
    public static EVENT_REQUEST_PAYMENT_RESULT = "requestPaymentResult";
    //define openInvoiceResult event
    public static EVENT_OPEN_INVOICE_RESULT = "openInvoiceResult";

    

    private static _instance:DashFunManager | null = null;

    public static get instance():DashFunManager{
        if(this._instance == null){
            this._instance = new DashFunManager();
        }
        return this._instance;
    }

    private _gameId:string = "ForTest";
    private testMode:boolean = true;

    public eventTarget:EventTarget = new EventTarget();

    //define constructor
    public constructor(){
        super();
        console.log("DashFunManager constructor");
        window.addEventListener("message", this.onMessage.bind(this));
    }

    protected start(): void {
        
    }
    
    /*
    const {parent} = window;
    const msg = {
	dashfun:{
		method:"loading",
		payload:{
			value:1, //value取值范围0-100
		}
	}
}
    parent.postMessage(msg, "*")
*/
    public updateLoadingProgress(value:number){
        const msg = {
            dashfun:{
                method:"loading",
                payload:{
                    value:value, //value取值范围0-100
                }
            }
        }
        console.log(`updateLoadingProgress ${value}`);
        window.parent.postMessage(msg, "*");

        // if (typeof window.loading === 'function') {
        //     window.loading(value);
        // }
    }

    /**
     * type UserProfile = {
	id: string				//dashfun userId
	channelId: string		//渠道方id，此处为TG的用户Id
	displayName: string 	//显示名称
	userName: string 		//用户名
	avatarUrl: string		//avatar地址
	from: number			//用户来源
	createData: number		//创建时间
	loginTime: number		//登录时间
	logoffTime: number		//登出时间
	language: string		//language code
}

const { parent } = window;

const msg = {
	dashfun:{
		method:"getUserProfile"
	}
}

//发送消息
parent.postMessage(msg, "*")

//接收结果
window.addEventListener("message", ({data}) => {
	const dashfun = data.dashfun;
	if(!dashfun) return;

	//回应消息的名字=发送消息的名字+Result
	if(dashfun.method == "getUserProfileResult"){
		console.log(dashfun.result.data) //UserProfile
	}
})
     */
    public getUserProfile(){
        console.log("getUserProfile start...");
        const msg = {
            dashfun:{
                method:"getUserProfile"
            }
        }
        window.parent.postMessage(msg, "*");
        
    }

    /*
    type PaymentRequest = {
	title:string, //付费项目名称，将显示在telegram的支付界面上
	desc:string, //项目描述
	info:string, //支付携带信息
	price:number, //付费项目价格，单位为telegram stars
}

type PaymentRequestResult = {
	invoiceLink: string, //tg invokce 链接
	paymentId: string, //dashfun平台paymentId
}

const { parent } = window;

const msg = {
	dashfun:{
		method: "requestPayment",
		payload:{ //PaymentRequest
			title:"200钻石",
			desc: "购买200钻石",
			info: "200钻石",
			price: 2,
		}
	}
}
//发送消息
parent.postMessage(msg, "*")
    */

    public async requestPayment(title:string, desc:string, type:PayItemType, price:number){

        if(this.testMode){
            const result = await NetworkManager.instance.requestAddDiamondForTest(price);
            if (result && result.success) {
                console.log(`Added ${result.data.added_amount} diamonds to user ${result.data.user_id}`);
                this.eventTarget.emit(DashFunManager.EVENT_OPEN_INVOICE_RESULT, result.success,0,Number(result.data.added_amount));
            }
            return;
        }
        
        console.log(`requestPayment title: ${title} , desc: ${desc} , type: ${type} , price: ${price} , ceshi`);
        const msg = {
            dashfun:{
                method: "requestPayment",
                payload:{
                    title:title,
                    desc:desc,
                    info:type.toString(),
                    price:price,
                }
            }
        }
        window.parent.postMessage(msg, "*");
    }

    /*
    type OpenInvoiceRequest = {
	invoiceLink: string, //tg invokce 链接
	paymentId: string, //dashfun平台paymentId
}

type OpenInvoiceResult = {
	paymentId: string, //dashfun平台paymentId
	status: "paid"|"canceled"|"failed"
}


const { parent } = window;

const msg = {
	dashfun:{
		method: "openInvoice",
		payload:{ //OpenInvoiceRequest
			invoiceLink: "https:/t.me/$xxxxxxx",
			paymentId: "12345"
		}
	}
}
//发送消息
parent.postMessage(msg, "*")


//接收结果
window.addEventListener("message", ({data})=>{
	const dashfun = data.dashfun;
	if(!dashfun) return;

	//回应消息的名字=发送消息的名字+Result
	if(dashfun.method == "openInvoiceResult"){
		console.log(dashfun.result.data) //OpenInvoiceResult
		const {paymentId, status} = dashfun.result.data;
	}
})
    */
    public openInvoice(invoiceLink:string, paymentId:string){
        console.log(`openInvoice ${invoiceLink} , paymentId: ${paymentId}`);
        const msg = {
            dashfun:{
                method: "openInvoice",
                payload:{
                    invoiceLink:invoiceLink,
                    paymentId:paymentId,
                }
            }
        }
        window.parent.postMessage(msg, "*");
    }
   

    protected async onMessage(event:MessageEvent){
        console.log("onMessage start ...");
        const data = event.data;
        const dashfun = data.dashfun;
        if(!dashfun) return;

        if(dashfun.method == DashFunManager.EVENT_GET_USER_PROFILE_RESULT){
            this.eventTarget.emit(DashFunManager.EVENT_GET_USER_PROFILE_RESULT, dashfun.result.data);
        }
        if(dashfun.method == DashFunManager.EVENT_REQUEST_PAYMENT_RESULT){
            this.openInvoice(dashfun.result.data.invoiceLink, dashfun.result.data.paymentId);
            //this.eventTarget.emit(DashFunManager.EVENT_REQUEST_PAYMENT_RESULT, dashfun.result.data);
        }
        if(dashfun.method == DashFunManager.EVENT_OPEN_INVOICE_RESULT){
            const {paymentId, status} = dashfun.result.data;
            console.log(`openInvoiceResult paymentId: ${paymentId} , status: ${status}`);
            if(status == "paid"){
                const result = await NetworkManager.instance.queryPaymentResult("ForTest", paymentId);
                //LOG RESULT
                console.log(`queryPaymentResult result: ${JSON.stringify(result)}`);
                if(result.success){
                    const index = parseInt(result.data.type);

                    this.eventTarget.emit(DashFunManager.EVENT_OPEN_INVOICE_RESULT, result.success,index,Number(result.data.amount));
                }
            }
        }
    }
}