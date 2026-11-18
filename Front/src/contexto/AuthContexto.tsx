import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { alSesionExpirada, fijarToken } from '../api/cliente';
import { comandos } from '../api/comandos';
import type { DatosRegistro, RespuestaAuth, Usuario } from '../tipos';

const CLAVE_SESION = 'lacancha.sesion';

interface AuthValor {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarPerfil: (nombre: string, telefono: string) => Promise<void>;
}

const Contexto = createContext<AuthValor | null>(null);


function aMilisegundos(fechaIso: string): number {
  return new Date(fechaIso.replace(/(\.\d{3})\d+/, '$1')).getTime();
}

export function AuthProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(async () => {
    fijarToken(null);
    setUsuario(null);
    await AsyncStorage.removeItem(CLAVE_SESION);
  }, []);


  useEffect(() => {
    alSesionExpirada(() => {
      void cerrarSesion();
    });

    (async () => {
      try {
        const guardada = await AsyncStorage.getItem(CLAVE_SESION);
        if (guardada) {
          const sesion = JSON.parse(guardada) as RespuestaAuth;
          if (aMilisegundos(sesion.expiraEn) > Date.now()) {
            fijarToken(sesion.token);
            setUsuario(sesion.usuario);
          } else {
            await AsyncStorage.removeItem(CLAVE_SESION);
          }
        }
      } catch {
        
      } finally {
        setCargando(false);
      }
    })();
  }, [cerrarSesion]);

  const iniciarSesion = useCallback(async (correo: string, contrasena: string) => {
    const respuesta = await comandos.iniciarSesion(correo, contrasena);
    fijarToken(respuesta.token);
    await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(respuesta));
    setUsuario(respuesta.usuario);
  }, []);

  const registrar = useCallback(
    async (datos: DatosRegistro) => {
      await comandos.registrarUsuario(datos);
      await iniciarSesion(datos.correo, datos.contrasena);
    },
    [iniciarSesion]
  );

  const actualizarPerfil = useCallback(
    async (nombre: string, telefono: string) => {
      if (!usuario) return;
      const actualizado = await comandos.actualizarUsuario(usuario.idUsuario, { nombre, telefono });
      const guardada = await AsyncStorage.getItem(CLAVE_SESION);
      if (guardada) {
        const sesion = JSON.parse(guardada) as RespuestaAuth;
        await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify({ ...sesion, usuario: actualizado }));
      }
      setUsuario(actualizado);
    },
    [usuario]
  );

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrar, cerrarSesion, actualizarPerfil }),
    [usuario, cargando, iniciarSesion, registrar, cerrarSesion, actualizarPerfil]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthValor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useAuth debe usarse dentro de AuthProveedor.');
  return valor;
}