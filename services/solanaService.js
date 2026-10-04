const { Connection, Keypair, LAMPORTS_PER_SOL, Transaction, TransactionInstruction, PublicKey } = require('@solana/web3.js');

// Conexão com a Devnet (Rede de Testes Gratuita)
const solanaConnection = new Connection('https://api.devnet.solana.com', 'confirmed');

// ID oficial do "Memo Program" da Solana (usado para gravar mensagens/logs de auditoria na blockchain)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Carteira do Servidor (Gerada ao iniciar)
let carteiraServidor;

async function iniciarCarteira() {
    console.log("🛠️  Iniciando Carteira Solana...");
    carteiraServidor = Keypair.generate();
    console.log(`🏦 Chave Pública (Wallet): ${carteiraServidor.publicKey.toBase58()}`);
    
    try {
        console.log("🪂  Solicitando airdrop de 1 SOL (Devnet) para pagar taxas...");
        const airdropSignature = await solanaConnection.requestAirdrop(
            carteiraServidor.publicKey,
            LAMPORTS_PER_SOL
        );
        
        const latestBlockHash = await solanaConnection.getLatestBlockhash();
        
        await solanaConnection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
        });
        console.log("✅ Airdrop recebido com sucesso! A carteira tem saldo para transacionar.");
    } catch (error) {
        console.error("⚠️ Aviso: Falha no airdrop (talvez o limite da Devnet tenha sido atingido). A transação pode falhar se não houver saldo.", error.message);
    }
}

// Inicia a carteira logo que o arquivo for carregado
iniciarCarteira();

/**
 * Função que grava um log imutável na blockchain
 */
async function registrarAuditoriaNaSolana(mensagemLog) {
    if (!carteiraServidor) {
        return "Erro: Carteira ainda não inicializada.";
    }

    try {
        console.log(`🔗 Gravando log na Solana: "${mensagemLog}"`);
        
        // Cria a instrução do Memo com a nossa mensagem
        const memoInstruction = new TransactionInstruction({
            keys: [{ pubkey: carteiraServidor.publicKey, isSigner: true, isWritable: true }],
            programId: MEMO_PROGRAM_ID,
            data: Buffer.from(mensagemLog, 'utf-8'),
        });

        // Cria a transação, adiciona a instrução e envia assinando com a carteira
        const transacao = new Transaction().add(memoInstruction);
        const latestBlockHash = await solanaConnection.getLatestBlockhash();
        transacao.recentBlockhash = latestBlockHash.blockhash;
        transacao.feePayer = carteiraServidor.publicKey;

        const signature = await solanaConnection.sendTransaction(transacao, [carteiraServidor]);
        
        await solanaConnection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
        });

        console.log(`✅ Sucesso! Transação confirmada na Solana. Hash: ${signature}`);
        return signature;

    } catch (err) {
        console.error("❌ Erro ao gravar na Solana:", err.message);
        return "Erro na transação blockchain";
    }
}

module.exports = {
    registrarAuditoriaNaSolana
};
