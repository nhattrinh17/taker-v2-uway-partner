import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
import { scale } from '../../ultils';
import { Shadow } from 'react-native-shadow-2';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

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
      <View style={styles.transactionIconContainer}>
        {isDeposit ? <Icons.Deposit /> : <Icons.Withdraw />}
      </View>
      <View style={styles.rowLeft}>
        <View style={styles.rowLeftHeader}>
          <CommonText text={truncateString(item.description)} styles={styles.titleItem} />
        </View>
        <CommonText
          text={new Date(item.transactionDate).toLocaleString('vi-VN')}
          styles={styles.dateItem}
        />
      </View>

      <View style={styles.rowRight}>
        <CommonText
          text={`${isDeposit ? '+' : '-'}${formatCurrency(item.amount)} đ`}
          styles={[styles.amountItem, isDeposit ? styles.amountPos : styles.amountNeg]}
        />
        <CommonText
          text={TRANSACTION_STATUS(item.status)}
          styles={[styles.statusItem, { color: TRANSACTION_STATUS_COLOR(item.status) }]}
        />
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

      // Clear error on successful fetch
      setError('');

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
    getBalance();
    await getHistoryTransaction(1, filters);
    setRefreshing(false);
  };

  const handleSearch = ({
    status,
    fromDate,
    toDate,
  }: { status?: string; fromDate?: string; toDate?: string }) => {
    setFilters({
      status,
      startDate: fromDate,
      endDate: toDate,
    });
    setPage(1);
    setTransactions([]);
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <Shadow
        startColor={'#00000010'}
        offset={[0, 5]} // Chỉ shadow phía dưới
        distance={5} // Độ lan của bóng
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setIsSearchModalVisible(true)}
            style={styles.headerIcon}
            activeOpacity={0.8}
          >
            {Icons.Moreoptions ? <Icons.Moreoptions width={scale(28)} height={scale(28)} /> : <Text>{'<'} </Text>}
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tài khoản</Text>

          <TouchableOpacity
            onPress={() => navigate('InCome')}
            style={styles.headerRight}
            activeOpacity={0.8}
          >
            <Text style={styles.headerAction}>Thu nhập</Text>
          </TouchableOpacity>
        </View>
      </Shadow>

      {/* Wallet card */}
      <ImageBackground
        source={Images.walletbackground}
        style={[styles.walletCard, { marginTop: scale(80) }]} // Tăng marginTop để phù hợp header lớn hơn
        imageStyle={styles.walletBgImage}
      >
        {/* Hàng trên: trái (ví + balance) – phải (username) */}
        <View style={styles.walletTopRow}>
          {/* Cột trái */}
          <View style={{ flexShrink: 1 }}>
            <CommonText text="Ví Uway" styles={styles.labelWalletBox} />
            <View style={styles.balanceRow}>
              <Text style={styles.labelAmount}>
                {formatCurrency(balance || 0)}<Text style={styles.balanceUnit}>đ</Text>
              </Text>
            </View>
          </View>

          {/* Cột phải */}
          <Text
            style={styles.username}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(user?.name || 'USER').toUpperCase()}
          </Text>
        </View>

        {/* Hàng dưới: 2 nút */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { marginRight: scale(8) }]}
            onPress={() => navigate('Deposit')}
            activeOpacity={0.85}
          >
            <Text style={styles.textBtn}>Nạp tiền     </Text>
            <Icons.Deposit />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { marginLeft: scale(8) }]}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
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

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth,
    paddingHorizontal: scale(20),
    paddingBottom: scale(20), // Tăng để hạ chữ và icon
    minHeight: scale(60), // Đảm bảo header đủ cao
    backgroundColor: Colors.white,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 60,
    elevation: 8,
  },
  headerIcon: {
    width: scale(48), // Tăng kích thước để chứa icon lớn hơn
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scale(30),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: scale(22), // Tăng fontSize để header lớn hơn
    color: Colors.black,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
    fontWeight: 'bold',
    paddingTop: scale(25),
  },
  headerRight: {
    width: scale(80), // Tăng width để chứa chữ lớn hơn
    alignItems: 'flex-end',
    paddingTop: scale(24),
  },
  headerAction: {
    fontSize: scale(18), // Tăng fontSize để đồng bộ
    color: Colors.blue,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },

  // Wallet card
  walletCard: {
    marginHorizontal: scale(16),
    marginTop: scale(80), // Tăng để tránh chồng lấn với header lớn hơn
    padding: scale(28),
    backgroundColor: Colors.blue,
    borderRadius: scale(18),
    height: scale(220),
  },
  walletBgImage: {
    borderRadius: scale(16),
    resizeMode: 'cover',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(50),
    gap: scale(25),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: scale(10),
    borderRadius: scale(22),
  },
  walletTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWalletBox: {
    fontSize: scale(14),
    color: Colors.white,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: scale(6)
  },
  labelAmount: {
    fontSize: scale(27),
    color: Colors.white,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  balanceUnit: {
    color: Colors.white,
    fontSize: scale(24),
    marginLeft: 0,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },
  textBtn: {
    color: Colors.blue,
    marginLeft: scale(6),
    fontSize: scale(14),
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  username: {
    marginTop: 0,
    color: Colors.white,
    fontSize: scale(24),
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },

  // Titles
  labelHistory: {
    fontSize: scale(18),
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
    color: Colors.black,
    marginHorizontal: scale(16),
    marginTop: scale(6),
    marginBottom: scale(8),
    fontWeight: 'bold',
  },

  // List
  listContent: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(24),
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  transactionIconContainer: {
    width: scale(35),
    height: scale(35),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    backgroundColor: Colors.blue,
  },
  rowItemLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flex: 1,
    paddingRight: scale(12)
  },
  rowLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    alignItems: 'flex-end'
  },
  titleItem: {
    fontSize: scale(14),
    color: Colors.black,
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  dateItem: {
    marginTop: scale(4),
    fontSize: scale(12),
    color: Colors.gray,
    fontFamily: Fonts.fontFamily?.LexendRegular,
  },
  amountItem: {
    fontSize: scale(14),
    marginBottom: scale(4),
    fontFamily: Fonts.fontFamily?.LexendSemiBold,
  },
  amountPos: {
    color: 'green'
  },
  amountNeg: {
    color: 'red'
  },
  statusItem: {
    fontSize: scale(12),
    fontFamily: Fonts.fontFamily?.LexendRegular,
    textAlign: 'right'
  },

  // Empty & errors
  wrapperEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(40)
  },
  emptyLabel: {
    fontSize: scale(14),
    color: Colors.gray,
    marginTop: scale(10),
    textAlign: 'center'
  },
  errorText: {
    color: Colors.red,
    textAlign: 'center',
    marginVertical: scale(10)
  },
});
export default Wallet;