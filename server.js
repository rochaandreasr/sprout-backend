const { processInsumoPurchase, checkSoilAndAlert } = require('./services/iotMonitor');
const { producerVoucher } = require('./models/data');

console.log("=== INICIANDO SISTEMA SPROUT ===");

// 1. O sistema monitora o campo automaticamente
const alertResult = checkSoilAndAlert();
console.log("Status do Monitoramento:", alertResult);

// 2. O produtor tenta fazer uma compra na revenda parceira
console.log("\nTentando realizar compra com o vale-insumo...");
const purchaseResult = processInsumoPurchase(450, "Fertilizantes", "AgroRevenda Sul");
console.log("Resultado da Transação:", purchaseResult);

console.log(`Saldo atualizado de ${producerVoucher.name}: R$ ${producerVoucher.availableBalance}`);