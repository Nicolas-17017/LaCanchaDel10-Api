

export type TipoUsuario = 'Cliente' | 'Propietario';
export type EstadoCancha = 'Activa' | 'Inactiva';
export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  tipoUsuario: TipoUsuario;
  fechaCreacion: string;
}

export interface RespuestaAuth {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}

export interface Establecimiento {
  idEstablecimiento: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  descripcion: string | null;
  idPropietario: number;
}

export interface Cancha {
  idCancha: number;
  nombre: string;
  tipo: string;
  precio: number;
  estado: EstadoCancha;
  idEstablecimiento: number;
  establecimientoNombre: string;
  establecimientoDireccion: string;
}

export interface Horario {
  idHorario: number;
  fecha: string; // "2026-10-20"
  horaInicio: string; // "16:00:00"
  horaFin: string;
  disponible: boolean;
  idCancha: number;
}

export interface Reserva {
  idReserva: number;
  fechaReserva: string;
  estado: EstadoReserva;
  precio: number;
  idUsuario: number;
  clienteNombre: string;
  idCancha: number;
  canchaNombre: string;
  establecimientoNombre: string;
  establecimientoDireccion: string;
  idHorario: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}



export interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  tipoUsuario: TipoUsuario;
}

export interface DatosEstablecimiento {
  nombre: string;
  direccion: string;
  telefono?: string;
  descripcion?: string;
}

export interface DatosCancha {
  nombre: string;
  tipo: string;
  precio: number;
  idEstablecimiento: number;
  estado: EstadoCancha;
}

export interface DatosHorario {
  idCancha: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}