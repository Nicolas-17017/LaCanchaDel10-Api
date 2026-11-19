import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colores } from '../tema';

type Props = TextInputProps & { etiqueta: string };

export default function Campo({ etiqueta, style, ...resto }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor="#9AA4B2"
        style={[estilos.entrada, style]}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { fontSize: 12, fontWeight: '600', color: colores.tintaSuave, marginBottom: 6 },
  entrada: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E3E8EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colores.tinta,
  },
});