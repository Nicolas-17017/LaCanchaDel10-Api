import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { comandos } from '../api/comandos';
import Campo from '../componentes/Campo';
import { Boton } from '../componentes/ui';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { EstadoCancha } from '../tipos';

type Props = NativeStackScreenProps<AppStackParams, 'FormCancha'>;

const TIPOS = ['Fútbol 5', 'Fútbol 8', 'Fútbol 11', 'Baloncesto', 'Voleibol', 'Tenis'];

export default function FormCanchaPantalla({ route, navigation }: Props) {
  const { idEstablecimiento, cancha } = route.params;
  const editando = !!cancha;

  const [nombre, setNombre] = useState(cancha?.nombre ?? '');
  const [tipo, setTipo] = useState(cancha?.tipo ?? '');
  const [precio, setPrecio] = useState(cancha ? String(cancha.precio) : '');
  const [estado, setEstado] = useState<EstadoCancha>(cancha?.estado ?? 'Activa');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const valor = Number(precio.replace(/[^0-9]/g, ''));
    if (!nombre.trim() || !tipo.trim() || !valor) {
      Alert.alert('Faltan datos', 'Nombre, tipo y un precio mayor a cero son obligatorios.');
      return;
    }
    const datos = {
      nombre: nombre.trim(),
      tipo: tipo.trim(),
      precio: valor,
      idEstablecimiento,
      estado,
    };
    setGuardando(true);
    try {
      if (cancha) await comandos.actualizarCancha(cancha.idCancha, datos);
      else await comandos.crearCancha(datos);
      navigation.goBack();
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Campo etiqueta="Nombre de la cancha" value={nombre} onChangeText={setNombre} placeholder="Cancha 1" />

        <Text style={estilos.etiqueta}>Tipo</Text>
        <View style={estilos.chips}>
          {TIPOS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTipo(t)}
              style={[estilos.chip, tipo === t && estilos.chipActivo]}
            >
              <Text style={[estilos.chipTexto, tipo === t && estilos.chipTextoActivo]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Campo etiqueta="O escribe otro tipo" value={tipo} onChangeText={setTipo} placeholder="Fútbol 5" />

        <Campo
          etiqueta="Precio por hora (COP)"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          placeholder="95000"
        />

        {editando && (
          <>
            <Text style={estilos.etiqueta}>Estado</Text>
            <View style={estilos.chips}>
              {(['Activa', 'Inactiva'] as EstadoCancha[]).map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setEstado(e)}
                  style={[estilos.chip, estado === e && estilos.chipActivo]}
                >
                  <Text style={[estilos.chipTexto, estado === e && estilos.chipTextoActivo]}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Boton
          titulo={guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cancha'}
          onPress={guardar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: { padding: 20, paddingBottom: 40 },
  etiqueta: { fontSize: 12, fontWeight: '600', color: colores.tintaSuave, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E3E8EF',
  },
  chipActivo: { backgroundColor: colores.primarioOscuro, borderColor: colores.primarioOscuro },
  chipTexto: { fontSize: 13, color: colores.tinta, fontWeight: '600' },
  chipTextoActivo: { color: '#fff' },
});