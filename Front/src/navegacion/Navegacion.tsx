import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Cargando } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import { marca } from '../estilo';
import ConfirmacionPantalla from '../pantallas/ConfirmacionPantalla';
import DetalleCanchaPantalla from '../pantallas/DetalleCanchaPantalla';
import FormCanchaPantalla from '../pantallas/FormCanchaPantalla';
import FormEstablecimientoPantalla from '../pantallas/FormEstablecimientoPantalla';
import FormHorarioPantalla from '../pantallas/FormHorarioPantalla';
import InicioPantalla from '../pantallas/InicioPantalla';
import LoginPantalla from '../pantallas/LoginPantalla';
import MiNegocioPantalla from '../pantallas/MiNegocioPantalla';
import MisReservasPantalla from '../pantallas/MisReservasPantalla';
import PerfilPantalla from '../pantallas/PerfilPantalla';
import RegistroPantalla from '../pantallas/RegistroPantalla';
import ReservasCanchaPantalla from '../pantallas/ReservasCanchaPantalla';
import { colores } from '../tema';
import type { AppStackParams, AuthStackParams, PestanasParams } from './tipos';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const AppStack = createNativeStackNavigator<AppStackParams>();
const Tab = createBottomTabNavigator<PestanasParams>();

type NombreIcono = keyof typeof Ionicons.glyphMap;

const iconos: Record<keyof PestanasParams, { activo: NombreIcono; inactivo: NombreIcono }> = {
  Inicio: { activo: 'football', inactivo: 'football-outline' },
  MisReservas: { activo: 'calendar', inactivo: 'calendar-outline' },
  MiNegocio: { activo: 'storefront', inactivo: 'storefront-outline' },
  Perfil: { activo: 'person', inactivo: 'person-outline' },
};

const opcionesEncabezado = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: marca.fondo },
  headerTintColor: colores.tinta,
  headerTitleStyle: { fontWeight: '800' as const, fontSize: 18 },
  contentStyle: { backgroundColor: marca.fondo },
};

function Pestanas() {
  const { usuario } = useAuth();
  const esPropietario = usuario?.tipoUsuario === 'Propietario';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: marca.verde,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: {
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#0B1B2B',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? iconos[route.name].activo : iconos[route.name].inactivo}
            size={size + 2}
            color={color}
          />
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

export default function Navegacion() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Cargando />;

  return (
    <NavigationContainer>
      {usuario ? (
        <AppStack.Navigator screenOptions={opcionesEncabezado}>
          <AppStack.Screen name="Pestanas" component={Pestanas} options={{ headerShown: false }} />
          <AppStack.Screen
            name="DetalleCancha"
            component={DetalleCanchaPantalla}
            options={{ title: 'Reservar cancha' }}
          />
          <AppStack.Screen
            name="Confirmacion"
            component={ConfirmacionPantalla}
            options={{ title: 'Reserva', headerBackVisible: false }}
          />
          <AppStack.Screen
            name="FormEstablecimiento"
            component={FormEstablecimientoPantalla}
            options={{ title: 'Nuevo establecimiento' }}
          />
          <AppStack.Screen
            name="FormCancha"
            component={FormCanchaPantalla}
            options={({ route }) => ({ title: route.params.cancha ? 'Editar cancha' : 'Nueva cancha' })}
          />
          <AppStack.Screen
            name="FormHorario"
            component={FormHorarioPantalla}
            options={({ route }) => ({ title: `Horarios · ${route.params.nombreCancha}` })}
          />
          <AppStack.Screen
            name="ReservasCancha"
            component={ReservasCanchaPantalla}
            options={({ route }) => ({ title: `Reservas · ${route.params.nombreCancha}` })}
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