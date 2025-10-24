# Solución: Botón Copiar en Bloques de Código

**Fecha:** 2024-10-24  
**Contexto:** Blog posts con bloques de código que necesitan botón de copiar

## Problema

Los bloques `<pre class="c-post__prompt c-post__prompt--scroll">` contienen código/texto que los usuarios necesitan copiar frecuentemente. Actualmente deben seleccionar manualmente el texto.

**Ejemplo de estructura HTML:**
```html
<pre class="c-post__prompt c-post__prompt--scroll">
  <code class="c-post__prompt-code">
    .cursor/
    ├── rules/
    └── memory/
  </code>
</pre>
```

## Solución Propuesta (KISS)

### Enfoque Simple: Botón dentro de `<pre>` + Clipboard API

**1. Estructura HTML:**
Botón dentro del `<pre>` existente (sin wrapper adicional):

```html
<pre class="c-post__prompt c-post__prompt--scroll">
  <button class="c-post__copy-btn" aria-label="Copiar código">
    <svg><!-- icono copiar --></svg>
  </button>
  <code class="c-post__prompt-code">...</code>
</pre>
```

**2. JavaScript vanilla (ya existe `application.min.js`):**
```javascript
// En application.js, añadir:
document.querySelectorAll('.c-post__prompt--scroll').forEach(pre => {
  const btn = pre.querySelector('.c-post__copy-btn');
  const code = pre.querySelector('.c-post__prompt-code');
  
  if (btn && code) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        // Feedback visual
        btn.classList.add('c-post__copy-btn--copied');
        setTimeout(() => btn.classList.remove('c-post__copy-btn--copied'), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    });
  }
});
```

**3. CSS (ya existe SCSS en `_components.scss`):**
```scss
.c-post {
  &__prompt {
    // Añadir a los estilos existentes:
    position: relative;
    
    // ... resto de estilos existentes permanecen igual
  }
  
  &__copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba($color-terminal, 0.8);
    border: 1px solid $color-link;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 10;
    
    &:hover {
      background: $color-link;
      
      svg {
        fill: $color-paper;
      }
    }
    
    &--copied {
      background: $color-light;
      border-color: $color-light;
    }
    
    svg {
      width: 16px;
      height: 16px;
      fill: $color-link;
      transition: fill 0.2s;
    }
  }
}
```

## Pasos de Implementación

### ✅ Fase 1: Añadir estilos (COMPLETADA)
1. ✓ Modificar `.c-post__prompt` en `scss/05-components/_components.scss` → añadir `position: relative`
2. ✓ Crear `.c-post__copy-btn` en mismo archivo
3. ✓ Compilar SCSS

### ✅ Fase 2: Añadir funcionalidad JavaScript (COMPLETADA)
1. ✓ Añadir código en `js/application.js`
2. ✓ Minificar a `application.min.js`

### ✅ Fase 3: Actualizar estructura HTML (COMPLETADA)
1. ✓ Modificar `post-from-md.mdc` para generar botón dentro de `<pre>`
2. ✓ Actualizar posts existentes:
   - `blog/contexto-extendido-v2.html` (4 bloques)
   - `en/blog/extended-context-v2.html` (20 bloques)
   - `pt/blogue/contexto-estendido-v2.html` (20 bloques)

## Trade-offs

**✅ Ventajas:**
- API nativa del navegador (no dependencias)
- Feedback visual claro
- Funciona con keyboard (accesible)
- Mantiene formato del código (usa `textContent`)
- **Sin wrapper adicional** → HTML más limpio
- Usa estructura `<pre>` existente

**⚠️ Consideraciones:**
- Clipboard API requiere HTTPS (ya lo tienes)
- Botón queda dentro del `<pre>` (solucionado con `position: absolute`)
- Necesita actualizar protocolo @blog-post

**❌ Alternativas descartadas:**
- Wrapper adicional `.c-post__code-wrapper` → Innecesario, añade complejidad
- `execCommand('copy')` → Deprecated
- Librerías externas (clipboard.js) → Over-engineering
- Selección manual + copiar → Requiere más pasos del usuario

## Icono SVG

**SVG definitivo (Material Icons - content_copy):**
```html
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 -960 960 960">
  <path d="M362.31-260q-27.01 0-45.66-18.65T298-324.31v-455.38q0-27.01 18.65-45.66T362.31-844h359.38q27.01 0 45.66 18.65T786-779.69v455.38q0 27.01-18.65 45.66T721.69-260zm0-52h359.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H362.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85m-124 176q-27.01 0-45.66-18.65T174-200.31v-507.38h52v507.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h411.38v52zM350-312v-480z"/>
</svg>
```

**Feedback visual:** Cambio de color del SVG y fondo del botón via CSS (`.c-post__copy-btn--copied` modifier)

## Estado de Implementación

✅ **Implementación completada** - Funcionalidad "copy to clipboard" integrada en todos los posts del blog con estructura HTML simple (sin wrapper), estilos custom, y JavaScript nativo.

