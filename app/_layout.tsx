import { TemaProvedor } from "../hooks/usar-tema";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <TemaProvedor>
      <Stack screenOptions={{ headerShown: false }} />
    </TemaProvedor>
  );
}