import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootNavigatorParamList } from '../../navigation/typings';
import { useGetInfo } from '../../services/profile';
import { useIsFocused } from '@react-navigation/native';
import { useUserStore } from '../../states/user';
import { userInfo } from '../../states/user/typings';
import Avatar from '../../components/Avatar';
import CommonText from '../../components/CommonText';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { Fonts } from '../../assets';
import { navigate, replace, goBack } from '../../navigation/utils/navigationUtils';
import Modal from 'react-native-modal';
import { USER_STATUS } from '../../ultils';
import Header from '../../components/Header';

const Profile = () => {
  const { top } = useSafeAreaInsets();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState('');
  const { triggerGetInfo } = useGetInfo();
  const [userInfo, setUserInfo] = useState<userInfo>();
  const isFocused = useIsFocused();
  const { user, setUser, setToken } = useUserStore(state => state);

  useEffect(() => {
    if (isFocused) {
      const getInfo = async () => {
        try {
          setError('');
          const res = await triggerGetInfo();
          console.log('[Profile] getInfo response:', res);
          setUserInfo(res.data);
          setUser(res.data); // Sync with userStore
        } catch (err) {
          console.error('[Profile] getInfo error:', err);
          setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
        }
      };
      getInfo();
    }
  }, [isFocused]);

  const onBackdropPress = () => {
    setShowLogoutModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return Colors.green;
      case 'PENDING':
        return '#FFC107'; // Fallback to a yellow hex if Colors.yellow is not defined
      case 'BLOCKED':
        return Colors.black;
      default:
        return Colors.gray; // Fallback for unknown status
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Message */}
        {error ? <Text style={{ color: Colors.red, textAlign: 'center', marginVertical: 10 }}>{error}</Text> : null}
        
        <Header title='Hồ sơ'/>

        {/* Avatar + Name card */}
        <View style={styles.cardProfile}>
          <View style={styles.avatarWrap}>
            <Avatar />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}> {userInfo?.name || user?.name || 'Người dùng'}</Text>
            <Text style={[styles.status, { color: getStatusColor(userInfo?.status || user?.status || '') }]}> {USER_STATUS(userInfo?.status || user?.status || '')}</Text>
          </View>
        </View>

        {/* Thông tin */}
        <Text style={styles.sectionLabel}>Thông tin</Text>
        <View style={styles.card}>
          <Row
            icon={Icons.NotifiProfile ? <Icons.NotifiProfile width={20} height={20} /> : <Text>N</Text>}
            title="Thông báo"
            right={
              <TouchableOpacity onPress={() => setNotifEnabled(v => !v)} activeOpacity={0.7}>
                <View style={[styles.toggle, notifEnabled && styles.toggleOn]}>
                  <View style={[styles.knob, notifEnabled && styles.knobOn]} />
                </View>
              </TouchableOpacity>
            }
          />
          <Divider />
          <Row
            icon={Icons.InforProfile ? <Icons.InforProfile width={20} height={20} /> : <Text>I</Text>}
            title="Thông tin cá nhân"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
            onPress={() => navigate('Information')}
          />
          <Divider />
          <Row
            icon={Icons.Gift ? <Icons.Gift width={20} height={20} /> : <Text>G</Text>}
            title="Giới thiệu và nhận ưu đãi"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
            onPress={() => navigate('Endow')}
          />
          <Divider />
          <Row
            icon={Icons.LocationManage ? <Icons.LocationManage width={20} height={20} /> : <Text>L</Text>}
            title="Quản lý địa chỉ"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
            onPress={() => navigate('LocationManage')}
          />
        </View>

        {/* Hỗ trợ & sử dụng */}
        <Text style={styles.sectionLabel}>Hỗ trợ và sử dụng</Text>
        <View style={styles.card}>
          <Row
            icon={Icons.Help ? <Icons.Help width={20} height={20} /> : <Text>H</Text>}
            title="Trung tâm hỗ trợ"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
            onPress={() => navigate('SupportCenter')}
          />
          <Divider />
          <Row
            icon={Icons.Rule ? <Icons.Rule width={20} height={20} /> : <Text>R</Text>}
            title="Điều khoản và chính sách"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
          />
          <Divider />
          <Row
            icon={Icons.Callhelp ? <Icons.Callhelp width={20} height={20} /> : <Text>C</Text>}
            title="Hỗ trợ khách hàng"
            right={
              <TouchableOpacity onPress={() => Linking.openURL('tel:0338452915')}>
                <Text style={styles.linkText}>0338452915</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* Tài khoản */}
        <Text style={styles.sectionLabel}>Tài khoản</Text>
        <View style={styles.card}>
          <Row
            icon={Icons.Changepass ? <Icons.Changepass width={20} height={20} /> : <Text>P</Text>}
            title="Đổi mật khẩu"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
            onPress={() => navigate('Changepass')}
          />
          <Divider />
          <Row
            icon={Icons.Setting ? <Icons.Setting width={20} height={20} /> : <Text>S</Text>}
            title="Cài đặt"
            right={Icons.NextArrow ? <Icons.NextArrow width={16} height={16} /> : <Text>›</Text>}
          />
          <Divider />
          <Row
            icon={Icons.Logout ? <Icons.Logout width={20} height={20} /> : <Text>L</Text>}
            title="Đăng xuất"
            titleStyle={{ color: Colors.red }}
            onPress={() => setShowLogoutModal(true)}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={showLogoutModal}
        style={styles.modal}
        onBackdropPress={onBackdropPress}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.contentModal}>
          <View style={styles.itemModal}>
            <CommonText text="Bạn có chắc chắn muốn đăng xuất ?" styles={styles.labelModal} />
          </View>
          <TouchableOpacity
            style={styles.itemModal}
            onPress={() => {
              setToken('');
              replace('AuthStack', { screen: 'Login' });
            }}
          >
            <CommonText text="Đăng xuất" styles={styles.textLogout} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.itemCancel} onPress={() => setShowLogoutModal(false)}>
            <CommonText text="Huỷ" styles={styles.labelModal} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const Row = ({
  icon,
  title,
  right,
  onPress,
  titleStyle,
}: {
  icon?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  onPress?: () => void;
  titleStyle?: any;
}) => (
  <TouchableOpacity style={styles.itemRow} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.itemLeft}>
      {!!icon && <View style={{ marginRight: 12 }}>{icon}</View>}
      <Text style={[styles.itemTitle, titleStyle]}>{title}</Text>
    </View>
    <View style={styles.itemRight}>{right}</View>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#D9D9D903' },
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: 0,
    marginBottom: 0,
  },
  contentModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Extra padding for iOS safe area
  },
  itemModal: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  itemCancel: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  labelModal: {
    color: Colors.textPrimary,
    fontSize: Fonts.fontSize[15],
    fontWeight: '600',
    textAlign: 'center',
  },
  textLogout: {
    color: Colors.red,
    fontWeight: '600',
    fontSize: Fonts.fontSize[15],
    textAlign: 'center'
  },
  cardProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 10,
    marginTop: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 150,
    overflow: 'hidden',
  },
  name: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  status: {
    color: Colors.green,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 20,
    color: Colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemTitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  itemRight: { marginLeft: 8 },
  linkText: { color: Colors.blue, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 32 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
    padding: 2,
  },
  toggleOn: { backgroundColor: Colors.blue },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  knobOn: { alignSelf: 'flex-end', backgroundColor: Colors.white },
});

export default Profile;