async function dispararTeste() {
    try {
        const resposta = await fetch('http://localhost:3000/api/sensor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sensorId: "esp32_campo_01",
                soilMoisture: 10
            })
        });

        const resultado = await resposta.json();
        console.log("Resposta do Servidor:", resultado);
    } catch (erro) {
        console.error("Erro ao enviar:", erro.message);
    }
}

dispararTeste();