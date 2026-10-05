import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CoresTipo } from '../constantes/cores';
import { BOTOES_AJUDA, ROTULOS, TopicoAjuda } from '../constantes/mensagens';
import { VozTipo } from '../hooks/usar-fala';

type PainelAjudaTipo = {
  cores: CoresTipo;
  vozes: VozTipo[];
  vozAtual: VozTipo | null;
  velocidade: number;
  aoEscolherTopico: (topico: TopicoAjuda) => void;
  aoTrocarVoz: () => void;
  aoTrocarVelocidade: () => void;
};

export function PainelAjuda({
  cores,
  vozes,
  vozAtual,
  velocidade,
  aoEscolherTopico,
  aoTrocarVoz,
  aoTrocarVelocidade,
}: PainelAjudaTipo) {
  return (
    <View style={[styles.painel, { backgroundColor: cores.primaria }]}>
      {BOTOES_AJUDA.map((topico) => (
        <Pressable
          key={topico}
          style={[styles.botao, { backgroundColor: cores.fundo, borderColor: cores.borda }]}
          onPress={() => aoEscolherTopico(topico)}
          accessibilityRole="button"
          accessibilityLabel={ROTULOS[topico]}
        >
          <Text style={[styles.botaoTexto, { color: cores.texto }]}>{ROTULOS[topico]}</Text>
        </Pressable>
      ))}

      {vozes.length > 1 && (
        <Pressable
          style={[styles.botao, styles.botaoAudio, { backgroundColor: cores.fundo, borderColor: cores.borda }]}
          onPress={aoTrocarVoz}
          accessibilityRole="button"
          accessibilityLabel={`Trocar voz. Voz atual: ${vozAtual?.nome || 'padrão'}`}
        >
          <Text style={[styles.botaoTexto, { color: cores.texto }]}>Voz</Text>
          <Text style={[styles.botaoValor, { color: cores.texto }]} numberOfLines={1}>
            {vozAtual?.nome || 'Padrão'}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.botao, styles.botaoAudio, { backgroundColor: cores.fundo, borderColor: cores.borda }]}
        onPress={aoTrocarVelocidade}
        accessibilityRole="button"
        accessibilityLabel={`Velocidade da fala: ${velocidade.toFixed(1).replace('.', ',')} vezes`}
      >
        <Text style={[styles.botaoTexto, { color: cores.texto }]}>Velocidade</Text>
        <Text style={[styles.botaoValor, { color: cores.texto }]}>
          {velocidade.toFixed(1).replace('.', ',')}×
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  painel: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botao: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  botaoAudio: {
    maxWidth: 190,
    gap: 2,
  },
  botaoValor: {
    fontSize: 13,
  },
});
