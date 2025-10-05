import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { RootNavigatorParamList } from '../../navigation/typings';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Modal,
    Pressable,
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { Images } from '../../assets/Images';
import Header from '../../components/Header';
import {
    useGetNotifications,
    useReadNotification,
    useDeleteNotification,
} from '../../services/notification';
import { formatCustomDatetimeV2 } from '../../ultils/validation';
import Animated from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import SuccessModal from '../../components/SuccessModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

interface NotificationItem {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

const Notification = () => {
    const { top } = useSafeAreaInsets();
    const { triggerGetNotifications } = useGetNotifications();
    const { triggerReadNotification } = useReadNotification();
    const { triggerDeleteNotification } = useDeleteNotification();

    const [newNotifications, setNewNotifications] = useState<NotificationItem[]>([]);
    const [olderNotifications, setOlderNotifications] = useState<NotificationItem[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchNoti = async (pageNumber: number = 1, isRefresh = false) => {
        try {
            if (pageNumber === 1 && !isRefresh) setHasMore(true);

            const noti = await triggerGetNotifications({
                page: pageNumber,
                limit: 15,
            });
            console.log('==>NOTI: ', noti);
            const mapped: NotificationItem[] = (noti?.data.data || []).map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                createdAt: n.createdAt,
                isRead: n.isRead,
            }));

            if (isRefresh || pageNumber === 1) {
                // reset danh sách
                setNewNotifications(mapped.filter(item => !item.isRead));
                setOlderNotifications(mapped.filter(item => item.isRead));
                setPage(1);
            } else {
                // append cho phân trang
                setNewNotifications(prev => [
                    ...prev,
                    ...mapped.filter(item => !item.isRead),
                ]);
                setOlderNotifications(prev => [
                    ...prev,
                    ...mapped.filter(item => item.isRead),
                ]);
            }

            // Nếu trả về ít hơn limit => hết dữ liệu
            if ((noti?.data.data || []).length < 15) setHasMore(false);
        } catch (e) {
            console.error('Fetch notifications error', e);
        } finally {
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNoti();
        }, [])
    );

    const handleReadNotification = async (id: string) => {
        try {
            await triggerReadNotification({ id });
            fetchNoti();
        } catch (error) {
            console.error('Read notification error: ', error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNoti(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            setLoadingMore(true);
            fetchNoti(page + 1);
            setPage(prev => prev + 1);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await triggerDeleteNotification({ id: deleteId });
            setShowConfirm(false);
            setShowSuccess(true);
            fetchNoti();
        } catch (error) {
            console.error('Delete notification error:', error);
            setShowConfirm(false);
        }
    };

    const renderRightActions = (id: string) => (progress: any, dragX: any) => {
        return (
            <View style={styles.deleteContainer}>
                <Animated.View style={styles.deleteButton}>
                    <TouchableOpacity
                        style={styles.deleteButtonInner}
                        onPress={() => confirmDelete(id)}
                        activeOpacity={0.7}
                    >
                        <Image source={Images.Delete} style={styles.deleteIcon} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    const NotificationRow = ({ item }: { item: NotificationItem }) => (
        <Swipeable renderRightActions={renderRightActions(item.id)}>
            <TouchableOpacity
                style={styles.notificationItem}
                onPress={() => handleReadNotification(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.notificationIconContainer}>
                    <Icons.Message />
                </View>
                <View style={styles.notificationContent}>
                    <Text
                        style={[
                            styles.notificationTitle,
                            !item.isRead && { fontWeight: '700' },
                        ]}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {item.content}
                    </Text>
                </View>
                <Text style={styles.notificationTime}>
                    {formatCustomDatetimeV2(item.createdAt)}
                </Text>
            </TouchableOpacity>
        </Swipeable>
    );

    const allNotifications = [
        { title: 'Mới', data: newNotifications },
        { title: 'Cũ hơn', data: olderNotifications },
    ];

    // Check if there are no notifications
    const isEmpty = newNotifications.length === 0 && olderNotifications.length === 0;

    // Component to render when there are no notifications
    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Hiện tại chưa có thông báo nào</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <View style={[styles.container]}>
                
                <Header title="Thông báo" />
                {isEmpty && !refreshing && !loadingMore ? (
                    <EmptyListComponent />
                ) : (
                    <FlatList
                        data={allNotifications}
                        keyExtractor={(item, index) => item.title + index}
                        renderItem={({ item }) => {
                            if (item.data.length === 0) return null;
                            return (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>{item.title}</Text>
                                    {item.data.map(notification => (
                                        <NotificationRow key={notification.id} item={notification} />
                                    ))}
                                </View>
                            );
                        }}
                        contentContainerStyle={styles.listContainer}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.2}
                        ListFooterComponent={
                            loadingMore ? (
                                <Text style={{ textAlign: 'center', padding: 10 }}>Đang tải thêm...</Text>
                            ) : null
                        }
                    />
                )}

                {/* Modal xác nhận xoá */}
                <Modal
                    transparent
                    visible={showConfirm}
                    animationType="fade"
                    onRequestClose={() => setShowConfirm(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Xóa thông báo này?</Text>
                            <View style={styles.modalActions}>
                                <Pressable
                                    style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                                    onPress={() => setShowConfirm(false)}
                                >
                                    <Text>Hủy</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.modalBtn, { backgroundColor: '#C82023' }]}
                                    onPress={handleDelete}
                                >
                                    <Text style={{ color: '#fff' }}>Xóa</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
                <SuccessModal
                    visible={showSuccess}
                    title="Xoá thông báo thành công"
                    autoCloseMs={2000}
                    onClose={() => setShowSuccess(false)}
                    primaryText="OK"
                    onPrimaryPress={() => setShowSuccess(false)}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginBottom: 0,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        color: '#1C1C1E',
        fontWeight: '500',
    },
    notificationMessage: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
    },
    notificationTime: {
        fontSize: 14,
        color: '#8E8E93',
        marginLeft: 8,
    },
    deleteContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    deleteButton: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#C82023',
        height: '100%',
    },
    deleteButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    deleteIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        marginHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
});

export default Notification;