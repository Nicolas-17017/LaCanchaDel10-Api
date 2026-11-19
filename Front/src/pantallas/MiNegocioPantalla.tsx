import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultas } from '../api/consultas';
import Insignia from '../componentes/Insignia';
import { Boton, Cargando } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import { marca, sombra } from '../estilo';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { Cancha, Establecimiento } from '../tipos';
import { dinero } from '../utilidades';

interface Grupo {
  establecimiento: Establecimiento;
  canchas: Cancha[];
}

export default function MiNegocioPantalla() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const { usuario } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (esRefresco = false) => {
      if (!usuario) return;
      if (esRefresco) setRefrescando(true);
      setError(null);
      try {
        const lista = await consultas.listarEstablecimientos(usuario.idUsuario);
        const resultado = await Promise.all(
          lista.map(async (e) => ({
            establecimiento: e,
            canchas: await consultas.listarCanchas({ idEstablecimiento: e.idEstablecimiento }),
          }))
        );
        setGrupos(resultado);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar tu negocio.');
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [usuario]
  );

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (cargando) return <Cargando />;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
      >
        <Text style={estilos.titulo}>Mi negocio</Text>
        <Text style={estilos.subtitulo}>Gestiona tus establecimientos, canchas y reservas.</Text>

        <Boton titulo="Nuevo establecimiento" onPress={() => navigation.navigate('FormEstablecimiento')} />

        {error && <Text style={estilos.mensaje}>{error}</Text>}

        {!error && grupos.length === 0 && (
          <View style={estilos.vacioCaja}>
            <Ionicons name="storefront-outline" size={48} color={colores.tintaSuave} />
            <Text style={estilos.mensaje}>
              Aún no tienes establecimientos. Crea el primero para registrar tus canchas.
            </Text>
          </View>
        )}

        {grupos.map(({ establecimiento, canchas }) => (
          <View key={establecimiento.idEstablecimiento} style={estilos.bloque}>
            <View style={estilos.cabecera}>
              <View style={estilos.icono}>
                <Ionicons name="storefront" size={22} color={marca.verde} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombreEst}>{establecimiento.nombre}</Text>
                <View style={estilos.ubicacion}>
                  <Ionicons name="location-outline" size={14} color={colores.tintaSuave} />
                  <Text style={estilos.sub} numberOfLines={1}>
                    {establecimiento.direccion}
                  </Text>
                </View>
              </View>
            </View>

            {canchas.length === 0 && <Text style={estilos.sub}>Sin canchas todavía.</Text>}

            {canchas.map((c) => {
              const activa = c.estado === 'Activa';
              return (
                <View key={c.idCancha} style={estilos.cancha}>
                  <View style={estilos.fila}>
                    <Text style={estilos.nombreCancha}>{c.nombre}</Text>
                    <Insignia
                      texto={c.estado}
                      color={activa ? '#15803D' : '#B91C1C'}
                      fondo={activa ? '#DCFCE7' : '#FEE2E2'}
                    />
                  </View>
                  <Text style={estilos.sub}>
                    {c.tipo} · {dinero(c.precio)} / hora
                  </Text>
                  <View style={estilos.acciones}>
                    <View style={estilos.accion}>
                      <Boton
                        titulo="Horarios"
                        variante="secundario"
                        onPress={() =>
                          navigation.navigate('FormHorario', { idCancha: c.idCancha, nombreCancha: c.nombre })
                        }
                      />
                    </View>
                    <View style={estilos.accion}>
                      <Boton
                        titulo="Reservas"
                        variante="secundario"
                        onPress={() =>
                          navigation.navigate('ReservasCancha', {
                            idCancha: c.idCancha,
                            nombreCancha: c.nombre,
                          })
                        }
                      />
                    </View>
                  </View>
                  <Boton
                    titulo="Editar cancha"
                    variante="secundario"
                    onPress={() =>
                      navigation.navigate('FormCancha', {
                        idEstablecimiento: establecimiento.idEstablecimiento,
                        cancha: c,
                      })
                    }
                  />
                </View>
              );
            })}

            <Boton
              titulo="Agregar cancha"
              onPress={() =>
                navigation.navigate('FormCancha', { idEstablecimiento: establecimiento.idEstablecimiento })
              }
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: marca.fondo },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  titulo: { fontSize: 28, fontWeight: '800', color: colores.tinta },
  subtitulo: { fontSize: 14, color: colores.tintaSuave, marginTop: -8 },
  mensaje: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center' },
  vacioCaja: { alignItems: 'center', gap: 10, marginTop: 30 },
  bloque: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 12, ...sombra },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: marca.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombreEst: { fontSize: 18, fontWeight: '800', color: colores.tinta },
  ubicacion: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sub: { fontSize: 13, color: colores.tintaSuave, flexShrink: 1 },
  cancha: {
    borderTopWidth: 1,
    borderTopColor: marca.borde,
    paddingTop: 12,
    gap: 8,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  nombreCancha: { fontSize: 16, fontWeight: '700', color: colores.tinta, flexShrink: 1 },
  acciones: { flexDirection: 'row', gap: 8 },
  accion: { flex: 1 },
});