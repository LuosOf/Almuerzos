# Control de Almuerzos

Aplicación web simple para registrar y gestionar almuerzos. Los datos se guardan en el navegador (localStorage).

Cómo usar

- Abrir `Index.html` en un navegador moderno.
- Añadir registros desde el formulario: Nombre, fecha y cantidad son obligatorios.
- Buscar por nombre o filtrar por fecha.
- Editar, eliminar o marcar como entregado desde las acciones de la lista.

Notas

- La app es completamente local; no envía datos a ningún servidor.
 - Para reiniciar los datos, vacía el almacenamiento local del navegador (Application > Local Storage) o elimina la clave `almuerzos_v1`.

Abrir desde el teléfono

- Opción local (red local):
	1. En la PC abre un servidor estático desde la carpeta del proyecto. Por ejemplo, si tienes Python:

```powershell
cd c:\Users\Luis\Desktop\a\Alm
python -m http.server 8000
```

	2. Averigua la IP local de tu PC (en Windows: `ipconfig` y busca la dirección IPv4 de tu adaptador de red).
	3. En el teléfono abre el navegador y visita `http://<IP-DE-TU-PC>:8000/` (por ejemplo `http://192.168.1.42:8000/`).
	4. Ahora podrás usar la app desde el móvil en la misma red Wi‑Fi.

- Opción pública: subir los archivos a GitHub Pages, Netlify o similar para acceder desde cualquier lugar.

Enviar la relación a WhatsApp

- En la interfaz hay un campo "Número WhatsApp" (opcional). Si lo completas con el número en formato internacional (sin el signo +, por ejemplo `34123456789`), al hacer clic en "Enviar relación a WhatsApp" se abrirá un chat directo con ese número y el mensaje prellenado listo para enviar.
- Si dejas el número vacío, la app abrirá WhatsApp Web/APP con el texto prellenado; igual tendrás que confirmar manualmente el envío.
- Nota importante: por razones de seguridad y políticas de WhatsApp, no es posible enviar mensajes de forma totalmente automática sin la intervención del usuario desde una app web simple. El botón abrirá WhatsApp (app o web) con el mensaje listo para que lo envíes manualmente.
