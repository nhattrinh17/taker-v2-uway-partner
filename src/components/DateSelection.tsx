import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Colors } from '../assets/Colors';
import { Icons } from '../assets';

interface DateSelectionProps {
  onDateChange: (year: string) => void;
  defaultDate?: string | null; // dạng "YYYY"
  label?: string;
}

const DateSelection: React.FC<DateSelectionProps> = ({
  onDateChange,
  defaultDate,
  label = 'Năm hoạt động',
}) => {
  // State mặc định: nếu có defaultDate dạng YYYY thì set về 01-01-YYYY
  const [date, setDate] = useState(
    defaultDate ? new Date(`${defaultDate}-01-01`) : new Date('1995-01-01')
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (defaultDate) {
      setDate(new Date(`${defaultDate}-01-01`));
    }
  }, [defaultDate]);

  const handleConfirm = (selectedDate: Date) => {
    setOpen(false);
    setDate(selectedDate);
    // chỉ lấy năm
    const year = selectedDate.getFullYear().toString();
    onDateChange(year);
  };

  const displayYear = defaultDate
    ? defaultDate
    : 'Chọn năm hoạt động';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.inputBox} onPress={() => setOpen(true)}>
        <Icons.DateTime />
        <Text style={[styles.inputText, !defaultDate && styles.placeholderText]}>
          {displayYear}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"                 // vẫn là date nhưng chỉ hiển thị năm
        locale="vi"
        // Giới hạn năm
        maximumDate={new Date('2010-12-31')}
        minimumDate={new Date('1945-01-01')}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        theme="light"
        buttonColor={Colors.blue}
        confirmText="Xác nhận"
        cancelText="Huỷ"
        title="Chọn năm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 14,
    color: '#000000B2',
    marginBottom: 8,
  },
  inputBox: {
    height: 48,
    borderColor: '#0000001A',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  placeholderText: {
    color: '#999',
  },
});

export default DateSelection;
