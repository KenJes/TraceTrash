/**
 * ============================================
 * MAIN.JS - TraceTrash Landing Page
 * ============================================
 * Script principal que maneja todas las interacciones
 * y animaciones de la landing page
 * ============================================
 */

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
    
    // Inicializar todas las funcionalidades
    initNavbar();
    initScrollTop();
    initCounters();
    initContactForm();
    initSmoothScroll();
});

// ============================================
// NAVEGACIÓN
// Maneja el efecto de scroll del navbar
// ============================================
function initNavbar() {
    const navbar = document.getElementById('mainNav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Cerrar el menú móvil al hacer clic en un link
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
}

// ============================================
// SCROLL TO TOP BUTTON
// Botón para volver al inicio de la página
// ============================================
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    // Mostrar/ocultar botón según scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    // Acción del botón
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// CONTADORES ANIMADOS
// Anima los números en la sección hero
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 50; // Velocidad de animación
    
    // Observer para detectar cuando los contadores son visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
    
    // Función para animar un contador individual
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-count'));
        let count = 0;
        const increment = target / speed;
        
        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.textContent = Math.ceil(count);
                requestAnimationFrame(updateCount);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCount();
    }
}

// ============================================
// FORMULARIO DE CONTACTO
// Maneja el envío del formulario con validación
// ============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            interest: document.getElementById('interest').value,
            message: document.getElementById('message').value
        };
        
        // Validar formulario
        if (!validateForm(formData)) {
            showMessage('Por favor completa todos los campos correctamente', 'danger');
            return;
        }
        
        // Deshabilitar botón mientras se procesa
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        
        try {
            // Simular envío (aquí iría la llamada AJAX real a tu backend)
            await simulateFormSubmit(formData);
            
            // Mostrar mensaje de éxito
            showMessage('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.', 'success');
            
            // Limpiar formulario
            form.reset();
            
        } catch (error) {
            // Mostrar mensaje de error
            showMessage('Hubo un error al enviar el formulario. Por favor intenta nuevamente.', 'danger');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
    
    // Función para validar el formulario
    function validateForm(data) {
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return false;
        }
        
        // Validar que todos los campos estén llenos
        for (let key in data) {
            if (!data[key] || data[key].trim() === '') {
                return false;
            }
        }
        
        return true;
    }
    
    // Función para mostrar mensajes
    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `alert alert-${type}`;
        formMessage.style.display = 'block';
        
        // Scroll al mensaje
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
    
    // Simular envío del formulario (reemplazar con AJAX real)
    function simulateFormSubmit(data) {
        return new Promise((resolve) => {
            // Simular delay de red
            setTimeout(() => {
                console.log('Datos del formulario:', data);
                resolve();
            }, 1500);
        });
    }
}

// ============================================
// SMOOTH SCROLL
// Navegación suave entre secciones
// ============================================
function initSmoothScroll() {
    // Seleccionar todos los links internos
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorar links vacíos
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Calcular offset del navbar
                const navbarHeight = document.getElementById('mainNav').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// LAZY LOADING DE IMÁGENES
// Carga las imágenes solo cuando son visibles
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    // Observar todas las imágenes con data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// ACTIVE LINK DETECTION
// Detecta qué sección está visible y actualiza el nav
// ============================================
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================
// PRELOADER (Opcional)
// Muestra un loader mientras carga la página
// ============================================
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }
});

// ============================================
// PARALLAX EFFECT (Opcional)
// Efecto parallax en el hero
// ============================================
window.addEventListener('scroll', function() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && window.innerWidth > 768) {
        const scrolled = window.scrollY;
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ============================================
// COPIAR AL PORTAPAPELES (Para compartir)
// ============================================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copiado al portapapeles');
    });
}

// ============================================
// ANALYTICS Y TRACKING
// Rastreo de eventos importantes
// ============================================
function trackEvent(category, action, label) {
    // Integración con Google Analytics, Facebook Pixel, etc.
    console.log('Event tracked:', { category, action, label });
    
    // Ejemplo con Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Rastrear clics en CTA
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function() {
        trackEvent('CTA', 'click', this.textContent.trim());
    });
});

// ============================================
// DETECCIÓN DE DISPOSITIVO
// Añade clases según el tipo de dispositivo
// ============================================
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;

if (isMobile) {
    document.body.classList.add('is-mobile');
}
if (isTablet) {
    document.body.classList.add('is-tablet');
}
