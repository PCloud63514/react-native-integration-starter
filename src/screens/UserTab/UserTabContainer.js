import React from 'react';
import UserTabPresenter from './UserTabPresenter';

export default class UserTabContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<UserTabPresenter/>);
    }
}