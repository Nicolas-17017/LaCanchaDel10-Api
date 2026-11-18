import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import { colores } from '../tema';

export default function PerfilPantalla() {
  const { usuario, cerrarSesion } = useAuth();
  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.contenido}>
        <Text style={estilos.nombre}>{usuario?.nombre}</Text>
        <Text style={estilos.rol}>{usuario?.tipoUsuario}</Text>
        <Boton titulo="Cerrar sesión" variante="secundario" onPress={cerrarSesion} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: { padding: 26, gap: 10 },
  nombre: { fontSize: 24, fontWeight: '800', color: colores.tinta },
  rol: { fontSize: 14, color: colores.tintaSuave, marginBottom: 16 },
});