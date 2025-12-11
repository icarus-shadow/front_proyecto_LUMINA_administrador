<p align="center"><a target="_blank"><img src="src/assets/lumina-logo.png" width="400" alt="Lumina Logo"></a></p>

<h1 align="center">Lumina - Sistema de Gestión de Equipos</h1>

<p align="center">
  <strong>Sistema integral para el control y gestión de entrada y salida de equipos</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Redux-2.10.1-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux">
  <img src="https://img.shields.io/badge/Vite-7.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

---

## 📋 Descripción

**Lumina** es una aplicación web moderna diseñada para gestionar eficientemente el control de entrada y salida de equipos en instituciones educativas o corporativas. El sistema permite registrar usuarios, equipos, y mantener un historial detallado de todos los movimientos, proporcionando trazabilidad completa y generación de reportes en tiempo real.

### ✨ Características Principales

- 🔐 **Autenticación Segura**: Sistema de login con tokens JWT y roles de usuario
- 👥 **Gestión de Usuarios**: CRUD completo con soporte para diferentes roles (Admin, Usuario, Celador)
- 📦 **Gestión de Equipos**: Registro de equipos con códigos QR, sub-elementos, y asignación a usuarios
- 📊 **Historial Completo**: Registro detallado de entradas y salidas con timestamps
- 🔔 **Actualizaciones en Tiempo Real**: WebSocket (Laravel Echo + Pusher) para sincronización instantánea
- 📈 **Reportes y Estadísticas**: Generación de reportes en PDF con gráficos
- 📱 **Diseño Responsive**: Interfaz adaptable a diferentes dispositivos
- 🎨 **Sistema de Alertas Animado**: Notificaciones visuales con animaciones usando Anime.js
- 📸 **Escaneo QR**: Integración de cámara para escaneo de códigos QR
- 🎓 **Gestión de Formación**: Control de programas de formación y niveles educativos

---

## 🛠️ Stack Tecnológico

### Frontend Framework
- **React 18.3.1**: Biblioteca principal para la interfaz de usuario
- **TypeScript 5.8.3**: Tipado estático para mayor robustez del código
- **Vite 7.0.0**: Build tool rápido y moderno

### Gestión de Estado
- **Redux Toolkit 2.10.1**: Manejo centralizado del estado de la aplicación
- **React Redux 9.2.0**: Integración de Redux con React

### UI/UX Libraries
- **Material-UI (MUI) 5.16.0**: Componentes de interfaz siguiendo Material Design
  - `@mui/material`: Componentes core
  - `@mui/icons-material`: Iconos
  - `@mui/x-data-grid`: Tablas de datos avanzadas
  - `@mui/x-date-pickers`: Selectores de fecha/hora
- **PrimeReact 10.8.3**: Componentes UI adicionales (Dialogs, Inputs)
- **Styled Components 6.1.19**: CSS-in-JS para estilos dinámicos
- **Lucide React 0.554.0**: Iconos adicionales

### Utilidades y Herramientas
- **Axios 1.13.2**: Cliente HTTP para llamadas API
- **React Router DOM 7.6.3**: Navegación y enrutamiento
- **Anime.js 4.2.2**: Animaciones fluidas y profesionales
- **Day.js 1.11.19**: Manipulación de fechas
- **QRCode.react 4.2.0**: Generación de códigos QR
- **@yudiel/react-qr-scanner 2.4.1**: Escaneo de códigos QR
- **Chart.js 4.5.1 + react-chartjs-2 5.3.1**: Gráficos y visualizaciones
- **jsPDF 3.0.4 + jspdf-autotable 5.0.2**: Generación de PDFs
- **html2canvas 1.4.1**: Capturas de pantalla
- **Laravel Echo 2.2.6 + Pusher.js 8.4.0**: WebSockets para tiempo real
- **i18next 25.4.2**: Internacionalización (soporte multiidioma)

### Desarrollo
- **ESLint 9.29.0**: Linter para mantener calidad del código
- **TypeScript ESLint 8.34.1**: Reglas de ESLint para TypeScript

---

## 📁 Estructura del Proyecto

```
front_proyecto/
├── public/                         # Archivos estáticos
│   ├── icon.svg                   # Favicon
│   ├── _headers                   # Configuración de headers HTTP
│   └── _redirects                 # Configuración de redirecciones
├── src/
│   ├── assets/                    # Recursos multimedia
│   │   ├── icon.svg              # Logo/icono
│   │   └── lumina-logo.png       # Logo principal
│   ├── components/               # Componentes reutilizables
│   │   ├── AlertSystem.tsx       # Sistema de alertas animadas
│   │   ├── Banner.tsx            # Barra de navegación superior
│   │   ├── Camera.tsx            # Componente de cámara para QR
│   │   ├── ContNav.tsx           # Navegación de contenedor
│   │   ├── CounterCard.tsx       # Tarjeta de contador
│   │   ├── CustomAlert.tsx       # Alerta personalizada
│   │   ├── DinamicTable.tsx      # Tabla dinámica reutilizable
│   │   ├── FormationModal.tsx    # Modal para gestión de formaciones
│   │   ├── Modal.tsx             # Modal genérico
│   │   ├── RegisterEquipmentModal.tsx  # Modal para registro de equipos
│   │   ├── Reportes.tsx          # Generador de reportes
│   │   ├── modalForm.tsx         # Formulario modal genérico
│   │   └── styles/               # Estilos de componentes
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── auth/                 # Páginas de autenticación
│   │   │   └── Login.tsx         # Página de inicio de sesión
│   │   ├── elementos.tsx         # Gestión de elementos/equipos
│   │   ├── entradas.tsx          # Vista de entradas
│   │   ├── historial.tsx         # Historial completo
│   │   ├── salidas.tsx           # Vista de salidas
│   │   └── usuarios.tsx          # Gestión de usuarios
│   ├── services/                 # Servicios de la aplicación
│   │   ├── api/                  # Servicios API
│   │   │   ├── data/            # APIs de datos
│   │   │   │   ├── Elements.tsx  # API de elementos
│   │   │   │   ├── Formation.tsx # API de formaciones
│   │   │   │   ├── LevelFormation.tsx  # API de niveles
│   │   │   │   ├── SubElements.tsx     # API de sub-elementos
│   │   │   │   ├── Users.tsx     # API de usuarios
│   │   │   │   └── history.tsx   # API de historial
│   │   │   ├── Auth.tsx          # API de autenticación
│   │   │   └── baseApi.tsx       # Configuración base de Axios
│   │   ├── redux/                # Configuración Redux
│   │   │   ├── slices/          # Redux slices
│   │   │   │   ├── data/        # Slices de datos
│   │   │   │   │   ├── elementsSlice.tsx
│   │   │   │   │   ├── formationSlice.tsx
│   │   │   │   │   ├── historySlice.tsx
│   │   │   │   │   ├── LevelFormationSlice.tsx
│   │   │   │   │   ├── subElementsSlice.tsx
│   │   │   │   │   └── UsersSlice.tsx
│   │   │   │   ├── AuthSlice.tsx # Slice de autenticación
│   │   │   │   └── index.tsx     # Exportaciones
│   │   │   ├── hooks.tsx         # Hooks personalizados de Redux
│   │   │   └── store.tsx         # Configuración del store
│   │   └── useEffects/           # Custom hooks con efectos
│   │       ├── history.tsx       # Efectos de historial
│   │       ├── slice.tsx         # Efectos de slices
│   │       └── users.tsx         # Efectos de usuarios
│   ├── types/                    # Definiciones de tipos TypeScript
│   │   └── interfacesData.tsx    # Interfaces de datos
│   ├── App.tsx                   # Componente principal
│   ├── index.css                 # Estilos globales
│   ├── main.tsx                  # Punto de entrada
│   └── vite-env.d.ts            # Tipos de Vite
├── .gitignore                    # Archivos ignorados por Git
├── data.md                       # Documentación de estructuras de datos
├── eslint.config.js              # Configuración de ESLint
├── index.html                    # HTML principal
├── package.json                  # Dependencias y scripts
├── README.md                     # Este archivo
├── tsconfig.json                 # Configuración de TypeScript
├── tsconfig.app.json             # Configuración TS para la app
├── tsconfig.node.json            # Configuración TS para Node
└── vite.config.ts                # Configuración de Vite
```

---

##  Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Vite |
| `npm run build` | Compila la aplicación para producción |
| `npm run lint` | Ejecuta ESLint para verificar el código |
| `npm run preview` | Previsualiza la build de producción |

---

## 🔑 Roles de Usuario

El sistema maneja tres roles principales:

| Rol | ID | Permisos |
|-----|-----|----------|
| **Usuario** | 1 | Acceso básico, ver historial propio |
| **Admin** | 2 | Acceso completo, CRUD de usuarios y equipos |
| **Celador** | 3 | Registro de entradas/salidas, consulta de equipos |

---

## 📊 Modelos de Datos

### Usuario
```typescript
{
  id: number;
  role_id: number;
  formacion_id: number;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  documento: string;
  edad: number;
  numero_telefono: string;
  path_foto: string;
  email: string;
  password: string;
  token: string;
  role: Role;
  formacion: Formacion;
}
```

### Elemento/Equipo
```typescript
{
  id: number;
  sn_equipo: string;           // Número de serie
  marca: string;
  color: string;
  tipo_elemento: string;
  descripcion: string;
  qr_hash: string;            // Hash del QR
  path_foto_equipo_implemento: string;
  usuarios: Usuario;          // Usuario asignado
}
```

### Historial
```typescript
{
  id: number;
  usuario_id: number;
  equipos_o_elementos_id: number;
  ingreso: string;            // Timestamp de entrada
  salida: string;             // Timestamp de salida
  equipo: Elemento;
  usuario: Usuario;
}
```

### Formación
```typescript
{
  id: number;
  tipos_programas_id: number;
  ficha: string;
  nombre_programa: string;
  fecha_inicio_programa: string;
  fecha_fin_programa: string;
  nivel_formacion: NivelFormacion;
}
```

---

## 🎯 Funcionalidades Principales

### 1. Autenticación y Autorización
- Login con email/password
- Manejo de tokens JWT en localStorage
- Interceptores de Axios para autenticación automática
- Redirección automática en caso de sesión expirada (401)

### 2. Gestión de Usuarios
- Crear, editar, eliminar y visualizar usuarios
- Asignación de roles
- Vinculación con programas de formación
- Carga de fotografías de perfil
- Vista detallada de información del usuario

### 3. Gestión de Equipos/Elementos
- Registro de equipos con información detallada
- Generación automática de códigos QR
- Gestión de sub-elementos (accesorios)
- Asignación/desasignación de equipos a usuarios
- Vista de equipos asignados por usuario
- Carga de imágenes de equipos

### 4. Control de Entradas y Salidas
- Registro de entrada: fecha, hora, usuario, equipo
- Registro de salida: actualización automática del registro
- Escaneo de código QR para identificación rápida
- Vista en tiempo real de entradas y salidas activas
- Filtrado y búsqueda de registros

### 5. Historial Completo
- Vista consolidada de todos los movimientos
- Filtros por fecha, usuario, equipo
- Exportación a PDF
- Información detallada de cada movimiento

### 6. Sistema de Reportes
- Generación de reportes PDF
- Gráficos estadísticos con Chart.js
- Reportes personalizables
- Exportación de datos

### 7. Actualizaciones en Tiempo Real
- WebSocket para sincronización instantánea
- Notificaciones de nuevas entradas/salidas
- Actualización automática del historial
- Estado de conexión visible

---

## 🔄 Flujo de la Aplicación

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Banner    │◄─── Visible en todas las páginas
│ (Navegación)│
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│        Rutas Protegidas              │
├──────────────────────────────────────┤
│  /usuarios  │  Gestión de Usuarios   │
│  /elementos │  Gestión de Equipos    │
│  /entradas  │  Registro de Entradas  │
│  /salidas   │  Registro de Salidas   │
│  /historial │  Historial Completo    │
└──────────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│  Redux Store    │
│  (Estado Global)│
└─────────────────┘
       │
       ▼
┌─────────────────┐
│   API Backend   │
│   (Laravel)     │
└─────────────────┘
```

---

## 🎨 Componentes Destacados

### AlertSystem
Sistema de alertas personalizado con animaciones usando Anime.js. Soporta cuatro tipos:
- ✅ Success
- ❌ Error
- ⚠️ Warning
- ℹ️ Info

**Características**:
- Animaciones de entrada/salida suaves
- Barra de progreso animada
- Alertas de confirmación (Sí/No)
- Diseño moderno con glassmorphism
- Colores personalizados por tipo

### DinamicTable
Tabla reutilizable basada en MUI DataGrid con:
- Paginación
- Ordenamiento
- Búsqueda
- Acciones personalizables (Ver, Editar, Eliminar)
- Renderizado condicional de columnas

### RegisterEquipmentModal
Modal complejo para registro/edición de equipos:
- Formulario multi-paso
- Gestión de sub-elementos
- Asignación de usuarios
- Carga de imágenes
- Vista previa de código QR
- Validación de campos

### Banner
Barra de navegación superior con:
- Logo de la aplicación
- Navegación entre secciones
- Botones de acción rápida (Agregar usuario/equipo)
- Perfil de usuario
- Logout
- Animaciones de transición

---

## 🌐 API y Backend

La aplicación se conecta a un backend Laravel desplegado en:
```
https://lumina-testing.onrender.com/api/
```

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/login` | Autenticación |
| GET | `/usuarios` | Listar usuarios |
| POST | `/usuarios` | Crear usuario |
| PUT | `/usuarios/{id}` | Actualizar usuario |
| DELETE | `/usuarios/{id}` | Eliminar usuario |
| GET | `/equipos_o_elementos` | Listar equipos |
| POST | `/equipos_o_elementos` | Crear equipo |
| PUT | `/equipos_o_elementos/{id}` | Actualizar equipo |
| DELETE | `/equipos_o_elementos/{id}` | Eliminar equipo |
| GET | `/historial` | Obtener historial |
| POST | `/historial` | Crear registro |
| GET | `/formaciones` | Listar formaciones |

**Nota**: Todos los endpoints (excepto `/login`) requieren token JWT en el header:
```
Authorization: Bearer {token}
```

---

## 🔐 Seguridad

- **Tokens JWT**: Autenticación basada en tokens
- **Interceptores**: Validación automática de tokens en cada petición
- **Redirección automática**: Logout y redirección en caso de token expirado
- **Validación de roles**: Control de acceso basado en roles
- **Sanitización de inputs**: Validación de formularios

---

## 🎓 Uso del Sistema

### Inicio de Sesión
1. Acceder a la aplicación
2. Ingresar email y contraseña
3. Sistema valida credenciales y genera token
4. Redirección automática a `/usuarios`

### Registrar un Equipo
1. Hacer clic en el botón "Agregar Elemento" en el Banner
2. Completar información del equipo
3. Opcionalmente, agregar sub-elementos
4. Asignar a un usuario (opcional)
5. Cargar fotografía del equipo
6. Guardar - se genera automáticamente un código QR

### Registrar Entrada
1. Ir a la página "Entradas"
2. Hacer clic en "Registrar Entrada"
3. Escanear QR del equipo o seleccionar manualmente
4. Seleccionar usuario
5. Confirmar - se registra con timestamp automático

### Registrar Salida
1. Ir a la página "Salidas"
2. Buscar el registro de entrada activo
3. Hacer clic en "Registrar Salida"
4. Confirmar - se actualiza el registro con timestamp de salida

### Generar Reporte
1. Ir a "Historial"
2. Aplicar filtros deseados (fechas, usuarios, equipos)
3. Hacer clic en "Generar Reporte"
4. El PDF se descarga automáticamente

---

## 🐛 Solución de Problemas

### La aplicación no carga
- Verificar que el servidor de desarrollo esté corriendo
- Revisar la consola del navegador para errores
- Verificar que todas las dependencias estén instaladas

### Error de autenticación
- Limpiar localStorage: `localStorage.clear()`
- Verificar que el backend esté disponible
- Revisar que las credenciales sean correctas

### WebSocket no conecta
- Verificar configuración de Pusher
- Revisar permisos de firewall
- Comprobar que el backend tenga configurado Broadcasting

### Imágenes no se cargan
- Verificar rutas de las imágenes
- Comprobar permisos en el servidor
- Revisar que las imágenes existan en `public/`

---

 # manual de uso


1\. esta es la página inicial que recibe al administrador en la cual debe ingresar sus respectivas credenciales

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/8bfe2fff-c0f9-4ee8-9fb5-3316a48aaaaf/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0)


2\. Este es el dashboard inicial que se encontrara el administrador al entrar a la página en este se puede ver en la parte superior los botones de acción en la parte central y ocupando la mayor parte del espacio está el listado de usuarios registrados junto con sus botones de acción, por la parte derecha se encuentran los botones de navegacion

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/5b1bf8c1-85b1-4f90-ba54-fd0dd6b84878/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=1044,480)


3\. Estos son los botones de navegación cada uno cuenta con un contador a modo de información para el administrador, al darle click en cualquier botón redireccionara a su respectiva pagina

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/7715eed9-32ea-4741-8c31-a1a8ce8cc955/user_cropped_screenshot.webp?tl_px=0,0&br_px=302,417&force_format=jpeg&q=100&width=542&wat_scale=48&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=427,678)


4\. de las acciones de usuarios esta es para ver la información detallada del usuario

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/a5d8eeb5-6eb1-484b-a027-a155cd6ed8d1/ascreenshot.jpeg?tl_px=684,46&br_px=1167,316&force_format=jpeg&q=100&width=483&wat_scale=43&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=233,141)


5\. luego de darle click en el botón aparecerá el siguiente modal el cual se encuentra dividido en 2 secciones, la sección de la izquierda se encuentra toda la información del usuario, en la parte inferior de esa información se encuentra un contador que indica el número de elementos asignados al usuario, por la sección de la derecha se encuentra listada la información de la formación

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/304782b3-b17a-42d9-a921-5318e0129889/ascreenshot.jpeg?tl_px=257,0&br_px=1357,615&force_format=jpeg&q=100&width=1101&wat_scale=98&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=667,56)


6\. este es el dashboard principal de elementos, no hay muchos cambios comparados con usuarios cuenta con sus datos, y sus respectivos botones de acción.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/a278723d-b63d-4309-a751-501503d43ca3/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=1032,473)


7\. Este es el modal para la información de elementos este tiene 3 secciones, la sección de la izquierda contiene la información del elemento junto con las opciones para descargar o imprimir el QR, por parte de la sección de la derecha se listan el/los propietario(s) con su respectiva información

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/4e233523-c6e7-4f4b-91c3-c936b2539520/ascreenshot.jpeg?tl_px=47,0&br_px=1357,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=740,22)


8\. por la sección inferior se listan los elementos adicionales

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/e7772bb5-bf18-42b0-b02b-685934e0fe00/ascreenshot.jpeg?tl_px=257,38&br_px=1357,653&force_format=jpeg&q=100&width=1101&wat_scale=98&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=669,366)


9\. este es el dashboard de historial a diferencia de las anteriores tablas este solo cuenta con un botón de acción que es para listar la información de forma más detallada, esta página cuenta con unos respectivos filtros para listar la información a gusto

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/446fda50-3065-4cf4-8983-2e9669d9373e/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=643,199)


10\. este es el modal de información del historial, este tiene 3 secciones, la sección de la izquierda contiene la información del usuario y la de la derecha contiene la información del dispositivo, por último en la parte inferior esta listada los datos de fecha y hora del registro

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/b6649abb-f3b6-4c07-8927-06b2cbc0485c/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=733,36)


11\. por debajo de estos se encuentra listados los elementos adicionales

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/6a05008f-6b54-4e74-a32e-d75f1ebee76d/ascreenshot.jpeg?tl_px=257,0&br_px=1357,615&force_format=jpeg&q=100&width=1101&wat_scale=98&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=707,272)


12\. este es el modal de los filtros que se pueden aplicar a la información del historial, entre estos se encuentran el poder filtrar la información por una fecha específica, un rango de fechas, por turno/ jornada (mañana, tarde y noche) y por usuario en especifico

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/0493911e-7b9c-454a-9ddc-ffd21b2f95ad/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=788,386)


13\. el filtro de usuario especifico también cuenta con un filtro para poder buscar el usuario deseado

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/e47f723e-acee-42bf-8a73-adaf4163266b/ascreenshot.jpeg?tl_px=180,238&br_px=924,654&force_format=jpeg&q=100&width=744&wat_scale=66&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=247,269)


14\. al darle a la opción de generar reportes aparecerá el siguiente modal en el que se podrá visualizar unas estadísticas de la información listada, al usar la información que se encuentra listada al usar los filtros se puede escoger con que información de puede realizar el reporte en este modal también cuenta con un botón para generar pdf en este se mostrará la información listada junto con las estadísticas mostradas

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/bc52d2f2-9567-4d34-aa60-fa90f00bd867/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=994,446)


15\. este es el dashboard de entradas al igual que historial cuenta con las opciones de filtrar y generar reportes (esta desactivado porque no hay información), en entradas se encuentra la información divida en 2 las entradas realizadas en el dia actual y las entradas anteriores (esto se debe a que el sistema permite la permanencia prolongada)

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/48504929-8ad7-43e3-bddb-edec7d4d541e/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=1009,396)


16\.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/cde1837e-4ae8-493a-8305-494c0a60c6c9/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=1032,445)


17\. este es el dashboard de salidas este al igual que los anteriores cuenta con sus opciones de ver la información, filtrarla y generar reportes

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/0acc3313-f16c-4b08-90a2-644157b50015/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=1017,469)


18\. este es el modal para poder realizar el registro de un nuevo usuario se encuentra dividido en 2 secciones la de la izquierda se encuentran los campos para rellenar la información del usuario y en la parte de la derecha se puede seleccionar la formación a la que pertenece el usuario (en caso de ser un funcionario se puede dejar vació este campo), en caso de no encontrarse la formación deseada en la parte superior derecha se encuentra un botón que permite gestionar las formaciones

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/7d4d73a8-5316-4a2e-8885-834e65896400/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=491,371)


19\. este es el modal que aparece cuando se quiere administrar las formaciones este se encuentra divida en 2 secciones por parte de la izquierda se encuentran listados las formaciones actualmente registradas con las opciones para editar o eliminar al darle a editar se autocompletara la información de la derecha  en la que se encuentra un modal que hace la función de agregar y editar, al darle al botón de cancelar este limpiara la información del modal

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/f40feb32-bd7e-4a48-acd0-1149a7b6f9f9/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=881,430)


20\. al darle a la opción de registrar equipo aparece el siguiente modal el cual está dividido en 3 secciones generales la de la izquierda se encuentra un formulario para registrar la información del equipo, por parte de la sección de la izquierda se encuentra listados los usuarios con un checkbox a su izquierda esto se debe a que el sistema permite tener multiples propietarios (en caso de elementos compartidos)

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/37c1be25-f9f2-417a-b343-51975121233f/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=656,60)


21\. por la parte inferior se encuentra este minicrud el cual está enfocado en los elementos adicionales en donde se pueden agregar editar o eliminar uno

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/4fbeaff2-99c7-4b6f-9f99-1275f44da926/ascreenshot.jpeg?tl_px=0,0&br_px=1358,654&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=813,347)


22\. esta es la alerta que mostrara cuando una acción es efectiva

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-05/0601e2d1-0bd1-4677-9092-2737ce7f2c89/ascreenshot.jpeg?tl_px=988,0&br_px=1349,201&force_format=jpeg&q=100&width=361&wat_scale=32&wat=1&wat_opacity=1&wat_gravity=northwest&wat_url=https://colony-recorder.s3.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=298,42)
#### [Made with Scribe](https://scribehow.com/shared/Aplicacin_web_de_administrador_para_el_sistema_LUMINA__3muwBLAMRPO3jLyzAyuhSA)








<p align="center">Hecho con ❤️ usando React + TypeScript</p>
