import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  adicionaProduto, 
  obtemTodasCategorias, 
  obtemTodosProdutos,
  excluiTodosProdutos,
  alteraProduto,
  excluiProduto
} from '../../../services/dbservice';

const CadastroProdutoScreen = ({ navigation }) => {
  const [produto, setProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    imagem: null,
    em_promocao: false,
    categoria_id: null
  });
  
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  useEffect(() => {
    let isMounted = true;
  
    const loadData = async () => {
      try {
        setLoading(true);
        const categoriasData = await obtemTodasCategorias();
        const produtosData = await obtemTodosProdutos();
        
        if (isMounted) {
          setCategorias(categoriasData);
          setProdutos(produtosData);
        }
      } catch (error) {
        if (isMounted) Alert.alert('Erro', 'Falha ao carregar dados');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    loadData();
  
    return () => {
      isMounted = false; 
    };
  }, []);

  const carregarDados = async () => {
    try {
      setRefreshing(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      const categoriasData = await obtemTodasCategorias();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      const produtosData = await obtemTodosProdutos();
      
      setCategorias(categoriasData);
      setProdutos(produtosData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao recarregar dados');
    } finally {
      setRefreshing(false);
    }
  };

  const selecionarImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!resultado.canceled && resultado.assets?.[0]?.uri) {
        setProduto({ ...produto, imagem: resultado.assets[0].uri });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao acessar a galeria');
    }
  };

  const validarDados = () => {
    if (!produto.nome.trim()) {
      Alert.alert('Atenção', 'Nome do produto é obrigatório');
      return false;
    }
    
    const preco = parseFloat(produto.preco);
    if (isNaN(preco)) {
      Alert.alert('Atenção', 'Preço inválido');
      return false;
    }
    
    if (preco <= 0) {
      Alert.alert('Atenção', 'Preço deve ser maior que zero');
      return false;
    }
    
    if (!produto.categoria_id) {
      Alert.alert('Atenção', 'Selecione uma categoria');
      return false;
    }
    
    return true;
  };

  const salvarProduto = async () => {
    if (!validarDados()) return;
  
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
  
      const produtoData = { ...produto, preco: parseFloat(produto.preco) };
      
      if (editingId) {
        await alteraProduto({ ...produtoData, id: editingId });
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        await adicionaProduto(produtoData);
        Alert.alert('Sucesso', 'Produto cadastrado!');
      }
  
      limparFormulario();
      await carregarDados();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const editarProduto = (prod) => {
    setProduto({
      nome: prod.nome,
      descricao: prod.descricao,
      preco: prod.preco.toString(),
      estoque: prod.estoque.toString(),
      imagem: prod.imagem,
      em_promocao: prod.em_promocao,
      categoria_id: prod.categoria_id
    });
    setEditingId(prod.id);
  };

  const excluirProduto = async (id) => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluiProduto(id);
              await carregarDados();
              Alert.alert('Sucesso', 'Produto excluído');
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Falha ao excluir');
            }
          }
        }
      ]
    );
  };

  const limparTudo = async () => {
    Alert.alert(
      'Confirmar',
      'Deseja excluir TODOS os produtos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluiTodosProdutos();
              await carregarDados();
              Alert.alert('Sucesso', 'Todos produtos foram excluídos');
            } catch (error) {
              console.error('Erro ao excluir tudo:', error);
              Alert.alert('Erro', 'Falha ao excluir produtos');
            }
          }
        }
      ]
    );
  };

  const limparFormulario = () => {
    setProduto({
      nome: '',
      descricao: '',
      preco: '',
      estoque: '',
      imagem: null,
      em_promocao: false,
      categoria_id: null
    });
    setEditingId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imagem && (
        <Image source={{ uri: item.imagem }} style={styles.cardImage} />
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.cardPrice}>R$ {item.preco.toFixed(2)}</Text>
        <Text style={styles.cardCategory}>
          {categorias.find(c => c.id === item.categoria_id)?.nome || 'Sem categoria'}
        </Text>
        {item.em_promocao && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>PROMOÇÃO</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editarProduto(item)}
        >
          <MaterialIcons name="edit" size={20} color="#F9AD3A" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => excluirProduto(item.id)}
        >
          <MaterialIcons name="delete" size={20} color="#DB1921" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Filtra categorias baseado no texto de busca
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(filtroCategoria.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={() => {
      setDropdownAberto(false);
      Keyboard.dismiss();
    }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>
            {editingId ? 'Editar Produto' : 'Novo Produto'}
          </Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto*"
              value={produto.nome}
              onChangeText={text => setProduto({...produto, nome: text})}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição"
              multiline
              value={produto.descricao}
              onChangeText={text => setProduto({...produto, descricao: text})}
              placeholderTextColor="#999"
            />
            
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preço*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={produto.preco}
                  onChangeText={text => setProduto({...produto, preco: text.replace(/[^0-9.]/g, '')})}
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estoque</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={produto.estoque}
                  onChangeText={text => setProduto({...produto, estoque: text.replace(/[^0-9]/g, '')})}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.imagePicker}
              onPress={selecionarImagem}
            >
              {produto.imagem ? (
                <Image source={{ uri: produto.imagem }} style={styles.imagePreview} />
              ) : (
                <MaterialCommunityIcons name="image-plus" size={40} color="#F9AD3A" />
              )}
            </TouchableOpacity>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, produto.em_promocao && styles.checkboxChecked]}
                onPress={() => setProduto({...produto, em_promocao: !produto.em_promocao})}
              >
                {produto.em_promocao && (
                  <MaterialIcons name="check" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Produto em promoção</Text>
            </View>
            
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Categoria*</Text>
              
              <TouchableOpacity 
                style={styles.dropdownHeader}
                onPress={() => setDropdownAberto(!dropdownAberto)}
              >
                <Text style={styles.dropdownHeaderText}>
                  {produto.categoria_id 
                    ? categorias.find(c => c.id === produto.categoria_id)?.nome 
                    : 'Selecione uma categoria'}
                </Text>
                <MaterialIcons 
                  name={dropdownAberto ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color="#F9AD3A" 
                />
              </TouchableOpacity>

              {dropdownAberto && (
                <View style={styles.dropdownList}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar categoria..."
                      placeholderTextColor="#999"
                      value={filtroCategoria}
                      onChangeText={setFiltroCategoria}
                    />
                    <MaterialIcons name="search" size={20} color="#999" />
                  </View>
                  
                  <ScrollView 
                    nestedScrollEnabled 
                    style={styles.dropdownScroll}
                  >
                    {categoriasFiltradas.map(categoria => (
                      <TouchableOpacity
                        key={categoria.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setProduto({...produto, categoria_id: categoria.id});
                          setDropdownAberto(false);
                          setFiltroCategoria('');
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{categoria.nome}</Text>
                        {produto.categoria_id === categoria.id && (
                          <MaterialIcons name="check" size={20} color="#F9AD3A" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            <View style={styles.formButtons}>
              {editingId && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={limparFormulario}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={salvarProduto}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {editingId ? 'Atualizar' : 'Salvar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Produtos Cadastrados</Text>
          
          {produtos.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
          ) : (
            <FlatList
              data={produtos}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              refreshing={refreshing}
              onRefresh={() => setTimeout(() => carregarDados(), 100)}
              extraData={produtos}
            />
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={limparTudo}
          >
            <FontAwesome name="trash-o" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Limpar Tudo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F9AD3A',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    color: '#FFF',
    marginBottom: 5,
    fontSize: 16,
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#F9AD3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#F9AD3A',
  },
  checkboxLabel: {
    color: '#FFF',
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdownHeaderText: {
    color: '#FFF',
    fontSize: 16,
  },
  dropdownList: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    maxHeight: 200,
    elevation: 3,
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 15,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    height: 40,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  dropdownItemText: {
    color: '#FFF',
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#333',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#F9AD3A',
  },
  clearButton: {
    backgroundColor: '#DB1921',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9AD3A',
    marginBottom: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardPrice: {
    color: '#F9AD3A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardCategory: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  promoBadge: {
    backgroundColor: '#DB1921',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  promoText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editButton: {
    marginRight: 10,
  },
});

export default CadastroProdutoScreen;