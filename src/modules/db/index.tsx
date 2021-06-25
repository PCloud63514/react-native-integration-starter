import config from '../../config/db'
import SQLite, {SQLiteDatabase } from 'react-native-sqlite-storage'
import { EventListener, ExceptionPromise } from '../utils'

SQLite.enablePromise(true)
const DB_NAME = config.DB_NAME
const DB_VERSION = config.DB_VERSION
const DB_DISPLAY_NAME = config.DB_DISPLAY_NAME
const TABLE_NAME = config.TABLE_NAME
const PRINT_LOG = config.SHOW_PRINT_LOG

declare global {
    interface IDBManager {
        Get(key:string, isArray:boolean):any
        Update(key:string, value:any):any
        Delete(key:string, isArray:boolean):any
    }
}

/** Sample Code                                                      
    await DBManager.Instance().Update("Test", "반가워요")        
    await DBManager.Instance().Delete("Test", false)              
    let data = await DBManager.Instance().Get("Test")                
    console.log(data)
 */
class DBManager extends EventListener implements IDBManager {
    private _db:SQLiteDatabase|undefined = undefined

    receive = async() => {
        this._db = this.OpenDatabase()["_W"]
        await this.InitDatabase()
    }

    dispose = async() => {
        ExceptionPromise(async()=> {
            if(this._db) {
                await this._db.close()
            }
        })
    }

    private PrintLog(msg:string) {
        if(PRINT_LOG) {
            console.log(msg)
        }
    }

    private OpenDatabase():any {
        return SQLite.openDatabase({name:DB_NAME, createFromLocation:'~www/' + DB_NAME, location:'default'})
    }

    private async InitDatabase() {
        const query = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME}("key" TEXT NOT NULL, "value" TEXT NOT NULL, PRIMARY KEY("key"))`
        await ExceptionPromise(async() => {
            await this._db?.transaction((tx:SQLite.Transaction) => {
                tx.executeSql(query, [])
            })
            return true
        })
    }

    Get = async(key:string, isArray:boolean=false) => {
        let query = `Select * from ${TABLE_NAME} where `
        //TODO like 조건이 너무 단순함. 숫자만 인식하도록 변경해야함.
        if (isArray) {
            query += 'key like "' + key + '%"'
        } else {
            query += 'key="' + key + '"'
        }
        this.PrintLog(query)
        return await ExceptionPromise(async() => {
            let response = undefined
            await this._db?.transaction((tx) => {
                tx.executeSql(query,[],(_, {rows})=> {
                    if(isArray) {
                        var len = rows.length
                        response = []
                        for(let i = 0; i < len; i++) {
                            response.push(rows.item(i).value)
                        }
                    } else {
                        response = rows.item(0).value
                    }
                })
            })
            return response
        })
    }

    Update = async(key:string, value:any) => {
        await ExceptionPromise(async() => {
            await this._db?.transaction((tx) => {
                if(Array.isArray(value)) {
                    value.forEach((data, index) => {
                        const query = `Insert OR Replace into ${TABLE_NAME}(key,value) values("${key}${index}","${String(data)}")`
                        this.PrintLog(query)
                        tx.executeSql(query, [])
                    })
                } else {
                    const query = `Insert OR Replace into ${TABLE_NAME}(key,value) values("${key}","${String(value)}")`
                    this.PrintLog(query)
                    tx.executeSql(query, [])
                }
            })
            return true
        })
    }

    //TODO 배열 형태는 특정 값만 삭제하고 싶다 예시 (A0 ~ A5 중 0~3만 제거 하고 싶다)
    //TODO 과연 isArray 라는 플래그로 배열을 핀딘하는 것이 옳을까
    //
    Delete = async(key:string, isArray:boolean=false) => {
        let query = `delete from ${TABLE_NAME} where `
        
        if (isArray) {
            query += "key like '" + key + "%'"
        } else {
            query += 'key="' + key + '"'
        }
        this.PrintLog(query)
        await ExceptionPromise(async() => {
            this._db?.transaction((tx) => {
                tx.executeSql(query, [])
            })
            return true
        })
    }
}

class SingletonDBManager {
    private static _Instance:DBManager
    static Instance() {
        if(SingletonDBManager._Instance === undefined) {
            SingletonDBManager._Instance = new DBManager()
        }
        return SingletonDBManager._Instance
    }
}



export default SingletonDBManager