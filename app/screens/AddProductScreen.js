import React from 'react';
import { View, StyleSheet } from 'react-native';
import AddProductContent from '../components/Produto/AddProductContent';
import Footer from '../components/Produto/Footer';

const AddCategoryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AddProductContent navigation={navigation} />
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
    padding: 20,
  },
});

export default AddCategoryScreen;