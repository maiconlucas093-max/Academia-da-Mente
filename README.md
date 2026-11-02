# ACADEMIA DA MENTE — versão inicial

## Como abrir no SPCK
1. Extraia o ZIP no celular.
2. No SPCK, abra a pasta `ACADEMIA-DA-MENTE`.
3. Abra `index.html` para visualizar a aplicação.
4. Para publicar, envie os arquivos da pasta para a raiz do repositório GitHub Pages.

## Arquivos
- `index.html`: estrutura da interface.
- `style.css`: identidade visual responsiva.
- `script.js`: navegação, áudio, sessão caminhada, favoritos, anotações, playlists e persistência local.
- `aulas/`: pastas preparadas para seus MP3.

## Como adicionar uma aula MP3
1. Copie o arquivo MP3 para a pasta do departamento, por exemplo `aulas/jung/inconsciente.mp3`.
2. Abra `script.js` e localize a constante `LESSONS`.
3. Adicione um objeto:
```js
{
  id: "jung-001",
  title: "Introdução à psicologia analítica",
  department: "jung",
  module: "Módulo 1",
  audio: "aulas/jung/inconsciente.mp3",
  durationLabel: "18 min",
  transcript: ""
}
```
4. Salve e recarregue a página.

IDs de departamento válidos: `garnier-malet`, `tom-campbell`, `my-big-toe`, `jung`, `neurociencia`, `criatividade`, `economia`, `filosofia`.

## Importante nesta etapa
- A versão inicial não inclui MP3 de demonstração nem progresso fictício.
- O tempo ouvido é contado durante a reprodução do áudio.
- Marcar uma aula como concluída exige ação explícita do usuário.
- Dados ficam no armazenamento local do navegador deste dispositivo; ainda não há sincronização.
- O suporte a áudio em segundo plano e controles na tela de bloqueio depende do navegador e do sistema operacional.
- A duração de sessão no Modo Caminhada é tempo decorrido da sessão; não é apresentada como tempo de áudio efetivamente ouvido.
- Para sincronização, autenticação e armazenamento remoto, a próxima etapa será a integração com Supabase e políticas RLS. Nunca publique a `service_role key` no frontend.
