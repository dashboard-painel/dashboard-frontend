# Dashboard de Auditoria de Vendas

Dashboard React + TypeScript para auditoria e monitoramento de dados de farmácias por CNPJ, com suporte a dark mode e responsividade.

## Stack

- **React 18** + **TypeScript**
- **Vite 6** (bundler)
- **Tailwind CSS 4**
- **Recharts** (gráficos)
- **shadcn/ui** + **Radix UI** (componentes)
- **Lucide React** (ícones)

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

```bash
npm install -g pnpm
```

## Instalação

```bash
pnpm install
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento (localhost:5173) |
| `pnpm build` | Gera o build de produção na pasta `dist/` |

### Desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

### Build de produção

```bash
pnpm build
```

Os arquivos gerados ficam em `dist/` e podem ser servidos por qualquer servidor HTTP estático.
