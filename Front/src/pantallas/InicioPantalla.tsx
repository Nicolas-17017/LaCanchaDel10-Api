import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultas } from '../api/consultas';
import { Boton, Cargando } from '../componentes/ui';
import Insignia from '../componentes/Insignia';
import { useAuth } from '../contexto/AuthContexto';
import { marca, sombra } from '../estilo';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { Cancha } from '../tipos';
import { dinero } from '../utilidades';

export default function InicioPantalla() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const { usuario } = useAuth();
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresco = false) => {
    if (esRefresco) setRefrescando(true);
    setError(null);
    try {
      setCanchas(await consultas.listarCanchas({ soloActivas: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las canchas.');
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

  const tipos = useMemo(() => Array.from(new Set(canchas.map((c) => c.tipo))), [canchas]);
  const visibles = filtro ? canchas.filter((c) => c.tipo === filtro) : canchas;
  const primerNombre = usuario?.nombre?.split(' ')[0] ?? '';

  if (cargando) return <Cargando />;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.encabezado}>
        <Text style={estilos.saludo}>Hola, {primerNombre} 👋</Text>
        <Text style={estilos.pregunta}>¿Qué cancha reservamos hoy?</Text>

        {tipos.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
            {[null, ...tipos].map((t) => {
              const activo = filtro === t;
              return (
                <Pressable
                  key={t ?? 'todas'}
                  onPress={() => setFiltro(t)}
                  style={[estilos.chip, activo && estilos.chipActivo]}
                >
                  <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{t ?? 'Todas'}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {error ? (
        <View style={estilos.centro}>
          <Ionicons name="cloud-offline-outline" size={48} color={colores.tintaSuave} />
          <Text style={estilos.error}>{error}</Text>
          <Boton titulo="Reintentar" onPress={() => cargar()} />
        </View>
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(c) => String(c.idCancha)}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
          ListEmptyComponent={
            <View style={estilos.vacioCaja}>
              <Ionicons name="football-outline" size={48} color={colores.tintaSuave} />
              <Text style={estilos.vacio}>No hay canchas disponibles.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [estilos.tarjeta, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('DetalleCancha', { idCancha: item.idCancha })}
            >
              <View style={estilos.icono}>
                <Ionicons name="football" size={26} color={marca.verde} />
              </View>

              <View style={estilos.centroTarjeta}>
                <Text style={estilos.nombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Insignia texto={item.tipo} color={marca.verde} fondo={marca.verdeSuave} />
                <View style={estilos.ubicacion}>
                  <Ionicons name="location-outline" size={14} color={colores.tintaSuave} />
                  <Text style={estilos.ubicacionTexto} numberOfLines={1}>
                    {item.establecimientoNombre}
                  </Text>
                </View>
              </View>

              <View style={estilos.precioCaja}>
                <Text style={estilos.precio}>{dinero(item.precio)}</Text>
                <Text style={estilos.porHora}>por hora</Text>
                <Ionicons name="chevron-forward" size={18} color={colores.tintaSuave} style={{ marginTop: 6 }} />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: marca.fondo },
  encabezado: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 },
  saludo: { fontSize: 28, fontWeight: '800', color: colores.tinta },
  pregunta: { fontSize: 15, color: colores.tintaSuave, marginTop: 2 },
  chips: { gap: 8, paddingTop: 16, paddingBottom: 6 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: marca.borde,
  },
  chipActivo: { backgroundColor: marca.verde, borderColor: marca.verde },
  chipTexto: { fontSize: 13, fontWeight: '600', color: colores.tinta },
  chipTextoActivo: { color: '#fff' },
  lista: { padding: 20, paddingTop: 12, gap: 14 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...sombra,
  },
  icono: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: marca.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centroTarjeta: { flex: 1, gap: 6 },
  nombre: { fontSize: 17, fontWeight: '800', color: colores.tinta },
  ubicacion: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ubicacionTexto: { fontSize: 13, color: colores.tintaSuave, flexShrink: 1 },
  precioCaja: { alignItems: 'flex-end' },
  precio: { fontSize: 16, fontWeight: '800', color: marca.verde },
  porHora: { fontSize: 11, color: colores.tintaSuave },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 26, gap: 14 },
  error: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center' },
  vacioCaja: { alignItems: 'center', marginTop: 60, gap: 10 },
  vacio: { color: colores.tintaSuave, fontSize: 14 },
});