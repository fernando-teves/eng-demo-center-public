# ENG Demo Center (Public)

Portfólio interativo de ofertas digitais, aceleradores e demos client-facing da Engineering do Brasil.

## Estrutura

```
public_demo_center/
  index.html                      Hub público com cards de ofertas
  ai_strategic_inception/         Demo executiva completa
    index.html
    assets/brand/fonts/           Fontes corporativas
    assets/brand/logos/           Logos ENG
    src/css/                      Estilos
    src/data/                     Dados demonstrativos (JSON)
    src/js/                       Lógica da aplicação
```

## Demos disponíveis

| Demo | Status | Descrição |
|------|--------|-----------|
| AI Strategic Inception | Disponível | Diagnóstico de maturidade, arquitetura alvo, backlog de AI Flows, roadmap, value case e dashboard de métricas |

## Como rodar localmente

Qualquer servidor de arquivos estáticos funciona. Exemplos:

**Python:**
```bash
cd public_demo_center
python -m http.server 8000
```
Acesse `http://localhost:8000`

**Node (npx):**
```bash
npx serve public_demo_center
```

**VS Code:**
Instale a extensão Live Server e abra `public_demo_center/index.html`.

## Como publicar

### GitHub Pages

1. Crie um repositório público no GitHub.
2. Copie o conteúdo de `public_demo_center/` para a raiz do repositório.
3. Ative GitHub Pages em **Settings > Pages > Source: Deploy from a branch > main / root**.
4. O site estará disponível em `https://<usuario>.github.io/<repo>/`.

### Netlify / Vercel

1. Conecte o repositório ao Netlify ou Vercel.
2. Configure o diretório de build como `/` (raiz).
3. Deploy automático a cada push.

## Notas

- Todos os dados são fictícios e utilizados exclusivamente para fins demonstrativos.
- Nenhuma informação confidencial, de cliente ou operacional está presente nesta versão.
- A demo AI Strategic Inception funciona inteiramente como site estático, sem dependências de servidor.
