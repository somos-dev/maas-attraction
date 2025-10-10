import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  date: Date;
  onSelectDate: () => void;
  onSelectTime: () => void;
}

export default function DateTimeSelector({ date, onSelectDate, onSelectTime }: Props) {
  const theme = useTheme(); // ✅ accedi ai colori del tema

  return (
    <View style={styles.row}>
      {/* Calendario */}
      <TouchableOpacity style={styles.box} onPress={onSelectDate}>
        <Icon
          name="calendar"
          size={20}
          color={theme.colors.onSurface} // ✅ colore adattivo chiaro/scuro
        />
        <Text style={[styles.text, { color: theme.colors.onSurface }]}>
          {date.toLocaleDateString("it-IT")}
        </Text>
      </TouchableOpacity>

      {/* Orologio */}
      <TouchableOpacity style={styles.box} onPress={onSelectTime}>
        <Icon
          name="clock-outline"
          size={20}
          color={theme.colors.onSurface} // ✅ colore adattivo chiaro/scuro
        />
        <Text style={[styles.text, { color: theme.colors.onSurface }]}>
          {date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 8 },
  box: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  text: { marginLeft: 8 },
});
