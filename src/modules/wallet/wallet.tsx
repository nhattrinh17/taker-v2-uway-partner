import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootNavigatorParamList } from '../../navigation/typings';
import { useGetWalletBalance, useGetWalletHistory } from '../../services/wallet';
import { useUserStore } from '../../states/user';
import { extractTime, convertToDate, truncateString } from '../../ultils/validation';
import { Fonts } from '../../assets';
import { Colors } from '../../assets/Colors';
import { Images } from '../../assets/Images';
import { ImageBackground } from 'react-native';
import { formatCurrency, TRANSACTION_STATUS, WALLET_STATUS_LABELS, TRANSACTION_STATUS_COLOR } from '../../ultils';
import CommonText from '../../components/CommonText';
import FancyWaveLoading from '../../components/FancyWaveLoading';
import { goBack, navigate } from '../../navigation/utils/navigationUtils';
import { Icons } from '../../assets';
import ModalOrderSearch from '../../components/ModalOrderSearch';

interface Transaction {
  id: string;
  transactionType: 'WITHDRAW' | 'DEPOSIT';
  description: string;
  transactionDate: string;
  amount: number;
  status: string;
}

const TransactionItem = ({ item, isLastItem }: { item: Transaction; isLastItem: boolean }) => {
  const isDeposit = item.transactionType === 'DEPOSIT';
  const navigation = useNavigation<NativeStackNavigationProp<RootNavigatorParamList>>();

  return (
    <TouchableOpacity
      style={[styles.rowItem, isLastItem && styles.rowItemLast]}
      onPress={() => navigation.navigate('TransactionDetail', { item })}
      activeOpacity={0.8}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowLeftHeader}>
          {/* Icon theo loại giao dịch */}
          {isDeposit ? (
            <Icons.Deposit width={18} height={18} style={styles.typeIcon} />
          ) : (
            <Icons.Withdraw width={18} height={18} style={styles.typeIcon} />
          )}
          <CommonText text={truncateString(item.description)} styles={styles.titleItem} />
        </View>
        <CommonText
          text={`${extractTime(item.transactionDate)}, ${convertToDate(item.transactionDate)}`}
          styles={styles.dateItem}
        />
      </View>

      <View style={styles.rowRight}>
        <CommonText
          text={`${isDeposit ? '+' : '-'}${formatCurrency(item.amount)} đ`}
          styles={[styles.amountItem, isDeposit ? styles.amountPos : styles.amountNeg]}
        />
        <CommonText text={TRANSACTION_STATUS(item.status)} styles={[styles.statusItem, { color: TRANSACTION_STATUS_COLOR(item.status) }]} />
      </View>
    </TouchableOpacity>
  );
};

const Wallet = () => {
  const { user, balance, setBalance } = useUserStore(state => state);
  const { triggerGetWalletBalance } = useGetWalletBalance();
  const { triggerGetWalletHistory } = useGetWalletHistory();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');

  // refs to avoid concurrent/duplicate fetches
  const isFetchingRef = useRef(false);
  const lastFetchPageRef = useRef<number | null>(null);
  const lastFetchAtRef = useRef<number | null>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const getBalance = async () => {
    try {
      const res = await triggerGetWalletBalance();
      setBalance(res.data);
    } catch (err) {
      setError('Không thể tải số dư. Vui lòng thử lại.');
    }
  };

  const getHistoryTransaction = async (pageToFetch = page, extraFilters = filters) => {
    try {
      if (isFetchingRef.current) {
        return;
      }
      if (pageToFetch !== 1 && total <= transactions.length) {
        return;
      }

      const now = Date.now();
      if (
        lastFetchPageRef.current === pageToFetch &&
        lastFetchAtRef.current &&
        now - lastFetchAtRef.current < 800
      ) {
        return;
      }

      lastFetchPageRef.current = pageToFetch;
      lastFetchAtRef.current = now;

      isFetchingRef.current = true;
      setLoadingList(true);

      const res = await triggerGetWalletHistory({
        page: pageToFetch,
        limit: 10,
        status: extraFilters.status || undefined,
        startDate: extraFilters.startDate || undefined,
        endDate: extraFilters.endDate || undefined,
      });
      console.log('==History: ', res);

      const newData: Transaction[] = res.data?.data ?? [];
      const totalFromApi = res.data?.pagination?.total ?? (pageToFetch === 1 ? newData.length : total);
      setTotal(totalFromApi);

      if (pageToFetch === 1) {
        setTransactions(newData);
      } else {
        setTransactions(prev => {
          const filtered = newData.filter(nd => !prev.some(p => p.id === nd.id));
          return [...prev, ...filtered];
        });
      }
    } catch (err) {
      console.error('[Wallet] getHistoryTransaction error', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
    } finally {
      isFetchingRef.current = false;
      setLoadingList(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getHistoryTransaction(1, filters);
    setRefreshing(false);
  };

  const handleSearch = ({
    status,
    fromDate,
    toDate,
  }: { status?: string; fromDate?: string; toDate?: string }) => {
    // map sang tên field API cần
    setFilters({
      status,
      startDate: fromDate,
      endDate: toDate,
    });
    setPage(1);                 // reset về trang 1
    setTransactions([]);        // xoá list cũ
    getHistoryTransaction(1, {
      status,
      startDate: fromDate,
      endDate: toDate,
    });
    setIsSearchModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      setTransactions([]);
      setPage(1);
      getBalance();
      getHistoryTransaction(1);
    }, [])
  );

  useEffect(() => {
    if (page > 1) {
      getHistoryTransaction(page);
    }
  }, [page]);

  const handleLoadMore = () => {
    // ensure not currently loading and still has more data
    if (!loadingList && !isFetchingRef.current && total > transactions.length) {
      setPage(prev => prev + 1);
    }
  };

  const renderEmpty = () => (
    <View style={styles.wrapperEmpty}>
      {Icons.NoticeEmpty ? <Icons.NoticeEmpty /> : <Text>Icon</Text>}
      <CommonText text="Chưa có dữ liệu" styles={styles.emptyLabel} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSearchModalVisible(true)} style={styles.headerIcon} activeOpacity={0.8}>
          {Icons.Moreoptions ? <Icons.Moreoptions /> : <Text>{'<'} </Text>}
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tài khoản</Text>

        <TouchableOpacity onPress={() => navigate('InCome')} style={styles.headerRight} activeOpacity={0.8}>
          <Text style={styles.headerAction}>Thu nhập</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet card */}
      <ImageBackground
        source={Images.walletbackground}
        style={styles.walletCard}
        imageStyle={styles.walletBgImage}
      >
        {/* Hàng trên: trái (ví + balance) – phải (username) */}
        <View style={styles.walletTopRow}>
          {/* Cột trái */}
          <View style={{ flexShrink: 1 }}>
            <CommonText text="Ví Uway" styles={styles.labelWalletBox} />
            <View style={styles.balanceRow}>
              <Text style={styles.labelAmount}>
                {formatCurrency(balance || 0)} <Text style={styles.balanceUnit}>đ</Text>
              </Text>
            </View>
          </View>

          {/* Cột phải */}
          <Text
            style={styles.username}
            numberOfLines={1} // tránh tràn
            ellipsizeMode="tail"
          >
            {(user?.name || 'USER').toUpperCase()}
          </Text>
        </View>

        {/* Hàng dưới: 2 nút */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { marginRight: 8 }]}
            onPress={() => navigate('Deposit')}
            activeOpacity={0.85}
          >
            <Text style={styles.textBtn}>Nạp tiền     </Text>
            <Icons.Deposit />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { marginLeft: 8 }]}
            onPress={() => navigate('WithDraw')}
            activeOpacity={0.85}
          >
            <Text style={styles.textBtn}>Rút tiền     </Text>
            <Icons.Withdraw />
          </TouchableOpacity>
        </View>
      </ImageBackground>


      {/* Error */}
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* History */}
      {transactions.length > 0 && <CommonText text="Lịch sử giao dịch" styles={styles.labelHistory} />}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TransactionItem item={item} isLastItem={index === transactions.length - 1} />
        )}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={loadingList ? <FancyWaveLoading /> : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <ModalOrderSearch
        title="Tìm kiếm lịch sử"
        statusLabels={WALLET_STATUS_LABELS}
        isVisible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onSearch={handleSearch}
      />
    </SafeAreaView>
  );
};

// ... styles unchanged (copy from your original)
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: Colors.black,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  headerRight: { width: 70, alignItems: 'flex-end' },
  headerAction: {
    fontSize: 16,
    color: Colors.blue,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },

  // Wallet card
  walletCard: {
    margin: 16,
    padding: 28,
    backgroundColor: Colors.blue,
    borderRadius: 18,
    height: 220,
  },
  walletBgImage: {
    borderRadius: 16,          // bo góc ảnh nền
    resizeMode: 'cover',       // hoặc 'stretch' tùy ý
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    gap: 25,
  },
  actionBtn: {
    flex: 1,                      // chia đều 2 nút
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderRadius: 22,
  },
  walletTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWalletBox: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  labelAmount: {
    fontSize: 28,
    color: Colors.white,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  balanceUnit: {
    color: Colors.white,
    fontSize: 28,
    marginLeft: 0,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },
  btnDeposit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  textBtn: {
    color: Colors.blue,
    marginLeft: 6,
    fontSize: 14,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  username: {
    marginTop: 0,
    color: Colors.white,
    fontSize: 24,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },

  // Titles
  labelHistory: {
    fontSize: 16,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
    color: Colors.black,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  rowItemLast: {
    borderBottomWidth: 0,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 6, // khoảng cách giữa icon và chữ
  },
  rowRight: { alignItems: 'flex-end' },

  titleItem: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  dateItem: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.gray,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },
  amountItem: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  amountPos: { color: 'green' },
  amountNeg: { color: 'red' },
  statusItem: {
    fontSize: 12,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },

  // Empty & errors
  wrapperEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyLabel: { fontSize: 14, color: Colors.gray, marginTop: 10, textAlign: 'center' },
  errorText: { color: Colors.red, textAlign: 'center', marginVertical: 10 },
});

export default Wallet;
