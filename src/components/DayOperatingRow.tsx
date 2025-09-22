import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icons } from '../assets';

interface Props {
  label: string;
  value?: { open: string; close: string } | null;
  onChange: (val: { open: string; close: string }) => void;
}

export default function DayOperatingRow({ label, value, onChange }: Props) {
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const format = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.timeBox}
        onPress={() => setShowOpen(true)}>
        <Text>{value?.open || '--:--'}</Text>
      </TouchableOpacity>

      <Text style={{ marginHorizontal: 6 }}>–</Text>

      <TouchableOpacity
        style={styles.timeBox}
        onPress={() => setShowClose(true)}>
        <Text>{value?.close || '--:--'}</Text>
      </TouchableOpacity>

      {showOpen && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          is24Hour
          onChange={(_, date) => {
            setShowOpen(false);
            if (date) onChange({ open: format(date), close: value?.close || '' });
          }}
        />
      )}

      {showClose && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          is24Hour
          onChange={(_, date) => {
            setShowClose(false);
            if (date) onChange({ open: value?.open || '', close: format(date) });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { width: 90, fontWeight: '500' },
  timeBox: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
