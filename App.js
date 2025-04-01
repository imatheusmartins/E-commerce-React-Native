import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';

import HomeScreen from './app/screens/HomeScreen';
import AddCategoryScreen from './app/screens/AddCategoryScreen';
import AddProductScreen from './app/screens/AddProductScreen';
import CategoryProducts from './app/screens/CategoryProducts';
import SearchScreen from './app/screens/SearchScreen';
import CartScreen from './app/screens/CartScreen';
import { createTables } from './services/dbservice';
import ProductDetail from './app/components/Produto/ProductDetail';
import HomeContent from './app/components/Home/HomeContent';
import ProductDetailScreen from './app/screens/ProductDetailScreen';
import SalesScreen from './app/screens/SalesScreen';

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await createTables();
      } catch (error) {
        console.error('Erro ao criar tabelas:', error);
      } finally {
        setLoading(false);
      }
    };
    setupDatabase();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E71A3D" />
        <Text>Configurando banco de dados...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#121212', // COR DE FUNDO
          },
          headerTintColor: '#121212', // COR DO TÍTULO/BOTÕES
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center', // ALINHAMENTO DO TÍTULO
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
        />
        <Stack.Screen
          name="HomeContent"
          component={HomeContent}
        />
        <Stack.Screen
          name="AddCategoryScreen"
          component={AddCategoryScreen}
          options={{
            title: 'Nova Categoria', // TÍTULO PERSONALIZADO
            headerBackTitle: 'Voltar', // TEXTO DO BOTÃO VOLTAR
          }}
        />
        <Stack.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{
            title: 'Novo Produto', // TÍTULO PERSONALIZADO
            headerBackTitle: 'Voltar', // TEXTO DO BOTÃO VOLTAR
          }}
        />

        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{
            title: 'Categorias', // TÍTULO PERSONALIZADO
            headerBackTitle: 'Voltar', // TEXTO DO BOTÃO VOLTAR
          }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{
            title: 'Detalhes do produto', // TÍTULO PERSONALIZADO
            headerBackTitle: 'Voltar', // TEXTO DO BOTÃO VOLTAR
          }}
        />
        <Stack.Screen
          name="ProductDetailScreen"
          component={ProductDetailScreen}
          options={{
            title: 'Detalhes do produto', // TÍTULO PERSONALIZADO
            headerBackTitle: 'Voltar', // TEXTO DO BOTÃO VOLTAR
          }}
        />

        <Stack.Screen
          name="CategoryProducts"
          component={CategoryProducts}
          options={({ route }) => ({ title: route.params.categoryName })}
        />

        <Stack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{ title: 'Meu Carrinho' }}
        />

        <Stack.Screen 
            name="SalesScreen" 
            component={SalesScreen} 
            options={{ title: 'Histórico de Vendas' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;