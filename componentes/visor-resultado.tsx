import { StyleSheet, Text, View } from 'react-native';
import { CoresTipo } from '../constantes/cores';
import { ResultadoProcessamento } from '../funcoes/logica';

type VisorResultadoTipo = {
  cores: CoresTipo;
  resultado: ResultadoProcessamento | null;
};

export function VisorResultado({ cores, resultado }: VisorResultadoTipo) {
  const texto =
    resultado?.tipo === 'conta' || resultado?.tipo === 'temperatura' || resultado?.tipo === 'conversao'
      ? `${resultado.expressao} = ${resultado.resultado}${resultado.unidadeSaida ? ` ${resultado.unidadeSaida}` : ''}`
      : resultado?.mensagem || '';

  return (
    <View style={[styles.visor, { backgroundColor: cores.fundo, borderColor: cores.texto }]}>
      <Text style={[styles.rotulo, { color: cores.texto }]}>Resultado:</Text>
      <Text
        style={[
          resultado?.tipo === 'ajuda' ? styles.textoMenor : styles.texto,
          { color: cores.texto },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  visor: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    minHeight: 80,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  texto: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  textoMenor: {
    fontSize: 16,
    lineHeight: 22,
  },
});
