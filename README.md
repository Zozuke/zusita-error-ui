# 🚀 ZuzitaErrorUI

<p align="center">
  <b>Depuración visual moderna para desarrollo web sin consola</b><br>
  Diseñada para trabajar directamente desde el celular 📱
</p>

---

## 📦 Instalación

Agrega el siguiente script en tu HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/Zozuke/zusita-error-ui@main/error-ui.js"></script>
```

---

## ✨ Características principales

- 🧠 **Detección automática de errores**
  - JavaScript (runtime)
  - Errores de red (offline)
  - HTTP 404
  - Errores de servidor (500+)
  - Promesas no controladas

- 🖥 **Consola visual integrada**
  - Logs en tiempo real
  - Interfaz flotante
  - Historial de eventos

- 🎨 **UI de errores elegante**
  - Mensajes amigables
  - Emojis dinámicos
  - Animaciones suaves

- ⚡ **Interceptación inteligente**
  - `console.log`, `warn`, `error`, `info`
  - `fetch()` para detectar fallos de red

- 🔍 **Modo DEBUG**
  - Muestra detalles técnicos del error
  - Ideal para desarrollo

---

## 🧩 API

### Mostrar error manual
```js
ZuzitaErrorUI.mostrar(tipo, detalle)
```

Tipos disponibles:
- `offline`
- `404`
- `server`
- `js`
- `unknown`
- `empty`

---

### Registrar log
```js
ZuzitaErrorUI.log("mensaje")
```

---

### Mostrar/Ocultar consola
```js
ZuzitaErrorUI.toggleConsole()
```

---

### Ocultar error
```js
ZuzitaErrorUI.ocultar()
```

---

## ⚙️ Funcionamiento interno

ZuzitaErrorUI funciona interceptando múltiples capas del navegador:

- `window.onerror` → captura errores globales
- `fetch` → detecta errores HTTP
- `unhandledrejection` → promesas fallidas
- `navigator.onLine` → estado de conexión

Además:

- Detecta páginas vacías automáticamente
- Evita duplicación de errores
- Mantiene historial de eventos

---

## 🧪 Modo DEBUG

```js
const DEBUG = true;
```

Permite:

- Ver detalles técnicos
- Mostrar errores completos
- Mejor diagnóstico

---

## 📱 Caso de uso ideal

- Desarrollo en celular sin DevTools
- Prototipos rápidos
- Debug visual sin consola
- Apps tipo PWA

---

## 🧱 Arquitectura

El sistema está dividido en módulos:

- `Util` → funciones auxiliares
- `Consola` → UI de logs
- `UI` → interfaz de errores
- `Deteccion` → captura de fallos

---

## 🔒 Seguridad

- No envía datos a servidores externos
- Todo se ejecuta en el cliente
- No almacena información sensible

---

## 📄 Licencia

Uso libre para proyectos personales y comerciales.

---

## 💡 Autor

Desarrollado como herramienta práctica para debug moderno en entornos limitados.

---

<p align="center">
  ⚡ ZuzitaErrorUI — Debug sin límites
</p>
