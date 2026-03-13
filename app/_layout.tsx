import { Stack } from "expo-router";
import { AuthProviderWithGoogle } from "../src/auth/AuthProviderWithGoogle";

export default function RootLayout() {
  return (
    <AuthProviderWithGoogle>
      <Stack />
    </AuthProviderWithGoogle>
  );
}