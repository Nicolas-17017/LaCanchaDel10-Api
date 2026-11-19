import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { comandos } from '../api/comandos';
import { consultas } from '../api/consultas';
import Insignia from '../componentes/Insignia';
import { Boton, Cargando } from '../componentes/ui';
import { marca, sombra } from '../estilo';
import { colores } from '../tema';
import type { EstadoReserva, Reserva } from '../tipos';
import { dinero, fechaLarga, hora } from '../utilidades';

const paleta: Record<EstadoReserva, { color: string; fondo: string }> = {
  Pendiente: { color: '#B7791F', fondo: '#FEF3C7' },
  Confirmada: { color: '#15803D', fondo: '#DCFCE7' },
  Cancelada: { color: '#B91C1C', fondo: '#FEE2E2' },
  Completada: { color: '#475569', fondo: '#E2E8F0' },
};

export default function MisReservasPantalla() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresco = false) => {
    if (esRefresco) setRefrescando(true);
    setError(null);
    try {
      const lista = await consultas.misReservas();
      setReservas(
        [...lista].sort((a, b) => `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar tus reservas.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  function pedirCancelar(r: Reserva) {
    Alert.alert('Cancelar reserva', `¿Cancelar ${r.canchaNombre} el ${fechaLarga(r.fecha)}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await comandos.cancelarReserva(r.idReserva);
            cargar();
          } catch (e) {
            Alert.alert('No se pudo cancelar', e instanceof Error ? e.message : 'Intenta de nuevo.');
          }
        },
      },
    ]);
  }

  if (cargando) return <Cargando />;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <Text style={estilos.titulo}>Mis reservas</Text>

      {error ? (
        <View style={estilos.centro}>
          <Ionicons name="cloud-offline-outline" size={48} color={colores.tintaSuave} />
          <Text style={estilos.mensaje}>{error}</Text>
          <Boton titulo="Reintentar" onPress={() => cargar()} />
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(r) => String(r.idReserva)}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
          ListEmptyComponent={
            <View style={estilos.vacioCaja}>
              <Ionicons name="calendar-outline" size={48} color={colores.tintaSuave} />
              <Text style={estilos.vacio}>Aún no tienes reservas.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const cancelable = item.estado === 'Pendiente' || item.estado === 'Confirmada';
            const p = paleta[item.estado];
            return (
              <View style={estilos.tarjeta}>
                <View style={[estilos.barra, { backgroundColor: p.color }]} />
                <View style={estilos.cuerpo}>
                  <View style={estilos.fila}>
                    <Text style={estilos.cancha} numberOfLines={1}>
                      {item.canchaNombre}
                    </Text>
                    <Insignia texto={item.estado} color={p.color} fondo={p.fondo} />
                  </View>

                  <View style={estilos.dato}>
                    <Ionicons name="location-outline" size={15} color={colores.tintaSuave} />
                    <Text style={estilos.linea}>{item.establecimientoNombre}</Text>
                  </View>
                  <View style={estilos.dato}>
                    <Ionicons name="calendar-outline" size={15} color={colores.tintaSuave} />
                    <Text style={estilos.linea}>{fechaLarga(item.fecha)}</Text>
                  </View>
                  <View style={estilos.dato}>
                    <Ionicons name="time-outline" size={15} color={colores.tintaSuave} />
                    <Text style={estilos.linea}>
                      {hora(item.horaInicio)} - {hora(item.horaFin)}
                    </Text>
                  </View>

                  <Text style={estilos.precio}>{dinero(item.precio)}</Text>

                  {cancelable && (
                    <Boton titulo="Cancelar reserva" variante="secundario" onPress={() => pedirCancelar(item)} />
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: marca.fondo },
  titulo: { fontSize: 28, fontWeight: '800', color: colores.tinta, padding: 20, paddingBottom: 8 },
  lista: { padding: 20, paddingTop: 10, gap: 14 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    ...sombra,
  },
  barra: { width: 6 },
  cuerpo: { flex: 1, padding: 16, gap: 8 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cancha: { fontSize: 18, fontWeight: '800', color: colores.tinta, flexShrink: 1 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linea: { fontSize: 14, color: colores.tinta },
  precio: { fontSize: 17, fontWeight: '800', color: marca.verde, marginTop: 4 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 26, gap: 14 },
  mensaje: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center' },
  vacioCaja: { alignItems: 'center', marginTop: 60, gap: 10 },
  vacio: { color: colores.tintaSuave, fontSize: 14 },
});