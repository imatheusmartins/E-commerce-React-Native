import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';
import Footer from '../components/Cart/Footer';
import { obtemProdutoPorId } from '../../services/dbservice';

const CartScreen = ({ route, navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Recebe itens da navegação (opcional)
  useEffect(() => {
    if (route.params?.cartItem) {
      addToCart(route.params.cartItem);
    }
  }, [route.params]);

  // Atualiza o total sempre que o carrinho muda
  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const addToCart = (newItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    const sum = cartItems.reduce(
      (acc, item) => acc + (item.preco * item.quantity),
      0
    );
    setTotal(sum);
  };

  const finalizeOrder = () => {
    Alert.alert(
      'Pedido Realizado',
      'Seu pedido foi enviado com sucesso!',
      [
        { text: 'OK', onPress: () => clearCart() }
      ]
    );
  };

  const cancelOrder = () => {
    Alert.alert(
      'Cancelar Pedido',
      'Deseja realmente cancelar o pedido?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => clearCart() }
      ]
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.itemsContainer}>
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <CartSummary 
          total={total}
          onFinalize={finalizeOrder}
          onCancel={cancelOrder}
        />
      )}
       <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  itemsContainer: {
    flex: 1,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#F9AD3A',
  },
});

export default CartScreen;