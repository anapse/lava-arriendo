# LavArrienda - Sistema de Gestión de Alquiler de Lavadoras

Sistema integral de gestión de alquiler de lavadoras con tarifas en Pesos Colombianos (COP), inventario, contratos, clientes, control de pagos, calendario y sincronización con Firebase Firestore.

---

## 🚀 Despliegue en GitHub Pages

Este proyecto ya está 100% configurado para GitHub Pages con dos métodos posibles:

### Opción 1: Despliegue Automático con GitHub Actions (Recomendado)

1. Sube tu proyecto a tu repositorio de GitHub (`git push origin main`).
2. En tu repositorio en GitHub, ve a **Settings** (Configuración) > **Pages**.
3. En la sección **Build and deployment**:
   - **Source**: Selecciona **GitHub Actions**.
4. ¡Listo! El archivo `.github/workflows/deploy.yml` compilará y publicará automáticamente tu aplicación cada vez que hagas un push a `main`.

---

### Opción 2: Despliegue Manual con el comando `npm run deploy`

Si prefieres publicar a una rama `gh-pages` directamente desde tu terminal:

1. Ejecuta:
   ```bash
   npm run deploy
   ```
2. En GitHub > **Settings** > **Pages**:
   - **Source**: Selecciona **Deploy from a branch**.
   - **Branch**: Selecciona la rama `gh-pages` y carpeta `/ (root)`.
   - Haz clic en **Save**.

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 8** (con `base: './'` para compatibilidad en cualquier subruta de GitHub Pages)
- **Tailwind CSS v4**
- **Firebase Firestore**
- **Lucide Icons** & **Canvas Confetti**
