import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Colors } from "../assets/Colors";
import { Icons } from "../assets";
import { useGetAddress } from "../services/address";
import { useAcceptShoeBooking } from "../services/shoe";
import SuccessModal from "./SuccessModal";
import { Order } from "../services/shoe/typings";

type ModalSelectBranchProps = {
    visible: boolean;
    onClose: () => void;
    order?: Order | null; // đơn hàng hiện tại
    onConfirm?: (order: Order, branch: any) => void; // callback sau khi nhận đơn
};

const ModalSelectBranch: React.FC<ModalSelectBranchProps> = ({
    visible,
    onClose,
    onConfirm,
    order,
}) => {
    const { triggerGetAddress } = useGetAddress();
    const { triggerAcceptShoeBooking } = useAcceptShoeBooking();

    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchBranches();
            setSelectedBranch(null);
            setSuccess(false);
        }
    }, [visible]);

    const fetchBranches = async () => {
        try {
            const data = await triggerGetAddress();
            setBranches(data.data.data || []);
        } catch (err) {
            console.error("[ModalSelectBranch] Error fetch branches:", err);
        }
    };

    const handleConfirm = async () => {
        if (!order || !selectedBranch) return;
        try {
            setLoading(true);
            await triggerAcceptShoeBooking({
                id: order.shoeBookingId,
                data: {
                    deliveryLocation: selectedBranch.location,
                    deliveryAddress: selectedBranch.address,
                },
            });
            setLoading(false);
            setShowSuccess(true);

            // callback ra ngoài nếu cần
            if (onConfirm) onConfirm(order, selectedBranch);
        } catch (err) {
            setLoading(false);
            console.error("[ModalSelectBranch] Accept error:", err);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = selectedBranch?.id === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    isSelected && {
                        borderColor: Colors.primary,
                        backgroundColor: "#F0F8FF",
                    },
                ]}
                onPress={() => setSelectedBranch(item)}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.fullName}</Text>
                    <Text style={styles.itemSub}>{item.address}</Text>
                </View>
                {isSelected ? (
                    <Icons.LocationManage width={20} height={20} color={Colors.primary} />
                ) : null}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>

                    <>
                        <Text style={styles.title}>Chọn chi nhánh nhận đơn</Text>
                        <FlatList
                            data={branches}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Chưa có chi nhánh nào</Text>
                            }
                            style={{ flexGrow: 0, maxHeight: 300 }}
                        />
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (!selectedBranch || loading) && {
                                    backgroundColor: Colors.gray,
                                },
                            ]}
                            onPress={handleConfirm}
                            disabled={!selectedBranch || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.confirmText}>Nhận đơn</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>Đóng</Text>
                        </TouchableOpacity>
                    </>
                    <SuccessModal
                        visible={showSuccess}
                        title="Nhận đơn thành công!"
                        message={`Đơn hàng đã được gán cho chi nhánh ${selectedBranch?.fullName}`}
                        onClose={() => {
                            setShowSuccess(false);
                            onClose(); // đóng luôn modal chọn chi nhánh
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    container: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        width: "100%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: Colors.textPrimary,
        textAlign: "center",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 8,
    },
    itemTitle: { fontSize: 16, fontWeight: "600", color: Colors.textPrimary },
    itemSub: { fontSize: 14, color: Colors.gray },
    emptyText: { textAlign: "center", color: Colors.gray, marginTop: 20 },
    confirmButton: {
        backgroundColor: Colors.primary,
        borderRadius: 30,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    confirmText: { color: Colors.white, fontSize: 16, fontWeight: "bold" },
    closeButton: { marginTop: 8, alignItems: "center" },
    closeText: { fontSize: 14, color: Colors.gray },
    successText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
        marginTop: 12,
    },
});

export default ModalSelectBranch;
