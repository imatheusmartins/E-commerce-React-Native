import * as SQLite from 'expo-sqlite';

// Conexão melhorada com tratamento de erro
export async function getDbConnection() {
    try {
        const db = await SQLite.openDatabaseAsync('dbTeste1.db');
        return db;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
}

export async function createTables() {
    const cx = await getDbConnection();

    try {
        // Criar tabela de categorias
        await cx.execAsync(`
            CREATE TABLE IF NOT EXISTS tblCategorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE,
                imagem TEXT
            );
        `);

        // Criar índice para categorias
        await cx.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_categorias_nome ON tblCategorias(nome);
        `);

        // Criar tabela de produtos
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

        // Criar índices para produtos
        await cx.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON tblProdutos(categoria_id);
        `);

        await cx.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_produtos_promocao ON tblProdutos(em_promocao);
        `);

        console.log("Tabelas criadas com sucesso!");
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

        return results; // Retorna o objeto do produto
    } catch (error) {
        console.error("Erro ao buscar o produto:", error);
        throw error;
    } finally {
        await db.closeAsync();
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
