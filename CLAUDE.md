# Projeto-RocketSeat — Portfólio do Carlos Eduardo

Site pessoal (GitHub Pages) do Carlos Eduardo, backend developer. Feito
durante o programa Discover da Rocketseat, sem framework — HTML/CSS/JS puro,
sem build step. Já passou por um redesign grande (esta sessão) que levou o
site de "portfólio simples" pra um case-study interativo do GestãoCheck +
carrossel de projetos com preview/modal + minigames + carrossel de
conquistas — mantendo a filosofia vanilla.

- **Live**: https://carloseduardo-rocha.github.io/Projeto-RocketSeat/
- **Autor**: Carlos Eduardo Rocha (GitHub: carloseduardo-rocha)

## ⚠️ Regra crítica de todo chat que trabalhar neste repo

**NUNCA rode `git commit` nem `git push`.** O Carlos sobe tudo manualmente.
Quando algo estiver pronto pra subir, só entregue o texto do commit pra ele
copiar e rodar — nunca execute o comando você mesmo. (O `.git` local também
pareceu com `HEAD` ausente em algum momento — se for mexer em git, confirme
o estado antes.)

## Stack e estrutura

Site estático de página única, sem build step.

```
index.html            # toda a estrutura (hero, links, case-study, projetos,
                       #   skills, conquistas, minigames, footer, modal)
style.css              # tudo via CSS custom properties (tema dark/light)
script.js              # toda a lógica: tema, partículas, modal de projeto,
                        #   galeria, hover-carousel, achievements, 4 minigames,
                        #   scroll reveal, tilt 3D, etc.
robots.txt / sitemap.xml
assets/
  avatar.png, avatar-light.png, full-moon.png, bg-*.jpg   # originais do site
  Curriculo-Carlos_Eduardo.pdf                             # currículo atual
  og-image.png                                             # Open Graph (gerada via PowerShell/System.Drawing)
  gestaocheck-*.png                                        # 13 telas reais (claro/escuro), já cortadas (sidebar removida)
  fittribe-*.png                                           # 7 telas reais do app (mockups pretos + claros)
  certificados/*.pdf                                       # PDFs reais linkados nos cards de conquista
```

Abrir com Live Server ou `python -m http.server` (config já em
`.claude/launch.json`, nome `static-site`, porta 8080). Fontes via Google
Fonts, ícones via Devicon (skills) e Ionicons (social), Devicon/Ionicons
carregados com `integrity`/`crossorigin` (SRI). CSP restritiva via `<meta>`
no `<head>`.

## Convenções que já existem no site (reaproveitar, não reinventar)

- **Tema**: toda cor é uma CSS var definida em `:root` (dark, default) e
  sobrescrita em `.light`. Nunca hardcodar cor — sempre `var(--nome)`.
  `--shine-color` existe especificamente pro efeito de brilho no hover
  (cyan no dark, azul no light) — reaproveitar em vez de hardcodar branco.
- **Container**: `#container` tem `max-width: 640px` até 700px, sobe pra
  960px a partir de 1024px (breakpoint criado pra dar espaço ao case-study).
- **Card de projeto** (`.project-card`): flex column, tem um
  `.project-visual` no topo (diagrama/tabuleiro/mockup, ver abaixo) +
  `.project-desc` (frase do que o projeto faz) + linha de stack + CTA.
  Todo `.project-card[data-preview]` abre o modal de preview ao clicar
  (ver `initProjectPreviewModal`), com o link real do GitHub só disponível
  dentro do modal.
- **GestãoCheck é uma seção própria** (`.case-study`), não um card — fica
  antes do `.projects-grid`. A imagem (`.case-study-media`) é um botão que:
  (a) no hover, avança um mini-carrossel com efeito de pilha de fotos atrás
  (`initCaseStudyHoverCarousel`); (b) no clique, abre o modal grande com a
  galeria completa (13 imagens, claro/escuro + 1 mobile).
- **Modal de preview** (`#project-modal` + `openProjectModal()` em
  script.js): função compartilhada usada tanto pelos `.project-card` quanto
  pelo `.case-study-media`. Suporta um `.project-visual` clonado OU uma
  galeria (`PROJECT_GALLERIES`) com múltiplas imagens ciclando sozinhas.
  Uma galeria "desktop" pode ter slides individuais `variant:"phone"`
  (ex: a tela mobile do GestãoCheck) — eles renderizam como um cartão de
  celular pequeno centralizado (`.gallery-inline-phone`), não esticado.
- **Skill tooltip** (`.skill-icon-btn` + `.skill-tooltip`): ícone Devicon +
  nome + tooltip com nível, descrição, link opcional. Cada botão também
  ganha dots de nível automaticamente via JS (`initSkillLevelIndicators`,
  lê o texto do tooltip, não precisa editar HTML pra isso).
- **Carrossel de conquistas** (`#achievements-carousel`): dados em
  `ACHIEVEMENTS` (script.js), cada item tem `category` ("formacao" ou
  "certificado"). O render (`initAchievements`) insere um
  `.achievement-category-divider` (rótulo vertical) toda vez que a
  categoria muda — pra adicionar uma categoria nova, só usar um novo valor
  de `category` e registrar o rótulo em `ACHIEVEMENT_CATEGORY_LABELS`.
  Scroll com drag+momentum de verdade (`initAchievementsCarousel`) e
  destaque no card central (`.centered`).
- **Minigames**: seletor tipo Steam (`.game-tile` + `.game-panel[hidden]`)
  controlado por `activeGame` (variável global) + `initGameSelector()`.
  4 jogos: Snake (motor com interpolação suave via `requestAnimationFrame`,
  não `setInterval` — ver `stepGame`/`renderGame`/`gameLoopFrame`),
  Jogo da Velha (`tttMode`: "cpu" ou "friend", 2 jogadores no mesmo
  aparelho), Pong (IA simples seguindo a bola, canvas próprio,
  `resizePongCanvas` só funciona depois do painel ficar visível —
  cuidado com esse tipo de bug se adicionar jogo novo com canvas escondido
  por padrão), 2048 (grid 4x4, swipe no mobile).
- **Bio do hero**: só as 5 linhas básicas ficam sempre visíveis (nome,
  cargo, @user, stack, "Também:"). O parágrafo de trajetória fica dentro
  de `.avatar-bio-bubble`, que abre ao passar o mouse na foto (ou tocar,
  no celular) — não deixar esse texto solto na página de novo, o Carlos já
  pediu pra tirar uma vez.

## Segurança (já implementado, não regredir)

CSP no `<meta>`, SRI nos CDNs, `.gitignore` (protege
`.claude/settings.local.json`), telefone/e-mail montados via JS em vez de
texto puro no HTML (`initContactLinks`, evita scraping bobo), `rel="noopener
noreferrer"` em todo `target="_blank"`.

## GestãoCheck — fatos pra não errar de novo

- Carlos é **cofundador e desenvolvedor** — mas entrou **depois** da ideia
  já existir (fundadores Jarbas e Tonhão). Ele "fortalece o time e ajuda a
  moldar a ideia em sistema" — **não** "assume a liderança" sozinho. Cuidado
  com esse tom.
- **Todos os módulos já existem em produção**: Estoque, CMV, CMO, CMC,
  Beneficiamento, Avarias, Ocorrências, Checklists, Manutenção, Requisição,
  Relatórios. Versão atual: **1.1.0, estável**. **Quase 10 clientes
  pagantes, crescendo.**
- **MVP-4 (em construção agora)**: IA interna de apoio ao uso, DRE
  completo, plano de curvas (primeira = Curva ABC). Não confundir isso com
  os módulos acima (que já estão prontos).
- Site institucional (vendas): gestaocheck.tech — repo público
  `github.com/GestaoCheck/gestao-pro` (o SISTEMA em si continua privado,
  não linkar).

## Pendências conhecidas (perguntar ao Carlos antes de assumir)

- **README.md do repo**: ainda não foi atualizado nesta sessão — provavelmente
  descreve a versão antiga e simples do site. Precisa refletir a estrutura
  atual (case-study, modal, galerias, minigames, conquistas, etc.).
- Mais certificados/cursos podem chegar (pasta
  `CERTIFICADO - CURRICULOS` no OneDrive do Carlos, fora deste repo — ele
  reorganiza ela vez ou outra, os arquivos às vezes mudam de subpasta).
- Mais imagens do GestãoCheck ou do FitTribe podem ser mandadas — perguntar
  onde foram salvas (normalmente `Downloads`) se vierem coladas sem
  caminho de arquivo.
- Carrossel de posts do LinkedIn: **descartado**, o Carlos decidiu que o
  carrossel de conquistas já cobre esse papel.
