import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Footer = ({ navigation }) => {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <View style={styles.homeIconWrapper}>
          <TouchableOpacity 
            style={styles.homeIconCircle}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <MaterialCommunityIcons name="star" size={20} color="#DB1921" />
          </TouchableOpacity>
          <Text style={[styles.iconText, { color: '#FFF' }]}>Home</Text>
        </View>

        {/* Ícone Busca */}
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Ionicons name="search-outline" size={24} color="#999" />
          <Text style={styles.iconText}>Busca</Text>
        </TouchableOpacity>

        {/* Ícone Vendas */}
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.navigate('SalesScreen')}
        >
          <Ionicons name="sparkles-outline" size={24} color="#999" />
          <Text style={styles.iconText}>Vendas</Text>
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
          onPress={() => navigation.navigate('CartScreen')}
        >
          <MaterialCommunityIcons name="cart-outline" size={24} color="#F9AD3A" />
          <Text style={styles.iconText}>Carrinho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Aumentei um pouco para espaço do blur
    backgroundColor: 'transparent',
    paddingBottom: 10, // Espaço extra na parte inferior
  },
  footerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fundo semi-transparente
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 5,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Efeito de blur (funciona no iOS)
    backdropFilter: 'blur(10px)', // Para web/React Native Web
  },
  homeIconWrapper: {
    alignItems: 'center',
    marginBottom: 9
  },
  homeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9AD3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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