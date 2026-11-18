import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton, Campo, Chip, MensajeError } from '../componentes/ui';
import { useAuth } from '../contexto/AuthContexto';
import type { AuthStackParams } from '../navegacion/tipos';
import { colores } from '../tema';
import type { TipoUsuario } from '../tipos';

type Props = NativeStackScreenProps<AuthStackParams, 'Registro'>;

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistroPantalla({ navigation }: Props) {
  const { registrar } = useAuth();
  const [tipo, setTipo] = useState<TipoUsuario>('Cliente');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    if (!nombre.trim()) nuevos.nombre = 'Escribe tu nombre.';
    if (!CORREO_VALIDO.test(correo.trim())) nuevos.correo = 'Escribe un correo válido.';
    if (contrasena.length < 6) nuevos.contrasena = 'Mínimo 6 caracteres.';
    if (confirmacion !== contrasena) nuevos.confirmacion = 'Las contraseñas no coinciden.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function crearCuenta() {
    setErrorGeneral(null);
    if (!validar()) return;
    setCargando(true);
    try {
      await registrar({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasena,
        telefono: telefono.trim() || undefined,
        tipoUsuario: tipo,
      });
    } catch (e) {
      setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear la cuenta.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo}>Crear cuenta</Text>
          <Text style={estilos.subtitulo}>Reserva canchas o administra las tuyas.</Text>

          <Text style={estilos.etiquetaSeccion}>¿Cómo vas a usar la app?</Text>
          <View style={estilos.fila}>
            <Chip texto="Quiero reservar" activo={tipo === 'Cliente'} onPress={() => setTipo('Cliente')} />
            <Chip texto="Administro canchas" activo={tipo === 'Propietario'} onPress={() => setTipo('Propietario')} />
          </View>

          {errorGeneral ? <MensajeError mensaje={errorGeneral} /> : null}

          <Campo
            etiqueta="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nicolas Zapata"
            autoCapitalize="words"
            error={errores.nombre}
          />
          <Campo
            etiqueta="Correo electrónico"
            value={correo}
            onChangeText={setCorreo}
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            error={errores.correo}
          />
          <Campo
            etiqueta="Teléfono (opcional)"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="3001234567"
            keyboardType="phone-pad"
          />
          <Campo
            etiqueta="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errores.contrasena}
          />
          <Campo
            etiqueta="Confirmar contraseña"
            value={confirmacion}
            onChangeText={setConfirmacion}
            placeholder="Repite la contraseña"
            secureTextEntry
            error={errores.confirmacion}
          />

          <Boton titulo="Crear cuenta" onPress={crearCuenta} cargando={cargando} estilo={{ marginTop: 8 }} />

          <View style={estilos.pie}>
            <Text style={estilos.textoPie}>¿Ya tienes cuenta? </Text>
            <Text style={estilos.enlace} onPress={() => navigation.goBack()}>
              Inicia sesión
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: { padding: 26, paddingTop: 36 },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.tinta },
  subtitulo: { fontSize: 14, color: colores.tintaSuave, marginTop: 4, marginBottom: 22 },
  etiquetaSeccion: { fontSize: 12, fontWeight: '600', color: colores.tintaSuave, marginBottom: 8 },
  fila: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  pie: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
  textoPie: { color: colores.tintaSuave, fontSize: 14 },
  enlace: { color: colores.primarioOscuro, fontSize: 14, fontWeight: '700' },
});