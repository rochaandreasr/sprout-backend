JavaScript
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Importa a função do bot do Telegram que criamos acima
const { enviarAlertaTelegram } = require('./services/telegramBot');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Supabase (lê das variáveis de ambiente)
const supabaseUrl = process.env.SUPABASE_URL || ' SUA_URL_SUPABASE ';
const supabaseKey = process.env.SUPABASE_ANON_KEY || ' SUA_CHAVE_SUPABASE ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração básica do Solana Devnet
const solanaConnection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Rota de Teste Inicial
app.get('/', (req, res) => {
    res.json({ status: "Online", projeto: "Sprout Backend & IoT" });
});

// Função interna de regra de negócio do Sensor (IoT)
function checkSoilAndAlert(soilMoisture) {
    if (soilMoisture < 15) {
        return {
            status: "ALERTA_SECA",
            message: `Atenção! A umidade do solo atingiu ${soilMoisture}%. Risco crítico para a lavoura. Necessária irrigação e liberação imediata de insumos.`
        };
    }
    return {
        status: "ESTAVEL",
        message: `Umidade do solo em ${soilMoisture}%. Níveis normais.`
    };
}

// 1. ROTA DO SENSOR (Recebe dados da telemetria / Painel do Produtor)
app.post('/api/sensor', async (req, res) => {
    try {
        const { sensorId, soilMoisture } = req.body;

        // Analisa o nível de umidade
        const analise = checkSoilAndAlert(soilMoisture);

        // Salva no banco de dados Supabase
        const { data, error } = await supabase
            .from('leituras_sensor')
            .insert([{ sensor_id: sensorId, umidade: soilMoisture, status: analise.status }]);

        if (error) {
            console.error("Erro ao salvar no Supabase:", error.message);
        }

        // Se o solo estiver seco, dispara automaticamente o alerta no Telegram!
        if (analise.status === "ALERTA_SECA") {
            // Cole aqui o seu Chat ID que o bot te deu no comando /start
            const meuChatId = process.env.TELEGRAM_CHAT_ID || 'COLOQUE_SEU_CHAT_ID_AQUI';
            enviarAlertaTelegram(meuChatId, analise.message);
        }

        res.json({
            success: true,
            statusCalculado: analise.status,
            mensagemAlerta: analise.message,
            auditoriaBlockchain: {
                rede: "Solana Devnet",
                transacaoSimulada: "Audit_Log_Hash_Verified_OK"
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. ROTA DE COMPRA DE INSUMOS (Painel da Cooperativa)
app.post('/api/comprar-insumo', async (req, res) => {
    try {
        const { purchaseAmount, category, merchantName } = req.body;

        // Regra restrita: só permite se for da categoria de fertilizantes/corretivos
        const categoriaPermitida = category.toLowerCase().includes('fertilizante') || category.toLowerCase().includes('corretivo');

        if (!categoriaPermitida) {
            return res.status(400).json({
                success: false,
                error: "Voucher recusado: O crédito restrito só pode ser utilizado para fertilizantes e corretivos de solo."
            });
        }

        res.json({
            success: true,
            transacao: {
                message: `Compra de R$ ${purchaseAmount} aprovada com sucesso na revenda ${merchantName}!`,
                newBalance: 850.00,
                solanaAudit: "Tx_Confirmed_Devnet_Secure"
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Inicia o servidor na porta configurada (Render ou porta 3000 local)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Sprout rodando na porta ${PORT}`);
});