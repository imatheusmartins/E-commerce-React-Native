// screens/HomeScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Home/Header';
import HomeContent from '../components/Home/HomeContent';
import Footer from '../components/Home/Footer';

const HomeScreen = ({ navigation }) => { // Recebe navigation do Stack.Navigator
  return (
    <View style={styles.container}>
      {/* Passe a prop navigation para o Header */}
      <Header navigation={navigation} />
      
      <View style={styles.contentWrapper}>
        <HomeContent />
      </View>
      
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentWrapper: {
    flex: 1,
  },
});

export default HomeScreen;