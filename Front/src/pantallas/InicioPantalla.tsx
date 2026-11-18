import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultas } from '../api/consultas';
import { Boton, Cargando } from '../componentes/ui';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { Cancha } from '../tipos';

export default function InicioPantalla() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const [canchas, setCanchas] = useState<Cancha[]>([]);
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

  if (cargando) return <Cargando />;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <Text style={estilos.titulo}>Canchas disponibles</Text>

      {error ? (
        <View style={estilos.centro}>
          <Text style={estilos.error}>{error}</Text>
          <Boton titulo="Reintentar" onPress={() => cargar()} />
        </View>
      ) : (
        <FlatList
          data={canchas}
          keyExtractor={(c) => String(c.idCancha)}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
          ListEmptyComponent={<Text style={estilos.vacio}>Aún no hay canchas disponibles.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={estilos.tarjeta}
              onPress={() => navigation.navigate('DetalleCancha', { idCancha: item.idCancha })}
            >
              <Text style={estilos.nombre}>{item.nombre}</Text>
              <Text style={estilos.tipo}>
                {item.tipo} · {item.establecimientoNombre}
              </Text>
              <Text style={estilos.precio}>
                ${Number(item.precio).toLocaleString('es-CO')} / hora
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.tinta, padding: 20, paddingBottom: 8 },
  lista: { padding: 20, paddingTop: 8, gap: 12 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    gap: 4,
  },
  nombre: { fontSize: 17, fontWeight: '700', color: colores.tinta },
  tipo: { fontSize: 13, color: colores.tintaSuave },
  precio: { fontSize: 15, fontWeight: '700', color: colores.primarioOscuro, marginTop: 6 },
  centro: { flex: 1, justifyContent: 'center', padding: 26, gap: 14 },
  error: { color: colores.tintaSuave, fontSize: 14, textAlign: 'center' },
  vacio: { textAlign: 'center', color: colores.tintaSuave, marginTop: 40 },
});