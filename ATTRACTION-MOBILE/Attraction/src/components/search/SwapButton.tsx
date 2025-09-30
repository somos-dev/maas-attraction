import React from "react";
import { IconButton } from "react-native-paper";

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export default function SwapButton({ onPress, disabled }: Props) {
  return (
    <IconButton
      icon="swap-vertical"
      size={28}
      onPress={onPress}
      disabled={disabled}
      style={{ alignSelf: "center" }}
    />
  );
}
