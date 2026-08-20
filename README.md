# Lyric video — "Esta mañana"

## Cómo usarlo

1. Colocá tu archivo de audio en `audio/cancion.mp3` (reemplazando el placeholder si lo hay).
2. Abrí `index.html` en el navegador (doble click, o con un servidor local tipo `npx serve`).
3. Listo: Play, pausa, seek, loop y la letra sincronizada ya funcionan.

Si preferís otro nombre o formato de archivo, cambiá el atributo `src` del tag `<audio>` en `index.html`.

## Qué modificar y dónde

- **Letra y tiempos**: array `lyrics` al principio de `script.js`.
- **Duración de respaldo, ventana del barco, rango de pájaros, velocidad del crossfade de la letra**: objeto `CONFIG` en `script.js`.
- **Paleta del cielo a lo largo de la canción**: array `SKY_KEYFRAMES` en `script.js` (cada punto tiene progreso `p` de 0 a 1 y sus colores).
- **Estilos generales, tipografías, controles**: `style.css` (tokens al principio del archivo, en `:root`).

## Estructura

```
index.html      → estructura de la página (fondo SVG, letra, controles, pantalla final)
style.css       → toda la estética visual
script.js       → audio, sincronización de letra, animación del fondo, pantalla final
audio/          → poné acá cancion.mp3
```

No depende de imágenes externas, APIs ni CDNs: todo el fondo es SVG/CSS. Las únicas conexiones externas son las tipografías de Google Fonts (Cormorant Garamond, Jost, Caveat); si vas a alojarlo sin internet, se puede descargar esas fuentes localmente y ajustar el `<link>` en `index.html`.

## Próximos pasos posibles (no implementados todavía, a propósito)

- Efecto de "escritura" más elaborado en la letra (máscaras SVG de trazo).
- Más variación de nubes/pájaros.
- Microinteracciones adicionales en la pantalla final.
