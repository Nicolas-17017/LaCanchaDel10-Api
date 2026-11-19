import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { comandos } from '../api/comandos';
import { Boton } from '../componentes/ui';
import Campo from '../componentes/Campo';
import type { AppStackParams } from '../navegacion/tipos';
import { colores } from '../tema';

type Props = NativeStackScreenProps<AppStackParams, 'FormEstablecimiento'>;

export default function FormEstablecimientoPantalla({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!nombre.trim() || !direccion.trim()) {
      Alert.alert('Faltan datos', 'El nombre y la dirección son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await comandos.crearEstablecimiento({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
      });
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
        <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Complejo El Golazo" />
        <Campo etiqueta="Dirección" value={direccion} onChangeText={setDireccion} placeholder="Calle 10 # 5-20" />
        <Campo
          etiqueta="Teléfono (opcional)"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          placeholder="3001234567"
        />
        <Campo
          etiqueta="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
          placeholder="Parqueadero, cafetería, vestieres..."
        />
        <Boton titulo={guardando ? 'Guardando...' : 'Guardar establecimiento'} onPress={guardar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: { padding: 20 },
});