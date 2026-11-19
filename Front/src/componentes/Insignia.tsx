import { StyleSheet, Text, View } from 'react-native';

type Props = { texto: string; color: string; fondo: string };

export default function Insignia({ texto, color, fondo }: Props) {
  return (
    <View style={[estilos.caja, { backgroundColor: fondo }]}>
      <Text style={[estilos.texto, { color }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  texto: { fontSize: 12, fontWeight: '700' },
});