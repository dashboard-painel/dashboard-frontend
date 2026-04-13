# Dashboard de Auditoria de Vendas - API vs Redshift

## Contexto do Projeto

Este dashboard monitora a **defasagem de sincronizacao de dados de Vendas** entre duas fontes: o banco de dados **Redshift** (dados internos) e a **API Farmarcas** (dados enviados pela integracao). Para cada CNPJ, o dashboard compara a **ultima data de emissao (dat_emissao)** disponivel no Redshift com a ultima data de emissao disponivel na API, e calcula a diferenca em dias. Isso permite identificar rapidamente quais farmacias estao com a sincronizacao em dia e quais estao atrasadas.

Abrange 3 grupos de farmacias: **Trier** (10 CNPJs), **Alpha7** (15 CNPJs) e **Eden** (20 CNPJs), totalizando **45 farmacias**. Por enquanto, somente o dominio de **Vendas** e comparado.

---

## Requisitos de Design

### Estilo Visual
- Design **dark mode** profissional, estilo enterprise/fintech
- Paleta de cores: fundo escuro (#1a1a2e ou similar), cards com fundo levemente mais claro, acentos em azul (#4361ee), verde (#06d6a0) para em dia, amarelo (#ffd166) para atraso leve, vermelho (#ef476f) para atraso critico
- Tipografia limpa e moderna (Inter, SF Pro, ou equivalente)
- Layout responsivo com grid system
- Cantos arredondados nos cards (8px)
- Sombras sutis para profundidade

### Tamanho da Tela
- Desktop-first: 1920x1080 como referencia principal
- Sidebar de navegacao fixa a esquerda (240px)

---

## Estrutura do Dashboard

### 1. Sidebar (Lateral Esquerda - Fixa)

```
Logo / Nome do Sistema: "Auditoria BC"
---
Menu de Navegacao:
  - Dashboard (ativo)
  - Vendas (sub-item ativo, com indicador visual)
  - Compras
  - Estoque
  - Receitas
  - Despesas
  - Clientes
---
Configuracoes
Sair
```

### 2. Header (Topo)

```
Titulo: "Auditoria de Vendas - API vs Redshift"
Subtitulo: "Monitoramento de defasagem de sincronizacao por CNPJ"

[Lado direito do header]
- Botao "Exportar Excel" (icone download)
- Botao "Atualizar Dados" (icone refresh)
- Indicador de ultima execucao: "Ultima auditoria: 13/04/2026 14:30"
```

### 3. Barra de Filtros (Abaixo do Header)

Barra horizontal com os seguintes filtros, todos lado a lado:

| Filtro | Tipo | Opcoes / Comportamento |
|--------|------|------------------------|
| **Grupo** | Dropdown multi-select | Trier, Alpha7, Eden (todos selecionados por padrao) |
| **CNPJ** | Dropdown com busca (searchable) | Lista de todos os 45 CNPJs, com nome da farmacia ao lado. Ex: "00.112.423/0001-01 - Farmacia Drogalar" |
| **Status** | Dropdown multi-select | Em dia, Atraso leve (1-3 dias), Atraso critico (4+ dias), Sem dados |
| **Defasagem minima** | Input numerico | Filtrar CNPJs com pelo menos N dias de defasagem (padrao: 0) |
| **Botao** | Botao primario | "Aplicar Filtros" |
| **Botao** | Botao secundario/link | "Limpar Filtros" |

### 4. KPI Cards (Primeira Linha - 4 Cards Horizontais)

Quatro cards com metricas de contagem de CNPJs por faixa de defasagem:
- Icone representativo no topo
- Valor grande (numero de CNPJs)
- Label descritivo abaixo
- Sublabel com contexto

```
[Card 1]                     [Card 2]                     [Card 3]                        [Card 4]
CNPJs                        CNPJs                        CNPJs com                       CNPJs
Em Dia                       Atraso Leve                  Atraso Critico                  Sem Dados
32                           8                            3                               2
icone: check-circle          icone: clock                 icone: alert-triangle           icone: x-circle
cor: verde                   cor: amarelo                 cor: vermelho                   cor: cinza
sublabel: "0 dias"           sublabel: "1 a 3 dias"       sublabel: "4+ dias"             sublabel: "sem retorno"
```

**Logica de cada card:**
- **Em Dia (verde)**: CNPJs onde a ultima dat_emissao no Redshift e a mesma da API (0 dias de diferenca)
- **Atraso Leve (amarelo)**: CNPJs onde a diferenca entre a ultima dat_emissao do Redshift e a ultima dat_emissao da API e de 1 a 3 dias
- **Atraso Critico (vermelho)**: CNPJs onde a diferenca e de 4 ou mais dias
- **Sem Dados (cinza)**: CNPJs que nao retornaram dados na API ou nao possuem dados no Redshift (erro de integracao ou CNPJ nao encontrado)

### 5. Tabela Principal - Visao Agrupada por CNPJ (Secao Central)

Titulo da secao: "Detalhamento por Farmacia"

Tabela com as seguintes colunas:

| Coluna | Descricao | Formato |
|--------|-----------|---------|
| **Status** | Icone colorido conforme defasagem: circulo verde (Em dia), relogio amarelo (Atraso leve), triangulo vermelho (Atraso critico), X cinza (Sem dados) | Badge/chip colorido |
| **Grupo** | Trier / Alpha7 / Eden | Tag/badge |
| **CNPJ** | CNPJ formatado: 00.112.423/0001-01 | Texto |
| **Nome Farmacia** | Nome da farmacia vinculada ao CNPJ | Texto |
| **Numero Farmacia** | Codigo/numero da loja | Texto |
| **Ultima Data Redshift** | Ultima dat_emissao encontrada no Redshift para este CNPJ | DD/MM/YYYY |
| **Ultima Data API** | Ultima dat_emissao encontrada na API para este CNPJ | DD/MM/YYYY |
| **Dias de Defasagem** | Diferenca em dias: (Ultima Data Redshift) - (Ultima Data API). Se API esta atrasada, valor positivo. Se Redshift esta atrasado, valor negativo. | Numero com cor (verde=0, amarelo=1-3, vermelho=4+) |
| **Total Registros Redshift** | Quantidade total de registros de vendas no Redshift para este CNPJ | Numero formatado (1.234) |
| **Total Registros API** | Quantidade total de registros de vendas na API para este CNPJ | Numero formatado (1.234) |
| **Ultima Auditoria** | Data/hora da ultima execucao da auditoria para este CNPJ | DD/MM/YYYY HH:MM |

**Funcionalidades da tabela:**
- Ordenacao por qualquer coluna (clicando no header). Padrao: ordenar por "Dias de Defasagem" decrescente (mais atrasados primeiro)
- Paginacao: 10, 25, 50 registros por pagina
- Linha clicavel: ao clicar numa linha, expande um accordion/drawer com detalhes
- Busca rapida por CNPJ ou nome
- Highlight visual: linhas com Atraso Critico devem ter borda lateral vermelha; Atraso Leve com borda amarela

### 6. Drawer/Painel de Detalhes (Ao Clicar na Linha)

Ao clicar em um CNPJ na tabela principal, abre um painel lateral (drawer) ou secao expansivel com:

#### 6a. Resumo do CNPJ
```
CNPJ: 00.112.423/0001-01
Nome: Farmacia Drogalar
Numero: 001
Grupo: Trier
Status: Atraso Leve (2 dias)
Ultima Data Redshift: 13/04/2026
Ultima Data API: 11/04/2026
```

#### 6b. Grafico de Linha - Evolucao da Defasagem ao Longo do Tempo
- Eixo X: Data da auditoria (cada execucao)
- Eixo Y: Dias de defasagem
- Uma linha mostrando como a defasagem evoluiu nas ultimas execucoes da auditoria
- Tooltip ao passar o mouse mostrando: data da auditoria, ultima data Redshift, ultima data API, dias de defasagem
- Area abaixo da linha colorida: verde quando 0, amarelo 1-3, vermelho 4+

#### 6c. Tabela de Datas por Periodo
Mostra a cobertura de datas para aquele CNPJ, comparando dia a dia:

| Coluna | Descricao |
|--------|-----------|
| **Data (dat_emissao)** | Cada data distinta de emissao | 
| **Registros Redshift** | Qtd de registros no Redshift nesta data |
| **Registros API** | Qtd de registros na API nesta data |
| **Diferenca** | Registros Redshift - Registros API |
| **Presente em** | "Ambos", "Somente Redshift", "Somente API" |

Ordenado por data decrescente (mais recente primeiro). Destacar em vermelho as linhas onde a data existe somente no Redshift (dados nao chegaram na API).

### 7. Graficos (Secao Inferior - 2 Colunas)

#### 7a. Grafico de Barras Horizontais (Esquerda)
- Titulo: "Defasagem por Farmacia"
- Eixo Y: CNPJs (nome curto ou CNPJ)
- Eixo X: Dias de defasagem
- Cada barra colorida conforme faixa: verde (0), amarelo (1-3), vermelho (4+)
- Ordenado por defasagem decrescente (piores no topo)
- Mostrar no maximo 15 farmacias (as mais atrasadas). Se todas estao em dia, mostrar todas em verde

#### 7b. Grafico de Pizza/Donut (Direita)
- Titulo: "Distribuicao de Status por CNPJ"
- 4 fatias: Em Dia (verde), Atraso Leve (amarelo), Atraso Critico (vermelho), Sem Dados (cinza)
- Mostra a quantidade de CNPJs em cada faixa
- Legenda abaixo com contagem de CNPJs
- Numero total no centro do donut (45)

### 8. Tabela de Erros de Integracao (Secao Final)

Titulo: "Erros de Comunicacao (API/Redshift)"

| Coluna | Descricao |
|--------|-----------|
| **CNPJ** | CNPJ afetado |
| **Nome Farmacia** | Nome |
| **Origem** | "API" ou "Redshift" |
| **Periodo** | Periodo da requisicao que falhou (data_inicial a data_final) |
| **Erro** | Descricao do erro (timeout, rate limiting, CNPJ nao encontrado, etc.) |
| **Timestamp** | Quando o erro ocorreu |

---

## Dados Tecnicos para Mapeamento de Campos

### Campo de Comparacao Principal
- **dat_emissao**: data de emissao da venda. E a data usada para determinar a defasagem.
- No Redshift: coluna `dat_emissao` da tabela `associacao.vendas`
- Na API: campo `data_emissao` retornado pelo endpoint `/v2/bc/obter-vendas`, convertido para timezone America/Sao_Paulo

### Calculo da Defasagem
```
ultima_data_redshift = MAX(dat_emissao) do Redshift WHERE num_cnpj = CNPJ
ultima_data_api = MAX(dat_emissao) da API WHERE num_cnpj = CNPJ
dias_defasagem = (ultima_data_redshift - ultima_data_api) em dias
```

### Classificacao de Status
- **Em Dia** (verde): dias_defasagem = 0
- **Atraso Leve** (amarelo): dias_defasagem entre 1 e 3
- **Atraso Critico** (vermelho): dias_defasagem >= 4
- **Sem Dados** (cinza): API nao retornou dados para o CNPJ, ou CNPJ nao encontrado no Redshift, ou erro de comunicacao

### Chave Unica de Registro (ID_UNICO)
Composicao: `num_cnpj` + `num_nota` + `cod_barra` + `dat_emissao` + `cod_cliente`
Separador: underscore (`_`)

### Grupos de Farmacias
- **Trier**: 10 CNPJs (associacao FARMARCAS, tenant farmarcas)
- **Alpha7**: 15 CNPJs (associacao FARMARCAS, tenant farmarcas)
- **Eden**: 20 CNPJs (associacao FARMARCAS, tenant f31167)

### API Endpoint
- Vendas: `POST /v2/bc/obter-vendas`
- Payload: `{ associacao, cnpj, data_inicial, data_final, numero_pagina, tamanho_pagina }`

### Tabela Redshift
- Schema: `associacao.vendas`
- Deduplicacao: `ROW_NUMBER() OVER (PARTITION BY num_cnpj, num_nota, cod_barra, dat_emissao, cod_cliente ORDER BY atualizado_em_delta DESC)`

---

## Interacoes e UX

1. **Filtros em tempo real**: ao selecionar filtros e clicar "Aplicar", todos os KPIs, tabelas e graficos devem atualizar
2. **Tooltip nos graficos**: ao passar mouse sobre barras/pontos, mostrar detalhes (CNPJ, nome, datas, defasagem)
3. **Export**: botao de exportar deve gerar Excel com os dados da tabela principal e detalhes por CNPJ
4. **Responsivo**: a tabela deve ter scroll horizontal em telas menores
5. **Loading states**: skeleton screens enquanto dados carregam
6. **Empty states**: mensagem positiva quando nao ha defasagem ("Todas as farmacias estao com sincronizacao em dia")
7. **Notificacao badge**: no menu lateral, mostrar badge vermelho no item "Vendas" se houver farmacias com Atraso Critico
8. **Ordenacao padrao**: tabela principal ordenada por defasagem decrescente para destacar os piores casos primeiro

---

## Notas para o Designer

- Os dados de exemplo nas tabelas e KPIs sao ilustrativos - use numeros realistas mas ficticios
- O campo "Nome Farmacia" e "Numero Farmacia" serao vinculados por CNPJ a partir de uma tabela auxiliar (os scripts atuais nao possuem esses dados nativamente)
- O dashboard e somente de leitura/visualizacao - nao ha acoes de edicao ou correcao de dados
- Priorizar a visao agrupada por CNPJ como tela principal, com drill-down para detalhes
- As faixas de defasagem (0, 1-3, 4+) sao configuracoes sugeridas que podem ser ajustadas no futuro
- Por enquanto o dashboard cobre somente Vendas. Os demais dominios (Compras, Estoque, etc.) seguirao o mesmo modelo futuramente
