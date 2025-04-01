import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllVendas } from '../../services/dbservice';
import Footer from '../components/Sales/Footer'

const SalesScreen = ({ navigation }) => {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadVendas = async () => {
        try {
            setLoading(true);
            const vendasData = await getAllVendas();
            setVendas(vendasData);
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadVendas);
        loadVendas();
        return unsubscribe;
    }, [navigation]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6608" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {vendas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="receipt" size={60} color="#888" />
                        <Text style={styles.emptyText}>Nenhuma venda encontrada</Text>
                    </View>
                ) : (
                    vendas.map((venda) => (
                        <TouchableOpacity 
                            key={venda.id}
                            style={styles.card}
                            onPress={() => navigation.navigate('SaleDetail', { saleId: venda.id })}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.saleId}>Venda #{venda.id}</Text>
                                <Text style={styles.date}>{formatDate(venda.data_venda)}</Text>
                            </View>
                            <Text style={styles.amount}>R$ {venda.valor_total.toFixed(2)}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
            <Footer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1C',
        padding: 15,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1C1C1C',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        marginTop: 20,
    },
    card: {
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    saleId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6608',
    },
    date: {
        fontSize: 14,
        color: '#AAA',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
});

export default SalesScreen;