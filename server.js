const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve arquivos estáticos (como o index.html)

// Inicialização do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota raiz: serve o index.html automaticamente ou retorna status da API
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ==========================================
// MÓDULO DE CRUD DE PRODUTORES (Tabela: producers)
// ==========================================

// 1. CADASTRAR PRODUTOR (Create)
app.post('/api/produtores', async (req, res) => {
  try {
    const { nome, localizacao, telegram_chat_id } = req.body;
    
    if (!nome) {
      return res.status(400).json({ sucesso: false, erro: "O campo 'nome' é obrigatório." });
    }

    const { data, error } = await supabase
      .from('producers')
      .insert([{ nome, localizacao, telegram_chat_id }])
      .select();

    if (error) throw error;

    return res.status(201).json({ 
      sucesso: true, 
      mensagem: "Produtor cadastrado com sucesso!", 
      produtor: data[0] 
    });
  } catch (erro) {
    console.error("Erro ao cadastrar produtor:", erro);
    return res.status(500).json({ sucesso: false, erro: erro.message });
  }
});

// 2. LISTAR PRODUTORES (Read)
app.get('/api/produtores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ sucesso: true, produtores: data });
  } catch (erro) {
    console.error("Erro ao listar produtores:", erro);
    return res.status(500).json({ sucesso: false, erro: erro.message });
  }
});

// 3. EXCLUIR PRODUTOR (Delete)
app.delete('/api/produtores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('producers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ sucesso: true, mensagem: "Produtor excluído com sucesso!" });
  } catch (erro) {
    console.error("Erro ao excluir produtor:", erro);
    return res.status(500).json({ sucesso: false, erro: erro.message });
  }
});

// ==========================================
// MÓDULO DE ALERTAS, ZCASH (ZIP-321) E TELEGRAM
// ==========================================

app.post('/api/alerta-solo', async (req, res) => {
  try {
    const { producerId, nomeProdutor, umidade, valorInsumos, telegramChatId } = req.body;

    if (umidade === undefined || valorInsumos === undefined) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: "Parâmetros 'umidade' e 'valorInsumos' são obrigatórios." 
      });
    }

    // Regra de negócio: Alerta crítico quando umidade <= 20%
    if (Number(umidade) <= 20) {
      const idTransacaoId = `zec_tx_${Date.now()}`;
      const enderecoTestnet = "ztestsapling1sproutbeb4lbkaklq";
      const quantidadeTAZ = Number(valorInsumos) || 750;
      const memoTexto = encodeURIComponent(`Voucher Sprout - Produtor: ${nomeProdutor || 'Geral'}`);

      // Geração da URI oficial ZIP-321 do Zcash (Testnet / Gasto Zero)[cite: 1]
      const uriZip321 = `zcash:${enderecoTestnet}?amount=${quantidadeTAZ}&memo=${memoTexto}`;

      // Disparo do Telegram
      const telegramToken = process.env.TELEGRAM_TOKEN;
      const chatIdDestino = telegramChatId || process.env.TELEGRAM_CHAT_ID;

      if (telegramToken && chatIdDestino) {
        try {
          const textoTelegram = `🚨 *ALERTA CRÍTICO DE SOLO - SPROUT* 🌾\n\n` +
                                `*Produtor:* ${nomeProdutor || 'Não informado'}\n` +
                                `*Umidade:* ${umidade}%\n` +
                                `*Status:* Voucher gerado (ZIP-321 Zcash Testnet)\n\n` +
                                `*URI de Pagamento:* \`${uriZip321}\``;

          await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatIdDestino,
              text: textoTelegram,
              parse_mode: 'Markdown'
            })
          });
          console.log("📲 Alerta enviado com sucesso para o Telegram do produtor!");
        } catch (erroTelegram) {
          console.error("⚠️ Falha ao enviar notificação para o Telegram:", erroTelegram);
        }
      }

      // GRAVAÇÃO AUTOMÁTICA NA TABELA 'vouchers' DO SUPABASE
      try {
        await supabase.from('vouchers').insert([{
          producer_id: producerId || null,
          total_amount: quantidadeTAZ,
          available_balance: quantidadeTAZ,
          allowed_category: 'Insumos Agrícolas (Adubo/Sementes)',
          is_active: true
        }]);
        console.log("💾 Voucher gravado com sucesso na tabela vouchers do Supabase!");
      } catch (errSupabase) {
        console.error("⚠️ Erro ao salvar voucher no Supabase:", errSupabase.message);
      }

      return res.status(200).json({
        sucesso: true,
        alertaCritico: true,
        mensagem: "Alerta crítico detectado! Voucher gerado (ZIP-321), notificação enviada ao Telegram e registo guardado no Supabase.",
        voucher: {
          idTransacao: idTransacaoId,
          produtor: nomeProdutor || "Produtor",
          valorTAZ: quantidadeTAZ,
          padraoTecnico: "ZIP-321 (Zcash Testnet)",
          uriPagamentoZcash: uriZip321,
          criadoEm: new Date().toISOString()
        }
      });
    }

    return res.status(200).json({
      sucesso: true,
      alertaCritico: false,
      mensagem: "Umidade do solo em níveis normais. Nenhum voucher gerado."
    });

  } catch (erro) {
    console.error("Erro interno no processamento do alerta:", erro);
    return res.status(500).json({ sucesso: false, erro: erro.message });
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Sprout rodando na porta ${PORT}`);
});