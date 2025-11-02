import { Tabs } from "expo-router";
import { BookOpen, Plus, User } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.glassThick,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 84 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 12,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: theme.typography.weights.label,
          marginBottom: 6,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="new-round"
        options={{
          title: "New Round",
          tabBarIcon: ({ color, size }) => <Plus color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar - accessed via Profile
        }}
      />
    </Tabs>
  );
}
