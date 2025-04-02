import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const CardOffer = ({ produto, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(produto)}
    >
      <Image 
        source={{ uri: produto.imagem || 'https://via.placeholder.com/300' }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <Text style={styles.name} numberOfLines={2}>{produto.nome}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>R$ {produto.preco.toFixed(2)}</Text>
        {produto.em_promocao && (
          <Text style={styles.promoText}>PROMOÇÃO</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 0.8,
  },
  image: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  priceContainer: {
    backgroundColor: '#F9AD3A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
  },
  price: {
    color: '#1C1C1C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  promoText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  }
});

export default CardOffer;