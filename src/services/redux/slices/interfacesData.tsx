export interface usersState {
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
}

export interface elementsState {
    id: number;
    sn_equipo: string;
    marca: string;
    color: string;
    tipo_elemento: string;
    descripcion: string;
    qr_hash: string;
    path_foto_equipo_implemento: string;
}

export interface subElementsState {
    id: number;
    nombre_elemento: string;
    path_foto_elemento: string;
    equipos_o_elementos_id: number;
}

export interface historialState {
    id: number;
    usuario_id: number;
    equipos_o_elementos_id: number;
    ingreso: string;
    salida: string;
}

export interface formacionState {
    id: number;
    tipos_programas_id: number;
    ficha: string;
    nombre_programa: string;
    fecha_inicio_programa: string;
    fecha_fin_programa: string;
}

export interface nivelFormacionState {
    id: number;
    nivel_formacion: string;
}


interface role {
    id: number;
    nombre_rol: string;
}

// login interfaces

interface User {
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

interface dataLogin {
    user: User;
    token: string;
    token_type: string;
}

export interface responseLogin {
    success: boolean;
    message: string;
    data: dataLogin;
}

export interface userAuthState {
    user: User | null;
    token: string | null;
}