
/**
 * 클래스 데코레이터
 * @param constructor Function
 */
function classDecorator(constructor:Function) {
    
}

/**
 * 메서드 데코레이터
 * 메서드 정의를 관찰, 수정할 수 있다.
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
function methodDecorator(target:any, propertyKey:string, descriptor:PropertyDescriptor) {

}

/**
 * 변수 데코레이터
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
function ParameterDecorator<T>(target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<T>) {

}

// 접근제어자 데코레이터

/**
 * 매개변수 데코레이터
 * @param target 
 * @param propertyKey 
 * @param parameterIndex 매개변수 순서
 * 
 * @example
 * class Boo {
 * 
 * boo(@parameterDecorator name:string) {
 * }
 * }
 */
function ArgsDecorator(target:Object, propertyKey:string|symbol, parameterIndex:number) {

}