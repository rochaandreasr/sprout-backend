// Importação de dependências principais
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicialização do aplicativo Express
const app = express();
app.use(express.json());
app.use(cors());

// Porta do servidor (usa a variável de ambiente ou 3000 como padrão)
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------
// Serviço de Integração Zcash (Padrões ZIP-316 / ZIP-321 simulados para Testnet/Regtest)
// ---------------------------------------------------------
class ZcashService {
  async gerarVoucherBlindado(produtorId, valorInsumos) {
    // Simulando a criação de um endereço blindado (Shielded Address - padrão ZIP-316)
    const enderecoBlindado = `ztestsapling1sprout${Math.random().toString(36).substring(2, 15)}`;
    
    // Simulando a transação blindada de emissão do voucher de crédito para a cooperativa
    const transacaoZcash = {
      idTransacao: `zec_tx_${Date.now()}`,
      produtor: produtorId,
      valor: valorInsumos,
      status: 'Protegido em Shielded Pool (Zcash Testnet)',
      enderecoDestino: enderecoBlindado,
      criadoEm: new Date().toISOString()
    };

    console.log("Voucher blindado gerado com sucesso:", transacaoZcash);
    return transacaoZcash;
  }
}

const zcashService = new ZcashService();

// ---------------------------------------------------------
// Rotas da API
// ---------------------------------------------------------

// Rota raiz para testar se a API está no ar
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    projeto: 'Sprout Backend - Agro DeFi & Zcash Privacy',
    versao: '1.0.0'
  });
});

// Rota para receber dados do sensor IoT e verificar alerta crítico
app.post('/api/alerta-solo', async (req, res) => {
  try {
    const { produtorId, umidade, valorInsumos } = req.body;

    // Validação básica dos dados recebidos
    if (umidade === undefined || !produtorId) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Parâmetros inválidos. Envie produtorId e umidade.' 
      });
    }

    // Regra de negócio: se a umidade do solo estiver crítica (< 20%)
    if (umidade < 20) {
      // Gera o voucher utilizando a lógica de privacidade do Zcash (gasto zero em Testnet/Regtest)
      const voucherPrivado = await zcashService.gerarVoucherBlindado(produtorId, valorInsumos || 500);

      return res.status(200).json({
        sucesso: true,
        alertaCritico: true,
        mensagem: 'Alerta crítico detectado! Voucher de insumos gerado com privacidade (Zcash Shielded Pool).',
        voucher: voucherPrivado
      });
    }

    return res.status(200).json({ 
      sucesso: true, 
      alertaCritico: false,
      mensagem: 'Umidade do solo normal. Nenhuma ação necessária.' 
    });

  } catch (error) {
    console.error('Erro ao processar alerta de solo:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});