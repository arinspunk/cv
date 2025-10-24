# Contexto Extendido 2.0: Los agentes también necesitan arquitectura, no solo notas

Esta guía es una versión mejorada de la que propuse en "[Contexto extendido. Los agentes también necesitan tomar notas](https://xulioze.com/blog/contexto-extendido.html)" y [Guía: desarrollar software de calidad asistido por agentes de IA](https://xulioze.com/blog/guia-desarrollar-software-agentes.html).

Cuando llegaron los editores con agentes de IA autónomos (Cursor, GitHub Copilot, Claude Code), muchos compramos la promesa: "[escribe el prompt perfecto](https://xulioze.com/blog/oneshot-vs-dialogo.html) y el agente te genera la feature completa de una tirada". La realidad fue otra: sin estructura ni constraints, acabábamos dedicando más tiempo a corregir bugs que a escribir código.

El "vibe-coding" —eso de confiar en que el agente "pille la vibe" de tu proyecto— funciona bien para prototipos rápidos, pero en proyectos reales y complejos genera más problemas que soluciones:
- **Decisiones perdidas**: ¿Por qué elegimos esta arquitectura hace dos semanas?
- **Alucinaciones constantes**: La IA inventa APIs, mezcla frameworks, ignora constraints
- **Trabajo monolítico**: Imposible dividir features en tareas rastreables
- **Improvisación continua**: Cada sesión comienza desde cero

Hace unos meses documenté [una solución](https://xulioze.com/blog/guia-desarrollar-software-agentes.html) (v1): un workflow estructurado (análisis → solución → backlog → ejecución → progreso guardado) con cuatro archivos de contexto que convertía el vibe-coding en ingeniería rastreable. Funcionó, pero había fricción: repetir manualmente los mismos prompts en cada sesión era un dolor.

Esta guía presenta la evolución de ese sistema (v2). Aprovecha el sistema de rules de Cursor para automatizar prompts y convierte el workflow en protocolos reutilizables. Pero al diseñarla emergió un **patrón universal**: separar conocimiento reutilizable (rules) de memoria temporal (memory). Esto va más allá de ahorrarte escribir los mismos prompts: puedes reutilizar el conocimiento en diferentes proyectos y llevar un registro ordenado de todo lo que haces. Y el patrón funciona con cualquier herramienta de IA, no solo con Cursor.

Vamos a ver cómo construir esa arquitectura.

## Problema de v1

Sistema de cuatro archivos en `context/`:
- `01-expert.md` - Perfil del experto
- `02-analysis.md` - Análisis del código  
- `03-plan.md` - Plan de implementación
- `04-backlog.md` - Tareas pendientes

### Limitaciones en proyectos reales

**Conocimiento mezclado**: `01-expert.md` combina principios generales (KISS, DRY) con constraints específicos del proyecto (stack, versiones, dependencias críticas). Imposible reutilizar principios entre proyectos sin arrastrar configuración irrelevante.

**Duplicación entre proyectos**: Cada proyecto replica conocimiento común. Si trabajas en 3 proyectos WordPress, tienes "security: sanitize_*, nonces" copiado tres veces. Actualizas una best practice, debes sincronizar manualmente.

**Sin gestión de histórico**: v1 te da tres opciones, todas malas:
- Sobrescribir 02-analysis.md → pierdes decisiones previas
- Acumular análisis en el mismo archivo → crece descontroladamente, imposible rastrear cuándo se tomó cada decisión
- Crear múltiples archivos (02-analysis-feature-X.md) → desorden, sin nomenclatura consistente

En todos los casos: ¿Por qué rechazaste la arquitectura X hace dos semanas? No hay forma sistemática de recuperarlo.

**Sin modularidad**: Cambiar de WordPress a React requiere reescribir `01-expert.md` completo. No puedes mantener módulos comunes (principios, patrones) y solo intercambiar el experto técnico.

v1 tenía dos problemas fundamentales: (1) conocimiento mezclado en un solo archivo (01-expert.md), (2) ejecución manual - cada acción requería escribir el prompt completo ("analiza este archivo y guarda en 02-analysis.md", "lee 04-backlog.md, ejecuta tareas 1-3, actualiza estado"). v2 resuelve ambos: separa conocimiento en rules/ modulares y automatiza ejecución mediante protocolos invocables en rules/utils/ (@analysis, @execute).

## Solución: Separación Rules/Memory

La solución replica cómo funciona nuestro cerebro: separamos conocimiento permanente (idioma, matemáticas, habilidades) de memoria episódica (lo que hicmos ayer, decisiones de la semana pasada). Pero además, nuestro conocimiento no es monolítico: tenemos módulos especializados (JavaScript, WordPress, principios KISS) que activamos según el contexto.

v2 implementa esta arquitectura dual:

1. **Separación conocimiento/memoria**: Rules reutilizables vs memory temporal
2. **Modularización del conocimiento**: Expertos, guidelines y protocolos ejecutables

```
.cursor/
├── rules/          # Conocimiento reutilizable y modular
│   ├── experts/    # Roles técnicos (WordPress, React, Python...)
│   ├── guidelines/ # Principios y constraints (KISS, proyecto-específicos)
│   └── utils/      # Protocolos ejecutables (analysis, backlog, commit)
└── memory/         # Experiencias temporales
    └── YYYYMMDD-VV-descripcion.md
```

### Concepto Clave: alwaysApply

El sistema rules/memory necesita un mecanismo de activación: ¿qué conocimiento 
carga Cursor automáticamente vs. qué invocas bajo demanda? Sin esto, tendrías 
100 reglas compitiendo por contexto limitado.

El flag `alwaysApply` resuelve esto:

- **`alwaysApply: true`** → Cursor las carga automáticamente en cada conversación
  - Usa para: Expertos base, guidelines críticas del proyecto
  - Ejemplo: `wordpress-classic-themes.mdc`, `constraints-balneario.mdc`

- **`alwaysApply: false`** → Usuario las invoca con `@` según necesidad
  - Usa para: Protocolos bajo demanda, herramientas específicas
  - Ejemplo: `@analysis`, `@backlog`

### Rules: Conocimiento Reutilizable

**Experts** - Perfiles de expertos técnicos/dominio:

`rules/experts/wordpress-classic-themes.mdc`
```markdown
---
alwaysApply: true
---
# WordPress Classic Expert
PHP + vanilla JS specialist. WordPress core APIs, theme dev.

## Stack
Backend: PHP 7.4+, WP Core APIs | Frontend: Vanilla JS, HTML5, CSS3

## Core Patterns
- Security: sanitize_*, esc_*, nonces
- Performance: transients (12h), conditional enqueue
- Translation: __(), _e() with text domain
```

**Guidelines** - Principios de código y restricciones de proyecto:

`rules/guidelines/constraints-balneario.mdc`
```markdown
---
alwaysApply: true
---
# Balneario Theme
Text domain: themefront v0.1.2
Stack: Node | SASS 1.67.0 | PHP 7.4+ | jQuery 3.x
Build: npm run watch:sass (never edit compiled CSS)

Critical: ACF PRO (18 groups), WooCommerce, WPML
Core Systems: PDF Generator (pdf-generator.php), WooCommerce integration
```

`rules/guidelines/kiss.mdc`
```markdown
---
alwaysApply: true
---
# KISS Principle
- Direct solutions, avoid over-engineering
- Simple patterns, minimal dependencies
- Single responsibility per function

Rule: If you can't explain it in 2-3 sentences, it's too complex.
```

El principio KISS es especialmente importante en desarrollo asistido por IA: es más 
fácil pedir al agente que añada complejidad a una solución simple, que perder tiempo 
analizando qué sobra en su propuesta ([los LLMs tienden a generar código más complejo 
de lo necesario](https://arxiv.org/html/2411.09916v1)).

**Utils** - Protocolos invocables:

`rules/utils/analysis.mdc` *→ Analiza código/carpetas y guarda en memory*
```markdown
---
alwaysApply: false
---
# Analysis Protocol
Trigger: @file/@folder or "analyze"
1. Acknowledge → 2. Analyze → 3. Save to .cursor/memory/YYYYMMDD-VV-*.md → 4. Confirm
```

`rules/utils/solution.mdc` *→ Propone solución y guarda en memory*
```markdown
---
alwaysApply: false
---
# Solution Protocol (KISS)
Trigger: User requests solution
1. Acknowledge → 2. Propose simplest solution → 3. Save to memory → 4. Confirm
Principles: Simplicity > complexity, proven patterns > novel
```

`rules/utils/backlog.mdc` *→ Convierte solución en tareas atómicas rastreables*
```markdown
---
alwaysApply: false
---
# Backlog Protocol
Solution → atomic tasks → persistent backlog (YYYYMMDD-VV-backlog-*.md)

Format: [Phase.Task#] ⏳/🔄/✅/⚠️ Title
> What to do | Date completed | Work done

Rules: 2-4h max, sequential, testable
```

`rules/utils/execute.mdc` *→ Ejecuta tareas del backlog y actualiza estado*
```markdown
---
alwaysApply: false
---
# Task Execution Protocol
Load backlog → parse scope → execute → update status → stop at boundary
Input: [1.1], [2.3,2.4], Phase 2, continue
```

`rules/utils/commit.mdc` *→ Genera commits convencionales y actualiza backlog*
```markdown
---
alwaysApply: false
---
# Commit Protocol
Analyze staged → generate conventional commit → approve → execute → update backlog
Format: [JIRA-XXX] type(scope): subject (English, imperative, max 72 chars)
```

### Memory: Registro Histórico

Los protocolos utils generan automáticamente archivos en memory/ siguiendo la nomenclatura `YYYYMMDD-VV-descripcion.md` (VV = secuencia diaria: 01, 02, 03...):

```
memory/
├── 20250919-01-analisis-pdf-generator.md
├── 20250919-02-sistema-pdfs-emails-finalizado.md
├── 20251015-01-analisis-completo-balneario-theme.md
├── 20251015-02-solucion-facturacion-automatica-399.md
└── 20251015-03-backlog-facturacion-automatica-399.md
```

Ventajas: ordenación cronológica, múltiples entradas/día, trazabilidad, relaciones visibles.

Esto resuelve el problema de las tres opciones malas de v1: la nomenclatura cronológica (YYYYMMDD-VV) acumula histórico sin descontrol, mantiene orden sin desorganización, y preserva decisiones sin sobrescritura.

## Workflow en Cursor

> **Nota**: Los comandos con `@` invocan reglas específicas. Por ejemplo, 
> `@analysis` carga `rules/utils/analysis.mdc` sin necesidad de escribir 
> la ruta completa. Esto es parte de la sintaxis nativa de Cursor.

Esta sección describe el **workflow general para desarrollo asistido por IA**: 
separar conocimiento reutilizable de memoria temporal, siguiendo el ciclo 
análisis → solución → backlog → ejecución → commit → continuar. Usamos Cursor 
y su sistema de rules como ejemplo de implementación, pero el workflow es 
aplicable a cualquier herramienta de IA con capacidad de inyectar contexto.

A continuación verás cómo funciona el workflow en la práctica. Si después quieres implementarlo en tus proyectos con Cursor, consulta la guía de **Implementación y Configuración** más abajo.

### Desarrollo de feature: facturación automática

**1. Análisis**
```
@analysis checkout.php
```
→ Genera: `20251015-01-analisis-checkout.md`

**2. Solución**
```
@solution
Implementa facturación automática WooCommerce
```
→ Genera: `20251015-02-solucion-facturacion.md`

**3. Backlog**
```
@memory/20251015-02-solucion-facturacion
@backlog
```
→ Genera: `20251015-03-backlog-facturacion.md`

**4. Ejecución**
```
@memory/20251015-03-backlog-facturacion
@execute [1.1]
```
→ Actualiza: `[1.1] ⏳ → ✅`

**5. Commit**
```
@memory/20251015-03-backlog-facturacion
@commit
```
→ Crea commit + actualiza backlog

**6. Continuar trabajo (nueva sesión)**
```
@memory/20251015-03-backlog-facturacion
Resume trabajo
```
→ Carga contexto + muestra próximas tareas

## Implementación y Configuración

### 1. Instalar el sistema (5 min)

Este sistema está disponible en [bitbucket.org/i2tic/cursor-rules](https://bitbucket.org/i2tic/cursor-rules).

**Dos formas de configurar:**

**Opción A - Contribuir al repo compartido (recomendado si quieres participar en el mantenimiento):**
```bash
cd tu-proyecto
git clone git@bitbucket.org:i2tic/cursor-rules.git .cursor
```
Mantiene conexión con el repo para recibir actualizaciones y contribuir mejoras. Actualiza cuando quieras: `cd .cursor && git pull`

**Opción B - Snapshot para tu proyecto (recomendado para trabajo diario):**
```bash
git clone git@bitbucket.org:i2tic/cursor-rules.git temp
cp -r temp/rules temp/memory tu-proyecto/.cursor/
rm -rf temp
```
Copia independiente que personalizas libremente sin afectar el repo original, ideal para versionar junto con el código de tu proyecto.

**Migración desde v1:** Usa Opción B para integrar con tu estructura existente.

### 2. Configuración inicial (15 min)

**Pre-requisitos:**
- Cursor instalado y proyecto abierto
- Sistema rules/memory clonado en `.cursor/` (paso anterior completado)

**Paso 1: Identifica tu stack (2 min)**
Revisa `rules/experts/` y activa el experto que coincida con tu proyecto:
- WordPress → `wordpress-classic-themes.mdc`
- React → `react-typescript.mdc` (si existe)
- Backend Python → `python-fastapi.mdc` (si existe)

Si tu stack no existe: copia el experto más cercano y adáptalo.

**Paso 2: Activa constraints del proyecto (3 min)**
1. Copia `rules/guidelines/constraints-template.mdc` a `constraints-{proyecto}.mdc`
2. Completa:
   - Stack técnico (versiones específicas)
   - Dependencias críticas (librerías que NO se pueden cambiar)
   - Sistemas legacy que debes respetar
3. Cambia `alwaysApply: false` → `true`

**Paso 3: Activa principios base (1 min)**
Activa `kiss.mdc` cambiando `alwaysApply: false` → `true`

**Paso 4: Verifica carga (1 min)**
Abre chat de Cursor (Cmd+L) y escribe:
```
¿Qué experto y guidelines tienes activas?
```
Cursor debe listar los archivos con `alwaysApply: true`.

**Paso 5: Primera ejecución (8 min)**
Prueba el workflow completo con un archivo real:
```
@analysis src/components/Header.tsx
```

Si genera correctamente `memory/YYYYMMDD-01-*.md`, el sistema está operativo.

---

> **Nota para otras herramientas**: Este sistema es agnóstico a Cursor. 
> La separación conceptual rules/memory puede implementarse en cualquier 
> herramienta capaz de inyectar contexto (GitHub Copilot, Claude Code, etc.).

Una vez configurado el sistema, el verdadero trabajo comienza: alimentar rules con 
conocimiento específico del proyecto y prácticas habituales del equipo, mientras 
memory registra el trabajo realizado con la IA (análisis, propuestas de solución, 
tareas y progreso). En la práctica, esto transforma cómo la IA genera código: 
soluciones coherentes con la arquitectura del proyecto y escalables. Además, 
documenta decisiones que facilitan debug posteriores y transferencia de 
conocimiento entre desarrolladores.

## Conclusión

El vibe-coding funciona para prototipos, pero genera más problemas que soluciones en proyectos reales: decisiones perdidas, alucinaciones constantes, trabajo imposible de rastrear. v1 resolvió esto con workflow estructurado, pero requería repetir prompts manualmente en cada sesión.

v2 elimina esa fricción automatizando los protocolos y, al hacerlo, descubre un patrón universal: **separar conocimiento reutilizable (rules) de memoria temporal (memory)**. Esta separación—la misma que hace tu cerebro entre habilidades y experiencias—convierte cualquier herramienta de IA en un sistema donde el conocimiento persiste, evoluciona y se reutiliza sistemáticamente.

No elimina las limitaciones de ventana de contexto, pero las transforma en un framework estructurado para construir software de forma rastreable y escalable.

### Próximos Pasos

1. **Si usas Cursor**: [Clona el repo](https://bitbucket.org/i2tic/cursor-rules) y configura tu primer proyecto
2. **Si usas otra herramienta**: Adapta la separación rules/memory a tu sistema
3. **Comparte tu implementación**: ¿Creaste expertos para tu stack? Contribuye al repo
4. **Comparte resultados**: ¿Mejoraste el workflow? Documenta tus hallazgos para refinar colectivamente el sistema