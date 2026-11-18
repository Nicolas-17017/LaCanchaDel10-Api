import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colores, radio } from '../tema';



type NombreIcono = ComponentProps<typeof Ionicons>['name'];



type VarianteBoton = 'primario' | 'secundario' | 'peligro';

interface BotonProps {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBoton;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

export function Boton({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  estilo,
}: BotonProps) {
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.boton,
        estilosBoton[variante],
        inactivo && estilos.inactivo,
        pressed && estilos.presionado,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={estilosTextoBoton[variante].color} />
      ) : (
        <Text style={[estilos.textoBoton, estilosTextoBoton[variante]]}>{titulo}</Text>
      )}
    </Pressable>
  );
}



interface CampoProps extends TextInputProps {
  etiqueta: string;
  error?: string;
}

export function Campo({ etiqueta, error, style, ...resto }: CampoProps) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor="#9AA7BC"
        autoCapitalize="none"
        {...resto}
        style={[estilos.entrada, error ? estilos.entradaError : null, style]}
      />
      {error ? <Text style={estilos.textoError}>{error}</Text> : null}
    </View>
  );
}



export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.chipActivo]}>
      <Text style={[estilos.textoChip, activo && estilos.textoChipActivo]}>{texto}</Text>
    </Pressable>
  );
}



type TonoInsignia = 'verde' | 'aviso' | 'peligro' | 'neutro';

export function Insignia({ texto, tono = 'neutro' }: { texto: string; tono?: TonoInsignia }) {
  return (
    <View style={[estilos.insignia, estilosInsignia[tono].caja]}>
      <Text style={[estilos.textoInsignia, estilosInsignia[tono].texto]}>{texto}</Text>
    </View>
  );
}



export function Tarjeta({ children, estilo }: { children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.tarjeta, estilo]}>{children}</View>;
}

// ---------- Estados: cargando, vacío y error ----------

export function Cargando() {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
    </View>
  );
}

export function EstadoVacio({
  icono = 'football-outline',
  titulo,
  detalle,
}: {
  icono?: NombreIcono;
  titulo: string;
  detalle?: string;
}) {
  return (
    <View style={estilos.centro}>
      <View style={estilos.circuloIcono}>
        <Ionicons name={icono} size={30} color={colores.primarioOscuro} />
      </View>
      <Text style={estilos.tituloVacio}>{titulo}</Text>
      {detalle ? <Text style={estilos.detalleVacio}>{detalle}</Text> : null}
    </View>
  );
}

export function MensajeError({ mensaje }: { mensaje: string }) {
  return (
    <View style={estilos.cajaError}>
      <Ionicons name="alert-circle-outline" size={18} color={colores.peligro} />
      <Text style={estilos.textoCajaError}>{mensaje}</Text>
    </View>
  );
}

// ---------- Estilos ----------

const estilos = StyleSheet.create({
  boton: {
    minHeight: 50,
    borderRadius: radio.medio,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: { fontSize: 15, fontWeight: '700' },
  inactivo: { opacity: 0.55 },
  presionado: { opacity: 0.85 },

  campo: { marginBottom: 14 },
  etiqueta: { fontSize: 12, fontWeight: '600', color: colores.tintaSuave, marginBottom: 6 },
  entrada: {
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: '#FBFCFE',
    borderRadius: radio.medio,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colores.tinta,
  },
  entradaError: { borderColor: colores.peligro },
  textoError: { color: colores.peligro, fontSize: 12, marginTop: 4 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.3,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  chipActivo: { backgroundColor: colores.navy, borderColor: colores.navy },
  textoChip: { fontSize: 13, fontWeight: '600', color: colores.tintaSuave },
  textoChipActivo: { color: '#FFFFFF' },

  insignia: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start' },
  textoInsignia: { fontSize: 11, fontWeight: '700' },

  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.grande,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
  },

  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  circuloIcono: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colores.primarioClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  tituloVacio: { fontSize: 17, fontWeight: '700', color: colores.tinta, textAlign: 'center' },
  detalleVacio: { fontSize: 14, color: colores.tintaSuave, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colores.peligroClaro,
    borderRadius: radio.medio,
    padding: 12,
    marginBottom: 14,
  },
  textoCajaError: { flex: 1, color: colores.peligro, fontSize: 13, lineHeight: 18 },
});

const estilosBoton: Record<VarianteBoton, ViewStyle> = {
  primario: { backgroundColor: colores.primario },
  secundario: { backgroundColor: colores.superficie, borderWidth: 1.5, borderColor: colores.borde },
  peligro: { backgroundColor: colores.peligroClaro },
};

const estilosTextoBoton: Record<VarianteBoton, { color: string }> = {
  primario: { color: '#04241A' },
  secundario: { color: colores.tinta },
  peligro: { color: colores.peligro },
};

const estilosInsignia: Record<TonoInsignia, { caja: ViewStyle; texto: { color: string } }> = {
  verde: { caja: { backgroundColor: colores.primarioClaro }, texto: { color: colores.primarioOscuro } },
  aviso: { caja: { backgroundColor: colores.avisoClaro }, texto: { color: colores.aviso } },
  peligro: { caja: { backgroundColor: colores.peligroClaro }, texto: { color: colores.peligro } },
  neutro: { caja: { backgroundColor: '#EEF1F6' }, texto: { color: colores.tintaSuave } },
};