

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
  Pestanas: undefined;
  DetalleCancha: { idCancha: number };
  Horarios: { idCancha: number };
  Confirmacion: { idReserva: number };
  FormEstablecimiento: undefined;
  FormCancha: { idEstablecimiento: number };
  FormHorario: { idCancha: number; nombreCancha: string };
  ReservasCancha: { idCancha: number; nombreCancha: string };
};