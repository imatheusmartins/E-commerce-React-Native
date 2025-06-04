import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import OfferContent from '../components/Offer/OfferContent';
import Footer from '../components/Offer/Footer';

const OfferScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1C1C1C" barStyle="light-content" />
      <OfferContent navigation={navigation} />
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
});

export default OfferScreen;