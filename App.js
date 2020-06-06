import React from 'react';
import Splash from './Splash'
import { StyleSheet, Text, View } from 'react-native';

export default class App extends React.Component {
  state = {
    isLoading: true
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {isLoading} = this.state;
    return isLoading ? (<Splash/>) : (<View><Text>is NULL</Text></View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
