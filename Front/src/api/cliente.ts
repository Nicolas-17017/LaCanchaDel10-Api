import { API_URL } from '../config';



let token: string | null = null;
let alExpirarSesion: (() => void) | null = null;

export function fijarToken(nuevo: string | null) {
  token = nuevo;
}

export function alSesionExpirada(accion: () => void) {
  alExpirarSesion = accion;
}

export class ErrorApi extends Error {
  estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
  }
}

const TIEMPO_MAXIMO_MS = 15000;

async function peticion<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const cabeceras: Record<string, string> = { Accept: 'application/json' };
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: controlador.signal,
    });
  } catch {
    throw new ErrorApi(
      'No se pudo conectar con el servidor. Revisa tu conexión y que la API esté encendida.',
      0
    );
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    // 401 con sesión iniciada: el token venció o ya no es válido.
    if (respuesta.status === 401 && token) {
      alExpirarSesion?.();
      throw new ErrorApi('Tu sesión expiró. Inicia sesión de nuevo.', 401);
    }
    throw new ErrorApi(await leerMensajeDeError(respuesta), respuesta.status);
  }

  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

async function leerMensajeDeError(respuesta: Response): Promise<string> {
  try {
    const datos = await respuesta.json();
    if (datos?.mensaje) return String(datos.mensaje);
    if (datos?.errors) {
      return Object.values(datos.errors as Record<string, string[]>).flat().join(' ');
    }
    if (datos?.title) return String(datos.title);
  } catch {
    // La respuesta no traía cuerpo JSON.
  }
  return 'Ocurrió un error inesperado.';
}

export const cliente = {
  get: <T>(ruta: string) => peticion<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('POST', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('PUT', ruta, cuerpo),
  eliminar: (ruta: string) => peticion<void>('DELETE', ruta),
};