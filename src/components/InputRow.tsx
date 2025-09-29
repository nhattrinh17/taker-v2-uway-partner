import React from "react";
import { View, Text, TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "../assets/Colors";

interface InputRowProps {
  label: string;
  value?: string | null;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  editable?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  placeholder?: string;
}

const InputRow: React.FC<InputRowProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
  onFocus,
  onBlur,
  keyboardType = 'default',
  maxLength,
  error = '',
  icon,
  placeholder,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputBox, error ? { borderColor: 'red' } : {}]}>
      {icon && <View style={styles.inputIconContainer}>{icon}</View>}
      <TextInput
        style={styles.input}
        value={value || ''}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default InputRow;

const styles = StyleSheet.create({
    inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#000000B2', marginBottom: 8, fontWeight: '500' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: Colors.background,
    borderColor: '#0000001A',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 11,
  },
  inputIconContainer: { marginRight: 12 },
  input: { flex: 1, fontSize: 13, color: Colors.textPrimary },
   errorText: { color: 'red', fontSize: 12, marginTop: 5, marginLeft: 5 },
});