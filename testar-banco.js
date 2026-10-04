require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Pega as chaves lá do nosso cofre (.env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Cria a conexão com o Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testarCadastro() {
    console.log("Conectando ao banco de dados Sprout...");

    // Tentando inserir um produtor de teste na tabela 'producers'
    const { data, error } = await supabase
        .from('producers')
        .insert([
            { name: 'Seu José', whatsapp: '+5538999998888' }
        ])
        .select();

    if (error) {
        console.error("Ops! Deu erro ao salvar:", error.message);
    } else {
        console.log("Sucesso! Produtor cadastrado no Supabase:", data);
    }
}

testarCadastro();