import React from 'react';
import { Root } from 'native-base';
import Splash from './Splash'
import MainNavigation from './src/navigation/MainNavigation'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  render() {
    const { isLoading } = this.state;
    return isLoading ? (<Splash/>) : 
    <Root>
      <MainNavigation/>
    </Root>;
  }
}