import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { adicionaCategoria, excluiTodasCategorias } from '../../../services/dbservice';

const AddCategoryContent = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria');
      return;
    }

    setLoading(true);
    try {
      const novaCategoria = {
        id: Date.now().toString(),
        nome: nome.trim(),
        imagem,
      };

      const sucesso = await adicionaCategoria(novaCategoria);
      
      if (sucesso) {
        Alert.alert('Sucesso', 'Categoria adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir todas as categorias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await excluiTodasCategorias();
              Alert.alert('Sucesso', 'Todas as categorias foram excluídas');
            } catch (error) {
              console.error('Erro ao excluir categorias:', error);
              Alert.alert('Erro', 'Não foi possível excluir as categorias');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Nova Categoria</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome da Categoria"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        <Text style={styles.imagePickerText}>Escolher Imagem</Text>
      </TouchableOpacity>
      {imagem && <Image source={{ uri: imagem }} style={styles.image} />}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "Salvar Categoria"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: 'red', marginTop: 10 }]} 
        onPress={handleDeleteAll}
      >
        <Text style={styles.buttonText}>Excluir Todas as Categorias</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff'
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#000'
  },
  imagePicker: {
    backgroundColor: '#F9AD3A',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#F9AD3A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddCategoryContent;