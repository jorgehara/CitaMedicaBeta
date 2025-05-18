# API REST con Node.js y Express

Esta es una API REST simple que implementa operaciones CRUD básicas.

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto (ya está creado con la configuración básica):

```
PORT=3000
```

## Ejecución

Para desarrollo (con recarga automática):
```bash
npm run dev
```

Para producción:
```bash
npm start
```

## Endpoints

- GET `/api/items` - Obtener todos los items
- GET `/api/items/:id` - Obtener un item por ID
- POST `/api/items` - Crear un nuevo item
- PUT `/api/items/:id` - Actualizar un item existente
- DELETE `/api/items/:id` - Eliminar un item

### Ejemplo de objeto item:
```json
{
    "id": 1,
    "nombre": "Ejemplo",
    "descripcion": "Este es un item de ejemplo"
}
```
