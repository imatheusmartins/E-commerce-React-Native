import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import SearchHeader from '../components/Search/Header';
import SearchContent from '../components/Search/SearchContent';
import { obtemTodasCategorias } from '../../services/dbservice';
import Footer from '../components/Search/Footer';

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        setLoading(true);
        const categoriasData = await obtemTodasCategorias();
        setCategories(categoriasData);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias');
      } finally {
        setLoading(false);
      }
    };

    carregarCategorias();
  }, []);

  const searchByName = (text) => {
    setSearchText(text);
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryProducts', { 
      categoryId: category.id,
      categoryName: category.nome 
    });
  };

  const filteredCategories = categories.filter(category =>
    category.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F9AD3A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader onSearch={searchByName} />
      <SearchContent 
        categories={filteredCategories} 
        onCategoryPress={handleCategoryPress} 
      />
      <Footer navigation={navigation} />
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#FF3333',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SearchScreen;