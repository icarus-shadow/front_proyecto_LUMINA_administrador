
# users 
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
}

# elements
{
id: number;
sn_equipo: string;
marca: string;
color: string;
tipo_elemento: string;
descripcion: string;
qr_hash: string;
path_foto_equipo_implemento: string;
}

# subElement
{
id: number;
nombre_elemento: string;
path_foto_elemento: string;
equipos_o_elementos_id: number;
}

# historial
{
id: number;
usuario_id: number;
equipos_o_elementos_id: number;
ingreso: string;
salida: string;
}

# formacion
{
id: number;
tipos_programas_id: number;
ficha: string;
nombre_programa: string;
fecha_inicio_programa: string;
fecha_fin_programa: string;
}

# nivelFormacion
{
id: number;
nivel_formacion: string;
}


# roles 

usuario: 1
admin: 2
celador: 3
