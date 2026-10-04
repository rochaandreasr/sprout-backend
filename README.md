🌱 Sprout: Automação Inteligente e Privada para o Agronegócio
Solução desenvolvida para o ecossistema de inovação e Web3 (Solana), unindo IoT de longo alcance, arquitetura em nuvem escalável e mitigação de perdas agrícolas através de crédito automatizado.

🎯 O Problema: O Custo Real da Lentidão no Campo
Enquanto conceitos de "casas inteligentes" focam na conveniência (como uma geladeira que compra leite sozinha), no agronegócio o atraso é sinónimo de desastre sistémico.
Se um sensor deteta uma queda crítica na umidade do solo e o produtor precisa enfrentar burocracias bancárias tradicionais para aprovar crédito e adquirir insumos, a plantação pode ser dizimada. Isso acarreta:

Desperdício massivo de recursos hídricos (milhares de litros de água evaporados em vão numa lavoura seca).

Perda de colheitas inteiras, impactando diretamente a segurança alimentar global e gerando volatilidade de preços.

💡 A Solução (Sprout)
O Sprout elimina a latência burocrática. Quando a telemetria do solo atinge níveis críticos, o sistema cruza dados de forma autónoma, valida regras de negócio e liberta instantaneamente vouchers restritos de insumos para uso imediato nas cooperativas parceiras, garantindo rapidez sem abrir mão da segurança e privacidade financeira on-chain.

🛠️ Arquitetura do Sistema
O projeto foi construído com uma stack moderna e modular:

Ponta (IoT / Campo): Simulação de sensores de alta eficiência baseados em protocolo de longo alcance (LoRa/LoRaWAN).

Back-end (Nuvem): API robusta desenvolvida em Node.js (Express) hospedada no Render, estruturada em microsserviços.

Banco de Dados: Supabase para persistência e registo em tempo real da telemetria e estados de alerta.

Camada Web3 & Privacidade: Integração com a Solana Devnet e preparação para protocolos de ativos blindados (Cloak / ZK-Ready), assegurando auditoria sem expor dados confidenciais do produtor.

🚀 Como Executar o Projeto Localmente
1. Clone o repositório:
git clone https://github.com/teu-usuario/sprout-backend.git
cd sprout-backend

2. Instale as dependências:
npm install

3. Configure o arquivo .env na raiz do projeto com as suas chaves do Supabase:

PORT=3000

SUPABASE_URL=sua_url_aqui

SUPABASE_ANON_KEY=sua_chave_aqui

4. Inicie o servidor local:
node server.js

🖥️ Interfaces Disponíveis
O projeto conta com um painel web unificado (index.html) que separa as perspetivas de operação:

Painel do Produtor: Focado no monitoramento da telemetria de solo e status de umidade em tempo real.

Painel da Cooperativa: Focado na validação e aprovação segura de créditos e vouchers restritos para compra de insumos.

🏆 Equipe & Hackathon
Projeto desenvolvido com foco em impacto tecnológico real, unindo a eficiência da infraestrutura da Solana com as reais necessidades do setor agrícola moderno.