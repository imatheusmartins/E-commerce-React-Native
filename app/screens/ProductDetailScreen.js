import { View, StyleSheet } from 'react-native'
import React from 'react'
import Footer from '../components/Home/Footer';
import ProductDetail from '../components/Produto/ProductDetail';

const ProductDetailScreen = ({ navigation, route }) => {
    const { productId } = route.params;

    return (
        <View style={styles.container}>
            <ProductDetail 
                productId={productId} 
                navigation={navigation} 
                route={route} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
});

export default ProductDetailScreen