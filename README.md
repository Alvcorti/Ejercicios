# Librería de ejercicios · Firebirds SC

Web estática con los ejercicios de entrenamiento del club. Los datos (nombre, categoría, descripción y vídeo) se leen de una hoja de Google Sheets, así que para cambiar el contenido no hace falta tocar el código.

## Cómo añadir o cambiar contenido

Todo se hace en la hoja **Firebirds – Librería de ejercicios**, en la pestaña *Ejercicios*:

| Columna | Qué poner |
|---|---|
| Ejercicio | Nombre que se ve en la web |
| Categoría | Technical, Rondo, Possession Game, Position Game, Situation Game, Game o Finishing |
| Imagen | Nombre del archivo de la imagen subida al repositorio (por ejemplo `double-area.jpg`) |
| Descripción | Texto libre. Los saltos de línea se respetan |
| Vídeo (link) | Link de YouTube (puede ser "no listado") o de Google Drive |
| Visible | `Sí` (o `Yes`) para mostrarlo, `No` para ocultarlo sin borrarlo |

Los cambios salen en la web al recargar la página.

**Para un ejercicio nuevo:** sube su imagen a este repositorio y añade una fila en la hoja con ese nombre de archivo.

**Vídeos de Google Drive:** compártelos como "Cualquier persona con el enlace" para que se puedan ver.

## Requisito de la hoja

La hoja tiene que estar compartida como **"Cualquier persona con el enlace → Lector"**. Si no, la web no puede leerla.

## Archivos

- `index.html`, `styles.css`, `app.js`: la web.
- `config.js`: el ID de la hoja y el nombre del club.
- Las imágenes `.jpg`: diagramas de los ejercicios. `logo.png`: escudo del club.
