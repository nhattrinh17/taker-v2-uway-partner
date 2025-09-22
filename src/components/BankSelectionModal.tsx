import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { dataBankStatics } from '../ultils/bank';
import { Colors } from '../assets/Colors';

interface BankSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectBank: (bank: any) => void;
  selectedBankName?: string;  // thêm prop này
}

const BankSelectionModal = ({
  isVisible,
  onClose,
  onSelectBank,
  selectedBankName,
}: BankSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setSearchTerm('');
    }
  }, [isVisible]);

  const filteredBanks = React.useMemo(
    () =>
      dataBankStatics.filter(
        bank =>
          bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.shortName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

const handleSelect = (bank: any) => {
  if (selectedBankName === bank.name) {
    // Nếu đang chọn ngân hàng này -> bỏ chọn
    onSelectBank(null);
  } else {
    // Chọn ngân hàng mới
    onSelectBank(bank);
  }
  setSearchTerm('');
  onClose();
};


  const handleClearSelection = () => {
    onSelectBank(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.bankModalContainer}>
        <Text style={styles.bankModalTitle}>Chọn ngân hàng</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
          <Text style={styles.clearButtonText}>Xóa lựa chọn</Text>
        </TouchableOpacity>
        <FlatList
          data={filteredBanks}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedBankName === item.name; // check item đang chọn
            return (
              <TouchableOpacity
                style={[styles.bankItem, isSelected && styles.bankItemSelected]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.bankName}>{`${item.shortName} - ${item.code}`}</Text>
                <Text style={styles.bankFullName}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bankModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 8,
    paddingBottom: 20,
  },
  bankModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  searchInput: {
    height: 48,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    color: Colors.textPrimary,
  },
  bankItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankItemSelected: {
    borderWidth: 2,
    borderColor: Colors.primary, // màu xanh chính
    borderRadius: 12,
    backgroundColor: '#E6F4FF', // nền nhẹ để nổi bật (optional)
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bankFullName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    marginBottom: 12,
  },
  clearButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
export default BankSelectionModal;