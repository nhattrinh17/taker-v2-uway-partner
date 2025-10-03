import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Platform,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActionSheetIOS,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Icons } from '../../assets';
import { Colors } from '../../assets/Colors';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import { Images } from '../../assets/Images';
import { goBack, navigate } from '../../navigation/utils/navigationUtils';
import { RootNavigatorParamList } from '../../navigation/typings';
import { RouteProp } from '@react-navigation/native';
import Header from '../../components/Header';
import { formatCustomDatetimeV2, formatCurrencyRoundedToHundred, checkShoeImage } from '../../ultils/validation';
import { convertTime } from '../../ultils';
import CommonButton from '../../components/Button';
import { getStatusColor, getStatusBackground, STATUS_BOOKING } from '../../ultils';
import {
  useRejectShoeBooking,
  useUpdateShoeBookingStatus,
  useUploadProcessImages,
  useGetShoeBooking,
} from '../../services/shoe';
import CancelModal from '../../components/CancelModal';
import SuccessModal from '../../components/SuccessModal';
import useUpload from '../../ultils/useUpload';
import { s3Url } from '../../services/APIConfig';
import ModalSuccessOrder from '../../components/ModalSuccessOrder';
import ViewImageModal from '../../components/ViewImageModal';
import { PermissionsAndroid } from 'react-native';
import FailureModal from '../../components/FailureModal';
import { scale } from '../../ultils';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderDetailScreenRouteProp = RouteProp<RootNavigatorParamList, 'OrderDetail'>;

type Props = {
  route: OrderDetailScreenRouteProp;
};

const OrderDetail = ({ route }: Props) => {
  const { orderId, id } = route.params;

  const [messageStatus, setMessageStatus] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { triggerRejectShoeBooking } = useRejectShoeBooking();
  const { triggerUpdateShoeBookingStatus } = useUpdateShoeBookingStatus();
  const { triggerUploadProcessImages } = useUploadProcessImages();
  const { triggerGetShoeBooking } = useGetShoeBooking();
  const { uploadImage } = useUpload();
  const [showModalSuccess, setShowModalSuccess] = useState(false);
  const [showModalFail, setShowModalFail] = useState(false);
  const [error, setError] = useState('');

  const handlePress = () => navigate('OrderProgress', { id: orderData.id, item: orderData });

  /** cập nhật text nút dựa theo status */
  const updateMessageFromStatus = useCallback((st: string) => {
    switch (st) {
      case 'FIND_DRIVER':
      case 'PICKUP_INCOMING':
        setMessageStatus('Huỷ đơn hàng');
        break;
      case 'ARRIVING_AT_SHOP':
        setMessageStatus('Tiếp nhận đơn hàng');
        break;
      case 'IN_PROGRESS': {
        const imgs = parseImages(orderData.processingImages);
        console.log('===> PROGRESS IMAGES:', imgs);
        setMessageStatus(imgs.length > 0 ? 'Bàn giao' : 'Đóng gói');
        break;
      }
      case 'RETURN_FIND_DRIVER':
        setMessageStatus('Đánh giá từ khách hàng ->');
        break;
      case 'COMPLETED':
        setMessageStatus('Xem đánh giá ->');
        break;
      default:
        // giữ nguyên, không set rỗng
        setMessageStatus(prev => prev);
        break;
    }
  }, [orderData?.processingImages]);

  // Thêm helper
  const parseImages = (images: string | string[] | null | undefined): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try {
      return JSON.parse(images);
    } catch (e) {
      console.error('Parse processingImages failed:', e);
      return [];
    }
  };

  // cập nhật mỗi khi status thay đổi
  useEffect(() => {
    if (orderData) {
      updateMessageFromStatus(status);
    }
  }, [status, updateMessageFromStatus]);

  const fetchOrderDetail = async () => {
    setRefreshing(true);
    try {
      // Gọi API với orderId từ param
      const response = await triggerGetShoeBooking({ orderId });
      console.log('===> Booking Detail: ', response);

      // Tùy cấu trúc trả về, nếu data là mảng 1 phần tử:
      const detail = Array.isArray(response?.data?.data)
        ? response.data.data[0]
        : response?.data?.data;

      if (detail) {
        setOrderData(detail);
        setStatus(detail.status);
        setUploadedImages([]);
      }
    } catch (error) {
      console.error('Lỗi khi fetch chi tiết đơn hàng:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const onRefresh = async () => {
    await fetchOrderDetail();
  };

  /** Xử lý nút hành động */
  const handleAction = async () => {
    try {
      if (messageStatus === 'Huỷ đơn hàng') {
        setShowCancelModal(true);
        return;
      }

      // ==== Đóng gói ====
      if (status === 'IN_PROGRESS') {
        const parsedProcessingImages = parseImages(orderData.processingImages);
        if (parsedProcessingImages.length === 0) {
          // upload ảnh trước, chưa đổi status
          console.log('===>Check IMG before Upload Image: ', uploadedImages, JSON.stringify(uploadedImages));
          const img = await triggerUploadProcessImages({
            id: orderData.id,
            data: { processingImages: JSON.stringify(uploadedImages) },
          });
          console.log('===>Check APi Upload Image: ', img);
          // Refetch để cập nhật
          await fetchOrderDetail();
          return;
        } else if (messageStatus === 'Bàn giao') {
          const res = await triggerUpdateShoeBookingStatus({
            id: orderData.id,
            data: {
              action: 'return',
              completedImages: JSON.stringify(uploadedImages),
            },
          });
          console.log('===>Check Response API: ', res);
          if (res?.type === 'success') {
            // Refetch để cập nhật status và data
            await fetchOrderDetail();
            console.log('===>Hoàn thành, hiện modalSuccessOrder: ');
            // Hiện modal khi bàn giao thành công
            setShowModalSuccess(true);
          }
          return;
        }
      }

      // ==== RETURN_FIND_DRIVER ====
      if (status === 'COMPLETED') {
        navigate('Review', { id: orderData.id })
      };

      // ==== ARRIVING_AT_SHOP ====
      if (status === 'ARRIVING_AT_SHOP') {
        const res = await triggerUpdateShoeBookingStatus({
          id: orderData.id,
          data: { action: 'progress' },
        });
        await fetchOrderDetail();
        if (res?.status) {
          // Refetch
          await fetchOrderDetail();
        }
      }
    } catch (err) {
      console.error('❌ Action failed:', err);
    }
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    await triggerRejectShoeBooking({ id: id });
    setShowSuccess(true);
    // Có thể refetch nếu cần, nhưng sẽ goback
  };

  const removeImage = (index: number) =>
    setUploadedImages(prev => prev.filter((_, i) => i !== index));

  const handleUploadImages = async (assets: Asset[]) => {
    const urls: string[] = [];
    for (const a of assets) {
      if (a.uri) {
        const url = await uploadImage(a.uri);
        if (url) urls.push(url);
      }
    }
    setUploadedImages(prev => [...prev, ...urls]);
  };

  const takePhoto = async () => {
    try {
      let granted;
      if (Platform.OS === 'android') {
        granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Quyền truy cập Camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh.',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'Đồng ý',
        });
      }
      if (Platform.OS === 'ios' || granted === PermissionsAndroid.RESULTS.GRANTED) {
        launchCamera(
          { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
          response => {
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.errorCode) {
              console.log('ImagePicker Error: ', response.errorMessage);
            } else {
              updateImage(response);
            }
          }
        );
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const updateImage = async (response: any) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorCode);
    } else if (response.assets && response.assets.length > 0) {
      try {
        const source = response.assets[0].uri;
        console.log('Image source URI:', source);
        if (source) {
          const publicUrl = await uploadImage(source);
          console.log('Uploaded image URL:', publicUrl);
          setUploadedImages(prev => [...prev, ...(publicUrl ? [publicUrl] : [])]);
        }
      } catch (error) {
        console.error('Error in updateImage:', error);
        setShowModalFail(true);
        setError('Tải ảnh thất bại. Vui lòng thử lại.');
      }
    }
  };

  const chooseFromLibrary = () =>
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 0 },
      async res => {
        if (res.assets) await handleUploadImages(res.assets);
      },
    );

  const showActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Huỷ', 'Chụp ảnh', 'Chọn ảnh có sẵn'], cancelButtonIndex: 0 },
        i => {
          if (i === 1) takePhoto();
          else if (i === 2) chooseFromLibrary();
        },
      );
    } else {
      Alert.alert('Thêm ảnh', '', [
        { text: 'Chụp ảnh', onPress: takePhoto },
        { text: 'Chọn ảnh có sẵn', onPress: chooseFromLibrary },
        { text: 'Huỷ', style: 'cancel' },
      ]);
    }
  };

  const parsedProcessingImages = useMemo(
    () => parseImages(orderData?.processingImages),
    [orderData?.processingImages]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chi tiết đơn hàng" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0B96DF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chi tiết đơn hàng" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Header title="Chi tiết đơn hàng" />

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: scale(100) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B96DF']} />
          }
        >
          {status === 'IN_PROGRESS' && parsedProcessingImages.length > 0 ? (
            <View style={styles.processingSection}>
              <Text style={styles.sectionLabel}>Ảnh tiếp nhận đơn hàng</Text>
              <View style={styles.processingImagesGrid}>
                {parseImages(orderData.imageUrls).length > 0 ? (
                  <ViewImageModal
                    images={parseImages(orderData.imageUrls).map(img => `${s3Url}${img}`)}
                  />
                ) : (
                  <Text style={styles.emptyText}>Khách hàng chưa thêm ảnh</Text>
                )}
              </View>
              <Text style={styles.sectionLabel}>Quy trình vệ sinh thực tế</Text>
              <View style={styles.processingImagesGrid}>
                <ViewImageModal
                  images={parseImages(orderData.processingImages).map(img => `${s3Url}${img}`)}
                />
              </View>
              <Text style={styles.sectionLabel}>Ảnh bàn giao cho đơn vị vận chuyển</Text>
              {uploadedImages.length > 0 ? (
                <View style={styles.uploadedImagesWrapper}>
                  {uploadedImages.map((url, idx) => (
                    <View key={idx} style={styles.imageItem}>
                      <Image source={{ uri: `${s3Url}${url}` }} style={styles.uploadedImage} resizeMode="contain" />
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => removeImage(idx)}
                      >
                        <Icons.DeleteCircle width={22} height={22} color="#C82023" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity onPress={showActionSheet} style={styles.addMoreBox}>
                    <Text style={{ fontSize: 32, color: '#555' }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={showActionSheet}>
                  <View style={styles.uploadBox}>
                    <Icons.Camera1 width={32} height={32} color="#555" />
                    <Text style={{ marginTop: 4, color: '#555' }}>
                      Thêm ít nhất 2 ảnh
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.detailSection1}>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
                  <Text style={styles.sectionLabel1}>Thông tin chi tiết đơn hàng</Text>

                  <View style={styles.detailRow}>
                    <View style={styles.detailTextBox}>
                      <Icons.Procedure style={styles.detailIcon} />
                      <Text style={styles.detailText1}>
                        Theo dõi quá trình xử lý đơn hàng của bạn
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Service */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.serviceSection, expanded && styles.serviceSectionExpanded]}
                onPress={() => setExpanded(p => !p)}
              >
                <View style={styles.serviceRow}>
                  <View style={styles.serviceIcon}>
                    <Icons.Shoe width={40} height={40} />
                  </View>
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceLabel}>Dịch vụ đánh giày</Text>
                    <Text style={styles.serviceAmount}>{orderData.shoeService.name}</Text>
                    {expanded && (
                      <Text style={styles.serviceDescription}>
                        <Text style={styles.des}>Mô tả cơ bản: </Text>
                        {orderData.shoeService.simpleDes || 'Không có mô tả'}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.serviceNote}>
                    {formatCurrencyRoundedToHundred(orderData.shoeService.price)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Trạng thái */}
              <View style={styles.statusSection}>
                <Text style={styles.sectionLabel}>Thông tin đơn hàng</Text>
              </View>
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>Trạng thái</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBackground(orderData.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailValue,
                        { color: getStatusColor(orderData.status) },
                      ]}
                    >
                      {STATUS_BOOKING(orderData.status)}
                    </Text>
                  </View>

                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>Thời gian đặt</Text>
                  <Text style={styles.detailValue}>
                    {formatCustomDatetimeV2(orderData.bookingDate)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>Thời gian dự kiến</Text>
                  <Text style={styles.detailValue}>
                    {convertTime(orderData.expectedDeliveryTime, orderData.bookingDate)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    Mô tả: {orderData.shoeService.description}
                  </Text>
                </View>
              </View>

              <View style={styles.imageContainer}>
                {parseImages(orderData.imageUrls).length > 0 ? (
                  <ViewImageModal
                    images={parseImages(orderData.imageUrls).map(img => `${s3Url}${img}`)}
                  />
                ) : (
                  <Text style={styles.emptyText}>Khách hàng chưa thêm ảnh</Text>
                )}
              </View>

              {(status === 'RETURN_FIND_DRIVER' || status === 'COMPLETED') && (
                <>
                  <Text style={styles.sectionLabel}>Quy trình vệ sinh thực tế</Text>
                  <View style={styles.processingImagesGrid}>
                    <ViewImageModal
                      images={parseImages(orderData.processingImages).map(img => `${s3Url}${img}`)}
                    />
                  </View>
                  <Text style={styles.sectionLabel}>Bàn giao cho đơn vị vận chuyển</Text>
                  <View style={styles.processingImagesGrid}>

                    <ViewImageModal
                      images={parseImages(orderData.completedImages).map(img => `${s3Url}${img}`)}
                    />

                  </View>
                </>
              )}

              {/* Quy trình vệ sinh */}
              {(status === 'IN_PROGRESS') && (
                <View style={styles.cleanProcessContainer}>
                  <Text style={styles.sectionLabel}>Quy trình vệ sinh thực tế</Text>
                  {uploadedImages.length > 0 ? (
                    <View style={styles.uploadedImagesWrapper}>
                      {uploadedImages.map((url, idx) => (
                        <View key={idx} style={styles.imageItem}>
                          <Image source={{ uri: `${s3Url}${url}` }} style={styles.uploadedImage} />
                          <TouchableOpacity
                            style={styles.deleteIcon}
                            onPress={() => removeImage(idx)}
                          >
                            <Icons.DeleteCircle width={22} height={22} color="#C82023" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity onPress={showActionSheet} style={styles.addMoreBox}>
                        <Text style={{ fontSize: 32, color: '#555' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={showActionSheet}>
                      <View style={styles.uploadBox}>
                        <Icons.Camera1 width={32} height={32} color="#555" />
                        <Text style={{ marginTop: 4, color: '#555' }}>
                          Thêm ít nhất 2 ảnh
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Fee */}
              <View style={styles.feeSection}>
                <View style={styles.feeRow}>
                  <Text style={styles.sectionLabel}>Thu nhập dự kiến</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Cước phí</Text>
                  <Text style={styles.feeValue}>
                    {formatCurrencyRoundedToHundred(
                      (orderData.finalPrice ?? 0) - (orderData.shoeService?.price ?? 0)
                    )}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Tổng tiền</Text>
                  <Text style={styles.feeValue}>
                    {formatCurrencyRoundedToHundred(orderData.finalPrice)}
                  </Text>
                </View>
              </View>
            </>
          )}

        </ScrollView>

        {/* Button hành động */}
        <View style={styles.buttonContainer}>
          {orderData.status === 'CANCELLED' ? (
            <Text style={{ color: '#C82023', fontWeight: 'bold', fontSize: 28 }}>Đã huỷ</Text>
          ) : (
            <CommonButton
              text={messageStatus}
              onPress={handleAction}
              isDisable={orderData.status === 'RETURN_FIND_DRIVER' ||
                (status === 'IN_PROGRESS' &&
                  (
                    // Nếu đang ở bước Đóng gói hoặc Bàn giao mà ảnh < 2
                    messageStatus === 'Đóng gói' ||
                    messageStatus === 'Bàn giao'
                  ) &&
                  uploadedImages.length < 2
                )
              }
              buttonStyles={[
                orderData.status === 'RETURN_FIND_DRIVER' && { backgroundColor: '#4f4545ff' },
                messageStatus === 'Huỷ đơn hàng' && { backgroundColor: '#C82023' },
                // ➜ Khi disable do thiếu ảnh, cho nút xám đi
                (status === 'IN_PROGRESS' &&
                  (messageStatus === 'Đóng gói' || messageStatus === 'Bàn giao') &&
                  uploadedImages.length < 2) && { backgroundColor: '#aaa' },
              ]}
            />
          )}
        </View>

        <CancelModal
          visible={showCancelModal}
          message="Bạn có chắc chắn muốn huỷ đơn hàng?"
          textBtn="Xác nhận"
          onClose={() => setShowCancelModal(false)}
          onContinue={handleConfirmCancel}
        />
        <SuccessModal
          visible={showSuccess}
          title="Thành công"
          message="Đơn hàng đã được huỷ."
          autoCloseMs={2000}
          onClose={() => {
            setShowSuccess(false);
            goBack();
          }}
        />
        <ModalSuccessOrder
          visible={showModalSuccess}
          onClose={() => {
            setShowModalSuccess(false);
            navigate('BottomStack', { screen: 'HomeStack' });
          }}
          onTrackOrder={() => {
            setShowModalSuccess(false);
            handlePress();
          }}
        />
        <FailureModal
          visible={showModalFail}
          onClose={() => setShowModalFail(false)}
          message={error}
          onContinue={() => { }}
        />

      </SafeAreaView>
    </SafeAreaView>
  );
};

export default OrderDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(20),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 20,
  },
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: scale(32), // Matches the back button width for symmetry
  },
  detailSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
    textAlign: 'center',
    borderRadius: 16,
  },
  detailSection1: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
    textAlign: 'center',
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  statusSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(0),
    marginTop: scale(9),
  },
  sectionLabel1: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(2),
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(2),
    //textAlign: 'center',
  },
  processingSection: { padding: 16, backgroundColor: '#fff', marginTop: 8, borderRadius: 12 },
  processingImagesGrid: {
    borderRadius: 16,
    backgroundColor: 'white'
  },
  processingImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: 8,
    marginBottom: 12
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  uploadedImagesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: scale(8),
  },
  imageItem: {
    position: 'relative',
    marginRight: scale(8),
    marginBottom: scale(8),

  },
  deleteIcon: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,        // bóng nhẹ Android
    shadowColor: '#000', // bóng iOS
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  uploadedImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: 8,
    marginRight: scale(8),
    marginBottom: scale(8),
  },
  addMoreBox: {
    width: scale(80),
    height: scale(80),
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(4),
    alignItems: 'center',
  },
  detailTextBox: {
    flexDirection: 'row',
    alignItems: 'center',       // icon và text cùng hàng
    backgroundColor: '#0B96DF',
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: 8,
  },

  detailIcon: {
    marginRight: scale(6),
    color: '#fff',
  },
  detailRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(4),
    backgroundColor: '#0B96DF'
  },
  detailText: {
    fontSize: scale(14),
    color: '#555',

  },
  detailText1: {
    fontSize: scale(14),
    color: '#fff',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  detailValue: {
    fontSize: scale(14),
    color: '#000',
    fontWeight: '500',
  },
  serviceSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
    borderRadius: scale(16),
  },
  serviceSectionExpanded: {
    backgroundColor: '#fff',
    paddingVertical: scale(20),
    borderRadius: scale(16),
  },
  serviceDescription: {
    marginTop: scale(8),
    fontSize: scale(13),
    color: '#555',
  },
  des: {
    fontWeight: 'bold',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),

  },
  serviceIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  serviceText: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },
  serviceAmount: {
    fontSize: scale(12),
    color: '#777',
    marginTop: scale(6),
  },
  serviceNote: {
    fontSize: scale(14),
    color: '#0B96DF',
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
    borderRadius: 16,
  },
  image: {
    width: scale(120),
    height: scale(120),
  },
  cleanProcessContainer: {
    backgroundColor: '#e6f2f8',      // xanh nhạt nền toàn khung
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginTop: scale(8),
  },
  uploadBox: {
    marginTop: scale(8),
    borderWidth: 1,
    borderStyle: 'dashed',           // viền gạch đứt
    borderColor: '#999',
    borderRadius: 8,
    height: scale(80),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f2f8',      // trùng màu nền ảnh mẫu
  },
  feeSection: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
    marginTop: scale(8),
    borderRadius: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(8),
  },
  feeLabel: {
    fontSize: scale(14),
    color: '#555',
  },
  feeValue: {
    fontSize: scale(14),
    color: '#000',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: scale(16),
    backgroundColor: Colors.background,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: scale(12),
    paddingHorizontal: scale(50),
    borderRadius: scale(24),
  },
  cancelText: {
    fontSize: scale(16),
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#007bff',
    paddingVertical: scale(12),
    paddingHorizontal: scale(50),
    borderRadius: scale(24),
  },
  acceptText: {
    fontSize: scale(16),
    color: '#fff',
  },
});