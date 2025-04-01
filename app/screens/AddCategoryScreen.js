import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Home/Header'; // Importe seu Header
import AddCategoryContent from '../components/Categoria/AddCategoryContent';
import Footer from '../components/Categoria/Footer';

const AddCategoryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <AddCategoryContent navigation={navigation} />
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