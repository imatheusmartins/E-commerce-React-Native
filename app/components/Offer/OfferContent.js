import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { obtemTodosProdutosEmPromocao } from '../../../services/dbservice';
import CardOffer from './CardOffer';

const OfferContent = ({ navigation }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const produtosPromocao = await obtemTodosProdutosEmPromocao(100); // Limite alto
        setProdutos(produtosPromocao);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Não foi possível carregar os produtos em promoção');
      } finally {
        setLoading(false);
      }
    };

    carregarProdutos();
  }, []);

  const handlePressProduto = (produto) => {
    navigation.navigate('ProductDetailScreen', { 
      productId: produto.id
    });
  };

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

  if (produtos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum produto em promoção no momento</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={produtos}
      renderItem={({ item }) => (
        <CardOffer 
          produto={item} 
          onPress={handlePressProduto}
        />
      )}
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
    backgroundColor: '#1C1C1C',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    padding: 20,
  },
  errorText: {
    color: '#DB1921',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default OfferContent;