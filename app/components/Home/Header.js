import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Header = ({ navigation }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Título ou logo (opcional) */}
      <Text style={styles.title}></Text>
      
      {/* Botões no canto direito */}
      <View style={styles.rightButtons}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('AddCategoryScreen')} // Substitua pela sua rota
        >
          <MaterialCommunityIcons name="alpha-c-box" size={34} color="#39FF14" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('AddProductScreen')} // Substitua pela sua rota
        >
          <MaterialCommunityIcons name="alpha-p-box" size={34} color="#39FF14" />
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
    paddingTop: 10,
    elevation: 5,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    color: '#39FF14',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 2, // Espaço entre os ícones
  },
  iconButton: {
    padding: 5,
  },
});

export default Header;