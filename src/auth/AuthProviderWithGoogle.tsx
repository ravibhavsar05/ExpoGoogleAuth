import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

type User = {
  email?: string;
  name?: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProviderWithGoogle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [, , promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const signIn = async () => {
    try {
      setIsLoading(true);

      const result = await promptAsync();
      if (result?.type !== "success") {
        console.log("Login cancelled");
        return;
      }
      if (result?.type === "success") {
        const token = result.authentication?.accessToken;
        setToken(token ?? null);
        const res = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setUser({
          email: data.email,
          name: data.name,
          picture: data.picture,
        });
      }
    } catch (error) {
      console.log("Google Login Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
  
      if (token) {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${token}`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/x-www-form-urlencoded",
            },
          }
        );
      }
  
      setUser(null);
      setToken(null);
    } catch (error) {
      console.log("Google Logout Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,

        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProviderWithGoogle");
  }

  return context;
};