import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, useTheme, Divider, Surface} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PrivacyScreen() {
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
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name="shield-check-outline"
            size={48}
            color={theme.colors.primary}
            style={{marginBottom: 8}}
          />
          <Text style={[styles.title, {color: theme.colors.onBackground}]}>
            Informativa sulla Privacy
          </Text>
          <Text
            style={[styles.subtitle, {color: theme.colors.onSurfaceVariant}]}>
            Tutela dei dati personali e trattamento delle informazioni
          </Text>
        </View>

        <Divider style={{marginVertical: 16}} />

        {/* Introduzione */}
        <Text style={[styles.paragraph, {color: theme.colors.onBackground}]}>
          La presente informativa descrive le modalità di trattamento dei dati
          personali raccolti e gestiti nell’ambito dell’applicazione
          sperimentale *Attraction*.
        </Text>

        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Titolare del trattamento
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            SOMOS S.r.l.{'\n'}
            Piazza Vermicelli c/o TechNest{'\n'}
            87036 Rende (CS), Italia{'\n'}
            Email: info@somos.srl
          </Text>
        </Surface>

        {/* Finalità del trattamento */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Finalità del trattamento
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            I dati personali eventualmente raccolti attraverso l’app sono
            trattati esclusivamente per finalità di ricerca e sperimentazione
            nell’ambito del progetto *Attraction*, volto allo sviluppo di un
            sistema MaaS (Mobility as a Service) per la pianificazione di
            spostamenti sostenibili.
          </Text>
        </Surface>

        {/* Tipologia di dati trattati */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Tipologia di dati trattati
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            L’app può trattare dati relativi alle preferenze di viaggio, alla
            posizione geografica (solo se espressamente autorizzata
            dall’utente), e a informazioni anonime o pseudonimizzate relative
            all’utilizzo dei servizi offerti.
          </Text>
        </Surface>

        {/* Modalità e sicurezza del trattamento */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Modalità e sicurezza del trattamento
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            I dati sono trattati nel pieno rispetto dei principi di liceità,
            correttezza, trasparenza, minimizzazione e integrità, secondo il
            Regolamento (UE) 2016/679 (GDPR).{'\n\n'}
            Tutte le informazioni vengono archiviate in modo sicuro su server di
            sviluppo localizzati all’interno dell’Unione Europea e accessibili
            solo da personale autorizzato.
          </Text>
        </Surface>

        {/* Conservazione ed eliminazione dei dati */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Conservazione ed eliminazione dei dati
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            I dati raccolti saranno conservati esclusivamente per il periodo
            necessario alla sperimentazione tecnica dell’app e verranno
            integralmente eliminati al termine della fase di test o su richiesta
            dell’utente.
          </Text>
        </Surface>

        {/* Diritti dell’utente */}
        <Surface style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.cardTitle, {color: theme.colors.primary}]}>
            Diritti dell’utente
          </Text>
          <Text style={[styles.cardText, {color: theme.colors.onSurface}]}>
            L’utente può esercitare in qualsiasi momento i diritti previsti
            dagli articoli 15-22 del GDPR, tra cui: accesso ai dati, rettifica,
            cancellazione, limitazione del trattamento, opposizione e
            portabilità dei dati.{'\n\n'}
            Le richieste possono essere inviate a: info@somos.srl
          </Text>
        </Surface>

        {/* Versione e note finali */}
        <Text
          style={[
            styles.note,
            {color: theme.colors.onSurfaceVariant, textAlign: 'center'},
          ]}>
          Ultimo aggiornamento: Ottobre 2025{'\n'}
          Questa informativa potrà essere soggetta a revisioni in seguito a
          modifiche legislative o aggiornamenti tecnici del progetto.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  note: {
    fontSize: 12,
    marginTop: 8,
  },
});
