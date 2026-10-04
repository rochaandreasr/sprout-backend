const producerVoucher = {
    producerId: "prod_001",
    name: "Seu José",
    phoneWhatsApp: "+5538999998888",
    availableBalance: 2000.00,
    allowedCategory: "Fertilizantes",
    isActive: true
};

const sensorTelemetry = {
    sensorId: "esp32_campo_01",
    soilMoisture: 10, // Nível crítico
    temperature: 34
};

module.exports = { producerVoucher, sensorTelemetry };