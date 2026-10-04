require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } = require('@solana/web3.js');

// Importando as regras do seu monitor de IoT e Insumos
const { processInsumoPurchase, checkSoilAndAlert } = require('./services/iotMonitor');

const app = express();
app.use(express.json());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Conexão com a Solana Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

app.get('/', (req, res) => {
    res.json({ 
        status: "Servidor do Sprout rodando com sucesso!",
        arquitetura: "IoT LoRa -> Node.js Cloud -> Supabase & Solana Devnet + Cloak Privacy" 
    });
});

// Rota principal de telemetria do sensor
app.post('/api/sensor', async (req, res) => {
    const { sensorId, soilMoisture } = req.body;

    if (soilMoisture === undefined) {
        return res.status(400).json({ success: false, error: "Parâmetro soilMoisture obrigatório." });
    }

    console.log(`[IoT / LoRa] Sensor ${sensorId} reportando umidade: ${soilMoisture}%`);

    // Atualiza temporariamente no escopo para a checagem do iotMonitor funcionar
    const modelsData = require('./models/data');
    modelsData.sensorTelemetry.soilMoisture = soilMoisture;

    // Roda a regra de negócio de alerta do módulo iotMonitor
    const analiseSolo = checkSoilAndAlert();
    const statusCampo = analiseSolo.status === "ALERTA_SECA" ? 'alerta' : 'ativo';

    // 1. Salva no Supabase
    const { data, error } = await supabase
        .from('sensors')
        .insert([{ soil_moisture: soilMoisture, status: statusCampo }])
        .select();

    if (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ success: false, error: error.message });
    }

    // 2. Auditoria na Solana Devnet (Simulando trilha blindada)
    let solanaAudit = "Não auditado";
    try {
        const wallet = Keypair.generate();
        const balance = await connection.getBalance(wallet.publicKey);
        
        solanaAudit = {
            rede: "Solana Devnet",
            carteiraAuditoria: wallet.publicKey.toBase58(),
            saldoTestSOL: balance / LAMPORTS_PER_SOL,
            camadaPrivacidade: "Cloak / ZK-Shielded Ready"
        };
    } catch (err) {
        console.error("Erro Solana:", err.message);
    }

    res.json({ 
        success: true, 
        message: "Dados processados com sucesso via microsserviço!",
        analiseIoT: analiseSolo,
        registroSupabase: data,
        auditoriaBlockchain: solanaAudit
    });
});

// Nova rota para testar o sistema de compra de insumos com voucher blindado
app.post('/api/comprar-insumo', (req, res) => {
    const { purchaseAmount, category, merchantName } = req.body;
    
    // Executa a regra do iotMonitor.js
    const resultadoCompra = processInsumoPurchase(purchaseAmount, category, merchantName);
    
    if (!resultadoCompra.success) {
        return res.status(400).json(resultadoCompra);
    }

    res.json({
        success: true,
        transacao: resultadoCompra,
        nota: "Transação de insumo validada e pronta para liquidação privada na Solana."
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Sprout rodando na porta ${PORT}`);
});