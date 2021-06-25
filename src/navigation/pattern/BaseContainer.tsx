//

declare global {
    interface IContainer {
        componentDidMount(props:any):void
        componentDidUpdate(props:any):void
        componentWillUnmount(props:any):void
    }
}

export default class BaseContainer {
    _props:any
    constructor(props:any) {
        this._props = props
    }
    
    async componentDidMount() {

    }

    componentDidUpdate() {

    }

    componentWillUnmount() {

    }
}