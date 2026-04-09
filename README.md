![Knowball_Web](https://drive.google.com/uc?export=view&id=1CyWc0o0BJYdtBxhkNr11Go0uOm4OA3Hm)

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

Interface web da plataforma **Knowball** — sistema de gestão de campeonatos, partidas e denúncias do futebol brasileiro masculino das categorias de base. Consome a [API REST Knowball](https://github.com/knowball-oracle/knowball-api) com autenticação JWT e controle de acesso por perfil.

---

## 📸 Capturas de Tela

### Tela de Login
![Tela_Login](https://drive.google.com/uc?export=view&id=11bBAGWZ-i00D_rN9Yu5Mddhzg1AEcsdf)

### Dashboard — ROLE_USER
![Tela_Dashboard_User](https://drive.google.com/uc?export=view&id=11g6Yjw_eBTdGDcMQdby_PB55PLBfXn32)

### Dashboard — ROLE_ADMIN
![Dashboard Admin](https://drive.google.com/uc?export=view&id=1eH2KKomKoWuJ97DN9xakQRTwPaDTDolc)

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [Angular CLI](https://angular.io/cli) 17 ou superior
- [API Knowball](https://github.com/knowball-oracle/knowball-api) rodando em `http://localhost:8080`

- Verifique suas versões:

```bash
node -v
ng version
```

---

## Instalação e execução

### 1 — Clone o repositório

```bash
git clone https://github.com/knowball-oracle/knowball-web.git
cd knowball-web
```

### 2 — Instale as dependências

```bash
npm install
```

### 3 — Configure o ambiente

Abra o arquivo `src/environments/environment.ts` e confirme a URL da API:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### 4 — Inicie a aplicação

```bash
ng serve
```

Acesse em: **http://localhost:4200**

> ⚠️ A API Knowball precisa estar rodando antes de abrir o frontend. Consulte as instruções de execução do [repositório backend](https://github.com/knowball-oracle/knowball-api).

> ## Credenciais para teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@knowball.com` | `Admin@1234` |
| Usuário | `user@knowball.com` | `User@1234` |

- Caso ainda não possua conta, clique em **Cadastre-se**.
---

## Perfis de acesso

A aplicação possui dois perfis com permissões distintas, controladas tanto no frontend (guards de rota + diretivas `@if`) quanto no backend (Spring Security).

### Permissões por funcionalidade

| Funcionalidade | ROLE_USER | ROLE_ADMIN |
|----------------|:---------:|:----------:|
| Visualizar campeonatos, partidas, árbitros e times | ✅ | ✅ |
| Criar / Editar / Excluir campeonatos, partidas, árbitros e times | ❌ | ✅ |
| Visualizar denúncias | ✅ | ✅ |
| **Criar denúncia** | ✅ | ❌ |
| Atualizar status e resultado de denúncias | ❌ | ✅ |
| Acessar módulo de Usuários | ❌ | ✅ |
| Criar / Editar / Excluir usuários | ❌ | ✅ |

### Indicação visual de perfil

O menu lateral exibe um badge identificando o perfil do usuário autenticado:

- 🟢 **USER** — para `ROLE_USER`
- 🔴 **ADMIN** — para `ROLE_ADMIN`

Botões de criação, edição e exclusão são ocultados automaticamente para `ROLE_USER` (exceto para Denúncia).
