import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Insignia from '../componentes/Insignia';
import { Boton } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import { marca, sombra } from '../estilo';
import { colores } from '../tema';

export default function PerfilPantalla() {
  const { usuario, cerrarSesion } = useAuth();
  const inicial = usuario?.nombre?.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.contenido}>
        <View style={estilos.cabecera}>
          <View style={estilos.avatar}>
            <Text style={estilos.inicial}>{inicial}</Text>
          </View>
          <Text style={estilos.nombre}>{usuario?.nombre}</Text>
          <Insignia texto={usuario?.tipoUsuario ?? ''} color={marca.verde} fondo={marca.verdeSuave} />
        </View>

        <View style={estilos.tarjeta}>
          <View style={estilos.fila}>
            <Ionicons name="mail-outline" size={20} color={marca.verde} />
            <View>
              <Text style={estilos.etiqueta}>Correo</Text>
              <Text style={estilos.valor}>{usuario?.correo}</Text>
            </View>
          </View>
          <View style={estilos.separador} />
          <View style={estilos.fila}>
            <Ionicons name="call-outline" size={20} color={marca.verde} />
            <View>
              <Text style={estilos.etiqueta}>Teléfono</Text>
              <Text style={estilos.valor}>{usuario?.telefono || 'No registrado'}</Text>
            </View>
          </View>
        </View>

        <Boton titulo="Cerrar sesión" variante="secundario" onPress={cerrarSesion} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: marca.fondo },
  contenido: { padding: 24, gap: 20 },
  cabecera: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: marca.verde,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },
  inicial: { fontSize: 42, fontWeight: '800', color: '#fff' },
  nombre: { fontSize: 24, fontWeight: '800', color: colores.tinta },
  tarjeta: { backgroundColor: '#fff', borderRadius: 18, padding: 18, ...sombra },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  separador: { height: 1, backgroundColor: marca.borde, marginVertical: 14 },
  etiqueta: { fontSize: 12, color: colores.tintaSuave },
  valor: { fontSize: 15, fontWeight: '600', color: colores.tinta, marginTop: 1 },
});