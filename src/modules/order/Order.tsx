import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { useGetShoeBooking } from '../../services/shoe';
import { goBack, navigate } from '../../navigation/utils/navigationUtils';
import ModalOrderSearch from '../../components/ModalOrderSearch';
import { formatCurrencyRoundedToHundred, formatCustomDatetimeV2 } from '../../ultils/validation';
import { getStatusColor, STATUS_BOOKING, getStatusBackground } from '../../ultils';
import { ShoeBooking } from '../../services/shoe/typings';
import { ORDER_STATUS_LABELS } from '../../ultils';

const PAGE_SIZE = 10;

// --- COMPONENT CON CHO MỖI ĐƠN HÀNG ---
const OrderCard = ({ item }: { item: ShoeBooking }) => {
  const isCompleted = item.status === 'completed';

  return (
    <TouchableOpacity onPress={() => navigate('OrderDetail', { orderId: item.orderId, id: item.id })}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconContainer}>
            <Icons.Shoe width={52} height={52} color={Colors.blue} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>{item.shoeService.name}</Text>
            <Text style={styles.serviceLocation}><Icons.Locationdetail /> {item.deliveryAddress}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatCustomDatetimeV2(item.createdAt)}</Text>
            {item.expectedDeliveryTime === 'HOUR_0_24' && <Icons.Clocks width={20} height={20} />}
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {STATUS_BOOKING(item.status)}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            {isCompleted && (
              <TouchableOpacity style={styles.rateButton} onPress={() => navigate('Review', { id: item.id })}>
                <Text style={styles.rateButtonText}>Đánh giá</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- COMPONENT CHÍNH ---
const Orders = () => {
  const { top } = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const { triggerGetShoeBooking } = useGetShoeBooking();
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<{ status?: string; fromDate?: string; toDate?: string }>({});

  // Gọi API để lấy danh sách đơn hàng khi component mount
  const fetchOrders = useCallback(
    async (pageNum = 1,
      isRefresh = false,
      filters?: { status?: string; fromDate?: string; toDate?: string }
    ) => {
      try {
        if (!isRefresh) setLoading(true);
        console.log('===>Date: ', filters,)
        const response = await triggerGetShoeBooking({
          page: pageNum,
          limit: PAGE_SIZE,
          status: filters?.status,
          fromDate: filters?.fromDate,
          toDate: filters?.toDate,
        });
        console.log('===>SHOE BOOKING: ', response.data.data, response);
        const data = response?.data?.data ?? [];
        const total = response?.data?.pagination?.total ?? 0;

        // const sortedData = [...data].sort((a, b) => {
        //   const downStatuses = ['COMPLETED', 'CANCELLED'];
        //   const aDown = downStatuses.includes(a.status);
        //   const bDown = downStatuses.includes(b.status);
        //   if (aDown === bDown) return 0;       // cả hai cùng nhóm -> giữ nguyên
        //   return aDown ? 1 : -1;               // a xuống dưới
        // });

        // setOrders(prev =>
        //   pageNum === 1 ? sortedData : [...prev, ...sortedData]
        // );

        setOrders(prev =>
          pageNum === 1 ? data : [...prev, ...data]
        );
        console.log('===>SHOE BOOKING1: ', orders);
        setHasMore(pageNum * PAGE_SIZE < total);
        setPage(pageNum);
        console.log('===>Page: ', hasMore, pageNum);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [triggerGetShoeBooking]
  );


  useFocusEffect(
    useCallback(() => {
      fetchOrders(1, false, filters);
      return () => {
        setFilters({});
        setActiveFilter('Tất cả');
        setPage(1);
        setOrders([]);
      };
    }, [fetchOrders])
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchOrders(page + 1, false, filters);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(1, true, filters);
  };

  const handleSearch = (searchParams: { status?: string; fromDate?: string; toDate?: string }) => {
    console.log('Search params:', searchParams);
    setFilters(searchParams);          // lưu bộ lọc
    fetchOrders(1, false, searchParams); // gọi API ngay
    setIsSearchModalVisible(false);
  };


  const handleMoreOptionsPress = () => {
    setIsSearchModalVisible(true);
  };

  const filterTabs = ['Tất cả', 'Xe máy', 'Giao hàng', 'Limousine', 'Ô tô'];

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Icons.Backbutton width={28} height={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng</Text>
        <TouchableOpacity onPress={handleMoreOptionsPress}>
          <Icons.Moreoptions width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterButton, activeFilter === tab && styles.activeFilterButton]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterText, activeFilter === tab && styles.activeFilterText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Order List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => <OrderCard item={item} />}
          keyExtractor={(item, index) => item.id ? String(item.id) : `idx-${index}`}
          //refreshing={loading}              // hiển thị spinner khi refresh
          //onRefresh={fetchOrders}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<Text style={styles.listTitle}>Danh sách đơn hàng của bạn</Text>}
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
            )
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loading && !refreshing ? (
              <ActivityIndicator size="small" color={Colors.blue} />
            ) : null
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
      <ModalOrderSearch
        isVisible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onSearch={handleSearch}
        title='Tìm kiếm đơn hàng'
        statusLabels={ORDER_STATUS_LABELS}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: Colors.blue,
  },
  filterText: {
    fontSize: 14,
    color: '#3C3C43',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
  },
  // --- Order Card Styles ---
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  serviceLocation: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#E0F5F5',
  },
  statusInProgress: {
    backgroundColor: '#E6F3FF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  rateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rateButtonText: {
    fontSize: 13,
    color: Colors.blue,
    fontWeight: '600',
  },
  reorderButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.blue,
    borderRadius: 15,
    marginLeft: 8,
  },
  reorderButtonText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
});

export default Orders;