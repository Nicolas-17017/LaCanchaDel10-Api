import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { comandos } from '../api/comandos';
import { consultas } from '../api/consultas';
import Insignia from '../componentes/Insignia';
import { Boton, Cargando } from '../componentes/ui';
import { marca, sombra } from '../estilo';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { Cancha, Horario } from '../tipos';
import { aISO, dinero, fechaLarga, hora, proximosDias } from '../utilidades';

type Props = NativeStackScreenProps<AppStackParams, 'DetalleCancha'>;

export default function DetalleCanchaPantalla({ route, navigation }: Props) {
  const { idCancha } = route.params;
  const dias = useMemo(() => proximosDias(7), []);
  const [cancha, setCancha] = useState<Cancha | null>(null);
  const [fecha, setFecha] = useState(dias[0].iso);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [cargandoCancha, setCargandoCancha] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    consultas
      .obtenerCancha(idCancha)
      .then(setCancha)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la cancha.'))
      .finally(() => setCargandoCancha(false));
  }, [idCancha]);

  const cargarHorarios = useCallback(async () => {
    setCargandoHorarios(true);
    setSeleccionado(null);
    try {
      const lista = await consultas.listarHorarios(idCancha, fecha);
      setHorarios([...lista].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
    } catch (e) {
      setHorarios([]);
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudieron cargar los horarios.');
    } finally {
      setCargandoHorarios(false);
    }
  }, [idCancha, fecha]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  function estaLibre(h: Horario): boolean {
    if (!h.disponible) return false;
    if (fecha === aISO(new Date())) {
      const ahora = new Date();
      const actual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      if (hora(h.horaInicio) <= actual) return false;
    }
    return true;
  }

  const horarioElegido = horarios.find((h) => h.idHorario === seleccionado);

  function pedirConfirmacion() {
    if (!horarioElegido || !cancha) return;
    Alert.alert(
      'Confirmar reserva',
      `${cancha.nombre}\n${fechaLarga(fecha)}\n${hora(horarioElegido.horaInicio)} - ${hora(
        horarioElegido.horaFin
      )}\n${dinero(cancha.precio)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reservar', onPress: reservar },
      ]
    );
  }

  async function reservar() {
    if (seleccionado === null) return;
    setReservando(true);
    try {
      const reserva = await comandos.crearReserva(seleccionado);
      navigation.replace('Confirmacion', { idReserva: reserva.idReserva });
    } catch (e) {
      Alert.alert('No se pudo reservar', e instanceof Error ? e.message : 'Intenta de nuevo.');
      cargarHorarios();
    } finally {
      setReservando(false);
    }
  }

  if (cargandoCancha) return <Cargando />;

  if (!cancha) {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <Text style={estilos.mensaje}>{error ?? 'Cancha no encontrada.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.cabecera}>
          <View style={estilos.icono}>
            <Ionicons name="football" size={32} color={marca.verde} />
          </View>
          <View style={estilos.cabeceraTexto}>
            <Text style={estilos.nombre}>{cancha.nombre}</Text>
            <Insignia texto={cancha.tipo} color={marca.verde} fondo={marca.verdeSuave} />
          </View>
          <View style={estilos.precioCaja}>
            <Text style={estilos.precio}>{dinero(cancha.precio)}</Text>
            <Text style={estilos.porHora}>por hora</Text>
          </View>
        </View>

        <View style={estilos.ubicacion}>
          <Ionicons name="location-outline" size={18} color={marca.verde} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.ubicacionNombre}>{cancha.establecimientoNombre}</Text>
            <Text style={estilos.ubicacionDireccion}>{cancha.establecimientoDireccion}</Text>
          </View>
        </View>

        <Text style={estilos.seccion}>Elige el día</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.dias}>
          {dias.map((d) => {
            const activo = d.iso === fecha;
            return (
              <Pressable
                key={d.iso}
                onPress={() => setFecha(d.iso)}
                style={[estilos.dia, activo && estilos.diaActivo]}
              >
                <Text style={[estilos.diaTexto, activo && estilos.textoActivo]}>{d.dia}</Text>
                <Text style={[estilos.diaNumero, activo && estilos.textoActivo]}>{d.numero}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={estilos.seccion}>Horarios</Text>
        {cargandoHorarios ? (
          <Text style={estilos.mensaje}>Cargando horarios...</Text>
        ) : horarios.length === 0 ? (
          <View style={estilos.vacioCaja}>
            <Ionicons name="time-outline" size={40} color={colores.tintaSuave} />
            <Text style={estilos.mensaje}>No hay horarios para este día.</Text>
          </View>
        ) : (
          <View style={estilos.horarios}>
            {horarios.map((h) => {
              const libre = estaLibre(h);
              const activo = h.idHorario === seleccionado;
              return (
                <Pressable
                  key={h.idHorario}
                  disabled={!libre}
                  onPress={() => setSeleccionado(h.idHorario)}
                  style={[estilos.hora, !libre && estilos.horaOcupada, activo && estilos.horaActiva]}
                >
                  <View style={estilos.horaIzq}>
                    <Ionicons
                      name={activo ? 'checkmark-circle' : 'time-outline'}
                      size={20}
                      color={activo ? '#fff' : libre ? marca.verde : '#9AA4B2'}
                    />
                    <Text
                      style={[
                        estilos.horaTexto,
                        !libre && estilos.horaTextoOcupada,
                        activo && estilos.textoActivo,
                      ]}
                    >
                      {hora(h.horaInicio)} - {hora(h.horaFin)}
                    </Text>
                  </View>
                  {!libre && <Text style={estilos.ocupado}>No disponible</Text>}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={estilos.pie}>
        <Boton
          titulo={reservando ? 'Reservando...' : seleccionado ? 'Reservar horario' : 'Elige un horario'}
          onPress={pedirConfirmacion}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: marca.fondo },
  contenido: { padding: 20, paddingBottom: 30 },
  cabecera: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...sombra,
  },
  icono: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: marca.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabeceraTexto: { flex: 1, gap: 6 },
  nombre: { fontSize: 20, fontWeight: '800', color: colores.tinta },
  precioCaja: { alignItems: 'flex-end' },
  precio: { fontSize: 17, fontWeight: '800', color: marca.verde },
  porHora: { fontSize: 11, color: colores.tintaSuave },
  ubicacion: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    ...sombra,
  },
  ubicacionNombre: { fontSize: 14, fontWeight: '700', color: colores.tinta },
  ubicacionDireccion: { fontSize: 13, color: colores.tintaSuave, marginTop: 1 },
  seccion: { fontSize: 15, fontWeight: '800', color: colores.tinta, marginTop: 24, marginBottom: 12 },
  dias: { gap: 8 },
  dia: {
    width: 60,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: marca.borde,
  },
  diaActivo: { backgroundColor: marca.verde, borderColor: marca.verde },
  diaTexto: { fontSize: 12, color: colores.tintaSuave },
  diaNumero: { fontSize: 18, fontWeight: '800', color: colores.tinta, marginTop: 2 },
  textoActivo: { color: '#fff' },
  horarios: { gap: 10 },
  hora: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: marca.borde,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horaIzq: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  horaActiva: { backgroundColor: marca.verde, borderColor: marca.verde },
  horaOcupada: { backgroundColor: '#F1F3F6' },
  horaTexto: { fontSize: 15, fontWeight: '700', color: colores.tinta },
  horaTextoOcupada: { color: '#9AA4B2' },
  ocupado: { fontSize: 12, color: '#9AA4B2' },
  vacioCaja: { alignItems: 'center', gap: 8, marginTop: 10 },
  mensaje: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center', marginTop: 6 },
  pie: { padding: 20, paddingTop: 10, backgroundColor: '#fff', ...sombra },
});