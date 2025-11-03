import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

/**
 * Themed Modal Component
 *
 * Beautiful on-brand modal with teal-green gradient theme
 * Replaces system Alert popups with custom branded dialogs
 */
export function ThemedModal({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
}) {
  const theme = useTheme();

  const handleButtonPress = (button) => {
    if (button.haptic !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss && button.dismissOnPress !== false) {
      onDismiss();
    }
  };

  const getButtonStyle = (button) => {
    if (button.style === "cancel") {
      return {
        backgroundColor: theme.colors.glass,
        borderColor: theme.colors.border,
        borderWidth: 1,
      };
    } else if (button.style === "destructive") {
      return {
        backgroundColor: theme.colors.danger,
      };
    } else {
      // Default style with brand gradient
      return {
        backgroundColor: "transparent",
      };
    }
  };

  const getButtonTextColor = (button) => {
    if (button.style === "cancel") {
      return theme.colors.text;
    } else if (button.style === "destructive") {
      return "#FFFFFF";
    } else {
      return "#FFFFFF";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={20}
          tint={theme.isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDismiss}
        />

        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.glassThick,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Title */}
          {title && (
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontWeight: theme.typography.weights.title,
                },
              ]}
            >
              {title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text
              style={[
                styles.message,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => {
              const isDefaultButton = !button.style || button.style === "default";

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  style={[styles.button, getButtonStyle(button)]}
                  activeOpacity={0.8}
                >
                  {isDefaultButton ? (
                    <LinearGradient
                      colors={[theme.colors.brandGradientStart, theme.colors.brandGradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            color: getButtonTextColor(button),
                            fontWeight: theme.typography.weights.title,
                          },
                        ]}
                      >
                        {button.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: getButtonTextColor(button),
                          fontWeight: theme.typography.weights.label,
                        },
                      ]}
                    >
                      {button.text}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
});
