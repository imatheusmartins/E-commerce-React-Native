import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Footer from '../components/Home/Footer';
import ProductDetail from '../components/Produto/ProductDetail';

const ProductDetailScreen = ({ navigation, route }) => {

    const { productId } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.contentWrapper}>
                <ProductDetail productId={productId} />
            </View>

            <Footer navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1C',
    },
    contentWrapper: {
        flex: 1,
    },
});

export default ProductDetailScreen