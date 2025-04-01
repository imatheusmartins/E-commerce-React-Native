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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import CheckBox from 'react-native-check-box';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { adicionaProduto, obtemTodasCategorias } from '../../../services/dbservice';

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
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const categoriasData = await obtemTodasCategorias();
        setCategorias(categoriasData.map(cat => ({ 
          label: cat.nome, 
          value: cat.id 
        })));
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        Alert.alert('Erro', 'Não foi possível carregar as categorias');
      }
    };
    carregarCategorias();
  }, []);

  const selecionarImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar imagens');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        setProduto({ ...produto, imagem: resultado.assets[0].uri });
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível acessar a galeria de imagens');
    }
  };

  const validarDados = () => {
    if (!produto.nome.trim()) {
      Alert.alert('Atenção', 'O nome do produto é obrigatório');
      return false;
    }
    
    if (!produto.preco || isNaN(parseFloat(produto.preco))) {
      Alert.alert('Atenção', 'Preço inválido');
      return false;
    }
    
    if (parseFloat(produto.preco) <= 0) {
      Alert.alert('Atenção', 'O preço deve ser maior que zero');
      return false;
    }
    
    if (!categoriaSelecionada) {
      Alert.alert('Atenção', 'Selecione uma categoria');
      return false;
    }
    
    return true;
  };

  const salvarProduto = async () => {
    if (!validarDados()) return;

    setLoading(true);
    try {
      const produtoParaSalvar = {
        nome: produto.nome.trim(),
        descricao: produto.descricao.trim() || "",
        preco: parseFloat(produto.preco),
        estoque: parseInt(produto.estoque) || 0,
        imagem: produto.imagem,
        em_promocao: produto.em_promocao,
        categoria_id: categoriaSelecionada
      };

      const idProduto = await adicionaProduto(produtoParaSalvar);
      
      if (idProduto) {
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
          { 
            text: "OK", 
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Cadastro de Produto</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome do Produto*"
          placeholderTextColor="#666"
          value={produto.nome}
          onChangeText={(text) => setProduto({...produto, nome: text})}
          maxLength={100}
        />
        
        <TextInput
          style={[styles.input, styles.descricaoInput]}
          placeholder="Descrição"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          value={produto.descricao}
          onChangeText={(text) => setProduto({...produto, descricao: text})}
          maxLength={500}
        />
        
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preço*</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={produto.preco}
              onChangeText={(text) => setProduto({...produto, preco: text.replace(/[^0-9.]/g, '')})}
            />
          </View>
          
          <View style={[styles.inputContainer, styles.estoqueInput]}>
            <Text style={styles.label}>Estoque</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={produto.estoque}
              onChangeText={(text) => setProduto({...produto, estoque: text.replace(/[^0-9]/g, '')})}
            />
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <CheckBox
            isChecked={produto.em_promocao}
            onClick={() => setProduto({...produto, em_promocao: !produto.em_promocao})}
            checkBoxColor="#F9AD3A"
          />
          <Text style={styles.checkboxLabel}>Produto em promoção?</Text>
        </View>
        
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Categoria*</Text>
          <DropDownPicker
            open={open}
            value={categoriaSelecionada}
            items={categorias}
            setOpen={setOpen}
            setValue={setCategoriaSelecionada}
            setItems={setCategorias}
            placeholder="Selecione uma categoria"
            placeholderStyle={{ color: '#666' }}
            style={styles.input}
            dropDownContainerStyle={styles.dropdownList}
            textStyle={styles.dropdownText}
            listMode="SCROLLVIEW"
          />
        </View>

        <View style={styles.uploadContainer}>
          <Text style={styles.label}>Imagem do Produto</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={selecionarImagem}
            disabled={loading}
          >
            <Text style={styles.uploadText}>Selecionar da Galeria</Text>
          </TouchableOpacity>
        </View>
        
        {produto.imagem && (
          <Image 
            source={{ uri: produto.imagem }} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
        )}
        
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={salvarProduto}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#1C1C1C',
    paddingBottom: 40
  },
  titulo: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#F9AD3A', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: { 
    backgroundColor: '#FFF', 
    borderRadius: 8, 
    padding: 15, 
    marginTop: 5,
    color: '#000',
    fontSize: 16,
  },
  descricaoInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
  },
  estoqueInput: {
    marginLeft: 10,
  },
  label: {
    color: '#FFF',
    marginBottom: 5,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 1000,
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderColor: '#CCC',
    marginTop: 5,
  },
  dropdownText: {
    color: '#000',
    fontSize: 16,
  },
  uploadContainer: { 
    marginBottom: 15,
  },
  uploadButton: { 
    backgroundColor: '#F9AD3A', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center',
  },
  uploadText: { 
    color: '#000', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreview: { 
    width: '100%', 
    height: 200, 
    borderRadius: 8,
    marginBottom: 20, 
    backgroundColor: '#333',
  },
  saveButton: { 
    backgroundColor: '#F9AD3A', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  saveButtonText: { 
    color: '#000', 
    fontWeight: 'bold', 
    fontSize: 18,
  },
});

export default CadastroProdutoScreen;