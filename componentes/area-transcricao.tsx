import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CoresTipo } from '../constantes/cores';

type AreaTranscricaoTipo = {
  cores: CoresTipo;
  ouvindo: boolean;
  editando: boolean;
  textoExibicao: string;
  textoLegenda: string;
  textoDigitado: string;
  aoDigitado: (texto: string) => void;
  aoEnviar: () => void;
  aoEditar: () => void;
  aoSairDaEdicao: () => void;
};

export function AreaTranscricao({
  cores,
  ouvindo,
  editando,
  textoExibicao,
  textoLegenda,
  textoDigitado,
  aoDigitado,
  aoEnviar,
  aoEditar,
  aoSairDaEdicao,
}: AreaTranscricaoTipo) {
  return (
    <View style={[styles.area, { backgroundColor: cores.secundaria }]}>
      <Text style={[styles.rotulo, { color: cores.textoInvertido }]}>Escutando usuário:</Text>
      {ouvindo ? (
        <Text style={[styles.texto, { color: cores.textoInvertido }]}>
          "{textoExibicao || '...'}"
        </Text>
      ) : editando ? (
        <TextInput
          style={[
            styles.entrada,
            { color: cores.textoInvertido, borderBottomColor: cores.textoInvertidoSuave },
          ]}
          placeholder="Conta ou conversão de temperatura..."
          placeholderTextColor={cores.textoInvertidoSuave}
          value={textoDigitado}
          onChangeText={aoDigitado}
          onSubmitEditing={aoEnviar}
          onBlur={aoSairDaEdicao}
          autoFocus
          returnKeyType="send"
        />
      ) : (
        <Pressable onPress={aoEditar}>
          <Text style={[styles.texto, { color: cores.textoInvertido }]}>
            "{textoLegenda || 'Pressione o microfone para gravar e solte quando terminar'}"
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  texto: {
    fontSize: 20,
    fontStyle: 'italic',
  },
  entrada: {
    fontSize: 20,
    fontStyle: 'italic',
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
});
