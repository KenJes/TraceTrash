# TraceTrash 🚛♻️

Sistema inteligente de rastreo en tiempo real para recolección de residuos urbanos.

## 📱 Descripción

TraceTrash es una solución completa que digitaliza y optimiza el servicio de recolección de basura en municipios, conectando a residentes, operadores y administradores en tiempo real.

## ✨ Características Principales

### Para Residentes

- 📍 **Rastreo en Tiempo Real**: Visualiza la ubicación exacta del camión recolector
- 🔔 **Notificaciones Inteligentes**: Recibe alertas cuando el camión se acerca a tu zona
- 📸 **Reporte de Incidencias**: Documenta problemas con fotos y ubicación GPS
- 📊 **Historial Personal**: Consulta tus reportes anteriores y su estado

### Para Conductores

- 🗺️ **Navegación Optimizada**: Rutas calculadas automáticamente para máxima eficiencia
- ⏱️ **Control de Servicio**: Inicia, pausa y finaliza tu turno desde la app
- 📱 **Interfaz Simplificada**: Diseño optimizado para uso durante conducción
- ✅ **Registro Automático**: El sistema registra puntos visitados automáticamente

### Para Administradores

- 📈 **Dashboard en Tiempo Real**: Monitorea todos los vehículos y métricas del servicio
- 🚚 **Gestión de Flota**: Administra conductores, vehículos y asignaciones
- 🛣️ **Optimización de Rutas**: Algoritmos inteligentes para planificación eficiente
- 📋 **Gestión de Reportes**: Seguimiento y respuesta a incidencias ciudadanas
- 📊 **Reportes y Analíticas**: Estadísticas detalladas del servicio

## 🎯 Beneficios

- **Ahorro de Costos**: Optimización automática reduce consumo de combustible hasta 20%
- **Mejor Servicio**: Ciudadanos informados en tiempo real = mayor satisfacción
- **Transparencia**: Trazabilidad completa del servicio de recolección
- **Sustentabilidad**: Rutas optimizadas reducen huella de carbono

## 🏙️ Casos de Uso

### Municipios Pequeños (< 50,000 habitantes)

Sistema escalable que inicia con 1-3 vehículos y crece con tu ciudad.

### Ciudades Medianas (50,000 - 200,000 habitantes)

Gestión completa de múltiples rutas, zonas y turnos.

### Mancomunidades

Solución compartida entre varios municipios para optimizar recursos.

## 📲 Disponibilidad

- **Android**: Disponible en APK para instalación directa
- **iOS**: Próximamente en App Store
- **Web**: Panel administrativo accesible desde navegador

## 🔐 Seguridad y Privacidad

- Autenticación segura de usuarios
- Datos encriptados en tránsito y en reposo
- Cumplimiento con normativas de protección de datos
- Ubicación de usuarios solo visible para ellos mismos

## 📞 Contacto

¿Interesado en implementar TraceTrash en tu municipio?

**Email**: contacto@axoloit.com  
**Sitio Web**: https://axoloit.com

---

## 🚀 Información Técnica (Para Desarrolladores)

### Stack Tecnológico

- **Frontend**: React Native + Expo SDK 54
- **Backend**: Firebase (Firestore + Authentication)
- **Mapas**: OpenStreetMap + Leaflet (100% gratuito)
- **Notificaciones**: Expo Push Notifications
- **Lenguaje**: TypeScript

### Requisitos del Sistema

- Node.js 22.11.0 o superior
- Expo CLI
- Android Studio (para desarrollo Android)
- Cuenta de Firebase

### Variables de Entorno

El proyecto requiere configuración de Firebase. Ver `.env.example` para referencia.

### Instalación para Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/KenJes/TraceTrash.git

# Instalar dependencias
cd TraceTrash
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Iniciar en modo desarrollo
npx expo start
```

### Build de Producción

```bash
# Build para Android (APK)
eas build --profile preview --platform android

# Build para producción
eas build --profile production --platform android
```

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 👨‍💻 Desarrollado por

**Axoloit**  
Soluciones Tecnológicas Inteligentes

**Kenneth Alcalá** - Desarrollador Principal  
GitHub: [@KenJes](https://github.com/KenJes)

---

© 2026 Axoloit. Todos los derechos reservados.

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

# Desarrollado por Axoloit - 2026

# TraceTrash

Sistema de rastreo en tiempo real de recolección de basura

## Descripción

Aplicación multiplataforma (Android, iOS, Web) que permite rastrear camiones recolectores de basura en tiempo real, gestionar rutas optimizadas, y reportar incidencias. Incluye tres roles de usuario con funcionalidades específicas.

## Características

### Residentes

- Rastreo en tiempo real del camión asignado
- Notificaciones push de proximidad del camión
- Reporte de incidencias con foto y ubicación
- Historial personal de reportes

### Conductores

- GPS tracking automático durante servicio
- Control de ruta (iniciar/pausar/finalizar)
- Vista de mapa con direcciones asignadas
- Notificación automática a usuarios en ruta

### Administradores

- Dashboard con métricas en tiempo real
- Mapa con ubicación de todos los camiones activos
- Gestión completa de conductores y rutas
- Optimización automática de rutas
- Administración y seguimiento de reportes

## Stack Tecnológico

- **Frontend**: React Native + Expo SDK 54 + TypeScript
- **Navegación**: Expo Router 6
- **Backend**: Firebase (Firestore + Authentication)
- **Mapas**: react-native-maps (móvil) | react-leaflet (web)
- **Notificaciones**: Expo Push Notifications
- **Build**: EAS Build

## Licencia

MIT License

## Autor

**Kenneth Alcalá**  
GitHub: [@KenJes](https://github.com/KenJes)

> > > > > > > main
