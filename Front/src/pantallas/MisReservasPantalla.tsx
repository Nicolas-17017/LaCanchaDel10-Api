import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores } from '../tema';

export default function MisReservasPantalla() {
  return (
    <SafeAreaView style={estilos.pantalla}>
      <Text style={estilos.texto}>Mis reservas (próximo paso)</Text>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: { color: colores.tintaSuave, fontSize: 14 },
});