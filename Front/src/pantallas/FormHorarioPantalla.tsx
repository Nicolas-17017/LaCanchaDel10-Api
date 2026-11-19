import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { comandos } from '../api/comandos';
import { consultas } from '../api/consultas';
import Campo from '../componentes/Campo';
import { Boton } from '../componentes/ui';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { Horario } from '../tipos';
import { fechaLarga, hora, proximosDias } from '../utilidades';

type Props = NativeStackScreenProps<AppStackParams, 'FormHorario'>;

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function aMinutos(texto: string): number {
  const [h, m] = texto.split(':').map(Number);
  return h * 60 + m;
}

function aTexto(minutos: number): string {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export default function FormHorarioPantalla({ route }: Props) {
  const { idCancha } = route.params;
  const dias = useMemo(() => proximosDias(14), []);
  const [fecha, setFecha] = useState(dias[0].iso);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [desde, setDesde] = useState('16:00');
  const [hasta, setHasta] = useState('22:00');
  const [cargando, setCargando] = useState(false);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const lista = await consultas.listarHorarios(idCancha, fecha);
      setHorarios([...lista].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
    } catch (e) {
      setHorarios([]);
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudieron cargar los horarios.');
    } finally {
      setCargando(false);
    }
  }, [idCancha, fecha]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function generar() {
    if (!FORMATO_HORA.test(desde) || !FORMATO_HORA.test(hasta)) {
      Alert.alert('Hora inválida', 'Usa el formato 24 horas HH:mm, por ejemplo 16:00.');
      return;
    }
    const inicio = aMinutos(desde);
    const fin = aMinutos(hasta);
    if (fin - inicio < 60) {
      Alert.alert('Rango inválido', 'La hora final debe ser al menos una hora después de la inicial.');
      return;
    }

    const existentes = new Set(horarios.map((h) => hora(h.horaInicio)));
    const pendientes: number[] = [];
    for (let t = inicio; t + 60 <= fin; t += 60) {
      if (!existentes.has(aTexto(t))) pendientes.push(t);
    }
    if (pendientes.length === 0) {
      Alert.alert('Sin cambios', 'Todos esos horarios ya existen para este día.');
      return;
    }

    setCreando(true);
    let creados = 0;
    let ultimoError = '';
    for (const t of pendientes) {
      try {
        await comandos.crearHorario({
          idCancha,
          fecha,
          horaInicio: `${aTexto(t)}:00`,
          horaFin: `${aTexto(t + 60)}:00`,
        });
        creados++;
      } catch (e) {
        ultimoError = e instanceof Error ? e.message : 'Error desconocido.';
      }
    }
    setCreando(false);
    await cargar();

    if (ultimoError) {
      Alert.alert('Listo, con avisos', `Se crearon ${creados} de ${pendientes.length} horarios.\n${ultimoError}`);
    } else {
      Alert.alert('Listo', `Se crearon ${creados} horarios.`);
    }
  }

  function pedirEliminar(h: Horario) {
    Alert.alert('Eliminar horario', `¿Eliminar ${hora(h.horaInicio)} - ${hora(h.horaFin)}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await comandos.eliminarHorario(h.idHorario);
            cargar();
          } catch (e) {
            Alert.alert('No se pudo eliminar', e instanceof Error ? e.message : 'Intenta de nuevo.');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Text style={estilos.seccion}>Elige el día</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.dias}>
        {dias.map((d) => {
          const activo = d.iso === fecha;
          return (
            <Pressable key={d.iso} onPress={() => setFecha(d.iso)} style={[estilos.dia, activo && estilos.diaActivo]}>
              <Text style={[estilos.diaTexto, activo && estilos.textoActivo]}>{d.dia}</Text>
              <Text style={[estilos.diaNumero, activo && estilos.textoActivo]}>{d.numero}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={estilos.seccion}>Crear horarios de 1 hora · {fechaLarga(fecha)}</Text>
      <View style={estilos.fila}>
        <View style={estilos.mitad}>
          <Campo etiqueta="Desde (HH:mm)" value={desde} onChangeText={setDesde} placeholder="16:00" maxLength={5} />
        </View>
        <View style={estilos.mitad}>
          <Campo etiqueta="Hasta (HH:mm)" value={hasta} onChangeText={setHasta} placeholder="22:00" maxLength={5} />
        </View>
      </View>
      <Boton titulo={creando ? 'Creando...' : 'Crear horarios'} onPress={generar} />

      <Text style={estilos.seccion}>Horarios de este día</Text>
      {cargando ? (
        <Text style={estilos.mensaje}>Cargando...</Text>
      ) : horarios.length === 0 ? (
        <Text style={estilos.mensaje}>Aún no hay horarios para este día.</Text>
      ) : (
        <View style={estilos.lista}>
          {horarios.map((h) => (
            <View key={h.idHorario} style={estilos.item}>
              <View>
                <Text style={estilos.itemHora}>
                  {hora(h.horaInicio)} - {hora(h.horaFin)}
                </Text>
                <Text style={[estilos.itemEstado, !h.disponible && estilos.reservado]}>
                  {h.disponible ? 'Disponible' : 'Reservado'}
                </Text>
              </View>
              {h.disponible && (
                <Pressable onPress={() => pedirEliminar(h)}>
                  <Text style={estilos.eliminar}>Eliminar</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: { padding: 20, paddingBottom: 40 },
  seccion: { fontSize: 13, fontWeight: '700', color: colores.tintaSuave, marginTop: 20, marginBottom: 10 },
  dias: { gap: 8 },
  dia: {
    width: 60,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E3E8EF',
  },
  diaActivo: { backgroundColor: colores.primarioOscuro, borderColor: colores.primarioOscuro },
  diaTexto: { fontSize: 12, color: colores.tintaSuave },
  diaNumero: { fontSize: 18, fontWeight: '800', color: colores.tinta, marginTop: 2 },
  textoActivo: { color: '#fff' },
  fila: { flexDirection: 'row', gap: 10 },
  mitad: { flex: 1 },
  mensaje: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center', marginTop: 10 },
  lista: { gap: 8 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemHora: { fontSize: 15, fontWeight: '700', color: colores.tinta },
  itemEstado: { fontSize: 12, color: '#15803D', marginTop: 2 },
  reservado: { color: '#B7791F' },
  eliminar: { color: '#B91C1C', fontWeight: '700', fontSize: 14 },
});