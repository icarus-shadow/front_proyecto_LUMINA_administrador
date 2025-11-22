// intefaces data
interface users {
    id: number;
    role_id: number;
    role: role;
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
}

interface elements {
    id: number;
    sn_equipo: string;
    marca: string;
    color: string;
    tipo_elemento: string;
    descripcion: string;
    qr_hash: string;
    path_foto_equipo_implemento: string;
}

interface subElements {
    id: number;
    nombre_elemento: string;
    path_foto_elemento: string;
    equipos_o_elementos_id: number;
}

interface historial {
    fechaFormateada: string | number | Date;
    id: number;
    usuario_id: number;
    equipos_o_elementos_id: number;
    ingreso: string;
    salida: string;
    equipo: elements;
    usuario: users;
}

interface formacion {
    id: number;
    tipos_programas_id: number;
    ficha: string;
    nombre_programa: string;
    fecha_inicio_programa: string;
    fecha_fin_programa: string;
}

interface nivelFormacion {
    id: number;
    nivel_formacion: string;
}


interface role {
    id: number;
    nombre_rol: string;
}

export interface User {
    id: number;
    role_id: number;
    formacion_id: string;
    nombre: string;
    apellido: string;
    tipo_documento: string;
    documento: string;
    edad: number;
    numero_telefono: string;
    path_foto: string;
    email: string;
    role: role;
    formacion: string;
}

export interface dataLogin {
    user: User;
    token: string;
    token_type: string;
}

// responses interfaces

export interface responseHistory {
    success: boolean | null;
    data: historial[] | null;
}

export interface responseDelete {
    success: boolean | null;
    message: string | null;
}

export interface responseUsersSlice {
    fetchSuccess: boolean | null;
    deleteSuccess: boolean | null;
    addSuccess: boolean | null;
    updateSuccess: boolean | null;
    success: boolean | null;
    data: users[] | null[];
}

export interface responseLogin {
    success: boolean;
    message: string;
    data: dataLogin;
}

// states redux

export interface userAuthState {
    user: User | null;
    token: string | null;
}
