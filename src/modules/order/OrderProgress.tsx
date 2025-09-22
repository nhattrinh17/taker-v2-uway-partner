import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { Icons } from "../../assets";
import Header from "../../components/Header";
import { useGetShoeBookingTimeline } from "../../services/shoe";
import { RouteProp } from "@react-navigation/native";
import { RootNavigatorParamList } from '../../navigation/typings';
import { formatCustomDatetimeV2, formatCurrencyRoundedToHundred } from "../../ultils/validation";
import { scale } from "../../ultils";
import { Colors } from "../../assets/Colors";

type TimelineItem = {
  actorId: string;
  actorType: string;
  createdAt: string;
  deletedAt: null;
  details: string;
  fromStatus: string | null;
  id: string;
  shoeBookingId: string;
  toStatus: string;
  updatedAt: string;
};

type Step = {
  id: string;
  title: string;
  time?: string;
  iconActive: any;
  iconInactive: any;
  status: string;
};

type Props = {
  route: RouteProp<RootNavigatorParamList, 'OrderProgress'>;
};

const OrderProgress = ({ route }: Props) => {
  const { id, item } = route.params;
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", title: "Đơn hàng đã được đặt", status: "PENDING", iconActive: Icons.BookedActive, iconInactive: Icons.BookedActive },
    { id: "2", title: "Đơn hàng đã được nhận bởi đối tác Uway", status: "FIND_DRIVER", iconActive: Icons.AcceptActive, iconInactive: Icons.AcceptActive },
    { id: "3", title: "Đơn vị vận chuyển tiếp nhận đơn hàng", status: "PICKUP_INCOMING", iconActive: Icons.DeliveryActive, iconInactive: Icons.Delivery },
    { id: "4", title: "Đối tác Uway tiếp nhận đơn hàng", status: "ARRIVING_AT_SHOP", iconActive: Icons.PartnerAcceptActive, iconInactive: Icons.PartnerAccept },
    { id: "5", title: "Quá trình vệ sinh giày", status: "IN_PROGRESS", iconActive: Icons.CleanProgressActive, iconInactive: Icons.CleanProgress },
    { id: "6", title: "Đóng gói đơn hàng & bàn giao vận chuyển", status: "RETURN_FIND_DRIVER", iconActive: Icons.PackageActive, iconInactive: Icons.Package },
    { id: "7", title: "Hoàn thành đơn hàng", status: "COMPLETED", iconActive: Icons.SuccessOrderActive, iconInactive: Icons.SuccessOrder },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { triggerGetShoeBookingTimeline } = useGetShoeBookingTimeline();
  const [expanded, setExpanded] = useState(false);

  const fetchTimeline = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await triggerGetShoeBookingTimeline({ id: id });
      console.log('===> Timeline: ', response);

      // Giả sử response.data là mảng TimelineItem[]
      const timelineItems: TimelineItem[] = response?.data || [];

      // Tạo map từ toStatus đến createdAt để gán time cho các step
      const statusTimeMap: { [key: string]: string | undefined } = {};
      timelineItems.forEach(item => {
        if (item.toStatus) {
          statusTimeMap[item.toStatus] = formatCustomDatetimeV2(item.createdAt);
        }
      });

      // Cập nhật steps với time từ API, giữ nguyên tất cả steps
      const updatedSteps = steps.map(step => ({
        ...step,
        time: statusTimeMap[step.status] ?? "Chưa có thông tin",
      }));

      setSteps(updatedSteps);

      // Tìm currentStep: index của step cuối cùng có toStatus trong API + 1
      const latestStatus = timelineItems
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-1)[0]?.toStatus;

      const currentStepIndex = steps.findIndex(step => step.status === latestStatus);
      setCurrentStep(latestStatus ? currentStepIndex + 1 : 0);

    } catch (error) {
      console.error('Lỗi khi fetch timeline:', error);
      // Giữ nguyên steps mặc định, reset time nếu lỗi
      setSteps(steps.map(step => ({ ...step, time: "Chưa có thông tin" })));
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTimeline();
    setRefreshing(false);
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchTimeline();
  }, [id]);

  // Nếu đang loading lần đầu (steps rỗng), hiển thị indicator
  if (loading && steps.every(step => step.time === "Chưa có thông tin")) {
    return (
      <View style={[styles.container, styles.center]}>
        <Header title="Quá trình đơn hàng" />
        <ActivityIndicator size="large" color="#2AA7FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Quá trình đơn hàng" />
      {/* Service Info - Có thể fetch từ details nếu cần */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.serviceSection, expanded && styles.serviceSectionExpanded]}
        onPress={() => setExpanded(p => !p)}
      >
        <View style={styles.serviceCard}>
          <Icons.Shoe style={styles.serviceIcon} width={40} height={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceTitle}>Dịch vụ đánh giày</Text>
            <Text style={styles.serviceSubtitle}>{item.shoeService.name}</Text>
            {expanded && (
              <Text style={styles.serviceDescription}>
                <Text style={styles.des}>Mô tả cơ bản: </Text>
                {item.shoeService.simpleDes || 'Không có mô tả'}
              </Text>
            )}
          </View>
          <Text style={styles.servicePrice}>{formatCurrencyRoundedToHundred(item.finalPrice)}</Text>
        </View>
      </TouchableOpacity>
      {/* Timeline */}
      <FlatList
        data={steps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2AA7FF']} />
        }
        renderItem={({ item, index }) => {
          const isActive = index < currentStep;
          const isLast = index === steps.length - 1;
          const IconComponent = isActive ? item.iconActive : item.iconInactive;
          return (
            <View style={styles.stepContainer}>
              {/* Left timeline */}
              <View style={styles.timeline}>
                <IconComponent
                  width={36}
                  height={36}
                // Bỏ prop color vì các icon Active đã có màu built-in, không cần override
                />
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor: index < currentStep - 1 ? "#2AA7FF" : "#D9B97E",
                      },
                    ]}
                  />
                )}
              </View>

              {/* Right content */}
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isActive && { color: "#2AA7FF" }]}>
                  {item.title}
                </Text>
                <Text style={styles.stepTime}>{item.time}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default OrderProgress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  serviceSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginTop: scale(8),
    borderRadius: scale(20),
  },
  serviceSectionExpanded: {
    paddingVertical: scale(20),
    borderRadius: scale(20),
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 14,
    elevation: 2,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  serviceSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  serviceDescription: {
    marginTop: scale(8),
    fontSize: scale(13),
    color: '#555',
  },
  des: {
    fontWeight: 'bold',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2AA7FF",
  },
  stepContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 60, // Ensure enough height for the line
  },
  timeline: {
    width: 36,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 40, // Start below the icon
    bottom: -10, // Extend to the next step
    width: 2,
    backgroundColor: "#D9B97E",
    zIndex: -1, // Ensure the line is behind the icons
  },
  stepContent: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  stepTime: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
});