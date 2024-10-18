import { Timestamp } from 'firebase/firestore'; 
export interface Equipos{
    id: string; 
    descripcion: string;
    nombre_equipo: string;
    nombre_fantasia: string;
    tipo_deporte: string;
    ubicacion: string
}
export interface Tipo_rutina{
    nombre_ejercicio: string;
    nombre_tipo_rutina: string;

}
export interface Rutinas{
    facil: string;
    media: string;
    dificil: string;
    nombre_tipo_rutina: string;
}
export interface Partidos{
    contrincante: string;
    fecha_partido: Timestamp;
    resultado: string;
    ubicacion: string;
}
export interface Logros{
    fecha: Timestamp;
    logro: string;
}
export interface Usuario {
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
    sexo: string;
    altura: number;
    peso: number;
    correo: string;
    contraseña?: string; // Cambiado a opcional
    fotoPerfil?: string; // Campo para la URL de la foto de perfil
}

  