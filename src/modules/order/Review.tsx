import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Icons } from '../../assets';
import Header from '../../components/Header';
import { useGetRatingAverage, useGetRatingDetail } from '../../services/rating';
import { RouteProp } from '@react-navigation/native';
import { RootNavigatorParamList } from '../../navigation/typings';
import { Colors } from '../../assets/Colors';

type Props = {
  route: RouteProp<RootNavigatorParamList, 'Review'>;
};

const Review = ({ route }: Props) => {
  const { id } = route.params || {}; // id có thể undefined
  const { triggerGetRatingAverage } = useGetRatingAverage();
  const { triggerGetRatingDetail } = useGetRatingDetail();

  const [rating, setRating] = useState<number>(0);          // điểm trung bình
  const [orders, setOrders] = useState<number>(0);          // tổng lượt đánh giá
  const [review, setReview] = useState<string>('');         // nội dung review đơn
  const [detailRating, setDetailRating] = useState<number>(0); // sao của đơn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const starSize = (screenWidth - 32) / 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1️⃣ luôn lấy điểm trung bình
        const avgRes = await triggerGetRatingAverage();
        if (avgRes?.data) {
          setRating(avgRes.data.averageRating || 0);
          setOrders(avgRes.data.totalCount || 0);
        }

        // 2️⃣ chi tiết đơn
        if (id) {
          try {
            const detailRes = await triggerGetRatingDetail({ shoeBookingId: id });
            console.log('===>Deatail: ', detailRes);
            if (detailRes?.data) {
              setDetailRating(detailRes.data.rating || 0);
              setReview(detailRes.data.comment || '');
            }
          } catch (err: any) {
            // 👉 Bắt riêng trường hợp rating_not_found
            const msg =
              err?.response?.data?.message ||
              err?.data?.message ||
              err?.message;
            if (msg === 'rating_not_found') {
              setDetailRating(0);
              setReview('Chưa có đánh giá từ khách hàng cho đơn hàng này.');
            } else {
              throw err; // các lỗi khác vẫn để rơi xuống catch lớn
            }
          }
        }
      } catch (err) {
        console.error('Error fetching rating data:', err);
        setError('Không thể tải dữ liệu đánh giá. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, triggerGetRatingAverage, triggerGetRatingDetail]);



  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Đánh giá từ khách hàng" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B96DF" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Đánh giá từ khách hàng" />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Đánh giá từ khách hàng" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Box rating tổng */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Đánh giá cửa hàng: <Text style={{ fontWeight: '600' }}>{rating.toFixed(1)} ⭐</Text>
          </Text>
          <Text style={styles.infoText}>Số lượt đánh giá: {orders}</Text>
        </View>

        {/* Nếu không có id → chỉ hiển thị tổng quan */}
        {!id ? (
          <Text style={styles.sectionTitle}>
            {rating === 5
              ? 'Cửa hàng nhận được đánh giá tuyệt đối từ khách hàng!'
              : 'Đây là đánh giá trung bình từ tất cả khách hàng.'}
          </Text>
        ) : (
          <>
            {/* Có id → xem đánh giá đơn hàng */}
            <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
            <View style={styles.stars}>
              {Array.from({ length: 5 }).map((_, index) =>
                index < Math.round(detailRating) ? (
                  <Icons.StarActive
                    key={index}
                    width={starSize}
                    height={starSize}
                    color="#FFD700"          // sao vàng
                  />
                ) : (
                  <Icons.Star
                    key={index}
                    width={starSize}
                    height={starSize}
                    color="#D3D3D3"          // sao xám
                  />
                )
              )}
            </View>

            <Text style={styles.sectionTitle}>Nội dung đánh giá</Text>
            <View style={styles.reviewBox}>
              <Text style={styles.reviewText}>{review || 'Chưa có nội dung.'}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Review;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: { fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  stars: { flexDirection: 'row', marginBottom: 16 },
  reviewBox: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  reviewText: { fontSize: 15, lineHeight: 20, color: '#333' },
  errorText: { fontSize: 16, color: '#C82023', textAlign: 'center' },
});
