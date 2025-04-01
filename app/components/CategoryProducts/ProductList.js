import React from 'react';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
import ProductCard from './ProductCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

const ProductList = ({ products }) => {
  const renderItem = ({ item }) => (
    <ProductCard product={item} />
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default ProductList;