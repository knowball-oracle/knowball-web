![Knowball_Web](https://drive.google.com/uc?export=view&id=1CyWc0o0BJYdtBxhkNr11Go0uOm4OA3Hm)

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

Interface web da plataforma **Knowball** — sistema de gestão de campeonatos, partidas e denúncias do futebol brasileiro masculino das categorias de base. A aplicação consome a [API REST Knowball](https://github.com/knowball-oracle/knowball-api) com autenticação JWT e controle de acesso por perfil.

---

## 🌐 Deploy da aplicação

A interface está publicada online e pode ser acessada em:

- **Frontend (Vercel):** [https://knowball-web-henna.vercel.app](https://knowball-web-henna.vercel.app)
- **Backend (Render):** [https://knowball-api.onrender.com](https://knowball-api.onrender.com)

> 💤 **Cold Start:** o backend está hospedado no plano gratuito do Render. Após períodos de inatividade, a primeira requisição pode demorar alguns segundos para responder.

---

## 📸 Capturas de tela

### Tela de Login
![Tela_Login](https://drive.google.com/uc?export=view&id=11bBAGWZ-i00D_rN9Yu5Mddhzg1AEcsdf)

### Dashboard — ROLE_USER
![Tela_Dashboard_User](https://drive.google.com/uc?export=view&id=11g6Yjw_eBTdGDcMQdby_PB55PLBfXn32)

### Dashboard — ROLE_ADMIN
![Dashboard Admin](https://drive.google.com/uc?export=view&id=1eH2KKomKoWuJ97DN9xakQRTwPaDTDolc)

---

## Pré-requisitos

### Para acessar online
Nenhuma instalação é necessária. Basta acessar a aplicação publicada na Vercel.

### Para executar localmente
- [Node.js](https://nodejs.org/) 18 ou superior.
- [Angular CLI](https://angular.io/cli) 17 ou superior.
- [API Knowball](https://github.com/knowball-oracle/knowball-api) rodando localmente em `http://localhost:8080`.

Verifique suas versões:

```bash
node -v
ng version
```

---

## Instalação e execução local

### 1. Clone o repositório

```bash
git clone https://github.com/knowball-oracle/knowball-web.git
cd knowball-web
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente local

Verifique o arquivo `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### 4. Inicie a aplicação

```bash
ng serve
```

Acesse em: **http://localhost:4200**

> ⚠️ A API Knowball precisa estar rodando antes de abrir o frontend localmente. Consulte as instruções de execução do [repositório backend](https://github.com/knowball-oracle/knowball-api).

---

## Ambiente de produção

Para o deploy em produção, o projeto utiliza o arquivo `environment.prod.ts` apontando para o backend publicado no Render:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://knowball-api.onrender.com'
};
```

A aplicação também possui configuração específica para deploy na Vercel com suporte ao roteamento SPA do Angular.

---

## Credenciais para teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@knowball.com` | `Admin@1234` |
| Usuário | `user@knowball.com` | `User@1234` |

Caso ainda não possua conta, clique em **Cadastre-se**.

---

## Perfis de acesso

A aplicação possui dois perfis com permissões distintas, controladas tanto no frontend quanto no backend.

### Permissões por funcionalidade

| Funcionalidade | ROLE_USER | ROLE_ADMIN |
|----------------|:---------:|:----------:|
| Visualizar campeonatos, partidas, árbitros e times | ✅ | ✅ |
| Criar / Editar / Excluir campeonatos, partidas, árbitros e times | ❌ | ✅ |
| Visualizar denúncias | ✅ | ✅ |
| Criar denúncia | ✅ | ❌ |
| Atualizar status e resultado de denúncias | ❌ | ✅ |
| Acessar módulo de Usuários | ❌ | ✅ |
| Criar / Editar / Excluir usuários | ❌ | ✅ |

### Indicação visual de perfil

O menu lateral exibe um badge identificando o perfil do usuário autenticado:

- 🟢 **USER** — para `ROLE_USER`.
- 🔴 **ADMIN** — para `ROLE_ADMIN`.

Botões de criação, edição e exclusão são ocultados automaticamente para `ROLE_USER`, exceto para denúncia.

---

## Integração com o backend

O frontend se comunica com a API publicada no Render por meio de requisições HTTP autenticadas com JWT. Após o login, o token é armazenado no cliente e enviado automaticamente nas requisições protegidas por meio de interceptor HTTP.

Essa integração permite:

- autenticação e autorização por perfil;
- consumo dos endpoints protegidos da API;
- navegação segura entre módulos administrativos e comuns;
- controle de acesso visual e funcional conforme a role do usuário.
