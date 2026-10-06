# Backend Editor - Rápido y Sabroso

Backend Flask para proteger y editar los productos del menú.

## Archivos

- `app.py` - servidor Flask
- `requirements.txt` - dependencias
- `render.yaml` - configuración opcional para Render

## Variables de entorno

Configurar en Render:

```text
EDITOR_USER=admin
EDITOR_PASSWORD=TU_CONTRASEÑA
EDITOR_SECRET_KEY=UNA_CLAVE_LARGA_Y_ALEATORIA

GITHUB_TOKEN=TU_TOKEN_DE_GITHUB
GITHUB_OWNER=TU_USUARIO
GITHUB_REPO=TU_REPOSITORIO
GITHUB_BRANCH=main

FRONTEND_ORIGINS=https://TU_USUARIO.github.io
```

Si tu GitHub Pages está dentro de un repositorio, `FRONTEND_ORIGINS` puede ser:

```text
https://tuusuario.github.io
```

También puede contener varios orígenes separados por coma.

## Rutas

### Estado

```http
GET /
GET /health
```

### Login

```http
POST /api/editor/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "..."
}
```

### Productos

```http
GET /api/editor/productos
Authorization: Bearer TOKEN
```

### Actualizar

```http
PUT /api/editor/productos/Vacuna
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "titulo": "Sanguche Vacuna",
  "precio": "18000",
  "descripcion": "Descripción..."
}
```

## Importante

El token de GitHub NO debe estar en JavaScript ni en GitHub Pages.
Debe existir solamente como variable de entorno en Render.

El backend usa GitHub Contents API y crea commits al modificar los JSON.
