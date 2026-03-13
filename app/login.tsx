import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/auth/AuthProviderWithGoogle";

export default function SignIn() {
  const { signIn,signOut, user, isLoading } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="shield-account"
              size={48}
              color="#0a7ea4"
            />
          </View>
          <Text style={styles.title}>
            {user ? "You're signed in" : "Welcome back"}
          </Text>
          <Text style={styles.subtitle}>
            {user
              ? `${user.email ?? user.name ?? "Signed in with Google"}`
              : "Sign in with your Google account to continue"}
          </Text>
        </View>

        {user ? ( <Pressable
    onPress={signOut}
    style={({ pressed }) => [
      styles.button,
      styles.buttonOutline,
      pressed && styles.buttonPressed,
    ]}
  >
    <Text style={styles.buttonLabelOutline}>Sign Out</Text>
  </Pressable>) : (
          <Pressable
            onPress={signIn}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="google"
                  size={22}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonLabel}>Sign in with Google</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 260,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#dc2626",
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLabelOutline: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
