# 🌿 Herbanário & Botânica Viva

> Guia Botânico Interativo de Plantas Medicinais, Farmácia Viva, Fenologia das 4 Estações e Planejamento de Canteiros Agroecológicos.

---

## ✨ Funcionalidades Principais

- **Catálogo Botânico & Farmácia Viva**: Consulta aprofundada de espécies medicinais nativas e adaptadas, incluindo nomes científicos, princípios ativos, modos de preparo (infusões, decocções, tinturas e cataplasmas) e contraindicações.
- **Simulador das 4 Estações (Fenologia & Cores)**: Mapa interativo para visualizar como as plantas mudam de cor ao longo do ano, quando florescem, frutificam e o que plantar em cada estação do Hemisfério Sul.
- **Meu Herbanário**: Gestão personalizada de espécimes plantados, controle de regas, histórico de adubação orgânica, diário de campo com fotos e notas botânicas.
- **Planejador de Canteiros & Espaçamento**: Cálculo de distanciamento entre mudas, consórcios botânicos favoráveis e proteção contra pragas.
- **Calculadora de Eficiência Hídrica**: Métricas de consumo de água e otimização por tipo de solo e sombreamento.
- **Cartões Botânicos para Impressão**: Geração de fichas prontas para corte e identificação física dos vasos e canteiros.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações & Efeitos**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), [Motion](https://motion.dev/)
- **Backend/API (Opcional)**: [Express](https://expressjs.com/)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: Versão `22.x` (LTS recomendada) ou `>= 20.x`
- **NPM**: Versão `10.x` ou superior

### Passos:
```bash
# 1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra no navegador em [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta 3000 |
| `npm run build` | Compila o bundle do cliente e o servidor Node.js de produção |
| `npm run build:pages` | Compila o build estático otimizado para o **GitHub Pages** (com caminhos relativos) |
| `npm run build:client` | Compila a versão SPA do cliente |
| `npm run preview` | Pré-visualiza localmente os arquivos compilados em `dist/` |
| `npm run lint` | Executa a verificação estática de tipos TypeScript |

---

## 🌐 Como Publicar no GitHub Pages

O repositório já inclui a automação configurada em `.github/workflows/deploy.yml` usando o **Node 22 LTS** e o deploy nativo de Actions.

### Passo a passo para ativar:

1. No seu repositório no GitHub, vá em **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção **Build and deployment** (Compilação e implantação):
   - Em **Source** (Origem), selecione **GitHub Actions**.
4. Faça um `git push` para a branch `main` (ou `master`), ou vá na aba **Actions** e acione o workflow **"Deploy to GitHub Pages"** manualmente.
5. Em poucos instantes, o site estará publicado no endereço:
   `https://<seu-usuario>.github.io/<seu-repositorio>/`

### 🔧 Problemas comuns resolvidos neste build:
- **Node 20 Deprecation**: O workflow utiliza `node-version: 22` LTS, eliminando os avisos de depreciação do runner do GitHub Actions.
- **Dependencies Lock File Error**: A instalação de dependências detecta a presença do `package-lock.json` com fallback automático para `npm install`.
- **Rotas de Assets Relativas**: O `vite.config.ts` está configurado com `base: './'`, permitindo que o app funcione tanto na raiz de domínios quanto em subdiretórios do GitHub Pages.

---

## 📄 Licença

Distribuído sob licença MIT. Consulte o arquivo de licença ou use livremente para fins pessoais e educacionais.
