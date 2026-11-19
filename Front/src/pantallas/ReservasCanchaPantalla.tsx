import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { comandos } from '../api/comandos';
import { consultas } from '../api/consultas';
import { Boton, Cargando } from '../componentes/ui';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { EstadoReserva, Reserva } from '../tipos';
import { dinero, fechaLarga, hora } from '../utilidades';

type Props = NativeStackScreenProps<AppStackParams, 'ReservasCancha'>;

const colorEstado: Record<EstadoReserva, string> = {
  Pendiente: '#B7791F',
  Confirmada: '#15803D',
  Cancelada: '#B91C1C',
  Completada: '#64748B',
};

export default function ReservasCanchaPantalla({ route }: Props) {
  const { idCancha } = route.params;
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (esRefresco = false) => {
      if (esRefresco) setRefrescando(true);
      setError(null);
      try {
        const lista = await consultas.reservasDeCancha(idCancha);
        setReservas(
          [...lista].sort((a, b) => `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar las reservas.');
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [idCancha]
  );

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  function cambiar(r: Reserva, estado: EstadoReserva) {
    Alert.alert('Cambiar estado', `¿Marcar la reserva de ${r.clienteNombre} como ${estado}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          try {
            await comandos.cambiarEstadoReserva(r.idReserva, estado);
            cargar();
          } catch (e) {
            Alert.alert('No se pudo cambiar', e instanceof Error ? e.message : 'Intenta de nuevo.');
          }
        },
      },
    ]);
  }

  if (cargando) return <Cargando />;

  if (error) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.mensaje}>{error}</Text>
        <Boton titulo="Reintentar" onPress={() => cargar()} />
      </View>
    );
  }

  return (
    <FlatList
      style={estilos.pantalla}
      data={reservas}
      keyExtractor={(r) => String(r.idReserva)}
      contentContainerStyle={estilos.lista}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
      ListEmptyComponent={<Text style={estilos.vacio}>Esta cancha aún no tiene reservas.</Text>}
      renderItem={({ item }) => (
        <View style={estilos.tarjeta}>
          <View style={estilos.fila}>
            <Text style={estilos.cliente}>{item.clienteNombre}</Text>
            <Text style={[estilos.estado, { color: colorEstado[item.estado] }]}>{item.estado}</Text>
          </View>
          <Text style={estilos.destacado}>
            {fechaLarga(item.fecha)} · {hora(item.horaInicio)} - {hora(item.horaFin)}
          </Text>
          <Text style={estilos.precio}>{dinero(item.precio)}</Text>

          {item.estado === 'Pendiente' && (
            <Boton titulo="Confirmar" onPress={() => cambiar(item, 'Confirmada')} />
          )}
          {item.estado === 'Confirmada' && (
            <Boton titulo="Marcar como completada" onPress={() => cambiar(item, 'Completada')} />
          )}
          {(item.estado === 'Pendiente' || item.estado === 'Confirmada') && (
            <Boton titulo="Cancelar reserva" variante="secundario" onPress={() => cambiar(item, 'Cancelada')} />
          )}
        </View>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  lista: { padding: 20, gap: 12 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    gap: 6,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cliente: { fontSize: 16, fontWeight: '700', color: colores.tinta, flexShrink: 1 },
  estado: { fontSize: 13, fontWeight: '700' },
  destacado: { fontSize: 14, fontWeight: '600', color: colores.tinta },
  precio: { fontSize: 15, fontWeight: '700', color: colores.primarioOscuro, marginBottom: 6 },
  centro: { flex: 1, justifyContent: 'center', padding: 26, gap: 14, backgroundColor: colores.superficie },
  mensaje: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center' },
  vacio: { textAlign: 'center', color: colores.tintaSuave, marginTop: 40 },
});