import * as SQLite from 'expo-sqlite';

// Conexão melhorada com tratamento de erro
export async function getDbConnection() {
    try {
        const db = await SQLite.openDatabaseAsync('dbTeste2.db');
        return db;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
}

export async function createTables() {
    const cx = await getDbConnection();

    try {
        await cx.execAsync(`
            CREATE TABLE IF NOT EXISTS tblCategorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE,
                imagem TEXT
            );
        `);

        await cx.execAsync(`
            CREATE TABLE IF NOT EXISTS tblProdutos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT NOT NULL,
                preco REAL NOT NULL,
                estoque INTEGER NOT NULL,
                imagem TEXT,
                em_promocao BOOLEAN DEFAULT 0,
                qtd_vendidos INTEGER DEFAULT 0,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                categoria_id INTEGER,
                FOREIGN KEY (categoria_id) REFERENCES tblCategorias(id)
            );
        `);

        await cx.execAsync(`
            CREATE TABLE IF NOT EXISTS tblPedido (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'aberto', -- 'aberto', 'finalizado', 'cancelado'
                valor_total REAL DEFAULT 0
            );
        `);

        await cx.execAsync(`
            CREATE TABLE IF NOT EXISTS tblItemPedido (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_pedido INTEGER NOT NULL,
                id_produto INTEGER NOT NULL,
                quantidade INTEGER NOT NULL,
                valor_unitario REAL NOT NULL,
                valor_total REAL NOT NULL,
                FOREIGN KEY (id_pedido) REFERENCES tblPedido(id),
                FOREIGN KEY (id_produto) REFERENCES tblProdutos(id)
            );
        `);

        await cx.execAsync(`
            CREATE TABLE IF NOT EXISTS tblVenda (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_pedido INTEGER NOT NULL,
                data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                valor_total REAL NOT NULL,
                FOREIGN KEY (id_pedido) REFERENCES tblPedido(id)
            );
        `);

        await cx.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_item_pedido_pedido ON tblItemPedido(id_pedido);
        `);
        
        await cx.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_item_pedido_produto ON tblItemPedido(id_produto);
        `);
        
        await cx.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_venda_pedido ON tblVenda(id_pedido);
        `);

        console.log("Todas as tabelas criadas com sucesso!");
    } catch (error) {
        console.error("Erro ao criar tabelas:", error);
        throw error;
    } finally {
        await cx.closeAsync();
    }
}

export async function getProductById(productId) {
    const db = await getDbConnection();
    try {
        const results = await db.getFirstAsync(
            `SELECT * FROM tblProdutos WHERE id = ?;`,
            [productId]
        );

        if (!results) {
            throw new Error("Produto não encontrado");
        }

        return {
            ...results,
            em_promocao: Boolean(results.em_promocao)
        };
    } catch (error) {
        console.error("Erro ao buscar o produto:", error);
        throw error;
    }
}


export async function obtemTodosProdutos(limit = 50, offset = 0) {
    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        const registros = await dbProd.getAllAsync(`
            SELECT p.*, c.nome AS categoria_nome
            FROM tblProdutos p
            LEFT JOIN tblCategorias c ON p.categoria_id = c.id
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        return registros.map(registro => ({
            id: registro.id,
            nome: registro.nome,
            descricao: registro.descricao,
            preco: registro.preco,
            categoria_id: registro.categoria_id,
            categoria_nome: registro.categoria_nome,
            estoque: registro.estoque,
            imagem: registro.imagem,
            em_promocao: Boolean(registro.em_promocao),
            qtd_vendidos: registro.qtd_vendidos,
            data_criacao: registro.data_criacao,
            data_atualizacao: registro.data_atualizacao
        }));
    } catch (error) {
        console.error("Erro ao obter produtos:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

export async function obtemTodasCategorias() {
    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        const registros = await dbProd.getAllAsync(`
            SELECT * FROM tblCategorias 
            ORDER BY nome ASC
        `);
        return registros.map(registro => ({
            id: registro.id,
            nome: registro.nome,
            imagem: registro.imagem
        }));
    } catch (error) {
        console.error("Erro ao obter categorias:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

// Métodos de inserção com validação
export async function adicionaProduto(produto) {
    if (!produto?.nome) {
        throw new Error("Dados do produto inválidos");
    }

    let dbCx = null;
    try {
        dbCx = await getDbConnection();
        const result = await dbCx.runAsync(`
            INSERT INTO tblProdutos (
                nome, descricao, preco, estoque, imagem, 
                em_promocao, categoria_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            produto.nome,
            produto.descricao || "",
            parseFloat(produto.preco) || 0,
            parseInt(produto.estoque) || 0,
            produto.imagem || null,
            produto.em_promocao ? 1 : 0,
            produto.categoria_id || null
        ]);

        return result.lastInsertRowId;
    } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        throw error;
    } finally {
        if (dbCx) await dbCx.closeAsync();
    }
}

export async function adicionaCategoria(categoria) {
    if (!categoria?.nome) {
        throw new Error("Nome da categoria é obrigatório");
    }

    let dbCx = null;
    try {
        dbCx = await getDbConnection();
        const result = await dbCx.runAsync(
            'INSERT INTO tblCategorias (nome, imagem) VALUES (?, ?)',
            [categoria.nome.trim(), categoria.imagem || null]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
        throw error;
    } finally {
        if (dbCx) await dbCx.closeAsync();
    }
}

// Métodos de atualização com transação
export async function alteraProduto(produto) {
    if (!produto?.id) {
        throw new Error("ID do produto é obrigatório");
    }

    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        await dbProd.execAsync('BEGIN TRANSACTION');

        const result = await dbProd.runAsync(`
            UPDATE tblProdutos SET
                nome = ?,
                descricao = ?,
                preco = ?,
                categoria_id = ?,
                estoque = ?,
                imagem = ?,
                qtd_vendidos = ?,
                em_promocao = ?,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.categoria_id,
            produto.estoque,
            produto.imagem,
            produto.qtd_vendidos,
            produto.em_promocao ? 1 : 0,
            produto.id
        ]);

        await dbProd.execAsync('COMMIT');
        return result.changes === 1;
    } catch (error) {
        if (dbProd) await dbProd.execAsync('ROLLBACK');
        console.error("Erro ao atualizar produto:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

export async function alteraCategoria(categoria) {
    if (!categoria?.id || !categoria?.nome) {
        throw new Error("Dados da categoria inválidos");
    }

    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        const result = await dbProd.runAsync(`
            UPDATE tblCategorias SET
                nome = ?,
                imagem = ?
            WHERE id = ?
        `, [
            categoria.nome.trim(),
            categoria.imagem,
            categoria.id
        ]);
        return result.changes === 1;
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

// Métodos de exclusão com transação
export async function excluiCategoria(idCategoria) {
    if (!idCategoria) {
        throw new Error("ID da categoria é obrigatório");
    }

    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        await dbProd.execAsync('BEGIN TRANSACTION');

        await dbProd.runAsync(
            'DELETE FROM tblProdutos WHERE categoria_id = ?',
            [idCategoria]
        );

        const result = await dbProd.runAsync(
            'DELETE FROM tblCategorias WHERE id = ?',
            [idCategoria]
        );

        await dbProd.execAsync('COMMIT');
        return result.changes === 1;
    } catch (error) {
        if (dbProd) await dbProd.execAsync('ROLLBACK');
        console.error("Erro ao excluir categoria:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

export async function excluiProduto(id) {
    if (!id) {
        throw new Error("ID do produto é obrigatório");
    }

    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        const result = await dbProd.runAsync(
            'DELETE FROM tblProdutos WHERE id = ?',
            [id]
        );
        return result.changes === 1;
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

// Métodos específicos otimizados
export async function obtemProdutosDaCategoria(categoriaId) {
    try {
        const db = await getDbConnection();
        const produtos = await db.getAllAsync(
            `SELECT * FROM tblProdutos WHERE categoria_id = ?`,
            [categoriaId]
        );

        return produtos.map(produto => ({
            ...produto,
            em_promocao: Boolean(produto.em_promocao)
        }));
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        throw error;
    }
}

export async function obtemTodosProdutosEmPromocao(limit = 20) {
    let dbProd = null;
    try {
        dbProd = await getDbConnection();
        const registros = await dbProd.getAllAsync(`
            SELECT p.*, c.nome AS categoria_nome
            FROM tblProdutos p
            LEFT JOIN tblCategorias c ON p.categoria_id = c.id
            WHERE p.em_promocao = 1
            LIMIT ?
        `, [limit]);

        return registros.map(registro => ({
            id: registro.id,
            nome: registro.nome,
            descricao: registro.descricao,
            preco: registro.preco,
            categoria_id: registro.categoria_id,
            categoria_nome: registro.categoria_nome,
            estoque: registro.estoque,
            imagem: registro.imagem,
            em_promocao: true,
            qtd_vendidos: registro.qtd_vendidos,
            data_criacao: registro.data_criacao,
            data_atualizacao: registro.data_atualizacao
        }));
    } catch (error) {
        console.error("Erro ao obter produtos em promoção:", error);
        throw error;
    } finally {
        if (dbProd) await dbProd.closeAsync();
    }
}

export async function obtemProdutosMaisVendidos(limit = 10) {
    const dbProd = await getDbConnection();
    try {
        const registros = await dbProd.getAllAsync(`
            SELECT p.*, c.nome AS categoria_nome
            FROM tblProdutos p
            LEFT JOIN tblCategorias c ON p.categoria_id = c.id
            ORDER BY p.qtd_vendidos DESC
            LIMIT ?
        `, [limit]);

        return registros.map(registro => ({
            id: registro.id,
            nome: registro.nome,
            descricao: registro.descricao,
            preco: registro.preco,
            categoria_id: registro.categoria_id,
            categoria_nome: registro.categoria_nome,
            estoque: registro.estoque,
            imagem: registro.imagem,
            em_promocao: Boolean(registro.em_promocao),
            qtd_vendidos: registro.qtd_vendidos,
            data_criacao: registro.data_criacao,
            data_atualizacao: registro.data_atualizacao
        }));
    } catch (error) {
        console.error("Erro ao obter produtos mais vendidos:", error);
        throw error;
    } finally {
        if (dbProd && dbProd.isOpen) {
            await dbProd.closeAsync();
        }
    }
}

export async function obtemProdutosLancamento(limit = 10) {
    const dbProd = await getDbConnection();
    try {
        const registros = await dbProd.getAllAsync(`
            SELECT p.*, c.nome AS categoria_nome
            FROM tblProdutos p
            LEFT JOIN tblCategorias c ON p.categoria_id = c.id
            ORDER BY p.data_criacao DESC
            LIMIT ?
        `, [limit]);

        return registros.map(registro => ({
            id: registro.id,
            nome: registro.nome,
            descricao: registro.descricao,
            preco: registro.preco,
            categoria_id: registro.categoria_id,
            categoria_nome: registro.categoria_nome,
            estoque: registro.estoque,
            imagem: registro.imagem,
            em_promocao: Boolean(registro.em_promocao),
            qtd_vendidos: registro.qtd_vendidos,
            data_criacao: registro.data_criacao,
            data_atualizacao: registro.data_atualizacao
        }));
    } catch (error) {
        console.error("Erro ao obter lançamentos:", error);
        throw error;
    } finally {
        if (dbProd && dbProd.isOpen) {
            await dbProd.closeAsync();
        }
    }
}

export async function excluiTodosProdutos() {
    let dbCx = null;
    try {
        dbCx = await getDbConnection();
        await dbCx.execAsync('BEGIN TRANSACTION');
        await dbCx.execAsync('DELETE FROM tblProdutos');
        await dbCx.execAsync('COMMIT');
        return true;
    } catch (error) {
        if (dbCx) await dbCx.execAsync('ROLLBACK');
        console.error("Erro ao excluir produtos:", error);
        throw error;
    } finally {
        if (dbCx) await dbCx.closeAsync();
    }
}

export async function excluiTodasCategorias() {
    let dbCx = null;
    try {
        dbCx = await getDbConnection();
        await dbCx.execAsync('BEGIN TRANSACTION');
        await dbCx.execAsync('DELETE FROM tblProdutos');
        await dbCx.execAsync('DELETE FROM tblCategorias');
        await dbCx.execAsync('COMMIT');
        return true;
    } catch (error) {
        if (dbCx) await dbCx.execAsync('ROLLBACK');
        console.error("Erro ao excluir categorias:", error);
        throw error;
    } finally {
        if (dbCx) await dbCx.closeAsync();
    }
}

export async function criarPedido() {
    const db = await getDbConnection();
    try {
        const result = await db.runAsync(
            'INSERT INTO tblPedido DEFAULT VALUES'
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        throw error;
    }
}

export async function adicionarItemAoPedido(idPedido, idProduto, quantidade) {
    const db = await getDbConnection();
    try {
        // Primeiro obtemos o preço do produto
        const produto = await db.getFirstAsync(
            'SELECT preco FROM tblProdutos WHERE id = ?',
            [idProduto]
        );
        
        if (!produto) {
            throw new Error("Produto não encontrado");
        }
        
        const valorUnitario = produto.preco;
        const valorTotal = valorUnitario * quantidade;
        
        // Inserimos o item no pedido
        const result = await db.runAsync(
            `INSERT INTO tblItemPedido 
             (id_pedido, id_produto, quantidade, valor_unitario, valor_total)
             VALUES (?, ?, ?, ?, ?)`,
            [idPedido, idProduto, quantidade, valorUnitario, valorTotal]
        );
        
        // Atualizamos o valor total do pedido
        await atualizarTotalPedido(idPedido);
        
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Erro ao adicionar item ao pedido:", error);
        throw error;
    }
}

async function atualizarTotalPedido(idPedido) {
    let db = null;
    try {
        db = await getDbConnection();
        
        // Calcula o novo total
        const { total } = await db.getFirstAsync(
            'SELECT SUM(valor_total) as total FROM tblItemPedido WHERE id_pedido = ?',
            [idPedido]
        );
        
        // Atualiza o pedido
        await db.runAsync(
            'UPDATE tblPedido SET valor_total = ? WHERE id = ?',
            [total || 0, idPedido]
        );
    } catch (error) {
        console.error("Erro ao atualizar total do pedido:", error);
        throw error;
    } finally {
        if (db) await db.closeAsync();
    }
}

export async function removerItemDoPedido(idItemPedido) {
    const db = await getDbConnection();
    try {
        const item = await db.getFirstAsync(
            'SELECT id_pedido FROM tblItemPedido WHERE id = ?',
            [idItemPedido]
        );
        
        if (!item) {
            throw new Error("Item do pedido não encontrado");
        }
        
        await db.runAsync(
            'DELETE FROM tblItemPedido WHERE id = ?',
            [idItemPedido]
        );
        
        await atualizarTotalPedido(item.id_pedido);
        
        return true;
    } catch (error) {
        console.error("Erro ao remover item do pedido:", error);
        throw error;
    }
}

export async function obterItensDoPedido(idPedido) {
    let db = null;
    try {
        db = await getDbConnection();
        
        const itens = await db.getAllAsync(
            `SELECT ip.*, p.nome, p.imagem 
             FROM tblItemPedido ip
             JOIN tblProdutos p ON ip.id_produto = p.id
             WHERE ip.id_pedido = ?`,
            [idPedido]
        );
        
        return itens.map(item => ({
            ...item,
            em_promocao: Boolean(item.em_promocao)
        }));
    } catch (error) {
        console.error("Erro ao obter itens do pedido:", error);
        throw error;
    } finally {
        if (db) await db.closeAsync();
    }
}

export async function finalizarPedido(idPedido) {
    let db = null;
    try {
        db = await getDbConnection();
        await db.execAsync('BEGIN TRANSACTION');
        
        // Verifica se o pedido existe e está aberto
        const pedido = await db.getFirstAsync(
            'SELECT * FROM tblPedido WHERE id = ? AND status = "aberto"',
            [idPedido]
        );
        
        if (!pedido) {
            throw new Error("Pedido não encontrado ou já finalizado");
        }
        
        // Obtém os itens do pedido
        const itens = await db.getAllAsync(
            'SELECT * FROM tblItemPedido WHERE id_pedido = ?',
            [idPedido]
        );
        
        // Atualiza o estoque e contador de vendas dos produtos
        for (const item of itens) {
            await db.runAsync(
                `UPDATE tblProdutos 
                 SET estoque = estoque - ?, 
                     qtd_vendidos = qtd_vendidos + ?
                 WHERE id = ?`,
                [item.quantidade, item.quantidade, item.id_produto]
            );
        }
        
        // Marca o pedido como finalizado
        await db.runAsync(
            'UPDATE tblPedido SET status = "finalizado" WHERE id = ?',
            [idPedido]
        );
        
        // Cria registro na tabela de vendas
        await db.runAsync(
            'INSERT INTO tblVenda (id_pedido, valor_total) VALUES (?, ?)',
            [idPedido, pedido.valor_total]
        );
        
        await db.execAsync('COMMIT');
        return true;
    } catch (error) {
        if (db) await db.execAsync('ROLLBACK');
        console.error("Erro ao finalizar pedido:", error);
        throw error;
    } finally {
        if (db) await db.closeAsync();
    }
}

export async function cancelarPedido(idPedido) {
    let db = null;
    try {
        db = await getDbConnection();
        
        await db.runAsync(
            'UPDATE tblPedido SET status = "cancelado" WHERE id = ?',
            [idPedido]
        );
        
        return true;
    } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
        throw error;
    } finally {
        if (db) await db.closeAsync();
    }
}

export async function obterPedido(idPedido) {
    const db = await getDbConnection();
    try {
      const pedido = await db.getFirstAsync(
        'SELECT * FROM tblPedido WHERE id = ?',
        [idPedido]
      );
      
      if (!pedido) {
        return null;
      }
  
      const itens = await db.getAllAsync(
        `SELECT ip.*, p.nome, p.imagem 
         FROM tblItemPedido ip
         JOIN tblProdutos p ON ip.id_produto = p.id
         WHERE ip.id_pedido = ?`,
        [idPedido]
      );
  
      return {
        ...pedido,
        itens: itens.map(item => ({
          ...item,
          em_promocao: Boolean(item.em_promocao)
        }))
      };
    } catch (error) {
      console.error("Erro ao obter pedido:", error);
      throw error;
    } finally {
      if (db && db.isOpen) {
        await db.closeAsync().catch(e => console.warn("Erro ao fechar conexão:", e));
      }
    }
}

export async function atualizarItemPedido(itemId, novaQuantidade) {
    const db = await getDbConnection();
    try {
        const item = await db.getFirstAsync(
            'SELECT * FROM tblItemPedido WHERE id = ?',
            [itemId]
        );
        
        if (!item) {
            throw new Error("Item do pedido não encontrado");
        }
        
        const novoTotal = item.valor_unitario * novaQuantidade;
        
        await db.runAsync(
            'UPDATE tblItemPedido SET quantidade = ?, valor_total = ? WHERE id = ?',
            [novaQuantidade, novoTotal, itemId]
        );
        
        await atualizarTotalPedido(item.id_pedido);
        
        return true;
    } catch (error) {
        console.error("Erro ao atualizar item do pedido:", error);
        throw error;
    }
}

export async function obterPedidoAtivo() {
    const db = await getDbConnection();
    try {
      const pedido = await db.getFirstAsync(
        'SELECT * FROM tblPedido WHERE status = "aberto" ORDER BY id DESC LIMIT 1'
      );
      
      if (!pedido) {
        return null;
      }
  
      const itens = await db.getAllAsync(
        `SELECT ip.*, p.nome, p.imagem 
         FROM tblItemPedido ip
         JOIN tblProdutos p ON ip.id_produto = p.id
         WHERE ip.id_pedido = ?`,
        [pedido.id]
      );
  
      return {
        ...pedido,
        itens: itens.map(item => ({
          ...item,
          em_promocao: Boolean(item.em_promocao)
        }))
      };
    } catch (error) {
      console.error("Erro ao obter pedido ativo:", error);
      throw error;
    } finally {
      if (db && db.isOpen) {
        await db.closeAsync().catch(e => console.warn("Erro ao fechar conexão:", e));
      }
    }
}

export async function getAllVendas() {
    const db = await getDbConnection();
    try {
        const vendas = await db.getAllAsync(`
            SELECT v.*, COUNT(ip.id) as total_itens
            FROM tblVenda v
            LEFT JOIN tblPedido p ON v.id_pedido = p.id
            LEFT JOIN tblItemPedido ip ON p.id = ip.id_pedido
            GROUP BY v.id
            ORDER BY v.data_venda DESC
        `);
        
        return vendas.map(venda => ({
            ...venda,
            valor_total: parseFloat(venda.valor_total),
        }));
    } catch (error) {
        console.error("Erro ao obter vendas:", error);
        throw error;
    }
}