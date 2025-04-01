import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  obterPedido, 
  finalizarPedido, 
  cancelarPedido, 
  removerItemDoPedido, 
  atualizarItemPedido,
  obterPedidoAtivo  // Adicionei esta importação
} from '../../services/dbservice';

const CartScreen = ({ route, navigation }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCartData = async () => {
    try {
      setLoading(true);
      // Primeiro tenta usar o orderId da rota, senão busca o pedido ativo
      const orderId = route.params?.orderId;
      const activeOrder = orderId ? await obterPedido(orderId) : await obterPedidoAtivo();
      
      if (activeOrder && activeOrder.itens && activeOrder.itens.length > 0) {
        setCart(activeOrder);
      } else {
        setCart(null); // Força o estado vazio
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      Alert.alert('Erro', 'Não foi possível carregar o carrinho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCartData();
    });

    // Carrega os dados inicialmente
    loadCartData();

    return unsubscribe;
  }, [navigation]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      setLoading(true);
      await atualizarItemPedido(itemId, newQuantity);
      await loadCartData(); // Recarrega os dados após atualização
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a quantidade');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true);
      await removerItemDoPedido(itemId);
      await loadCartData(); // Recarrega os dados após remoção
    } catch (error) {
      console.error('Erro ao remover item:', error);
      Alert.alert('Erro', 'Não foi possível remover o item');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
        setLoading(true);
        const vendaId = await finalizarPedido(cart.id);
        
        Alert.alert(
            'Compra Finalizada!',
            `Venda #${vendaId} registrada com sucesso!`,
            [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('HomeScreen'),
                }
            ]
        );
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        Alert.alert('Erro', 'Não foi possível finalizar a compra');
    } finally {
        setLoading(false);
    }
};

  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      Alert.alert('Erro', 'Não foi possível cancelar o pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6608" />
        <Text style={styles.loadingText}>Carregando carrinho...</Text>
      </View>
    );
  }

  if (!cart || !cart.itens || cart.itens.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-off" size={60} color="#888" />
        <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <Text style={styles.continueButtonText}>Continuar comprando</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.itemsContainer}>
        {cart.itens.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Image 
              source={{ uri: item.imagem || 'https://via.placeholder.com/100' }} 
              style={styles.itemImage}
            />
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <Text style={styles.itemPrice}>R$ {item.valor_unitario.toFixed(2)}</Text>
              
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  onPress={() => handleUpdateQuantity(item.id, item.quantidade - 1)}
                  disabled={item.quantidade <= 1}
                >
                  <MaterialCommunityIcons name="minus" size={20} color="#FF6608" />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantidade}</Text>
                
                <TouchableOpacity 
                  onPress={() => handleUpdateQuantity(item.id, item.quantidade + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FF6608" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.itemTotal}>
              <Text style={styles.totalText}>R$ {item.valor_total.toFixed(2)}</Text>
              <TouchableOpacity 
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeButton}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3333" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>R$ {cart.valor_total.toFixed(2)}</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelOrder}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.checkoutButton]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Finalizar Compra</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    backgroundColor: '#1C1C1C',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1C1C1C',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#FF6608',
    padding: 15,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    padding: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF6608',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#FFF',
  },
  itemTotal: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#1C1C1C',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 18,
    color: '#FFF',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6608',
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
  },
  cancelButton: {
    backgroundColor: '#333',
    marginRight: 10,
  },
  checkoutButton: {
    backgroundColor: '#FF6608',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;