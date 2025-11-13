// Interfaces para los datos
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  departamento: string;
}

interface Elemento {
  id: number;
  nombre: string;
  descripcion: string;
  asignadoA: number; // ID del usuario
  estado: 'dentro' | 'fuera';
  categoria: string;
}

interface Historial {
  id: number;
  fecha: string; // Fecha en formato ISO
  usuarioId: number;
  elementoId: number;
  tipo: 'entrada' | 'salida';
  observaciones?: string;
}

// Datos de usuarios
export const usuarios: Usuario[] = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@institucion.edu', departamento: 'Administración' },
  { id: 2, nombre: 'María García', email: 'maria.garcia@institucion.edu', departamento: 'Tecnología' },
  { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@institucion.edu', departamento: 'Recursos Humanos' },
  { id: 4, nombre: 'Ana Rodríguez', email: 'ana.rodriguez@institucion.edu', departamento: 'Biblioteca' },
  { id: 5, nombre: 'Pedro Martínez', email: 'pedro.martinez@institucion.edu', departamento: 'Mantenimiento' },
];

// Datos de elementos (cada uno asignado a un usuario)
export const elementos: Elemento[] = [
  { id: 1, nombre: 'Laptop Dell', descripcion: 'Laptop para trabajo administrativo', asignadoA: 1, estado: 'dentro', categoria: 'Computadora' },
  { id: 2, nombre: 'Proyector Epson', descripcion: 'Proyector para presentaciones', asignadoA: 2, estado: 'fuera', categoria: 'Audiovisual' },
  { id: 3, nombre: 'Teléfono móvil', descripcion: 'Teléfono corporativo', asignadoA: 3, estado: 'dentro', categoria: 'Comunicación' },
  { id: 4, nombre: 'Impresora HP', descripcion: 'Impresora multifunción', asignadoA: 4, estado: 'fuera', categoria: 'Oficina' },
  { id: 5, nombre: 'Tablet Samsung', descripcion: 'Tablet para educación', asignadoA: 5, estado: 'dentro', categoria: 'Computadora' },
  { id: 6, nombre: 'Cámara de seguridad', descripcion: 'Cámara para vigilancia', asignadoA: 1, estado: 'fuera', categoria: 'Seguridad' },
  { id: 7, nombre: 'Router Cisco', descripcion: 'Router de red', asignadoA: 2, estado: 'dentro', categoria: 'Redes' },
  { id: 8, nombre: 'Monitor LG', descripcion: 'Monitor de 24 pulgadas', asignadoA: 3, estado: 'fuera', categoria: 'Computadora' },
  { id: 9, nombre: 'Micrófono inalámbrico', descripcion: 'Micrófono para conferencias', asignadoA: 4, estado: 'dentro', categoria: 'Audiovisual' },
  { id: 10, nombre: 'Herramientas de mantenimiento', descripcion: 'Kit de herramientas básicas', asignadoA: 5, estado: 'fuera', categoria: 'Mantenimiento' },
];

// Datos de historial (entradas y salidas)
export const historial: Historial[] = [
  { id: 1, fecha: '2023-10-01T08:00:00Z', usuarioId: 1, elementoId: 1, tipo: 'salida', observaciones: 'Salida para reunión externa' },
  { id: 2, fecha: '2023-10-01T12:00:00Z', usuarioId: 1, elementoId: 1, tipo: 'entrada', observaciones: 'Regreso de reunión' },
  { id: 3, fecha: '2023-10-02T09:00:00Z', usuarioId: 2, elementoId: 2, tipo: 'salida', observaciones: 'Uso en presentación' },
  { id: 4, fecha: '2023-10-03T14:00:00Z', usuarioId: 3, elementoId: 3, tipo: 'salida', observaciones: 'Llamadas de trabajo' },
  { id: 5, fecha: '2023-10-04T10:00:00Z', usuarioId: 4, elementoId: 4, tipo: 'salida', observaciones: 'Impresiones urgentes' },
  { id: 6, fecha: '2023-10-05T11:00:00Z', usuarioId: 5, elementoId: 5, tipo: 'salida', observaciones: 'Uso en clase' },
  { id: 7, fecha: '2023-10-06T13:00:00Z', usuarioId: 1, elementoId: 6, tipo: 'salida', observaciones: 'Instalación en pasillo' },
  { id: 8, fecha: '2023-10-07T15:00:00Z', usuarioId: 2, elementoId: 7, tipo: 'entrada', observaciones: 'Configuración completada' },
  { id: 9, fecha: '2023-10-08T16:00:00Z', usuarioId: 3, elementoId: 8, tipo: 'salida', observaciones: 'Reparación externa' },
  { id: 10, fecha: '2023-10-09T17:00:00Z', usuarioId: 4, elementoId: 9, tipo: 'entrada', observaciones: 'Regreso de evento' },
  { id: 11, fecha: '2023-10-10T08:30:00Z', usuarioId: 5, elementoId: 10, tipo: 'salida', observaciones: 'Trabajo de campo' },
  { id: 12, fecha: '2023-10-11T09:30:00Z', usuarioId: 1, elementoId: 1, tipo: 'salida', observaciones: 'Viaje de negocios' },
  { id: 13, fecha: '2023-10-12T10:30:00Z', usuarioId: 2, elementoId: 2, tipo: 'entrada', observaciones: 'Fin de presentación' },
  { id: 14, fecha: '2023-10-13T11:30:00Z', usuarioId: 3, elementoId: 3, tipo: 'entrada', observaciones: 'Fin de llamadas' },
  { id: 15, fecha: '2023-10-14T12:30:00Z', usuarioId: 4, elementoId: 4, tipo: 'entrada', observaciones: 'Impresiones completadas' },
  { id: 16, fecha: '2023-10-15T13:30:00Z', usuarioId: 5, elementoId: 5, tipo: 'entrada', observaciones: 'Fin de clase' },
  { id: 17, fecha: '2023-10-16T14:30:00Z', usuarioId: 1, elementoId: 6, tipo: 'entrada', observaciones: 'Instalación terminada' },
  { id: 18, fecha: '2023-10-17T15:30:00Z', usuarioId: 2, elementoId: 7, tipo: 'salida', observaciones: 'Mantenimiento' },
  { id: 19, fecha: '2023-10-18T16:30:00Z', usuarioId: 3, elementoId: 8, tipo: 'entrada', observaciones: 'Reparación completada' },
  { id: 20, fecha: '2023-10-19T17:30:00Z', usuarioId: 4, elementoId: 9, tipo: 'salida', observaciones: 'Evento especial' },
];

// Contadores calculados
export const contadores = {
  usuarios: usuarios.length,
  elementos: elementos.length,
  historial: historial.length,
  entradas: historial.filter(h => h.tipo === 'entrada').length,
  salidas: historial.filter(h => h.tipo === 'salida').length,
};