import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { adicionaCategoria, excluiTodasCategorias, obtemTodasCategorias, alteraCategoria, excluiCategoria } from '../../../services/dbservice';

const AddCategoryContent = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const categoriasCarregadas = await obtemTodasCategorias();
      setCategorias(categoriasCarregadas);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    }
  };

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
      if (editingId) {
        // Modo edição
        const categoriaAtualizada = {
          id: editingId,
          nome: nome.trim(),
          imagem,
        };

        const sucesso = await alteraCategoria(categoriaAtualizada);
        
        if (sucesso) {
          Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
          setEditingId(null);
        }
      } else {
        // Modo adição
        const novaCategoria = {
          id: Date.now().toString(),
          nome: nome.trim(),
          imagem,
        };

        const sucesso = await adicionaCategoria(novaCategoria);
        
        if (sucesso) {
          Alert.alert('Sucesso', 'Categoria adicionada com sucesso!');
        }
      }

      setNome('');
      setImagem(null);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      Alert.alert('Erro', 'Não foi possível salvar a categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setNome(categoria.nome);
    setImagem(categoria.imagem);
    setEditingId(categoria.id);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await excluiCategoria(id);
              await carregarCategorias();
              Alert.alert('Sucesso', 'Categoria excluída com sucesso');
            } catch (error) {
              console.error('Erro ao excluir categoria:', error);
              Alert.alert('Erro', 'Não foi possível excluir a categoria');
            }
          },
          style: 'destructive'
        }
      ]
    );
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
              await carregarCategorias();
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

  const cancelEdit = () => {
    setEditingId(null);
    setNome('');
    setImagem(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {editingId ? 'Editar Categoria' : 'Nova Categoria'}
        </Text>
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nome da Categoria"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity 
            style={[styles.iconButton, styles.saveButton]}
            onPress={handleSubmit}
            disabled={loading || !nome.trim()}
          >
            <MaterialIcons 
              name={loading ? "hourglass-empty" : "save"} 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.cancelButton]}
              onPress={cancelEdit}
            >
              <MaterialIcons 
                name="close" 
                size={24} 
                color="#FFF" 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.imageSection}>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={handlePickImage}
          >
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.imagePreview} />
            ) : (
              <MaterialCommunityIcons name="image-plus" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Categorias Cadastradas</Text>
        
        {categorias.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
        ) : (
          categorias.map((categoria) => (
            <View key={categoria.id} style={styles.categoryCard}>
              {categoria.imagem && (
                <Image 
                  source={{ uri: categoria.imagem }} 
                  style={styles.categoryImage} 
                />
              )}
              
              <Text style={styles.categoryName} numberOfLines={1}>
                {categoria.nome}
              </Text>
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(categoria)}
                >
                  <MaterialIcons name="edit" size={18} color="#FFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(categoria.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={[styles.deleteAllButton, categorias.length === 0 && { marginTop: 20 }]}
          onPress={handleDeleteAll}
        >
          <FontAwesome name="trash-o" size={20} color="#FFF" />
          <Text style={styles.deleteButtonText}>Limpar Tudo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1C1C1C',
    minHeight: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#F9AD3A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#F9AD3A',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    color: '#FFF',
    fontSize: 16,
    marginRight: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#F9AD3A',
  },
  cancelButton: {
    backgroundColor: '#DB1921',
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: '#333',
    height: 100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginRight: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#DB1921',
  },
  deleteAllButton: {
    flexDirection: 'row',
    backgroundColor: '#DB1921',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default AddCategoryContent;