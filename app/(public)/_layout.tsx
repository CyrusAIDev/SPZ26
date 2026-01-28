import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function PublicLayout() {
  return (
    <Stack initialRouteName="welcome">
      <Stack.Screen
        name="welcome"
        options={{
          title: "Welcome",
          headerTransparent: Platform.OS === "ios",
        }}
      />
    </Stack>
  );
}
