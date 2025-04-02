import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getProductById, adicionarItemAoPedido, criarPedido } from '../../../services/dbservice';

const { width } = Dimensions.get('window');

const ProductDetail = ({ productId, navigation, route }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isPromo, setIsPromo] = useState(route.params?.isPromo || false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carrega o produto
        const productData = await getProductById(productId);
        if (isMounted) {
          setProduct(productData);
          // Se veio da tela de promoções, força mostrar como promoção
          if (route.params?.fromPromo) {
            setIsPromo(true);
          }
        }
        
        // Cria um novo pedido se não existir um aberto
        const newOrderId = await criarPedido();
        if (isMounted) setCurrentOrderId(newOrderId);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        if (isMounted) Alert.alert('Erro', 'Não foi possível carregar o produto');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || !currentOrderId) return;
    
    setLoading(true);
    try {
      await adicionarItemAoPedido(currentOrderId, product.id, quantity);
      Alert.alert('Sucesso', 'Produto adicionado ao carrinho!');
      
      // Navega de volta para a tela de promoções se veio de lá
      if (route.params?.fromPromo) {
        navigation.navigate('SaleScreen');
      } else {
        navigation.navigate('CartScreen');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      Alert.alert('Erro', 'Não foi possível adicionar ao carrinho');
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.estoque || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!product || !currentOrderId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6608" />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FF6608" />
          </TouchableOpacity>
          
          {(isPromo || product.em_promocao) && (
            <View style={styles.promoHeaderTag}>
              <Text style={styles.promoHeaderText}>PROMOÇÃO</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Image 
            source={{ uri: product.imagem || 'https://via.placeholder.com/300' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
          
          <View style={styles.detailsContainer}>
            <Text style={styles.productName}>{product.nome}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>R$ {product.preco.toFixed(2)}</Text>
              
              {(isPromo || product.em_promocao) && (
                <View style={styles.promoTag}>
                  <Text style={styles.promoTagText}>-30%</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.productDescription}>{product.descricao}</Text>
          </View>
          
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantidade:</Text>
            
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <MaterialCommunityIcons name="minus" size={24} color="#FF6608" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setQuantity(Math.min(num, product.estoque || 10));
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={increaseQuantity}
                disabled={quantity >= (product.estoque || 10)}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#FF6608" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.stockText}>
              {product.estoque > 0 
                ? `${product.estoque} disponíveis em estoque` 
                : 'Produto esgotado'}
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buyButton]}
              onPress={handleAddToCart}
              disabled={loading || product.estoque <= 0}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {product.estoque > 0 ? 'ADICIONAR AO CARRINHO' : 'ESGOTADO'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  promoHeaderTag: {
    backgroundColor: '#FF6608',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  promoHeaderText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFF',
    fontSize: 16,
  },
  productImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#333',
    alignSelf: 'center',
  },
  detailsContainer: {
    marginBottom: 25,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6608',
  },
  productDescription: {
    fontSize: 16,
    color: '#AAA',
    lineHeight: 24,
  },
  promoTag: {
    backgroundColor: '#FF6608',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  promoTagText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityContainer: {
    marginBottom: 30,
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 15,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 5,
  },
  quantityInput: {
    width: 60,
    height: 40,
    backgroundColor: '#333',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
    fontSize: 18,
  },
  stockText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 10,
  },
  button: {
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: '#FF6608',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductDetail;