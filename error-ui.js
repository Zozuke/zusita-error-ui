/**
 * 🐱 ZuzitaErrorUI v1.0
 * Herramienta de depuración visual con personalidad
 * Para desarrollo en celular sin consola
 * 
 * Uso: Solo agrega <script src="error-ui.js"></script>
 * API: ZuzitaErrorUI.mostrar(), .log(), .toggleConsole(), .ocultar()
 */
(function() {
  'use strict';

  // ============================================
  // ⚙️ CONFIGURACIÓN
  // ============================================
  const DEBUG = true;
  
  // Imágenes personalizables (URLs o emojis grandes)
  const IMAGES = {
    default: '🐱🔧',
    '404': '4️⃣0️⃣4️⃣💔',
    offline: '📡❌',
    server: '🖥️💥',
    js: '🐛💻',
    unknown: '❓💫',
    empty: '🚧🐱'
  };

  // Mensajes amigables por tipo de error
  const MENSAJES = {
    default: {
      titulo: 'Ups… algo se rompió 👀',
      subtitulo: 'Hmm… esto no salió como esperaba 🛠',
    },
    '404': {
      titulo: 'Oops, la página se perdió por ahí 🐾',
      subtitulo: 'Los números 404 están tirados en el suelo…',
    },
    offline: {
      titulo: '¡Sin conexión! 📡',
      subtitulo: 'Parece que las señales se cayeron',
    },
    server: {
      titulo: 'El servidor está durmiendo 🖥️💤',
      subtitulo: 'Tranqui, estamos arreglando esto 💜',
    },
    js: {
      titulo: '¡Un bichito en el código! 🐛',
      subtitulo: 'Un error de JavaScript se coló por aquí',
    },
    unknown: {
      titulo: 'Misterio… algo pasó 🕵️',
      subtitulo: 'No sabemos qué fue, pero lo investigaremos',
    },
    empty: {
      titulo: '🚧 Página en construcción',
      subtitulo: 'Esta parte aún la estoy armando 💜',
    }
  };

  // ============================================
  // 📦 MÓDULO: Utilidades
  // ============================================
  const Util = {
    generarId: () => 'zuzita_' + Math.random().toString(36).substr(2, 9),
    
    formatearTimestamp: () => {
      const ahora = new Date();
      return ahora.toLocaleTimeString('es-ES', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    crearElemento: (tag, attrs = {}, ...hijos) => {
      const elem = document.createElement(tag);
      Object.entries(attrs).forEach(([key, val]) => {
        if (key === 'estilo') Object.assign(elem.style, val);
        else if (key === 'className') elem.className = val;
        else elem[key] = val;
      });
      hijos.forEach(hijo => {
        if (typeof hijo === 'string') elem.appendChild(document.createTextNode(hijo));
        else if (hijo) elem.appendChild(hijo);
      });
      return elem;
    },

    debounce: (fn, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }
  };

  // ============================================
  // 📦 MÓDULO: Consola Visual
  // ============================================
  const Consola = {
    _entradas: [],
    _contenedor: null,
    _output: null,
    _visible: false,
    _maxEntradas: 100,

    inicializar: () => {
      Consola._crearUI();
      Consola._interceptarConsola();
      Consola.agregar('✅ ZuzitaErrorUI activo 💜', 'info');
    },

    _crearUI: () => {
      // Botón flotante
      const btn = Util.crearElemento('button', {
        id: 'zuzita_btn_consola',
        texto: '⚙️',
        estilo: {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '9997',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: '#1a1a2e',
          color: '#e0e0e0',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        },
        onclick: Consola.toggle
      });
      
      // Contenedor de la consola
      Consola._contenedor = Util.crearElemento('div', {
        id: 'zuzita_consola',
        estilo: {
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: '9996',
          background: '#0a0a0a',
          borderTop: '2px solid #333',
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          display: 'none',
          maxHeight: '40vh',
          transition: 'transform 0.3s ease',
          transform: 'translateY(100%)'
        }
      });

      // Header
      const header = Util.crearElemento('div', {
        estilo: {
          padding: '8px 15px',
          background: '#1a1a2e',
          color: '#e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #333',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      }, 
        Util.crearElemento('span', {}, '🐱 Terminal Zuzita'),
        Util.crearElemento('button', {
          texto: '✕',
          estilo: {
            background: 'none',
            border: 'none',
            color: '#e0e0e0',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0 5px'
          },
          onclick: Consola.toggle
        })
      );

      // Área de salida
      Consola._output = Util.crearElemento('div', {
        estilo: {
          padding: '10px 15px',
          color: '#00ff41',
          overflowY: 'auto',
          maxHeight: 'calc(40vh - 60px)',
          lineHeight: '1.6'
        }
      });

      Consola._contenedor.appendChild(header);
      Consola._contenedor.appendChild(Consola._output);
      
      document.body.appendChild(btn);
      document.body.appendChild(Consola._contenedor);
    },

    _interceptarConsola: () => {
      const originales = {};
      ['log', 'warn', 'error', 'info'].forEach(nivel => {
        originales[nivel] = console[nivel];
        console[nivel] = function(...args) {
          originales[nivel].apply(console, args);
          Consola.agregar(args.join(' '), nivel);
        };
      });
    },

    agregar: (mensaje, nivel = 'log') => {
      const entrada = {
        timestamp: Util.formatearTimestamp(),
        mensaje: String(mensaje),
        nivel
      };
      Consola._entradas.push(entrada);
      
      if (Consola._entradas.length > Consola._maxEntradas) {
        Consola._entradas.shift();
      }

      if (Consola._visible && Consola._output) {
        Consola._renderizarEntrada(entrada);
      }
    },

    _renderizarEntrada: (entrada) => {
      const colores = {
        log: '#00ff41',
        warn: '#ffd700',
        error: '#ff6b6b',
        info: '#4dabf7'
      };

      const linea = Util.crearElemento('div', {
        estilo: {
          marginBottom: '4px',
          wordBreak: 'break-all'
        }
      },
        Util.crearElemento('span', {
          estilo: { color: '#888', marginRight: '8px' }
        }, entrada.timestamp),
        Util.crearElemento('span', {
          estilo: { color: colores[entrada.nivel] || '#00ff41' }
        }, entrada.mensaje)
      );

      Consola._output.appendChild(linea);
      Consola._output.scrollTop = Consola._output.scrollHeight;
    },

    _renderizarTodo: () => {
      if (!Consola._output) return;
      Consola._output.innerHTML = '';
      Consola._entradas.forEach(Consola._renderizarEntrada);
    },

    toggle: () => {
      Consola._visible = !Consola._visible;
      if (Consola._visible) {
        Consola._contenedor.style.display = 'block';
        setTimeout(() => {
          Consola._contenedor.style.transform = 'translateY(0)';
          Consola._renderizarTodo();
        }, 10);
      } else {
        Consola._contenedor.style.transform = 'translateY(100%)';
        setTimeout(() => {
          Consola._contenedor.style.display = 'none';
        }, 300);
      }
    },

    mostrar: () => {
      if (!Consola._visible) Consola.toggle();
    },

    ocultar: () => {
      if (Consola._visible) Consola.toggle();
    }
  };

  // ============================================
  // 📦 MÓDULO: UI de Errores
  // ============================================
  const UI = {
    _overlay: null,
    _errorActual: null,
    _historial: [],
    _ultimoError: null,

    inicializar: () => {
      UI._crearOverlay();
    },

    _crearOverlay: () => {
      UI._overlay = Util.crearElemento('div', {
        id: 'zuzita_overlay',
        estilo: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: '9999',
          background: 'rgba(10, 10, 20, 0.95)',
          display: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          animation: 'zuzita_fadeIn 0.3s ease',
          padding: '20px',
          boxSizing: 'border-box'
        },
        onclick: (e) => {
          if (e.target === UI._overlay) UI.ocultar();
        }
      });

      // Inyectar keyframes CSS
      const estilos = document.createElement('style');
      estilos.textContent = `
        @keyframes zuzita_fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zuzita_scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes zuzita_slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zuzita_float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .zuzita_boton {
          padding: 12px 24px;
          margin: 8px;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: #2d2d44;
          color: #e0e0e0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .zuzita_boton:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          background: #3d3d5c;
        }
        .zuzita_boton_primario {
          background: #6c63ff;
          color: white;
        }
        .zuzita_boton_primario:hover {
          background: #7c73ff;
        }
        .zuzita_icono_grande {
          font-size: 80px;
          animation: zuzita_float 3s ease-in-out infinite;
          margin-bottom: 20px;
        }
        .zuzita_titulo {
          font-size: 24px;
          font-weight: bold;
          color: #e0e0e0;
          margin: 10px 0;
          text-align: center;
          animation: zuzita_scaleIn 0.4s ease;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .zuzita_subtitulo {
          font-size: 16px;
          color: #aaa;
          margin: 10px 0 30px;
          text-align: center;
          animation: zuzita_slideUp 0.5s ease;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .zuzita_detalle {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 10px;
          margin: 10px 0;
          font-family: monospace;
          font-size: 11px;
          color: #888;
          word-break: break-all;
          max-width: 90vw;
          max-height: 100px;
          overflow-y: auto;
          display: ${DEBUG ? 'block' : 'none'};
        }
      `;
      document.head.appendChild(estilos);
      document.body.appendChild(UI._overlay);
    },

    mostrar: (tipo = 'default', detalle = '') => {
      // Evitar duplicación del mismo error en 2 segundos
      const ahora = Date.now();
      const clave = `${tipo}_${detalle}`;
      if (UI._ultimoError && UI._ultimoError.clave === clave && (ahora - UI._ultimoError.tiempo) < 2000) {
        return;
      }
      UI._ultimoError = { clave, tiempo: ahora };

      const imagen = IMAGES[tipo] || IMAGES['default'];
      const mensajes = MENSAJES[tipo] || MENSAJES['default'];
      
      UI._errorActual = { tipo, detalle, timestamp: new Date().toISOString() };
      UI._historial.push(UI._errorActual);

      // Limpiar overlay
      UI._overlay.innerHTML = '';

      // Contenedor principal
      const contenedor = Util.crearElemento('div', {
        estilo: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '400px',
          animation: 'zuzita_scaleIn 0.3s ease'
        }
      });

      // Imagen / emoji
      const icono = Util.crearElemento('div', {
        className: 'zuzita_icono_grande',
        texto: imagen
      });
      contenedor.appendChild(icono);

      // Título
      contenedor.appendChild(
        Util.crearElemento('div', { className: 'zuzita_titulo' }, mensajes.titulo)
      );

      // Subtítulo
      contenedor.appendChild(
        Util.crearElemento('div', { className: 'zuzita_subtitulo' }, mensajes.subtitulo)
      );

      // Detalle técnico (solo en DEBUG)
      if (DEBUG && detalle) {
        contenedor.appendChild(
          Util.crearElemento('div', { className: 'zuzita_detalle' }, detalle)
        );
      }

      // Contenedor de botones
      const botones = Util.crearElemento('div', {
        estilo: {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '10px'
        }
      });

      // Botón Reintentar
      botones.appendChild(
        Util.crearElemento('button', {
          className: 'zuzita_boton zuzita_boton_primario',
          texto: '🔄 Reintentar',
          onclick: () => {
            UI.ocultar();
            if (tipo === 'offline') {
              // Intentar reconectar
              window.location.reload();
            } else if (tipo === '404') {
              window.location.href = '/';
            } else {
              window.location.reload();
            }
          }
        })
      );

      // Botón Ver Detalles (consola)
      botones.appendChild(
        Util.crearElemento('button', {
          className: 'zuzita_boton',
          texto: '🔍 Ver detalles',
          onclick: () => {
            Consola.mostrar();
          }
        })
      );

      // Botón Cerrar
      botones.appendChild(
        Util.crearElemento('button', {
          className: 'zuzita_boton',
          texto: '✕ Cerrar',
          onclick: UI.ocultar
        })
      );

      contenedor.appendChild(botones);
      UI._overlay.appendChild(contenedor);
      UI._overlay.style.display = 'flex';
      
      // Registrar en consola
      Consola.agregar(`🐱 Error [${tipo}]: ${detalle || 'Sin detalle adicional'}`, 'error');
    },

    ocultar: () => {
      if (UI._overlay) {
        UI._overlay.style.opacity = '0';
        UI._overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          UI._overlay.style.display = 'none';
          UI._overlay.style.opacity = '1';
        }, 300);
      }
    }
  };

  // ============================================
  // 📦 MÓDULO: Detección de Errores
  // ============================================
  const Deteccion = {
    _fetchOriginal: null,
    _erroresDetectados: new Set(),

    inicializar: () => {
      Deteccion._monitorearOffline();
      Deteccion._monitorearErroresJS();
      Deteccion._monitorearErroresFetch();
      Deteccion._monitorearPromesas();
      Deteccion._detectarPaginaVacia();
    },

    _monitorearOffline: () => {
      window.addEventListener('offline', () => {
        if (Deteccion._erroresDetectados.has('offline')) return;
        Deteccion._erroresDetectados.add('offline');
        Consola.agregar('📡 Conexión perdida', 'warn');
        UI.mostrar('offline', 'Se perdió la conexión a internet');
      });

      window.addEventListener('online', () => {
        Deteccion._erroresDetectados.delete('offline');
        Consola.agregar('📡 Conexión restaurada 💜', 'info');
        UI.ocultar();
      });

      // Verificar estado inicial
      if (!navigator.onLine) {
        UI.mostrar('offline', 'No hay conexión a internet');
      }
    },

    _monitorearErroresJS: () => {
      window.onerror = function(mensaje, fuente, linea, columna, error) {
        const clave = `${mensaje}_${linea}_${columna}`;
        if (Deteccion._erroresDetectados.has(clave)) return;
        Deteccion._erroresDetectados.add(clave);

        let tipo = 'js';
        if (mensaje.includes('ReferenceError')) tipo = 'js';
        else if (mensaje.includes('fetch')) tipo = 'server';
        else if (mensaje.includes('404')) tipo = '404';

        Consola.agregar(`❌ ${mensaje} (${fuente}:${linea})`, 'error');
        
        if (DEBUG) {
          UI.mostrar(tipo, `Error: ${mensaje}\nArchivo: ${fuente}:${linea}`);
        } else {
          UI.mostrar(tipo);
        }
        return true;
      };
    },

    _monitorearErroresFetch: () => {
      Deteccion._fetchOriginal = window.fetch;
      
      window.fetch = function(...args) {
        return Deteccion._fetchOriginal.apply(this, args)
          .then(response => {
            if (response.status === 404) {
              const clave = `fetch404_${args[0]}`;
              if (!Deteccion._erroresDetectados.has(clave)) {
                Deteccion._erroresDetectados.add(clave);
                Consola.agregar(`📭 404: ${args[0]}`, 'error');
                UI.mostrar('404', `Recurso no encontrado: ${args[0]}`);
              }
            } else if (response.status >= 500) {
              Consola.agregar(`🖥️ Server error ${response.status}: ${args[0]}`, 'error');
              UI.mostrar('server', `Error del servidor (${response.status})`);
            }
            return response;
          })
          .catch(error => {
            Consola.agregar(`🌐 Fetch error: ${error.message}`, 'error');
            if (!navigator.onLine) {
              UI.mostrar('offline');
            } else {
              UI.mostrar('server', error.message);
            }
            throw error;
          });
      };
    },

    _monitorearPromesas: () => {
      window.addEventListener('unhandledrejection', (event) => {
        const mensaje = event.reason?.message || String(event.reason);
        const clave = `promise_${mensaje}`;
        if (Deteccion._erroresDetectados.has(clave)) return;
        Deteccion._erroresDetectados.add(clave);

        Consola.agregar(`💥 Promesa rechazada: ${mensaje}`, 'error');
        if (mensaje.includes('404')) {
          UI.mostrar('404', mensaje);
        } else {
          UI.mostrar('js', mensaje);
        }
      });
    },

    _detectarPaginaVacia: () => {
      // Esperar a que la página cargue
      window.addEventListener('load', () => {
        setTimeout(() => {
          // Verificar si el body tiene contenido real
          const body = document.body;
          const textoVisible = body.innerText?.trim() || '';
          const elementos = body.children.length;
          const tieneApp = document.getElementById('app') || 
                          document.getElementById('root') ||
                          document.querySelector('[data-app]');
          
          // Consideramos vacío si:
          // - No hay app/root
          // - Menos de 2 elementos
          // - Texto muy corto
          if (!tieneApp && elementos <= 2 && textoVisible.length < 20) {
            Consola.agregar('🚧 Página vacía detectada', 'info');
            UI.mostrar('empty', 'No se encontró contenido en esta página');
          }
        }, 500);
      });
    }
  };

  // ============================================
  // 🌐 API PÚBLICA
  // ============================================
  const ZuzitaErrorUI = {
    /**
     * Muestra un error con UI visual
     * @param {string} tipo - 'offline', '404', 'server', 'js', 'unknown', 'empty'
     * @param {string} detalle - Información adicional del error
     */
    mostrar: (tipo = 'unknown', detalle = '') => {
      UI.mostrar(tipo, detalle);
    },

    /**
     * Agrega un mensaje al historial de la consola
     * @param {string} mensaje - Mensaje para registrar
     */
    log: (mensaje) => {
      Consola.agregar(mensaje, 'log');
    },

    /**
     * Muestra/oculta la consola visual
     */
    toggleConsole: () => {
      Consola.toggle();
    },

    /**
     * Oculta el overlay de error
     */
    ocultar: () => {
      UI.ocultar();
    }
  };

  // ============================================
  // 🚀 INICIALIZACIÓN
  // ============================================
  const inicializar = () => {
    // Esperar al DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', iniciar);
    } else {
      iniciar();
    }
  };

  const iniciar = () => {
    // Prevenir doble inicialización
    if (window.ZuzitaErrorUI) return;

    Consola.inicializar();
    UI.inicializar();
    Deteccion.inicializar();

    // Exponer API global
    window.ZuzitaErrorUI = ZuzitaErrorUI;

    // Si DEBUG es true, mostrar consola automáticamente
    if (DEBUG) {
      setTimeout(() => {
        Consola.mostrar();
      }, 500);
    }

    // Mensaje inicial en consola
    Consola.agregar('🐱 ZuzitaErrorUI listo 💜', 'info');
    Consola.agregar('Desarrollo móvil sin consola activado', 'info');
  };

  // Arrancar
  inicializar();

})();
