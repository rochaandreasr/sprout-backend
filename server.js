require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
    res.json({ status: "Servidor do Sprout rodando perfeitamente!" });
});

app.post('/api/sensor', async (req, res) => {
    const { sensorId, soilMoisture } = req.body;

    console.log(`[IoT] Dados recebidos do sensor ${sensorId}: Umidade = ${soilMoisture}%`);

    const statusCampo = soilMoisture < 12 ? 'alerta' : 'ativo';

    const { data, error } = await supabase
        .from('sensors')
        .insert([
            { soil_moisture: soilMoisture, status: statusCampo }
        ])
        .select();

    if (error) {
        console.error("Erro detalhado do Supabase:", error);
        return res.status(500).json({ success: false, error: error.message });
    }

    console.log("[Supabase] Telemetria salva com sucesso!");
    res.json({ 
        success: true, 
        message: "Dados do sensor registrados com sucesso!",
        statusCalculado: statusCampo,
        registroSalvo: data 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Sprout rodando na porta ${PORT}`);
});