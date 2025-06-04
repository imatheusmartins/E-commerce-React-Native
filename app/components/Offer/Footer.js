import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Footer = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Efeito de vidro */}
      <BlurView 
        intensity={Platform.OS === 'ios' ? 25 : 70} 
        tint="dark"
        style={styles.blurView}
      >
        <View style={styles.footerContent}>
          {/* Ícone Home */}
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
            onPress={() => navigation.navigate('OfferScreen')}
          >
            <MaterialCommunityIcons name="sale" size={24} color="#999" />
            <Text style={styles.iconText}>Ofertas</Text>
          </TouchableOpacity>

          {/* Ícone Carrinho */}
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('CartScreen')}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color="#999" />
            <Text style={styles.iconText}>Carrinho</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 85 : 80,
    backgroundColor: 'transparent',
  },
  blurView: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  homeIconWrapper: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 9,
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