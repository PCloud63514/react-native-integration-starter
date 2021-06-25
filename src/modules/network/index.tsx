import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import DBManager from '../db'
import { EventListener } from '../utils';
import Optional from '../utils/Optional'
import * as NE from './exceptions'
declare global {
    interface IRestfulService extends EventListener {
        Request(ruleName: string, method: Method, dataBundle?: any, delay?:number):Promise<any>
        RetryRequest(fixRequestConfig: any, delay?:number): Promise<any>
        SendSequentialRequest():Promise<any>
        AddSequentialRequest(key:string, ruleName:string, method:Method, dataBundle?:any):void
        RemoveSequentialRequest(key:string):void
    }
}

function encode(val:any) {
    return encodeURIComponent(val)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%25/gi, '%')
      .replace(/%2C/gi, ',')
      .replace(/%5B/gi, '[')
      .replace(/%5D/gi, ']');
}

class RuleBody {
    readonly header
    readonly request
    readonly response
    constructor(header:any, request:any, response:any) {
        this.header = header
        this.request = request
        this.response = response
    }
}

class Rule {
    readonly address_subfix:string
    readonly ruleBodys:Map<Method, RuleBody>

    constructor(address_subfix:string, ruleBodys:Map<Method, RuleBody>) {
        this.address_subfix = address_subfix
        this.ruleBodys = ruleBodys
    }
}


interface IRestEventMethod {
    key:string
    ruleName: string
    method: Method
    dataBundle?: any
}

interface IRestSequentialRequester {
    sequentialRequest(rest:IRestfulService):Promise<any>
    addRestRequest(key:string, ruleName: string, method: Method, dataBundle?: any): void
    removeRestRequest(key:string):void
    // flush():void
}

// TODO A 요청의 결과가 B에 필요한 경우 어떻게 할 것인가....
// TODO A의 결과를 B에 넣는건 어렵지 않다 단 사용자의 로직이 수정될 필요 없이 작성하려면 어떻게 할 것인가
// TODO 요소의 값이 특정 문자열이면 결과를 참고하도록?? 흠..
// 결과의 그룹은 Map<String, any> 형식을 만들어서 값을 변경하도록 해야할 것이다.
class RestSequentialRequester implements IRestSequentialRequester {
    private _queue:Array<IRestEventMethod> = new Array<IRestEventMethod>()
    private _responseCacheObj:any = {}
    // private _responseCahceMap:Map<string, any> = new Map<string, any>()

    addRestRequest(key:string, ruleName: string, method: Method, dataBundle?: any): void {
        let index = this._queue.findIndex( value => value.key === key)
        if(index === -1) {
            this._queue.push({key, ruleName, method, dataBundle})
        } else {
            this._queue[index] = { key:key, ruleName:ruleName, method:method, dataBundle:dataBundle }
        }
    }

    removeRestRequest(key:string): void {
        this._queue = this._queue.filter(value => value.key !== key)
    }

    /* 재귀를 이용해 response를 cacheMap에 저장 */
    private recursionResponse(response:any, isReturn:boolean=false):any {
        let temp = {}
        if(response !== undefined && response !== null) {
            Object.keys(response).forEach((key:string, index:number) => {
                let data = response[key]
                if(data === undefined) { return }
                if(typeof(data) === 'object' && !Array.isArray(data)) {
                    Object.assign(this._responseCacheObj, {[key]: this.recursionResponse(data, true)})
                } else {
                    if(isReturn) {
                        Object.assign(temp, {[key]:data})
                    } else {
                        Object.assign(this._responseCacheObj, {[key]:data})
                    }
                }
            })

            if(isReturn) {
                return temp
            }
        }
        
    }

    // 요창(delay)

    
    /*
     queue에 저장된 Rest를 순차처리한다.
     각 rest의 response값은 recursion 로직을 통해 저장된다.
     rest요청 시 dataBundle에 object형식 값에 undefined가 존재할 경우 cacheMap에서 찾아낸다.
    */
    async sequentialRequest(rest:IRestfulService, isCahceFlush:boolean=true):Promise<any> {
        if(isCahceFlush) {
            this._responseCacheObj = {}
        }
        let delay = 500
        for(const {key, ruleName, method, dataBundle} of this._queue) {
            let response = undefined
            if(dataBundle === undefined) {
                response = await rest.Request(ruleName, method, this._responseCacheObj, delay)
            } else if(typeof(dataBundle) === "object" && !Array.isArray(dataBundle)) {
                this.recursionResponse(dataBundle)
                response = await rest.Request(ruleName, method, this._responseCacheObj, delay)
            } else if(Array.isArray(dataBundle)) {
                dataBundle.forEach((value:any) => {
                    if(typeof(value) === 'object') {
                        Object.keys(value).forEach((key) => {
                            if(value[key] === undefined) {
                                value[key] = this._responseCacheObj[key]
                            }
                        })
                    }
                })
                response = await rest.Request(ruleName, method, dataBundle, delay)
            } else {
                response = await rest.Request(ruleName, method, dataBundle, delay)
            }
            this.recursionResponse(response)
        }

        this._queue = new Array<IRestEventMethod>()

        // const obj:any = Array.from(this._responseCahceMap.entries()).reduce((main, [key, value]) => ({...main, [key]: value}), {})
        return this._responseCacheObj
    }
}



class RestfulService extends EventListener implements IRestfulService {
    private _isDataObjectPass:boolean = false
    private _instance:AxiosInstance|undefined = undefined
    private _header_configs:Map<any,any> = new Map<any,any>()
    private _rules:Map<string, Rule> = new Map<string,Rule>()
    private _exceptions:Array<NetworkException> = new Array<NetworkException>()
    private _token:string|undefined = undefined
    private _restSequentialRequester:RestSequentialRequester = new RestSequentialRequester()
    private retryCount:number = 0
    private RETRY_MAX_COUNT:number = 5
    wait = async(ms:number) => {
        return new Promise((resolve) => {setTimeout(resolve, ms)})
    }

    /** 통신 요청(기본 사항)
     * @param ruleName : api 명
     * @param method : 통신 방식 [GET|POST|DELETE|PUT]
     * @param dataBundle : 통신에 필요한 정보
     */
    async Request(ruleName: string, method: Method, dataBundle?: any, delay:number=0): Promise<any> {
        let requestConfig = await this.generateRequestConfig(ruleName, method, dataBundle)
        return await this._instance?.request(requestConfig).then(async (v)=> {
            await this.wait(delay)
            return v
        })
    }


    /** 재시도 요청 (config을 변경하지 않는다. 그대로 요청) */
    async RetryRequest(fixRequestConfig: any, delay:number=1500): Promise<any> {
        console.log("//==RetryRequest==//")
        await this.wait(delay)
        return await this._instance?.request(fixRequestConfig)
    }

    /** 순차 전송할 Request를 추가한다.
     * @param key = 순차 전송 Request Identify 값
     * @param ruleName = rest config에 정의된 요청 네임
     * @param method = GET | POST
     * @param dataBundle = 요청에 필요한 정보
     */
     AddSequentialRequest(key:string, ruleName: string, method: Method, dataBundle?: any): void {
        this._restSequentialRequester.addRestRequest(key, ruleName, method, dataBundle)
    }
    /** 순차 전송 Request를 제거한다. (key 기준)
     * @param key 
     */
    RemoveSequentialRequest(key:string) {
        this._restSequentialRequester.removeRestRequest(key)
    }
    /** 순차전송
     * @returns Request의 모든 결과 값. 
     */
    async SendSequentialRequest():Promise<any> {
        return await this._restSequentialRequester.sequentialRequest(this)
    }

    private async generateRequestConfig(ruleName: string, method: Method, dataBundle?: any): Promise<any> {
        const rule:Optional<Rule> = Optional.ofNullable(this._rules.get(ruleName))
        if(rule.isPresent() === false) { throw 'ruleName could not be found.' }
        let requestConfig:any = {
            ruleName:ruleName,
            url:rule.get().address_subfix,
            method:method
        }
        //요청 필요 정보 가져옴
        const ruleBody:Optional<RuleBody> = Optional.ofNullable(rule.get().ruleBodys.get(method))
        if(ruleBody.isPresent() === false) { throw 'No definitions associated with the method were found.' }

        //header 정보 병합
        requestConfig['headers'] = await this.genereateHeaders(ruleBody.get().header)
        //body 세팅
        if(dataBundle !== undefined) {
            let bodyForm = this.generateRequestBody(method, ruleBody.get().request, dataBundle)
            // console.log(bodyForm)
            if(requestConfig['headers']['content-type'] === "multipart/form-data;") {
                let fd = new FormData()
                // console.log(bodyForm.value)
                Object.keys(bodyForm.value).forEach((key) => {
                    fd.append(key, bodyForm.value[key])
                    // console.log(key)
                })
                requestConfig[bodyForm.type] = fd
            } else {
                if(bodyForm.type === 'url') { 
                    requestConfig['url'] += bodyForm.value
                } else {
                    requestConfig[bodyForm.type] = bodyForm.value
                }
            }
        }
        // console.log("@@@requestConfig@@@:", requestConfig)

        return requestConfig
    }

    private getRequestType(method:Method, request:any):'data'|'params'|'url' {
        if(request) {
            return method === 'POST' ? "data" : 'params'
        } else {
            return 'url'
        }
    }
    private generateRequestBody(method:Method, request:any, dataBundle?:any):{type:'data'|'params'|'url', value:any} {
        let key:'data'|'params'|'url' = this.getRequestType(method, request)
        let value:any = undefined
        if(typeof request === 'object') {}

        if(Array.isArray(request)) { 
            value = dataBundle
        } else if(typeof request === 'object') {
            let requestBody:any = {}
            Object.keys(request).forEach((key:string, _) => {
                let data = Optional.ofNullable(dataBundle[key])
                if(data.isPresent() === false) {  throw `request에 필요한 정보가 없습니다. key:${key}` }
                requestBody[key] = data.get()
            })
            value = requestBody
        } else {
            value = "/" + String(dataBundle)
        }

        return {
            type:key,
            value:value
        }
    }

    /*header 정보 병합*/
    private async genereateHeaders(header:any):Promise<any> {
        let headers = {}
        for(const configsName of header) {
            const c = this._header_configs.get(configsName)
            if (c === undefined ) { throw 'configName could not be found.'}
            
            if (configsName === 'Authorization') { 
                if(this._token === undefined || this._token === null) { this._token = await DBManager.Instance().Get("token") }
                // const refreshToken = await DBManager.Instance().Get('refreshToken')
                // c['headers']['refreshToken'] = refreshToken
                c['headers']['Authorization'] =  this._token
            }
            Object.assign(headers, c["headers"])
        }
        return headers
    }

    /*Rest RequestInterceptor 초기화*/
    private _initializeRequestInterceptor = () => {
        this._instance?.interceptors.request.use(
            this._handleRequest,
            this._handleRequestError
        )
    }

    /*Rest ResponseInterceptor 초기화*/
    private _initializeResponseInterceptor = () => {
        this._instance?.interceptors.response.use(
            this._handleResponse,
            this._handleResponseError
        )
    }

    /*Rest Request 진입*/
    private _handleRequest = (config:AxiosRequestConfig) => { 
        return config
    }

    /**config 정보에 맞춰 필요 정보만 Return 한다. */
    private _handleResponse = async(response: AxiosResponse) => {
        let config:any = response.config
        let data:any = response.data
        let ruleName = config.ruleName
        let method = config.method.toUpperCase()
        let responseBody = this._rules.get(ruleName)?.ruleBodys.get(method)?.response

        //TODO QuestionList API 값 수정이 되기 전까지 남아 있는 코드
        if(ruleName === "QUESTIONLIST") {
            Object.assign(data, {"list": data.data})
            delete data.data
        } else if(this._isDataObjectPass && typeof(data.data) === 'object'){
            Object.assign(data, data.data)
            delete data.data
        } 
        if (response.headers['token'] !== undefined) {
            console.log("headers:", response.headers)
            console.log("token:" + response.headers['token'])
            await DBManager.Instance().Update("token", response.headers['token']) 
            this._token = response.headers['token']
            if(response.headers['refreshToken'] !== undefined) {
                console.log("refreshToken:" + response.headers['refreshToken'])
                await DBManager.Instance().Update("refreshToken", response.headers['refreshToken']) 
            }
        }

        return this.dfs(responseBody, data)
    }

    dfs = (permissionObj:any, responseObj:any) => {
        let murgeObj:any = {}
        Object.keys(permissionObj).forEach((key) => {
            let keys:string[] = this.splitKey(key)
            if(typeof(permissionObj[key]) === 'object' && permissionObj[key] !== null && !Array.isArray(permissionObj[key])) {
                Object.assign(murgeObj, {[keys[1]]:this.dfs(permissionObj[key], responseObj[keys[0]])})
            } 
            else {
                if(responseObj !== undefined) {
                    Object.assign(murgeObj, {[keys[1]]:responseObj[keys[0]]})
                }
            }
        })
        // console.log("murgeObj:", murgeObj)
        return murgeObj
    }

    checkKey = (key:string):boolean => {
        if(key.indexOf("[") !== -1  && key.indexOf("]") !== -1) {
            return true
        }
        return false
    }

    splitKey = (key:string):string[] => {
        if(this.checkKey(key)) {
            let i = key.indexOf("[")
            let j = key.indexOf("]")
            return [key.substring(0, i), key.substring(i + 1, j)]
        }
        return [key, key]
    }

    /*Rest Request 에러*/
    protected _handleRequestError = (error:any) => { 
        return Promise.reject(error)
    }

    /*Rest Response 에러*/
    protected _handleResponseError = async(error:any) =>  {
        const errConfig = error.config
        const errStatus = error.response?.status
        
        if(errStatus !== 401) {
            console.log(error.response)
            console.log("error:", error)
        }

        const exception = this._exceptions.filter(exception => exception.errorCode === errStatus)[0]
        if(exception !== undefined) {
            return await new Promise((resolve, reject) => {
                resolve(exception.request(this, error))
            })
        }


    }

    private __init__ = () => {
        const config = this.GetConfig()
        this._isDataObjectPass = config._isDataObjectPass
        this._instance = axios.create({
            baseURL:config.address,
            paramsSerializer:(params:any) => {
                return Object.keys(params)
                .map((key) => {
                    var val = params[key];
                    if (val === null || typeof val === 'undefined') {
                    return;
                    }
                    var keyName = key;
                    if (Array.isArray(val)) {
                    keyName = key + '[]';
                    } else {
                    val = [val];
                    }
                    return val
                    .map((v:any) => {
                        if (Object.prototype.toString.call(v) === '[object Date]') {
                        v = v.toISOString();
                        } else if (v !== null && typeof v === 'object') {
                        v = JSON.stringify(v);
                        }
                        return encode(key) + '=' + encode(v);
                    })
                    .join('&');
                })
                .join('&');        
            },
            timeout: config.timeout
        })

        this.__init_config_(config)
        this.__init_rules_(config)
        this.__init_exceptions_()
        this._initializeRequestInterceptor()
        this._initializeResponseInterceptor()
    }

    private __init_config_(config:any) {
        Object.entries(config.configs).map(([key, value]) => {
            this._header_configs.set(key, value)
        })
    }

    private __init_rules_(config:any) {
        Object.entries<any>(config.Rules).map(([key, value]) => {
            const ruleName = key
            const ruleBodys = this.createRuleBodys(value)
            this._rules.set(ruleName, new Rule(value["address_subfix"], ruleBodys))
        })
    }

    private __init_exceptions_() {
        Object.entries<any>(NE).forEach(([className, networkException]) => {
            this._exceptions.push(new networkException())
        })
    }

    private createRuleBodys(value:any):Map<Method, RuleBody> {
        
        const Methods:Array<Method> = ["GET", "POST"]
        const map = new Map<Method, RuleBody>()

        Methods.forEach((method) => {
            const rb = value[method]
            if(rb) {
                const header = rb["header"]
                const request = rb["request"]
                const response = rb["response"]
                map.set(method, new RuleBody(header, request, response)) 
            }
        })

        return map
    }

    private GetConfig():any {
        if(SingleRest.CONFIG !== undefined) {
            return SingleRest.CONFIG
        }
        throw "Rest.CONFIG is Empty."
    }

    private __close__ = () => {

    }

    receive = async() => {
        this.__init__()
    }

    dispose = async() => {
        this.__close__()
    }
}

export default class SingleRest {
    private static _instance:IRestfulService|undefined = undefined
    public static CONFIG:any
    static Instance():IRestfulService {
        if(SingleRest._instance === undefined) {
            SingleRest._instance = new RestfulService()
        }
        return this._instance!
    }
}