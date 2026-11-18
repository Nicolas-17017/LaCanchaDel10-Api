import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton, Campo, MensajeError } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import type { AuthStackParams } from '../navegacion/tipos';
import { colores } from '../tema';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export default function LoginPantalla({ navigation }: Props) {
  const { iniciarSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function ingresar() {
    setError(null);
    if (!correo.trim() || !contrasena) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setCargando(true);
    try {
      await iniciarSesion(correo.trim(), contrasena);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.marca}>
            <Text style={estilos.logo}>
              LACANCHA<Text style={estilos.logoAcento}>DEL10</Text>
            </Text>
            <Text style={estilos.eslogan}>Tu cancha, tu partido, tu momento.</Text>
          </View>

          <Text style={estilos.titulo}>Bienvenido de nuevo</Text>

          {error ? <MensajeError mensaje={error} /> : null}

          <Campo
            etiqueta="Correo electrónico"
            value={correo}
            onChangeText={setCorreo}
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Campo
            etiqueta="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Tu contraseña"
            secureTextEntry
            onSubmitEditing={ingresar}
          />

          <Boton titulo="Iniciar sesión" onPress={ingresar} cargando={cargando} estilo={{ marginTop: 8 }} />

          <View style={estilos.pie}>
            <Text style={estilos.textoPie}>¿No tienes cuenta? </Text>
            <Text style={estilos.enlace} onPress={() => navigation.navigate('Registro')}>
              Regístrate
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 26 },
  marca: { marginBottom: 36 },
  logo: { fontSize: 26, fontWeight: '800', color: colores.navy, letterSpacing: -0.5 },
  logoAcento: { color: colores.primario },
  eslogan: { fontSize: 13, color: colores.tintaSuave, marginTop: 4 },
  titulo: { fontSize: 24, fontWeight: '800', color: colores.tinta, marginBottom: 20 },
  pie: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  textoPie: { color: colores.tintaSuave, fontSize: 14 },
  enlace: { color: colores.primarioOscuro, fontSize: 14, fontWeight: '700' },
});