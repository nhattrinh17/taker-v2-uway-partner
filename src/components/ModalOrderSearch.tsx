import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActionSheetIOS,
  FlatList,
} from 'react-native';
import { Colors } from '../assets/Colors';
import { Icons } from '../assets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';

interface ModalOrderSearchProps {
  isVisible: boolean;
  onClose: () => void;
  statusLabels: Record<string, string>;
  title: string;
  onSearch: (filters: { status: string; fromDate: string; toDate: string }) => void;
}

const ModalOrderSearch = ({
  isVisible,
  onClose,
  onSearch,
  title,
  statusLabels,
}: ModalOrderSearchProps) => {
  const { top } = useSafeAreaInsets();
  const [status, setStatus] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [openPicker, setOpenPicker] = useState<null | 'start' | 'end'>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [dateError, setDateError] = useState('');

  const statusKeys = Object.keys(statusLabels);

  const handleSelectStatus = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...statusKeys.map((k) => statusLabels[k]), 'Hủy'],
          cancelButtonIndex: statusKeys.length,
          title: 'Chọn trạng thái',
        },
        (buttonIndex) => {
          if (buttonIndex < statusKeys.length) {
            const selectedKey = statusKeys[buttonIndex];
            setStatus((prev) => (prev === selectedKey ? '' : selectedKey));
          }
        },
      );
    } else {
      setShowStatusModal(true);
    }
  };

  const handleClose = () => {
    setStatus('');
    setFromDate(null);
    setToDate(null);
    setDateError('');
    setShowStatusModal(false);
    onClose();
  };

  // Validate logic ngày
  const validateDates = (from: Date | null, to: Date | null) => {
    if ((from && !to) || (!from && to)) {
      return 'Vui lòng nhập cả Từ ngày và Đến ngày';
    }
    if (from && to && from > to) {
      return 'Ngày bắt đầu không được lớn hơn ngày kết thúc';
    }

    // Check fromDate <= today
    if (from) {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (from > endOfToday) {
        return 'Ngày bắt đầu không được lớn hơn ngày hiện tại';
      }
    }

    // Check toDate <= today
    if (to) {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (to > endOfToday) {
        return 'Ngày kết thúc không được lớn hơn ngày hiện tại';
      }
    }
    return '';
  };

  const handleFromDateConfirm = (date: Date) => {
    setFromDate(date);
    setDateError(validateDates(date, toDate));
    setOpenPicker(null);
  };

  const handleToDateConfirm = (date: Date) => {
    setToDate(date);
    setDateError(validateDates(fromDate, date));
    setOpenPicker(null);
  };

  const handleSearch = () => {
    if (dateError) return;
    onSearch({
      status,
      fromDate: fromDate
        ? new Date(fromDate.setHours(0, 0, 0, 0)).toISOString()
        : '',
      toDate: toDate
        ? new Date(toDate.setHours(23, 59, 59, 999)).toISOString()
        : '',
    });
    handleClose();
  };

  const isSearchDisabled = !!dateError;

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { marginTop: top + 40 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icons.DeleteCircle width={22} height={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Trạng thái đơn hàng */}
          <Text style={styles.label}>Trạng thái đơn hàng</Text>
          <TouchableOpacity style={styles.selectContainer} onPress={handleSelectStatus}>
            <Text style={status ? styles.selectText : styles.selectPlaceholder}>
              {status ? statusLabels[status] : 'Chọn trạng thái'}
            </Text>
            <Icons.DownArrow width={18} height={18} color={Colors.gray} />
          </TouchableOpacity>

          {/* Thời gian */}
          <Text style={[styles.label, { marginTop: 16 }]}>Thời gian</Text>
          <View style={styles.dateGroup}>
            <TouchableOpacity style={styles.dateItem} onPress={() => setOpenPicker('start')}>
              <Icons.Date width={40} height={40} color={Colors.blue} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.dateLabel}>Từ ngày</Text>
                <Text style={styles.dateValue}>
                  {fromDate ? fromDate.toLocaleDateString() : 'DD/MM/YYYY'}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.dateItem} onPress={() => setOpenPicker('end')}>
              <Icons.Date width={40} height={40} color={Colors.blue} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.dateLabel}>Đến ngày</Text>
                <Text style={styles.dateValue}>
                  {toDate ? toDate.toLocaleDateString() : 'DD/MM/YYYY'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

          {/* Search button */}
          <TouchableOpacity
            style={[styles.searchButton, isSearchDisabled && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isSearchDisabled}
          >
            <Text style={styles.searchText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date pickers */}
      <DatePicker
        modal
        mode="date"
        open={openPicker === 'start'}
        date={fromDate || new Date()}
        onConfirm={handleFromDateConfirm}
        onCancel={() => setOpenPicker(null)}
      />
      <DatePicker
        modal
        mode="date"
        open={openPicker === 'end'}
        date={toDate || new Date()}
        onConfirm={handleToDateConfirm}
        onCancel={() => setOpenPicker(null)}
      />

      {/* Android Status Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <FlatList
              data={statusKeys}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.statusItem}
                  onPress={() => {
                    setStatus((prev) => (prev === item ? '' : item));
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={styles.statusText}>{statusLabels[item]}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowStatusModal(false)} style={styles.cancelBtn}>
              <Text style={{ color: Colors.red }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: Colors.gray,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  dateGroup: {
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginHorizontal: 12,
  },
  searchButton: {
    backgroundColor: Colors.blue,
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: Colors.grayLight,
    opacity: 0.6,
  },
  searchText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  statusModal: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    width: '80%',
  },
  statusItem: {
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  cancelBtn: {
    marginTop: 10,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    marginHorizontal: 12,
    marginBottom: 8,
  },
});

export default ModalOrderSearch;
