import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Icons } from '../../assets';
import { Colors } from '../../assets/Colors';
import { useUserStore } from '../../states/user';
import { navigate } from '../../navigation/utils/navigationUtils';
import { useGetWalletBalance } from '../../services/wallet';
import { SocketService, SHOE_BOOKING_UPDATE_STATUS, SocketEvent } from '../../services/socket';
import { FlatListProps } from 'react-native/Libraries/Lists/FlatList';
import { useGetAddress } from '../../services/address';
import { styles } from './styles';
import ModalSelectBranch from '../../components/ModalSelectBranch';
import SuccessModal from '../../components/SuccessModal';
import { Order } from '../../services/shoe/typings';
import HeaderHome from '../../components/HeaderHome';
import { formatCurrencyRoundedToHundred, formatCustomDatetimeV2 } from '../../ultils/validation';
import { useRejectShoeBooking } from '../../services/shoe';
import CancelModal from '../../components/CancelModal';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;

const OrderCard = ({ item, onAccept, onReject }: { item: Order; onAccept: (order: Order) => void; onReject: (order: Order) => void; }) => {
  const { triggerRejectShoeBooking } = useRejectShoeBooking();

  const handlePressItem = () => {
    console.log('===>Item: ', item);
    navigate('AcceptDetail', { item });
  };

  const handleReject = async (shoeBookingId: string) => {
    await triggerRejectShoeBooking({ id: shoeBookingId });
  }

  return (
    <TouchableOpacity onPress={handlePressItem}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconContainer}>
            <Icons.Shoe width={scale(40)} height={scale(40)} color={Colors.blue} />
          </View>

          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>{item.name || 'Dịch vụ giày'}</Text>

            <View style={styles.row}>

              <Text style={styles.serviceLocation} numberOfLines={1} ellipsizeMode="tail">Mô tả: {item.shoeServiceDes}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.serviceLocation} numberOfLines={1} ellipsizeMode="tail">Giá Tiền: {formatCurrencyRoundedToHundred(item.finalPrice)}</Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatCustomDatetimeV2(item.bookingTime)}</Text>
            {item.expectedDeliveryTime === 'HOUR_0_24' && (
              <View style={styles.clockWrapper}>
                <Icons.Clocks width={30} height={30} />   
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => onReject(item)}>
            <Text style={styles.rejectText}>Không nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(item)}>
            <Text style={styles.acceptText}>Nhận đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Home = () => {
  const { token } = useUserStore(state => state);
  const { triggerGetWalletBalance } = useGetWalletBalance();
  const { triggerGetAddress } = useGetAddress();
  const { triggerRejectShoeBooking } = useRejectShoeBooking();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successType, setSuccessType] = useState<'accept' | 'reject'>('accept');

  const socket = SocketService.getInstance(token);

  const handleAcceptOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowBranchModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    setShowCancelModal(false);
    await triggerRejectShoeBooking({ id: selectedOrder.shoeBookingId });
    setSuccessType('reject');
    setShowSuccess(true);
  };

  const handleRejectPress = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  useEffect(() => {
    triggerGetWalletBalance();

    socket.on('connect', () => console.log('✅ Socket connected'));
    socket.on('disconnect', (reason: any) => console.log('❌ Socket disconnected:', reason));
    socket.on('connect_error', (err: any) => console.error('⚠️ Socket connect_error:', err.message));

    const handleShoeBookingUpdate = (payload: Order) => {
      console.log('[socket] shoe_booking_update payload:', payload);

      setOrders(prev => {
        const exists = prev.some(o => o.shoeBookingId === payload.shoeBookingId);
        const status = (payload.status || '').toLowerCase();
        if (status === 'customer-cancelled') {
          console.log('🗑 Lắng nghe huỷ đơn, xoá:', payload.shoeBookingId);
          const next = prev.filter(
            o => o.shoeBookingId.trim() !== String(payload.shoeBookingId).trim()
          );
          console.log('✅ After filter:', next.map(o => o.shoeBookingId));
          return next;
        }

        const newOrderStatuses = [
          SHOE_BOOKING_UPDATE_STATUS.FIND_SHOP,
          SHOE_BOOKING_UPDATE_STATUS.FIND_DRIVER,
          SHOE_BOOKING_UPDATE_STATUS.DRIVER_NOTIFIED,
          SHOE_BOOKING_UPDATE_STATUS.CANCELLED,
        ];

        if (newOrderStatuses.includes(payload.status)) {
          return exists
            ? prev.map(o =>
              o.shoeBookingId === payload.shoeBookingId ? payload : o
            )
            : [payload, ...prev];
        }
        return exists
          ? prev.map(o =>
            o.shoeBookingId === payload.shoeBookingId
              ? { ...o, status: payload.status }
              : o
          )
          : prev;
      });
    };

    socket.on(SocketEvent.SHOE_BOOKING_UPDATE, handleShoeBookingUpdate);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off(SocketEvent.SHOE_BOOKING_UPDATE);
    };
  }, [triggerGetWalletBalance, token, socket]);

  const handleRefresh = () => {
    setRefreshing(true);
    setOrders([]);
    setRefreshing(false);
  };

  const getItemLayout: FlatListProps<Order>['getItemLayout'] = (_, index) => ({
    length: scale(120),
    offset: scale(120) * index,
    index,
  });

  return (
    <SafeAreaView style={styles.container}>
      <HeaderHome />
      <Text style={styles.sectionTitle}>Danh sách đơn hàng đề xuất</Text>
      <FlatList
        data={orders}
        key={orders.map(o => o.shoeBookingId).join(',')}
        removeClippedSubviews={false}
        keyExtractor={(item) => item.shoeBookingId}
        extraData={orders}
        renderItem={({ item }) => (
          <OrderCard item={item} onAccept={handleAcceptOrder} onReject={handleRejectPress} />
        )}
        contentContainerStyle={{ paddingBottom: scale(100) }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng đề xuất</Text>}
        getItemLayout={getItemLayout}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <ModalSelectBranch
        visible={showBranchModal}
        order={selectedOrder}
        onClose={() => setShowBranchModal(false)}
        onConfirm={(order, branch) => {
          console.log('✅ Xác nhận nhận đơn:', order, branch);
          setShowBranchModal(false);
          setSuccessType('accept');
          setShowSuccess(true);
        }}
      />

      title={successType === 'accept' ? 'Đã nhận đơn' : 'Đã từ chối đơn'}
      message={
        successType === 'accept'
          ? 'Bạn đã nhận đơn thành công'
          : 'Bạn đã từ chối đơn thành công'
      }
      <CancelModal
        visible={showCancelModal}
        message="Bạn có chắc chắn muốn huỷ đơn hàng?"
        textBtn="Xác nhận"
        onClose={() => setShowCancelModal(false)}
        onContinue={handleConfirmCancel}
      />
      <SuccessModal
        visible={showSuccess}
        title='Từ chối thành công'
        message='Bạn đã từ chối đơn hàng thành công'
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

export default Home;
