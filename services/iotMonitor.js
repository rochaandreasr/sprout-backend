const { producerVoucher, sensorTelemetry } = require('../models/data');

function processInsumoPurchase(purchaseAmount, category, merchantName) {
    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        return { success: false, error: "Valor da compra inválido." };
    }
    if (!producerVoucher.isActive) {
        return { success: false, error: "Conta inativa." };
    }
    if (category !== producerVoucher.allowedCategory) {
        return { success: false, error: `Bloqueado: Crédito exclusivo para ${producerVoucher.allowedCategory}.` };
    }
    if (purchaseAmount > producerVoucher.availableBalance) {
        return { success: false, error: "Saldo insuficiente." };
    }

    producerVoucher.availableBalance -= purchaseAmount;
    return {
        success: true,
        message: `Compra aprovada na revenda parceira: ${merchantName}!`,
        newBalance: producerVoucher.availableBalance
    };
}

function checkSoilAndAlert() {
    const CRITICAL_MOISTURE = 12;
    if (sensorTelemetry.soilMoisture < CRITICAL_MOISTURE) {
        return {
            status: "ALERTA_SECA",
            message: `Atenção! Umidade crítica em ${sensorTelemetry.soilMoisture}%. Acionando suporte preventivo.`
        };
    }
    return { status: "NORMAL" };
}

module.exports = { processInsumoPurchase, checkSoilAndAlert };