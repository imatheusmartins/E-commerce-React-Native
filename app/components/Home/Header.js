import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Header = ({ navigation }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Imagem no canto esquerdo - tamanho ajustado */}
      <Image 
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      {/* Botões no canto direito */}
      <View style={styles.rightButtons}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('AddCategoryScreen')}
        >
          <MaterialCommunityIcons name="shape-plus" size={28} color="#F9AD3A" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('AddProductScreen')}
        >
          <MaterialCommunityIcons name="plus-box" size={28} color="#F9AD3A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#1C1C1C',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#F9AD3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 120,  // Largura reduzida
    height: 40,  // Altura proporcional
    marginLeft: 5,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
});

export default Header;