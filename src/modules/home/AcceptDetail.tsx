import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Icons } from '../../assets';
import { Colors } from '../../assets/Colors';
import { Images } from '../../assets/Images';
import { RouteProp } from '@react-navigation/native';
import Header from '../../components/Header';
import ModalSelectBranch from '../../components/ModalSelectBranch';
import SuccessModal from '../../components/SuccessModal';
import { formatCustomDatetimeV2, formatCurrencyRoundedToHundred } from '../../ultils/validation';
import { convertTime } from '../../ultils';
import { Order } from '../../services/shoe/typings';
import { s3Url } from '../../services/APIConfig';
import { goBack } from '../../navigation/utils/navigationUtils';
import { useRejectShoeBooking } from '../../services/shoe';
import CancelModal from '../../components/CancelModal';
import ViewImageModal from '../../components/ViewImageModal';
import { scale } from '../../ultils';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  route: RouteProp<{
    AcceptDetail: {
      item: Order;
      onAccepted?: (id: string) => void;
      onRejected?: (id: string) => void; // thêm vào
    };
  }, 'AcceptDetail'>;
};

const AcceptDetail = ({ route }: Props) => {
  const { item } = route.params;               // chỉ cần item
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { triggerRejectShoeBooking } = useRejectShoeBooking();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [successType, setSuccessType] = useState<'accept' | 'reject'>('accept');

  // Khi chọn chi nhánh và bấm "Nhận đơn"
  const handleConfirmBranch = (order: Order, branch: any) => {
    console.log('✅ Xác nhận nhận đơn:', order, branch);
    route.params?.onAccepted?.(order.shoeBookingId);
    setShowBranchModal(false);
    setSuccessType('accept');
    setShowSuccess(true);
  };

  const parseImages = (images: string | string[] | null | undefined): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try {
      return JSON.parse(images);
    } catch (e) {
      console.error('Parse processingImages failed:', e);
      return [];
    }
  };

  const handleRejectPress = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    await triggerRejectShoeBooking({ id: item.shoeBookingId });
    route.params?.onRejected?.(item.shoeBookingId);
    setShowCancelModal(false);
    setSuccessType('reject');
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="Chi tiết đơn hàng" />

        {/* Order Timing and Details */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionLabel}>Thông tin chi tiết đơn hàng</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>{formatCustomDatetimeV2(item.bookingTime)}</Text>
          </View>
        </View>

        {/* Service and Amount */}
        <View style={styles.serviceSection}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIcon}>
              <Icons.Shoe width={scale(34)} height={scale(34)} />
            </View>
            <View style={styles.serviceText}>
              <Text style={styles.serviceLabel}>Dịch vụ đánh giày</Text>
              <Text style={styles.serviceAmount}>{item.shoeServiceName}</Text>
            </View>
            <Text style={styles.serviceNote}>{formatCurrencyRoundedToHundred(item.finalPrice)}</Text>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionLabel}>Thông tin đơn hàng</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>Thời gian đặt</Text>
            <Text style={styles.detailValue}>{formatCustomDatetimeV2(item.bookingTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>Thời gian dự kiến</Text>
            <Text style={styles.detailValue}>
              {convertTime(item.expectedDeliveryTime, item.bookingTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>Mô tả: {item.shoeServiceDes}</Text>
          </View>
        </View>

        {/* Images */}
        <View style={styles.processingImagesGrid}>
          {parseImages(item.imageUrls).length > 0 ? (
            <ViewImageModal
              images={parseImages(item.imageUrls).map(img => `${s3Url}${img}`)}
            />
          ) : (
            <Text style={styles.emptyText}>Khách hàng chưa thêm ảnh</Text>
          )}
        </View>

        {/* Fee Breakdown */}
        <View style={styles.feeSection}>
          <View style={styles.feeRow}>
            <Text style={styles.sectionLabel}>Thu nhập dự kiến</Text>
          </View>
          {/* <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Cước phí</Text>
          <Text style={styles.feeValue}>{formatCurrencyRoundedToHundred(item.finalPrice)}</Text>
        </View> */}
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Tổng tiền</Text>
            <Text style={styles.feeValue}>{formatCurrencyRoundedToHundred(item.finalPrice)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleRejectPress(item)}>
            <Text style={styles.cancelText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => setShowBranchModal(true)} // mở modal chọn chi nhánh
          >
            <Text style={styles.acceptText}>Nhận đơn</Text>
          </TouchableOpacity>
        </View>

        <ModalSelectBranch
          visible={showBranchModal}
          order={item}
          onClose={() => setShowBranchModal(false)}
          onConfirm={handleConfirmBranch}
        />

        <SuccessModal
          visible={showSuccess}
          onClose={() => {
            setShowSuccess(false)
            goBack()
          }}
          title={successType === 'accept' ? 'Đã nhận đơn' : 'Đã huỷ đơn'}
          message={successType === 'accept'
            ? 'Bạn đã nhận đơn thành công'
            : 'Bạn đã từ chối đơn thành công'}
        />

        <CancelModal
          visible={showCancelModal}
          message="Bạn có chắc chắn muốn huỷ đơn hàng?"
          textBtn="Xác nhận"
          onClose={() => setShowCancelModal(false)}
          onContinue={handleConfirmCancel}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default AcceptDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  detailSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
  },
  sectionLabel: { fontSize: scale(16), fontWeight: '600', marginBottom: scale(8) },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(4) },
  detailText: { fontSize: scale(14), color: '#555' },
  detailValue: { fontSize: scale(14), color: '#000', fontWeight: '500' },
  processingImagesGrid: {
    backgroundColor: 'white',
    alignItems: 'center',
  },
  processingImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: 8,
    marginBottom: 12
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  serviceSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
    borderRadius: scale(20),
  },
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(8) },
  serviceIcon: {
    backgroundColor: '#e0f0ff',
    borderRadius: scale(30),
    padding: scale(8),
    marginRight: scale(12),
  },
  serviceText: { flex: 1 },
  serviceLabel: { fontSize: scale(16), fontWeight: '600', color: '#333' },
  serviceAmount: { fontSize: scale(12), color: '#777', marginTop: scale(6) },
  serviceNote: { fontSize: scale(14), color: '#0B96DF', fontWeight: '600' },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
  },
  image: { width: scale(120), height: scale(120) },
  feeSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(8) },
  feeLabel: { fontSize: scale(14), color: '#555' },
  feeValue: { fontSize: scale(14), color: '#000', fontWeight: '500' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: scale(16),
    backgroundColor: Colors.background,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelButton: {
    backgroundColor: '#C82023',
    paddingVertical: scale(12),
    paddingHorizontal: scale(50),
    borderRadius: scale(24),
  },
  cancelText: { fontSize: scale(16), color: '#fff' },
  acceptButton: {
    backgroundColor: '#0B96FD',
    paddingVertical: scale(12),
    paddingHorizontal: scale(50),
    borderRadius: scale(24),
  },
  acceptText: { fontSize: scale(16), color: '#fff' },
});
