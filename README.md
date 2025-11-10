# 🍽️ Control de Almuerzos

Aplicación web moderna para registrar y gestionar entregas de almuerzos. Interfaz limpia, responsive y fácil de usar desde cualquier dispositivo.

## ✨ Características

- **Gestión de clientes predefinidos**: Luis, Marcos, Gabriel, Carlos, Ruth, Darith, Jorsy, Wilder, Mayra, Lio, Jose Peña.
- **Agregar nuevos clientes**: Botón `+` para expandir la lista de clientes dinámicamente.
- **Registro de almuerzos**: Selecciona cliente, fecha, cantidad y observaciones.
- **Editar y eliminar**: Modifica o borra registros fácilmente.
- **Marcar entregado**: Toggle rápido para cambiar estado de entrega.
- **Filtros y búsqueda**: Busca por nombre de cliente o filtra por fecha.
- **Compartir a WhatsApp**: Envía la relación de almuerzos a un número específico o a WhatsApp Web.
- **Exportar JSON**: Descarga todos los datos como archivo JSON.
- **100% local**: Los datos se guardan en el navegador (localStorage). Sin servidores, sin privacidad comprometida.
- **Responsive**: Funciona perfectamente en desktop, tablet y móvil.

## 🚀 Cómo usar

### En la web (GitHub Pages)
Abre en tu navegador:
```
https://luosof.github.io/Almuerzos/
```

### Localmente
1. Descarga o clona el repositorio.
2. Abre `index.html` en tu navegador.
3. ¡Listo! Empieza a usar.

### Desde el móvil en tu red local
1. En tu PC, en la carpeta del proyecto:
```powershell
python -m http.server 8000
```

2. Averigua tu IP local (ejecuta `ipconfig` y busca IPv4 Address).

3. En tu móvil, abre el navegador y visita:
```
http://<tu-ip>:8000/
```

## 📝 Cómo funciona

1. **Selecciona un cliente** del dropdown o agrega uno nuevo con el botón `+`.
2. **Ingresa la fecha y cantidad** de almuerzos.
3. **Opcionalmente** agrega observaciones.
4. Haz clic en **Registrar**.
5. **Filtra o busca** para encontrar registros rápidamente.
6. **Edita, elimina o marca como entregado** desde los botones de cada registro.
7. **Comparte a WhatsApp** ingresando un número (opcional) y presionando el botón de envío.

## 💾 Datos

Los datos se guardan en **localStorage** del navegador:
- **Clientes**: guardados en `clientes_v1`
- **Registros**: guardados en `almuerzos_v1`

Para reiniciar todo, limpia el localStorage del navegador (DevTools > Application > Local Storage > elimina las claves).

## 🎨 Diseño

- **Moderno y limpio**: Interfaz intuitiva con colores suave.
- **Responsive**: Se adapta a cualquier tamaño de pantalla.
- **Accesible**: Botones grandes, texto legible, navegación clara.

## 🤝 Agregar más clientes

Haz clic en el botón `+` junto al dropdown de clientes y escribe el nombre. Los clientes nuevos se guardan automáticamente.

## ❓ Preguntas frecuentes

**¿Mis datos están seguros?**
Sí, todo se guarda localmente en tu dispositivo. Ningún dato se envía a servidores.

**¿Puedo usar esto offline?**
Sí, una vez cargada la página, funciona completamente sin internet.

**¿Puedo compartir datos entre dispositivos?**
Actualmente no (cada dispositivo tiene su propia copia en localStorage). Puedes **exportar como JSON** en un dispositivo e **importar** en otro (importación manual próximamente).

## 📱 Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 🛠️ Desarrollo

Tecnologías utilizadas:
- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript ES6+
- localStorage API

Sin dependencias externas. 100% vanilla.

---

**Hecho con ❤️ para simplificar la gestión de almuerzos.**