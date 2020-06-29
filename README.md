# DelillahResto
**Una Api para manejar ordenes y pedidos al estilo Rappi**

Este es un proyecto REST FULL API, permite administrar usuarios, ordenes y pedidos de un restaurante.

## Especificación OPEN API

- [Open API Docs](/spec.yml)

## Inicializar el Proyecto

### Clonar Repositorio:

```
https://github.com/AlexRosso1025/DelillahResto.git
```

### Instalar Dependencias:

```
$ npm install
```

### Base de Datos:

- Correr un servidor MySQL (Xampp).
- Crear la Base de datos desde PHPMyAdmin o usando MySQLWorkbench `https://dev.mysql.com/downloads/Workbench/`.
- Abrir `src/sql` crear la Base de datos desde el archivo `database.sql`.
- Abrir `src/config` el archivo (`dbConfig.js`) y configurar host, user, password y database.

### Correr el API
```
$node index
```

## Dependencias Usadas

- body-parser version 1.19.0
- express version 4.17.1
- jsonwebtoken version 8.5.1
- sequelize version 5.21.13
- mysql2 version 2.1.0
- moment version 2.27.0