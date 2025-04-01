import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: item.imagem || 'https://via.placeholder.com/100' }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.price}>R$ {item.preco.toFixed(2)}</Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
        >
          <Icon name="remove" size={20} color="#F9AD3A" />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity 
          onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
        >
          <Icon name="add" size={20} color="#F9AD3A" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        onPress={() => onRemove(item.id)}
        style={styles.removeButton}
      >
        <Icon name="delete" size={24} color="#FF3333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#F9AD3A',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  removeButton: {
    padding: 5,
  },
});

export default CartItem;