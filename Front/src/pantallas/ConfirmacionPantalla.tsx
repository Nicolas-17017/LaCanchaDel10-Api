import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultas } from '../api/consultas';
import Insignia from '../componentes/Insignia';
import { Boton, Cargando } from '../componentes/ui';
import { marca, sombra } from '../estilo';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { Reserva } from '../tipos';
import { dinero, fechaLarga, hora } from '../utilidades';

type Props = NativeStackScreenProps<AppStackParams, 'Confirmacion'>;

function Dato({ icono, texto }: { icono: keyof typeof Ionicons.glyphMap; texto: string }) {
  return (
    <View style={estilos.dato}>
      <Ionicons name={icono} size={18} color={marca.verde} />
      <Text style={estilos.datoTexto}>{texto}</Text>
    </View>
  );
}

export default function ConfirmacionPantalla({ route, navigation }: Props) {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    consultas
      .obtenerReserva(route.params.idReserva)
      .then(setReserva)
      .catch(() => setReserva(null))
      .finally(() => setCargando(false));
  }, [route.params.idReserva]);

  if (cargando) return <Cargando />;

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.contenido}>
        <View style={estilos.exito}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={estilos.titulo}>¡Reserva realizada!</Text>
        <Text style={estilos.subtitulo}>Te esperamos en la cancha.</Text>

        {reserva ? (
          <View style={estilos.tarjeta}>
            <View style={estilos.fila}>
              <Text style={estilos.cancha} numberOfLines={1}>
                {reserva.canchaNombre}
              </Text>
              <Insignia texto={reserva.estado} color="#B7791F" fondo="#FEF3C7" />
            </View>
            <View style={estilos.linea} />
            <Dato icono="location-outline" texto={`${reserva.establecimientoNombre} · ${reserva.establecimientoDireccion}`} />
            <Dato icono="calendar-outline" texto={fechaLarga(reserva.fecha)} />
            <Dato icono="time-outline" texto={`${hora(reserva.horaInicio)} - ${hora(reserva.horaFin)}`} />
            <View style={estilos.linea} />
            <View style={estilos.fila}>
              <Text style={estilos.totalEtiqueta}>Total</Text>
              <Text style={estilos.precio}>{dinero(reserva.precio)}</Text>
            </View>
          </View>
        ) : (
          <Text style={estilos.subtitulo}>Tu reserva quedó creada. Revísala en "Mis reservas".</Text>
        )}

        <View style={estilos.botones}>
          <Boton
            titulo="Ver mis reservas"
            onPress={() => navigation.navigate('Pestanas', { screen: 'MisReservas' })}
          />
          <Boton
            titulo="Volver a las canchas"
            variante="secundario"
            onPress={() => navigation.navigate('Pestanas', { screen: 'Inicio' })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: marca.fondo },
  contenido: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'stretch', gap: 10 },
  exito: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: marca.verde,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.tinta, textAlign: 'center', marginTop: 10 },
  subtitulo: { fontSize: 14, color: colores.tintaSuave, textAlign: 'center', marginBottom: 10 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 12, ...sombra },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cancha: { fontSize: 19, fontWeight: '800', color: colores.tinta, flexShrink: 1 },
  linea: { height: 1, backgroundColor: marca.borde },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  datoTexto: { fontSize: 14, color: colores.tinta, flexShrink: 1 },
  totalEtiqueta: { fontSize: 14, color: colores.tintaSuave },
  precio: { fontSize: 22, fontWeight: '800', color: marca.verde },
  botones: { gap: 12, marginTop: 14 },
});