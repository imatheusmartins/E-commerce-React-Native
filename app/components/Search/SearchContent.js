import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import CategoryCard from './CategoryCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

const SearchContent = ({ categories, onCategoryPress }) => {
  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <CategoryCard 
        category={item} 
        onPress={() => onCategoryPress(item)}
      />
    </View>
  );

  return (
    <FlatList
      data={categories}
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
    backgroundColor: '#1C1C1C'
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 10,
  },
});

export default SearchContent;