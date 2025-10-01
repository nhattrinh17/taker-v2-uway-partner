import React, { useState, useCallback } from 'react';
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
import { formatCustomDatetimeV2 } from '../../ultils/validation';
import { getStatusColor, STATUS_BOOKING, getStatusBackground } from '../../ultils';
import { ShoeBooking } from '../../services/shoe/typings';
import { ORDER_STATUS_LABELS } from '../../ultils';

const PAGE_SIZE = 10;

// --- COMPONENT CON HIỂN THỊ MỖI ĐƠN ---
const OrderCard = ({ item }: { item: ShoeBooking }) => (
  <TouchableOpacity onPress={() => navigate('OrderDetail', { orderId: item.orderId, id: item.id })}>
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceIconContainer}>
          <Icons.Shoe width={52} height={52} color={Colors.blue} />
        </View>
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceTitle} >{item.shoeService.name}</Text>
          <Text style={styles.serviceLocation}>
            <Icons.Locationdetail /> {item.deliveryAddress}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatCustomDatetimeV2(item.createdAt)}</Text>
          {item.expectedDeliveryTime === 'HOUR_0_24' && <Icons.Clocks width={25} height={25} />}
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {STATUS_BOOKING(item.status)}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// --- COMPONENT CHÍNH ---
const Orders = () => {
  const { top } = useSafeAreaInsets();
  const { triggerGetShoeBooking } = useGetShoeBooking();

  const [orders, setOrders] = useState<ShoeBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<{ status?: string; fromDate?: string; toDate?: string }>({});
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);


  // gọi API
  const fetchOrders = useCallback(
    async (
      pageNum = 1,
      isRefresh = false,
      customFilters?: { status?: string; fromDate?: string; toDate?: string }
    ) => {
      try {
        if (pageNum === 1) setLoading(true);
        if (pageNum > 1) setLoadingMore(true);

        const params: any = { page: pageNum, limit: PAGE_SIZE };
        const f = customFilters ?? filters;
        if (f.status) params.status = f.status;
        if (f.fromDate) params.fromDate = f.fromDate;
        if (f.toDate) params.toDate = f.toDate;

        const response = await triggerGetShoeBooking(params);
        const data: ShoeBooking[] = response?.data?.data ?? [];
        const total = response?.data?.pagination?.total ?? 0;

        setOrders(prev =>
          pageNum === 1
            ? data
            : [...prev, ...data].filter(
              (v, i, arr) => arr.findIndex(x => x.id === v.id) === i
            )
        );
        setHasMore(pageNum * PAGE_SIZE < total);
        setPage(pageNum);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [triggerGetShoeBooking, filters]
  );

  // fetch lần đầu khi focus màn hình
  useFocusEffect(
    useCallback(() => {
      fetchOrders(1, false);
    }, [fetchOrders])
  );

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchOrders(page + 1, false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(1, true);
  };

  const handleSearch = (searchParams: { status?: string; fromDate?: string; toDate?: string }) => {
    setFilters(searchParams);
    fetchOrders(1, false, searchParams);
    setIsSearchModalVisible(false);
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
        <TouchableOpacity onPress={() => setIsSearchModalVisible(true)}>
          <Icons.Moreoptions width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterButton, activeFilter === tab && styles.activeFilterButton]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text style={[styles.filterText, activeFilter === tab && styles.activeFilterText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!loading && !error && orders.length > 0 && (
        <Text style={styles.listTitle}>Danh sách đơn hàng của bạn</Text>
      )}


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
          keyExtractor={(item, index) => (item.id ? String(item.id) : `idx-${index}`)}
          contentContainerStyle={styles.listContainer}
          //ListHeaderComponent={<Text style={styles.listTitle}>Danh sách đơn hàng của bạn</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng nào.</Text>}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color={Colors.blue} /> : null
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <ModalOrderSearch
        isVisible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onSearch={handleSearch}
        title="Tìm kiếm đơn hàng"
        statusLabels={ORDER_STATUS_LABELS}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: Colors.background,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  filterContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: Colors.background },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    height: 36,
  },
  activeFilterButton: { backgroundColor: Colors.blue },
  filterText: { fontSize: 14, color: '#3C3C43' },
  activeFilterText: { color: 'white', fontWeight: '600' },
  listContainer: { padding: 16 },
  listTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E', marginBottom: 16, paddingHorizontal: 16, paddingTop: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#FF3B30' },
  emptyText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 20 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceDetails: { flex: 1 },
  serviceTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  serviceLocation: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  timeContainer: { alignItems: 'flex-end' },
  timeText: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
});

export default Orders;