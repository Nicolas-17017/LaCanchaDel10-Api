import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProveedor } from './src/contexto/AuthContexto';
import Navegacion from './src/navegacion/Navegacion';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProveedor>
        <StatusBar style="dark" />
        <Navegacion />
      </AuthProveedor>
    </SafeAreaProvider>
  );
}