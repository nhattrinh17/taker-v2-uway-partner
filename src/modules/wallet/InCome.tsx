import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    Platform,
    ScrollView, RefreshControl
} from "react-native";
import Header from "../../components/Header";
import { Colors } from "../../assets/Colors";
import { Icons } from "../../assets";
import { scale } from "../../ultils";
import { useGetShoeBooking } from "../../services/shoe";
import { useFocusEffect } from "@react-navigation/native";
import { navigate } from "../../navigation/utils/navigationUtils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatCustomDatetimeV2 } from "../../ultils/validation";
import { STATUS_BOOKING } from "../../ultils";

const { width } = Dimensions.get("window");

const InCome = () => {
    const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { triggerGetShoeBooking } = useGetShoeBooking();

    const getDateRange = () => {
        const from = new Date(selectedDate);
        const to = new Date(selectedDate);
        switch (activeTab) {
            case "day":
                break;
            case "week":
                const day = from.getDay();
                from.setDate(from.getDate() - day);
                to.setDate(from.getDate() + 6);
                break;
            case "month":
                from.setDate(1);
                to.setMonth(from.getMonth() + 1);
                to.setDate(0);
                break;
        }
        const formatDate = (d: Date, end = false) => {
            const dt = new Date(d);
            dt.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
            return dt.toISOString();
        };
        return { fromDate: formatDate(from), toDate: formatDate(to, true) };
    };

    const fetchData = async (reset = true) => {
        setLoading(true);
        const { fromDate, toDate } = getDateRange();
        const res = await triggerGetShoeBooking({
            status: "COMPLETED",
            fromDate,
            toDate,
            page,
            limit,
        });
        const newOrders = res.data.data || [];
        setOrders(reset ? newOrders : [...orders, ...newOrders].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
        const total = newOrders.reduce((sum: number, order: any) => sum + (order.finalPrice || 0), reset ? 0 : totalIncome);
        setTotalIncome(total);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchData(true);
        }, [activeTab, selectedDate])
    );

    useEffect(() => {
        fetchData(page === 1); // nếu page=1 nghĩa là reset
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchData(true).finally(() => setRefreshing(false));
    };

    const handleLoadMore = () => {
        if (!loading) {
            setPage(prev => prev + 1);
            fetchData(false);
        }
    };

    const handleDateChange = (_event: any, date?: Date) => {
        if (date) setSelectedDate(date);
        if (Platform.OS === "android") setShowPicker(false);
    };

    const changeDate = (direction: "prev" | "next") => {
        const newDate = new Date(selectedDate);
        if (activeTab === "day") {
            newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        } else if (activeTab === "week") {
            newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        }
        setSelectedDate(newDate);
    };

    const convertComplete = (status: string) =>{
        switch(status){
            case 'COMPLETED':
                return 'Hoàn thành';
            default:
                return 'Không xác định';
        }
    }

    const handlePressItem = (item: any) => {
        navigate("OrderDetail", { orderId: item.orderId, id: item.id });
    };

    const getDateDisplay = () => {
        const from = new Date(selectedDate);
        const to = new Date(selectedDate);
        switch (activeTab) {
            case "day":
                return from.toLocaleDateString();
            case "week":
                const day = from.getDay();
                const diffToMonday = day === 0 ? -6 : 1 - day;
                from.setDate(from.getDate() + diffToMonday);
                to.setDate(from.getDate() + 6);
                return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
            case "month":
                return `Tháng ${from.getMonth() + 1}/${from.getFullYear()}`;
            default:
                return from.toLocaleDateString();
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity onPress={() => handlePressItem(item)}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.serviceIconContainer}>
                        <Icons.Shoe width={scale(40)} height={scale(40)} color={Colors.blue} />
                    </View>
                    <View style={styles.serviceDetails}>
                        <Text style={styles.serviceTitle}>{item.shoeService.name}</Text>
                        <View style={styles.row}>
                            <Icons.Locationdetail width={14} height={14} style={{ marginRight: 4 }} />
                            <Text style={[styles.serviceLocation, { flexShrink: 1 }]} >
                                {item.deliveryAddress}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatCustomDatetimeV2(item.createdAt)}</Text>
                        {item.expectedDeliveryTime === "HOUR_0_24" && <Icons.Clocks width={20} height={20} />}
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <Text style={styles.statusText}>{convertComplete(item.status)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header title="Thu nhập" />
            <View style={styles.tabContainer}>
                {["day", "week", "month"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tab}
                        onPress={() => setActiveTab(tab as any)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === "day" ? "Ngày" : tab === "week" ? "Tuần" : "Tháng"}
                        </Text>
                        <View style={styles.baseUnderline} />
                        {activeTab === tab && <View style={styles.underline} />}
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.boxSelect}>
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={() => changeDate("prev")} style={styles.iconWrapper}>
                        <Icons.Pre width={30} height={30} />
                    </TouchableOpacity>
                    <View style={styles.dateIncomeBox}>
                        <TouchableOpacity onPress={() => setShowPicker(true)}>
                            <Text style={styles.dateText}>{getDateDisplay()}</Text>
                        </TouchableOpacity>
                        <Text style={styles.totalIncome}>{totalIncome.toLocaleString()} VND</Text>
                    </View>
                    <TouchableOpacity onPress={() => changeDate("next")} style={styles.iconWrapper}>
                        <Icons.Next width={30} height={30} />
                    </TouchableOpacity>
                </View>
                {showPicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
            </View>
            <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Lịch sử đơn hàng</Text>
            </View>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 0, backgroundColor: Colors.background, }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có đơn hàng</Text>
                    </View>
                }
            />
        </View>
    );
};

export default InCome;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EEF8FF" },
    scrollView: { flex: 1 },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginHorizontal: 20,
        marginVertical: 16,
    },
    tab: {
        paddingVertical: 8,
        alignItems: "center",
    },
    tabText: {
        fontSize: 18,
        color: "#000",
        fontWeight: "600",
    },
    tabTextActive: {
        color: Colors.blue,
    },
    baseUnderline: {
        height: 1,
        width: "290%",
        backgroundColor: "#000",
        marginTop: 4,
    },
    underline: {
        height: 4,
        width: "290%",
        backgroundColor: Colors.blue,
        bottom: 0,
        marginTop: -3,
    },
    boxSelect: {
        paddingVertical: 20,
        backgroundColor: "#EEF8FF",
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    iconWrapper: {
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        //height: "100%",
    },
    dateIncomeBox: {
        alignItems: "center",
    },
    dateText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
        paddingHorizontal: 20,
        paddingVertical: 6,
        backgroundColor: "#0B96DF",
        borderRadius: 15,
        textAlign: "center",
    },
    totalIncome: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.black,
        marginTop: 12,
    },
    historyHeader: {
        marginBottom: 8,
        marginLeft: 10,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    listContent: {
        flexGrow: 1,
        backgroundColor: '#F7F9FB', // hoặc Colors.background
        paddingBottom: 0,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        marginBottom: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", alignItems: "flex-start" },
    serviceIconContainer: { marginRight: 12 },
    serviceDetails: { flex: 1, marginRight: 8 },
    serviceTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4, width: '100%' },
    row: { flexDirection: "row", alignItems: "center" },
    serviceLocation: { fontSize: 13, color: "#666", flex: 1, width: '100%' },
    timeContainer: { alignItems: "flex-end", marginLeft: 8 },
    timeText: { fontSize: 12, color: "#999", marginBottom: 4 },
    cardFooter: { marginTop: 8, flexDirection: "row", justifyContent: "flex-start" },
    statusText: { fontSize: 13, fontWeight: "600", color: "green" },
});