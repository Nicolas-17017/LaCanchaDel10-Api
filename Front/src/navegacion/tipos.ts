import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Cancha } from '../tipos';

export type AuthStackParams = {
  Login: undefined;
  Registro: undefined;
};

export type PestanasParams = {
  Inicio: undefined;
  MisReservas: undefined;
  MiNegocio: undefined;
  Perfil: undefined;
};

export type AppStackParams = {
  Pestanas: NavigatorScreenParams<PestanasParams> | undefined;
  DetalleCancha: { idCancha: number };
  Horarios: { idCancha: number };
  Confirmacion: { idReserva: number };
  FormEstablecimiento: undefined;
  FormCancha: { idEstablecimiento: number; cancha?: Cancha };
  FormHorario: { idCancha: number; nombreCancha: string };
  ReservasCancha: { idCancha: number; nombreCancha: string };
};