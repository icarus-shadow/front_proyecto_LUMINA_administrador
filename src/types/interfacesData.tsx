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
    usuarios: users
}

export interface subElements {
    id?: number;
    nombre_elemento: string;
    path_foto_elemento?: string;
    equipos_o_elementos_id?: number;
}

export interface historial {
    id: number;
    usuario_id: number;
    equipos_o_elementos_id: number;
    ingreso: string;
    salida: string;
    equipo: elements;
    usuario: users;
}

export interface formacion {
    id: number;
    tipos_programas_id: number;
    ficha: string;
    nombre_programa: string;
    fecha_inicio_programa: string;
    fecha_fin_programa: string;
    nivel_formacion?: nivelFormacion;
}

export interface nivelFormacion {
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

export interface responseElements {
    success: boolean | null;
    data: elements[] | null[];
    count: number;
}

export interface responseHistory {
    success: boolean | null;
    data: historial[] | null;
    count: number;
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
    count: number;
}

export interface responseLogin {
    success: boolean;
    message: string;
    data: dataLogin;
}


export interface responseFormation {
    success: boolean | null;
    data: formacion[] | null;
    count: number;
}

export interface responseSubElements {
    success: boolean | null;
    data: subElements[] | null;
    count: number;
}

export interface responseLevelFormation {
    success: boolean | null;
    data: nivelFormacion[] | null;
    count: number;
}

// states redux

export interface AddUserPayload {
    role_id: number;
    formacion_id: number | null;
    nombre: string;
    apellido: string;
    tipo_documento: string;
    documento: string;
    edad: number | null;
    numero_telefono: string | null;
    path_foto: File | null;
    email: string;
    password: string;
}

export interface EditUserPayload {
    id: number;
    role_id: number;
    formacion_id: number | null;
    nombre: string;
    apellido: string;
    tipo_documento: string;
    documento: string;
    edad: number | null;
    numero_telefono: string | null;
    path_foto: File | null;
    email: string;
}

export interface userAuthState {
    user: User | null;
    token: string | null;
}
