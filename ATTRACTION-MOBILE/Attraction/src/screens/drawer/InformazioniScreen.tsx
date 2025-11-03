import React from 'react';
import {View, StyleSheet, ScrollView, Image} from 'react-native';
import {Text, useTheme, Divider, Surface} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function InformazioniScreen() {
  const theme = useTheme();

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 50,
        }}>
        {/* Logo header */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo/Attraction.scritta.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Titolo e icona */}
        <View style={styles.header}>
          <Text
            style={[styles.subtitle, {color: theme.colors.onSurfaceVariant}]}>
            Analisi dei flussi di mobilità e sviluppo di un prototipo MaaS
          </Text>
        </View>

        <Divider style={{marginVertical: 16}} />

        {/* Descrizione progetto */}
        <Text style={[styles.paragraph, {color: theme.colors.onBackground}]}>
          La proposta si basa sull'analisi e l'utilizzo di big data
          socioeconomici e di mobilità, raccolti da fonti sia pubbliche che
          private. L'obiettivo principale è sviluppare un prototipo per un
          sistema di orientamento della domanda di mobilità, implementato in un
          MaaS (Mobility as a Service) che garantisca la sostenibilità degli
          spostamenti urbani ed extraurbani.
        </Text>

        <Text style={[styles.paragraph, {color: theme.colors.onBackground}]}>
          Attraverso l'analisi origine-destinazione dei flussi di mobilità, il
          progetto mira a individuare soluzioni di mobilità ottimali,
          utilizzando servizi di sharing mobility, trasporto pubblico e
          micromobilità.
        </Text>

        <Text style={[styles.paragraph, {color: theme.colors.onBackground}]}>
          La proposta traguarda anche all’ottimizzazione della fruibilità degli
          spazi urbani, migliorando l'accessibilità ai servizi, riducendo i
          conflitti di mobilità e promuovendo l'inclusione sociale. Viene
          orientata la domanda su vettori con costi medi nettamente più bassi
          rispetto al mezzo privato, favorendo la compatibilità ambientale con
          l’impiego di veicoli elettrici (EV) alternativi a ICE.
        </Text>

        <Text style={[styles.paragraph, {color: theme.colors.onBackground}]}>
          Il progetto affronta anche il tema della resilienza dei territori,
          concentrandosi sulla gestione delle emergenze e sull'ottimizzazione
          dei percorsi di esodo in caso di eventi catastrofici. Fornisce inoltre
          agli operatori informazioni in tempo reale sulle condizioni delle
          infrastrutture di trasporto.
        </Text>

        <Text style={[styles.paragraph, {color: theme.colors.onBackground}]}>
          L’intero sviluppo segue un approccio di design thinking, sperimentato
          inizialmente all’interno del campus universitario.
        </Text>

        {/* Partenariato */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Partenariato
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            • Università della Calabria – organismo di ricerca{'\n'}• JAKALA
            CIVITAS S.p.A. – grande impresa{'\n'}• SOMOS S.r.l. – media impresa
          </Text>
        </Surface>

        {/* Funzionalità app */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Funzionalità dell’app
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            L’app consente di pianificare spostamenti sostenibili, confrontando
            diverse soluzioni di trasporto pubblico, sharing mobility e
            micromobilità.{'\n\n'}
            Include inoltre informazioni sui percorsi, la disponibilità dei
            mezzi condivisi e la possibilità di valutare l’impatto ambientale
            dei viaggi effettuati.
          </Text>
        </Surface>

        {/* Stato prototipale */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Versione prototipale
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            Questa versione dell’app è un prototipo sperimentale in fase di test
            interni. Alcune funzionalità e interfacce potrebbero subire
            modifiche durante le successive fasi di sviluppo.
          </Text>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 280,
    height: 90,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
