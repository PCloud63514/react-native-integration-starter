import React from 'react';
import BestGoodsTabPresenter from './BestGoodsTabPresenter';

export default class BestGoodsTabContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    render() {
        return (<BestGoodsTabPresenter/>);
    }
}