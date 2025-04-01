import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Footer = ({ navigation }) => {
  return (
    <View style={styles.footerContainer}>
      {/* Ícone Home com círculo destacado */}
      <View style={styles.homeIconWrapper}>
        <TouchableOpacity 
          style={styles.homeIconCircle}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <MaterialCommunityIcons name="alpha-z" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={[styles.iconText, { color: '#FFF' }]}>Home</Text>
      </View>

      {/* Ícone Busca */}
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search-outline" size={24} color="#999" />
        <Text style={styles.iconText}>Busca</Text>
      </TouchableOpacity>

      {/* Ícone Marcas */}
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => navigation.navigate('Brands')}
      >
        <Ionicons name="sparkles-outline" size={24} color="#999" />
        <Text style={styles.iconText}>Marcas</Text>
      </TouchableOpacity>

      {/* Ícone Ofertas */}
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => navigation.navigate('Offers')}
      >
        <MaterialCommunityIcons name="sale" size={24} color="#999" />
        <Text style={styles.iconText}>Ofertas</Text>
      </TouchableOpacity>

      {/* Ícone Carrinho */}
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => navigation.navigate('Cart')}
      >
        <MaterialCommunityIcons name="cart-outline" size={24} color="#999" />
        <Text style={styles.iconText}>Carrinho</Text>
      </TouchableOpacity>
    </View>
  );
};

// Mantenha os mesmos estilos que você já tinha
const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 70,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingHorizontal: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  homeIconWrapper: {
    alignItems: 'center',
    marginBottom: 9
  },
  homeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#39FF14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 4,
    borderColor: '#000',
    elevation: 10
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    width: 60,
  },
  iconText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    color: '#999'
  },
});

export default Footer;