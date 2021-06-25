//1. 어떤 상황에 Exception이 되어야할지 규칙을 정할 수 있어야한다
//2. Exception이 호출되었을 때 특정 행동을 취할 수 있어야한다
//3. 상속용 클래스 이므로 구현하기 편하도록 설계해야한다
//4. 반환은 성공여부와 결과를 알 수 있는 ExceptionResult여야한다.


/** 
 * @description
 *     Exception Interface.
 * @method exceptionRole Exception 규칙을 정의하기 위한 추상메소드
 * @returns(Boolean) true=Exception이 발생했을 때. false=Exception이 발생하지 않았을 때
 */
interface IException<T> {
    /** 
     * @description Exception 규칙을 정의하기 위한 메소드
     */
    exceptionRole:(arg:T)=>Promise<Boolean>
}

/**
 * @description Exception 처리에 대한 결과
 */
interface IExceptionResult<T=any> {
    /**
     * @description 실행 결과를 반환
     */
    getResult:()=>T
    /**
     * @description Exception이 발생하여 동작이 실패하였는지에 대한 결과를 반환.
     * @return success - Exception이 발생하지 않음
     * @return fail - Exception이 발생
     */
    getType:()=>"success"|"fail"
}

/**
 * @description IException을 구현한 추상클래스
 */
export abstract class Exception<T> implements IException<T> {
    async exceptionRole(arg:T):Promise<Boolean> {
        return false
    }
}

/**
 * @description Exception 추상클래스의 예제를 위한 Sample Class1
 */
class SampleException1 extends Exception<number> {
    async exceptionRole(arg:number) {
        if(arg > 10) {
            return true
        }
        return false
    }
}

/**
 * @description Exception 추상클래스의 예제를 위한 Sample Class2
 */
class SampleException2 extends Exception<string> {
    async exceptionRole(arg:string) {
        if(arg == 'hello') {
            return true
        }
        return false
    }
}

/**
 * @description IExceptionResult를 구현한 클래스
 */
export class ExceptionResult<T=any> implements IExceptionResult<T> {
    constructor(private type:"success"|"fail", private result:T) {
    }

    getResult() {
        return this.result
    }

    getType() {
        return this.type
    }
}

class ExceptionSuccessHandler {

}

class ExceptionFailureHandler {

}