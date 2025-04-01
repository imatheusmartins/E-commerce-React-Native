import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getProductById } from '../../../services/dbservice';

const ProductDetail = ({ productId }) => {

    const [product, setProduct] = useState(null);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const result = await getProductById(productId);
                setProduct(result);
            } catch (error) {
                console.error("Erro ao carregar os detalhes do produto:", error);
            }
        }

        fetchProduct();
    }, [productId]);

    if (!product) return <Text>Carregando...</Text>;

    return (
        <View style={styles.container}>
            <Image source={{ uri: product.imagem }} style={styles.image} />
            <Text style={styles.name}>{product.nome}</Text>
            <Text style={styles.price}>R$ {product.preco.toFixed(2)}</Text>
            <Text style={styles.description}>{product.descricao}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    image: { width: '100%', height: 200, resizeMode: 'cover', marginBottom: 20 },
    name: { fontSize: 22, fontWeight: 'bold' },
    price: { fontSize: 18, color: 'green', marginBottom: 10 },
    description: { fontSize: 16, color: '#555' },
});

export default ProductDetail