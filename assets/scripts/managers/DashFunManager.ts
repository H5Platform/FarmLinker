import { _decorator,Component,EventTarget } from "cc";

const { ccclass, property } = _decorator;

export class DashFunManager extends Component{

    //define requestPaymentResult event
    public static EVENT_REQUEST_PAYMENT_RESULT = "EVENT_REQUEST_PAYMENT_RESULT";

    

    private static _instance:DashFunManager | null = null;

    public static get instance():DashFunManager{
        if(this._instance == null){
            this._instance = new DashFunManager();
        }
        return this._instance;
    }

    public eventTarget:EventTarget = new EventTarget();

    public onLoad(): void {
        window.addEventListener("message", this.onMessage.bind(this));
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
        window.postMessage(msg, "*");
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
        window.postMessage(msg, "*");
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

    public requestPayment(title:string, desc:string, info:string, price:number){
        const msg = {
            dashfun:{
                method: "requestPayment",
                payload:{
                    title:title,
                    desc:desc,
                    info:info,
                    price:price,
                }
            }
        }
        window.postMessage(msg, "*");
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
        const msg = {
            dashfun:{
                method: "openInvoice",
                payload:{
                    invoiceLink:invoiceLink,
                    paymentId:paymentId,
                }
            }
        }
        window.postMessage(msg, "*");
    }
   

    protected onMessage(event:MessageEvent){
        const data = event.data;
        const dashfun = data.dashfun;
        if(!dashfun) return;

        if(dashfun.method == "getUserProfileResult"){
            this.eventTarget.emit("getUserProfileResult", dashfun.result.data);
        }
        if(dashfun.method == "requestPaymentResult"){
            this.eventTarget.emit(DashFunManager.EVENT_REQUEST_PAYMENT_RESULT, dashfun.result.data);
        }
        if(dashfun.method == "openInvoiceResult"){
            this.eventTarget.emit("openInvoiceResult", dashfun.result.data);
        }
    }
}