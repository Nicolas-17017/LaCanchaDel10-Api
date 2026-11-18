import type {
  Cancha,
  DatosCancha,
  DatosEstablecimiento,
  DatosHorario,
  DatosRegistro,
  Establecimiento,
  EstadoReserva,
  Horario,
  RespuestaAuth,
  Usuario,
} from '../tipos';
import { cliente } from './cliente';



type CanchaGuardada = Omit<Cancha, 'establecimientoNombre' | 'establecimientoDireccion'>;

export const comandos = {
  iniciarSesion: (correo: string, contrasena: string) =>
    cliente.post<RespuestaAuth>('/api/auth/login', { correo, contrasena }),

  registrarUsuario: (datos: DatosRegistro) => cliente.post<Usuario>('/api/usuarios', datos),

  actualizarUsuario: (idUsuario: number, datos: { nombre: string; telefono: string }) =>
    cliente.put<Usuario>(`/api/usuarios/${idUsuario}`, datos),

  crearEstablecimiento: (datos: DatosEstablecimiento) =>
    cliente.post<Establecimiento>('/api/establecimientos', datos),

  crearCancha: (datos: DatosCancha) => cliente.post<CanchaGuardada>('/api/canchas', datos),

  actualizarCancha: (idCancha: number, datos: DatosCancha) =>
    cliente.put<CanchaGuardada>(`/api/canchas/${idCancha}`, datos),

  desactivarCancha: (idCancha: number) => cliente.eliminar(`/api/canchas/${idCancha}`),

  crearHorario: (datos: DatosHorario) => cliente.post<Horario>('/api/horarios', datos),

  eliminarHorario: (idHorario: number) => cliente.eliminar(`/api/horarios/${idHorario}`),

  crearReserva: (idHorario: number) =>
    cliente.post<{ idReserva: number }>('/api/reservas', { idHorario }),

  cancelarReserva: (idReserva: number) => cliente.eliminar(`/api/reservas/${idReserva}`),

  cambiarEstadoReserva: (idReserva: number, estado: EstadoReserva) =>
    cliente.put<{ idReserva: number }>(`/api/reservas/${idReserva}`, { estado }),
};