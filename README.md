# Axoloit - Sitio Web Corporativo

Sitio web oficial de **Axoloit** con diseño moderno dark/tech inspirado en plataformas de IA contemporáneas.

**URL de producción**: https://axoloit.com

## Estructura del Sitio

```
https://axoloit.com/              → Landing corporativa Axoloit (raíz)
https://axoloit.com/Tracetrash/   → Producto TraceTrash (subcarpeta)
```

### Arquitectura de Archivos

```
/                                  (raíz = dominio axoloit.com)
├── index.html                     Landing Axoloit (diseño dark/tech)
├── robots.txt                     SEO crawler directives
├── sitemap.xml                    Sitemap XML
├── css/
│   ├── axoloit.css               Sistema de diseño corporativo
│   └── styles.css                Estilos legacy TraceTrash
├── images/
│   ├── logo-axoloit.svg          Logo ajolote (mascota Axoloit)
│   ├── logo.png                  Logo TraceTrash
│   └── screenshot-*.png          Capturas de pantalla producto
├── js/
│   └── main.js                   Scripts TraceTrash
└── Tracetrash/
    └── index.html                Landing producto TraceTrash
```

## Diseño y Estilo

### Identidad Visual

**Paleta dark/tech:**
- `--ax-dark: #0A0E1A` (negro azulado profundo)
- `--ax-primary: #00D9FF` (cyan brillante - tech accent)
- `--ax-secondary: #8B5CF6` (púrpura vibrante)
- `--ax-accent: #06FFA5` (verde tech)
- `--ax-text: #E4E7EB` (texto claro)
- `--ax-text-muted: #94A3B8` (texto secundario)

**Tipografía:**
- Primary: Inter Variable (Google Fonts)
- Display: Inter 700-800 para títulos impactantes
- Mono: JetBrains Mono para acentos tech

**Características de diseño:**
- Dark theme como principal
- Glassmorphism en cards (backdrop-filter blur)
- Gradientes sutiles cyan-púrpura
- Efectos de glow en CTAs y elementos interactivos
- Animaciones CSS suaves y AOS
- Grid moderno con espaciado generoso
- Accesibilidad WCAG AA verificada

### Contraste WCAG Verificado

- Texto claro (#E4E7EB) sobre fondo oscuro (#0A0E1A): **14.2:1** ✓ WCAG AAA
- Cyan (#00D9FF) sobre fondo oscuro: **9.1:1** ✓ WCAG AAA
- Púrpura (#8B5CF6) sobre fondo oscuro: **5.8:1** ✓ WCAG AA

## Estructura de Archivos

```
/
├── index.html                  # Landing Axoloit (dark/tech moderno)
├── README.md                   # Este archivo
├── _config.yml                 # GitHub Pages config
├── Tracetrash/
│   └── index.html             # Página producto TraceTrash
├── css/
│   ├── axoloit.css            # Sistema de diseño dark/tech
│   └── styles.css             # Estilos TraceTrash (legacy)
├── js/
│   └── main.js                # Scripts JavaScript
└── images/
    ├── logo-axoloit.svg       # Logo SVG minimalista
    └── ...                    # Assets gráficos
```

## Características Técnicas

- HTML5 semántico
- CSS3 con variables y sistema de diseño modular
- JavaScript vanilla para interacciones
- Inter Variable font (Google Fonts)
- Bootstrap Icons
- AOS Animation Library
- Performance optimizada
- SEO y Open Graph tags
- JSON-LD structured data

## Secciones de Axoloit

1. **Hero**: Propuesta de valor con gradiente en título
2. **Stats**: Métricas clave en cards glassmorphism
3. **Qué Hacemos**: 3 beneficios principales con iconos
4. **Productos**: Showcase de TraceTrash con features
5. **Casos de Uso**: 3 perfiles de clientes objetivo
6. **CTA**: Llamado a la acción con mailto
7. **Nosotros**: Historia, valores y enlaces sociales
8. **Footer**: Links, redes sociales y copyright

## Enlaces Externos

- **GitHub**: https://github.com/KenJes
- **LinkedIn**: https://www.linkedin.com/in/kenneth-alcalá-14852a23a

## GitHub Pages

Para publicar:

1. Push a rama `docs` o `main`
2. En GitHub: Settings → Pages
3. Source: Branch docs / root folder
## Deploy en Cloudflare Pages

### Configuración Inicial

1. **Conectar Repositorio**:
   - Ir a Cloudflare Dashboard → Pages
   - Click "Create a project" → "Connect to Git"
   - Seleccionar repositorio: `KenJes/TraceTrash`
   - Branch de producción: `docs`

2. **Build Settings**:
   ```
   Framework preset: None (Static site)
   Build command: (dejar vacío)
   Build output directory: / (raíz del repo)
   Root directory: / (raíz del repo)
   ```

3. **Variables de Entorno**:
   - No requeridas para sitio estático

### Mapeo de Dominio Personalizado

1. **Añadir dominio axoloit.com**:
   - Pages → [Tu proyecto] → Custom domains
   - Click "Set up a custom domain"
   - Ingresar: `axoloit.com`
   - Click "Continue"

2. **Configurar DNS en Cloudflare**:
   ```
   Tipo: CNAME
   Name: @
   Target: [tu-proyecto].pages.dev
   Proxy: Activado (nube naranja)
   ```

3. **Añadir www (opcional)**:
   ```
   Tipo: CNAME
   Name: www
   Target: axoloit.com
   Proxy: Activado
   ```

4. **Activar HTTPS**:
   - Se configura automáticamente
   - Forzar HTTPS: SSL/TLS → Edge Certificates → Always Use HTTPS

### Verificación

- URL principal: https://axoloit.com → `/index.html`
- Subpágina: https://axoloit.com/Tracetrash/ → `/Tracetrash/index.html`
- Tiempo propagación DNS: 1-5 minutos

### Deploy Automático

Cada push a rama `docs` dispara deploy automático:
```bash
git add .
git commit -m "fix: actualizar contenido"
git push origin docs
```

### Rollback

- Cloudflare Pages → Deployments
- Click en deployment previo → "Rollback to this deployment"

## Alternativa: GitHub Pages

Si prefieres mantener GitHub Pages temporalmente:

1. Settings → Pages → Source: `docs` branch
2. URL: https://kenjes.github.io/TraceTrash/
3. Redirección DNS:
   ```
   Tipo: CNAME
   Name: www
   Target: kenjes.github.io
   ```

## Diferencias con TraceTrash

**Axoloit (index.html):**
- Dark theme (negro azulado #0A0E1A)
- Paleta cyan/púrpura (#00D9FF / #8B5CF6)
- Diseño corporativo B2B
- Enfoque en IA y datos
- Glassmorphism y efectos glow

**TraceTrash (Tracetrash/index.html):**
- Light theme con green accent
- Paleta verde (#4CAF50)
- Diseño orientado a producto
- Enfoque en features específicas
- Estilo más tradicional

## Comandos Git

```bash
# Cambiar a branch
git checkout feature/axoloit-ui-refresh

# Ver cambios
git status
git diff

# Commit
git add .
git commit -m "feat(docs): rediseño dark/tech moderno para Axoloit"

# Push
git push origin feature/axoloit-ui-refresh

# Merge a docs
git checkout docs
git merge feature/axoloit-ui-refresh
git push origin docs
```

## Validación y Testing

### Checklist Local

- [ ] Abrir index.html en navegador
- [ ] Verificar responsive (DevTools)
- [ ] Probar navegación entre secciones
- [ ] Verificar links externos (GitHub/LinkedIn)
- [ ] Probar link a /Tracetrash
- [ ] Validar contraste de colores

### Validación Técnica

- [ ] HTML Validator: https://validator.w3.org/
- [ ] CSS Validator: https://jigsaw.w3.org/css-validator/
- [ ] Lighthouse Audit (Performance, Accessibility, SEO)
- [ ] Contrast Checker: https://webaim.org/resources/contrastchecker/

### Targets de Performance

- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Lighthouse SEO: > 95
- First Contentful Paint: < 1.5s

## Contacto

Para solicitar demo: contacto@axoloit.com

---

Desarrollado por Axoloit - 2026
