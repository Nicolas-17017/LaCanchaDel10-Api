import type { Cancha, Establecimiento, Horario, Reserva, Usuario } from '../tipos';
import { cliente } from './cliente';



function parametros(valores: Record<string, string | number | boolean | undefined>): string {
  const partes = Object.entries(valores)
    .filter(([, valor]) => valor !== undefined && valor !== '')
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`);
  return partes.length > 0 ? `?${partes.join('&')}` : '';
}

export const consultas = {
  listarCanchas: (opciones: { idEstablecimiento?: number; tipo?: string; soloActivas?: boolean } = {}) =>
    cliente.get<Cancha[]>(`/api/canchas${parametros(opciones)}`),

  obtenerCancha: (idCancha: number) => cliente.get<Cancha>(`/api/canchas/${idCancha}`),

  listarHorarios: (idCancha: number, fecha?: string) =>
    cliente.get<Horario[]>(`/api/canchas/${idCancha}/horarios${parametros({ fecha })}`),

  reservasDeCancha: (idCancha: number) => cliente.get<Reserva[]>(`/api/canchas/${idCancha}/reservas`),

  listarEstablecimientos: (idPropietario?: number) =>
    cliente.get<Establecimiento[]>(`/api/establecimientos${parametros({ idPropietario })}`),

  misReservas: () => cliente.get<Reserva[]>('/api/reservas'),

  obtenerReserva: (idReserva: number) => cliente.get<Reserva>(`/api/reservas/${idReserva}`),

  obtenerUsuario: (idUsuario: number) => cliente.get<Usuario>(`/api/usuarios/${idUsuario}`),
};