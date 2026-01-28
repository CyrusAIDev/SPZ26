import { useEffect } from "react";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";

import { useSupabase } from "@/hooks/useSupabase";
import { SupabaseProvider } from "@/providers/supabase-provider";

// Only configure splash screen in development builds, not Expo Go
if (Constants.appOwnership !== "expo") {
  SplashScreen.setOptions({
    duration: 500,
    fade: true,
  });
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SupabaseProvider>
      <RootNavigator />
    </SupabaseProvider>
  );
}

function RootNavigator() {
  const { isLoaded, session } = useSupabase();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hide();
    }
  }, [isLoaded]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "none",
        animationDuration: 0,
      }}
    >
      {/* Root index route */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Public routes - accessible without authentication */}
      <Stack.Screen name="invite/[code]" />
      <Stack.Screen name="group/[groupId]" />
      <Stack.Screen name="login" />
      <Stack.Screen name="test-setup" />

      {/* Protected routes - authentication required */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      {/* Public auth screens */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
    </Stack>
  );
}
