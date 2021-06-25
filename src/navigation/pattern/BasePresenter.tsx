import React from 'react'

// TODO Container DidMount를 위해 초기 render 스킵작업을 해야할지 고민해야함.
export default class BasePresenter extends React.Component<any, any> {
    _container:any|IContainer|undefined = undefined

    constructor(props:any, container:any=undefined) {
        super(props)
        this._container = container
    }

    async componentDidMount() {
        await this._container?.componentDidMount(this.props);
        this.setState({})
    }

    componentDidUpdate() {
        this._container?.componentDidUpdate(this.props);
    }

    async componentWillUnmount() {
        this._container?.componentWillUnmount(this.props);
    }
}