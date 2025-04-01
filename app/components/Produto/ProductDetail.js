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
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProductById, adicionarItemAoPedido, criarPedido } from '../../../services/dbservice';

const ProductDetail = ({ productId, navigation }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Carrega o produto
        const productData = await getProductById(productId);
        if (isMounted) setProduct(productData);
        
        // Cria um novo pedido se não existir um aberto
        const newOrderId = await criarPedido();
        if (isMounted) setCurrentOrderId(newOrderId);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        if (isMounted) Alert.alert('Erro', 'Não foi possível carregar o produto');
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
      navigation.navigate('CartScreen');
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
        <View style={styles.contentContainer}>
          <Image 
            source={{ uri: product.imagem || 'https://via.placeholder.com/300' }} 
            style={styles.productImage}
            resizeMode="contain"
          />
          
          <View style={styles.detailsContainer}>
            <Text style={styles.productName}>{product.nome}</Text>
            <Text style={styles.productPrice}>R$ {product.preco.toFixed(2)}</Text>
            <Text style={styles.productDescription}>{product.descricao}</Text>
            
            {product.em_promocao && (
              <View style={styles.promoBadge}>
                <Text style={styles.promoText}>PROMOÇÃO</Text>
              </View>
            )}
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
                ? `${product.estoque} disponíveis` 
                : 'Produto esgotado'}
            </Text>
          </View>

          {/* Botões agora fazem parte do conteúdo rolável */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buyButton]}
              onPress={handleAddToCart}
              disabled={loading || product.estoque <= 0}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {product.estoque > 0 ? 'Comprar' : 'Esgotado'}
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
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 500, // Espaço extra para o footer
  },
  contentContainer: {
    padding: 20,
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
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#333',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6608',
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 15,
    lineHeight: 24,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6608',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  promoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  quantityContainer: {
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 18,
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
  },
  footer: {
    padding: 20,
    backgroundColor: '#1C1C1C',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  cancelButton: {
    backgroundColor: '#333',
    marginRight: 10,
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