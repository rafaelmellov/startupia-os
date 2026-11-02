# Startupia Motion 3.0

50 composiciones activas y 120 variantes interactivas; el código completo se encuentra incrustado en index.html.

Todos los efectos respetan la preferencia del sistema y el control Reducir movimiento. Los contenidos permanecen visibles si la API de animaciones no está disponible. Las animaciones no retrasan operaciones ni introducen latencia artificial.

| # | Composición | Elemento | Activador |
|---|---|---|---|
| 1 | Orbital Logo Reveal | `.nav .brand` | view |
| 2 | Stellar Eyebrow Assembly | `.hero-copy .eyebrow` | view |
| 3 | Spatial Headline Entrance | `.hero-copy h1` | view |
| 4 | Cinematic Hero Focus | `.hero-art` | view |
| 5 | Action Depth Entrance | `.hero-copy .actions` | view |
| 6 | Trust Line Reveal | `.hero-note` | view |
| 7 | Orbital Seal Arrival | `.orbital-seal` | view |
| 8 | Edition Tracking | `.hero-edition` | view |
| 9 | Path Coordinates | `.hero-coordinate` | view |
| 10 | Navigation Glass Settle | `.site-header` | view |
| 11 | Editorial Section Reveal | `.contrast .section-head` | view |
| 12 | Clarity Type Perspective | `.clarity-copy h3` | view |
| 13 | Before After Surface Assembly | `.clarity-compare` | view |
| 14 | Journey Depth Reveal | `.journey-card` | view |
| 15 | Founder Narrative Slide | `.journey-intro` | view |
| 16 | Intelligence Scene Focus | `.context-scene` | view |
| 17 | Connected Headline Rise | `.context-heading` | view |
| 18 | Intelligence Node Reveal | `.context-label` | view |
| 19 | Dashboard Reconstruction | `.product-shell` | view |
| 20 | Workspace Caption Wipe | `.workspace-caption` | view |
| 21 | Module Architecture Rise | `.module-card` | view |
| 22 | Holographic Icon Tilt | `.module-icon` | hover |
| 23 | MVP Blueprint Reveal | `.native-illustration` | view |
| 24 | Visual Data Tracing | `.native-illustration svg` | hover |
| 25 | Surface Light Pulse | `.module-card .module-top` | hover |
| 26 | Pricing Material Shift | `.price-card` | hover |
| 27 | Floating Glass Tile | `.path-tile` | hover |
| 28 | Node Energy Pulse | `.context-label` | hover |
| 29 | Human Perspective Reveal | `.mentor-scene` | view |
| 30 | Session Steps Assembly | `.mentor-process li` | view |
| 31 | Answer Selection Ripple | `.choice` | click |
| 32 | Adaptive Progress Illumination | `.progress` | view |
| 33 | Question Spatial Morph | `#quiz-body h2` | view |
| 34 | Diagnostic Result Assembly | `.result-steps` | view |
| 35 | Recommendation Spotlight | `.result-label` | view |
| 36 | Next Moves Cascade | `.result-steps li` | view |
| 37 | Conversion Invitation Lift | `.result-tools .btn` | hover |
| 38 | Success Surface Arrival | `#toast` | shown |
| 39 | Budget Number Transition | `#mentor-cost` | text |
| 40 | CTA Press Feedback | `.btn` | click |
| 41 | Connected Module Transition | `#demo-panel .panel-enter` | view |
| 42 | Active Tool Marker | `.side-btn` | click |
| 43 | Task Completion Signal | `.task input` | change |
| 44 | Context Answer Reveal | `#demo-insight` | text |
| 45 | Assistant Orbit Open | `#assistant` | shown |
| 46 | Guide Response Entrance | `#assistant-answer` | text |
| 47 | Comparison Expansion | `.compare` | toggle |
| 48 | FAQ Progressive Disclosure | `.faq-list details` | toggle |
| 49 | Mobile Navigation Reveal | `#navigation` | shown |
| 50 | Editorial Image Expansion | `#image-dialog` | shown |

## Variantes

Doce familias, diez niveles calibrados por familia: edge-light, focus-depth, icon-turn, surface-lift, text-drift, glass-sheen, selection-pulse, node-glow, line-emphasis, image-breathe, press-settle y panel-arrival. Se asignan a botones, enlaces, resúmenes, etiquetas, iconos y superficies mediante data-effect.

Por nivel i=0…9: duración 180+26i ms; amplitud 0.45+0.12i; easing alterno entre ease-out y cubic-bezier(.22,1,.36,1). Activadores: pointerenter, focusin y click. La implementación usa Web Animations API; las variantes de brillo y sombra se ejecutan solo en la interacción, sin bucles permanentes.

El movimiento de scroll usa requestAnimationFrame solo tras un evento. Las tarjetas usan reflejos con variables CSS. IntersectionObserver ejecuta cada aparición una vez. Los observadores se desconectan al salir de la página.
