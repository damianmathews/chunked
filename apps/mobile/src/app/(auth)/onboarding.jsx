import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnboardingScreen() {
  const theme = useTheme();
  const [handicap, setHandicap] = useState("");
  const [homeCourse, setHomeCourse] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");

  const saveUserDataAndComplete = async () => {
    try {
      // Save user data
      const userData = {
        handicap,
        homeCourse,
        yearsPlaying,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem("user_profile", JSON.stringify(userData));

      // Mark onboarding as complete
      await AsyncStorage.setItem("onboarding_complete", "true");

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving user data:", error);
      // Still navigate even if save fails
      router.replace("/(tabs)");
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement Google Sign In
    console.log("Google Sign In");
    await saveUserDataAndComplete();
  };

  const handleTwitterSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement X (Twitter) Sign In
    console.log("Twitter Sign In");
    await saveUserDataAndComplete();
  };

  const handleEmailSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to email/password screen
    console.log("Email Sign In");
    await saveUserDataAndComplete();
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await saveUserDataAndComplete();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require("../../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.tagline,
              {
                color: theme.colors.textSecondary,
                fontWeight: theme.typography.weights.body,
              },
            ]}
          >
            Track your game. Master your shots.
          </Text>
        </View>

        {/* Golf Info Section */}
        <View
          style={[
            styles.infoSection,
            {
              backgroundColor: theme.colors.glassThick,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontWeight: theme.typography.weights.title,
              },
            ]}
          >
            Tell us about your game
          </Text>

          {/* Handicap Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: theme.colors.textSecondary,
                  fontWeight: theme.typography.weights.label,
                },
              ]}
            >
              Handicap Index
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g., 12.5"
              placeholderTextColor={theme.colors.placeholder}
              value={handicap}
              onChangeText={setHandicap}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Home Course Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: theme.colors.textSecondary,
                  fontWeight: theme.typography.weights.label,
                },
              ]}
            >
              Home Course (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Your favorite course"
              placeholderTextColor={theme.colors.placeholder}
              value={homeCourse}
              onChangeText={setHomeCourse}
            />
          </View>

          {/* Years Playing Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: theme.colors.textSecondary,
                  fontWeight: theme.typography.weights.label,
                },
              ]}
            >
              Years Playing (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g., 5"
              placeholderTextColor={theme.colors.placeholder}
              value={yearsPlaying}
              onChangeText={setYearsPlaying}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Authentication Section */}
        <View style={styles.authSection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontWeight: theme.typography.weights.title,
              },
            ]}
          >
            Sign up to save your data
          </Text>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            style={[
              styles.authButton,
              {
                backgroundColor: theme.colors.glassThick,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={22} color="#DB4437" />
            <Text
              style={[
                styles.authButtonText,
                {
                  color: theme.colors.text,
                  fontWeight: theme.typography.weights.label,
                },
              ]}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* X (Twitter) Sign In */}
          <TouchableOpacity
            onPress={handleTwitterSignIn}
            style={[
              styles.authButton,
              {
                backgroundColor: theme.colors.glassThick,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="logo-twitter"
              size={22}
              color={theme.isDark ? "#1DA1F2" : "#000000"}
            />
            <Text
              style={[
                styles.authButtonText,
                {
                  color: theme.colors.text,
                  fontWeight: theme.typography.weights.label,
                },
              ]}
            >
              Continue with X
            </Text>
          </TouchableOpacity>

          {/* Email Sign In */}
          <TouchableOpacity
            onPress={handleEmailSignIn}
            style={[
              styles.authButton,
              {
                backgroundColor: theme.colors.glassThick,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="mail-outline"
              size={22}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.authButtonText,
                {
                  color: theme.colors.text,
                  fontWeight: theme.typography.weights.label,
                },
              ]}
            >
              Continue with Email
            </Text>
          </TouchableOpacity>

          {/* Skip for now */}
          <TouchableOpacity onPress={handleContinue} style={styles.skipButton}>
            <Text
              style={[
                styles.skipText,
                {
                  color: theme.colors.textSecondary,
                  fontWeight: theme.typography.weights.body,
                },
              ]}
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButtonContainer}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[
              theme.colors.brandGradientStart,
              theme.colors.brandGradientEnd,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text
              style={[
                styles.continueButtonText,
                { fontWeight: theme.typography.weights.title },
              ]}
            >
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
  },
  infoSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  authSection: {
    marginBottom: 24,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  authButtonText: {
    fontSize: 16,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  skipText: {
    fontSize: 15,
  },
  continueButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
