import axios from 'axios';

const API_URL = 'http://192.168.15.3:3000/api'; // Update with your server's URL

// Helper function to handle API errors
const handleError = (error) => {
    console.error('API Error:', error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || 'Erro na requisição');
};

// Categories
export async function obtemTodasCategorias() {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function adicionaCategoria(categoria) {
    try {
        if (!categoria?.nome) throw new Error('Nome da categoria é obrigatório');
        const response = await axios.post(`${API_URL}/categories`, categoria);
        return response.data.id;
    } catch (error) {
        handleError(error);
    }
}

export async function alteraCategoria(categoria) {
    try {
        if (!categoria?.id || !categoria?.nome) throw new Error('Dados da categoria inválidos');
        const response = await axios.put(`${API_URL}/categories/${categoria.id}`, categoria);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function excluiCategoria(idCategoria) {
    try {
        if (!idCategoria) throw new Error('ID da categoria é obrigatório');
        const response = await axios.delete(`${API_URL}/categories/${idCategoria}`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

// Products
export async function getProductById(productId) {
    try {
        const response = await axios.get(`${API_URL}/products/${productId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function obtemTodosProdutos(limit = 50, offset = 0) {
    try {
        const response = await axios.get(`${API_URL}/products`, { params: { limit, offset } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function adicionaProduto(produto) {
    try {
        if (!produto?.nome) throw new Error('Dados do produto inválidos');
        const response = await axios.post(`${API_URL}/products`, produto);
        return response.data.id;
    } catch (error) {
        handleError(error);
    }
}

export async function alteraProduto(produto) {
    try {
        if (!produto?.id) throw new Error('ID do produto é obrigatório');
        const response = await axios.put(`${API_URL}/products/${produto.id}`, produto);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function excluiProduto(id) {
    try {
        if (!id) throw new Error('ID do produto é obrigatório');
        const response = await axios.delete(`${API_URL}/products/${id}`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function obtemProdutosDaCategoria(categoriaId) {
    try {
        const response = await axios.get(`${API_URL}/products`, { params: { categoria_id: categoriaId } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function obtemTodosProdutosEmPromocao(limit = 20) {
    try {
        const response = await axios.get(`${API_URL}/products`, { params: { em_promocao: true, limit } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function obtemProdutosMaisVendidos(limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/products`, { params: { sort: 'qtd_vendidos', order: 'desc', limit } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function obtemProdutosLancamento(limit = 10) {
    try {
        const response = await axios.get(`${API_URL}/products`, { params: { sort: 'data_criacao', order: 'desc', limit } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function excluiTodosProdutos() {
    try {
        const response = await axios.delete(`${API_URL}/products`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function excluiTodasCategorias() {
    try {
        const response = await axios.delete(`${API_URL}/categories`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

// Orders
export async function criarPedido() {
    try {
        const response = await axios.post(`${API_URL}/orders`);
        return response.data.id;
    } catch (error) {
        handleError(error);
    }
}

export async function adicionarItemAoPedido(idPedido, idProduto, quantidade) {
    try {
        const response = await axios.post(`${API_URL}/orders/${idPedido}/items`, { id_produto: idProduto, quantidade });
        return response.data.id;
    } catch (error) {
        handleError(error);
    }
}

export async function removerItemDoPedido(idItemPedido) {
    try {
        const response = await axios.delete(`${API_URL}/order-items/${idItemPedido}`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function obterItensDoPedido(idPedido) {
    try {
        const response = await axios.get(`${API_URL}/orders/${idPedido}`);
        return response.data.itens;
    } catch (error) {
        handleError(error);
    }
}

export async function finalizarPedido(idPedido) {
    try {
        const response = await axios.put(`${API_URL}/orders/${idPedido}/finalize`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function cancelarPedido(idPedido) {
    try {
        const response = await axios.put(`${API_URL}/orders/${idPedido}/cancel`);
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function obterPedido(idPedido) {
    try {
        const response = await axios.get(`${API_URL}/orders/${idPedido}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function atualizarItemPedido(itemId, novaQuantidade) {
    try {
        const response = await axios.put(`${API_URL}/order-items/${itemId}`, { novaQuantidade });
        return response.data.success;
    } catch (error) {
        handleError(error);
    }
}

export async function obterPedidoAtivo() {
    try {
        const response = await axios.get(`${API_URL}/orders/active`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function getAllVendas() {
    try {
        const response = await axios.get(`${API_URL}/sales`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}