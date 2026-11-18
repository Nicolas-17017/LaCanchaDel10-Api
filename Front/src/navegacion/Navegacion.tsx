import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cargando } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import InicioPantalla from '../pantallas/InicioPantalla';
import LoginPantalla from '../pantallas/LoginPantalla';
import MiNegocioPantalla from '../pantallas/MiNegocioPantalla';
import MisReservasPantalla from '../pantallas/MisReservasPantalla';
import PerfilPantalla from '../pantallas/PerfilPantalla';
import RegistroPantalla from '../pantallas/RegistroPantalla';
import { colores } from '../tema';
import type { AppStackParams, AuthStackParams, PestanasParams } from './tipos';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const AppStack = createNativeStackNavigator<AppStackParams>();
const Tab = createBottomTabNavigator<PestanasParams>();

const iconos: Record<keyof PestanasParams, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'football-outline',
  MisReservas: 'calendar-outline',
  MiNegocio: 'storefront-outline',
  Perfil: 'person-outline',
};

function Pestanas() {
  const { usuario } = useAuth();
  // Ajusta este texto al valor real que devuelve tu API para el dueño de canchas
  const esPropietario = usuario?.tipoUsuario === 'Propietario';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colores.primarioOscuro,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={iconos[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={InicioPantalla} options={{ title: 'Canchas' }} />
      <Tab.Screen name="MisReservas" component={MisReservasPantalla} options={{ title: 'Mis reservas' }} />
      {esPropietario && (
        <Tab.Screen name="MiNegocio" component={MiNegocioPantalla} options={{ title: 'Mi negocio' }} />
      )}
      <Tab.Screen name="Perfil" component={PerfilPantalla} />
    </Tab.Navigator>
  );
}

// Temporal: se reemplaza en el paso 3 (detalle y horarios)
function DetalleTemporal() {
  return (
    <SafeAreaView style={estilos.temporal}>
      <Text style={estilos.texto}>Detalle de cancha (próximo paso)</Text>
    </SafeAreaView>
  );
}

export default function Navegacion() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Cargando />;

  return (
    <NavigationContainer>
      {usuario ? (
        <AppStack.Navigator>
          <AppStack.Screen name="Pestanas" component={Pestanas} options={{ headerShown: false }} />
          <AppStack.Screen
            name="DetalleCancha"
            component={DetalleTemporal}
            options={{ title: 'Detalle de cancha' }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginPantalla} />
          <AuthStack.Screen name="Registro" component={RegistroPantalla} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  temporal: { flex: 1, backgroundColor: colores.fondo, justifyContent: 'center', alignItems: 'center' },
  texto: { color: colores.tintaSuave, fontSize: 14 },
});