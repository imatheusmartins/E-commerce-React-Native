import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { obtemProdutosLancamento, obtemProdutosMaisVendidos } from '../../../services/dbservice';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const HomeContent = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Chamadas separadas para evitar conflito de fechamento de conexão
        const lancamentosData = await obtemProdutosLancamento();
        const maisVendidosData = await obtemProdutosMaisVendidos();

        if (isMounted) {
          setLancamentos(lancamentosData);
          setMaisVendidos(maisVendidosData);
          console.log('Dados Carregados')
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderCarouselItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id })}>

        <Animated.View style={[styles.carouselItem, { transform: [{ scale }] }]}>
          <Image source={{ uri: item.imagem }} style={styles.carouselImage} />
          <Text style={styles.carouselTitle}>{item.nome}</Text>
          <Text style={styles.carouselPrice}>R$ {item.preco.toFixed(2)}</Text>
        </Animated.View>

      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.imagem }} style={styles.productImage} />
      <Text style={styles.productTitle}>{item.nome}</Text>
      <Text style={styles.productPrice}>R$ {item.preco.toFixed(2)}</Text>
    </View>
  );

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {lancamentos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index ? styles.paginationDotActive : null
            ]}
          />
        ))}
      </View>
    );
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (screenWidth * 0.8));
        setCurrentIndex(index);
      }
    }
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Seção de Lançamentos - Carrossel Customizado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lançamentos</Text>
        <Animated.FlatList
          data={lancamentos}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={screenWidth * 0.8}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContainer}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
        {renderPagination()}
      </View>

      {/* Seção de Mais Vendidos - Grid 2 colunas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mais Vendidos</Text>
        <FlatList
          data={maisVendidos}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingLeft: 10,
    color: '#fff'
  },
  carouselContainer: {
    paddingHorizontal: 10,
  },
  carouselItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 20,
  },
  carouselImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  carouselPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginTop: 5,
  },
  productItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    maxWidth: '50%',
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginTop: 5,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2a9d8f',
    width: 12,
  },
});

export default HomeContent;