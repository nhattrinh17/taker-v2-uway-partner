import React, { useRef, useState } from 'react';
import {
  Dimensions, FlatList, Image, ImageBackground,
  Pressable, StyleSheet, Text, View,
  Platform, ImageStyle, ViewStyle, TextStyle,
} from 'react-native';
import { appStore } from '../../states/app';
import DotIndicator from '../../components/DotIndicator';
import { Images } from '../../assets/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from '../../ultils';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(height * 0.58, scale(420));

// CTA để chừa chỗ cho text đứng ngay trên nút
const CTA_HEIGHT = scale(48);
const CTA_RIGHT_PADDING = scale(24);
const CTA_BOTTOM_PADDING = scale(24);
const GAP_TEXT_TO_CTA = scale(8);
const EXTRA_SAFE = Platform.OS === 'ios' ? scale(4) : 0;
const SPACE_FOR_CTA = CTA_HEIGHT + CTA_BOTTOM_PADDING + GAP_TEXT_TO_CTA + EXTRA_SAFE;

/** --- TYPES cho override --- */
type VectorOverride = {
  dy?: number;          // dịch dọc theo HERO_HEIGHT (âm: lên, dương: xuống)
  scale?: number;       // phóng to / thu nhỏ
  rotate?: number;      // độ (deg)
  widthPct?: number;    // % bề rộng ảnh nền
  heightPct?: number;   // % bề cao ảnh nền
};

type HeroOverride = ImageStyle & { dy?: number; scale?: number };

type PerSlideStyle = {
  vector?: VectorOverride;
  hero?: HeroOverride;
  content?: ViewStyle;
  title?: TextStyle;
  desc?: TextStyle;
};

type Slide = {
  key: string;
  bg: any;
  img: any;
  title: string;
  desc: string;
  style?: PerSlideStyle;
};

/** --- SLIDES --- */
const SLIDES: Slide[] = [
  {
    key: 's1',
    bg: Images.vector1,
    img: Images.onboard1,
    title: 'Đối tác Uway\nThu nhập ổn định',
    desc: 'Nhận đơn hàng nhanh chóng, dễ dàng\ntrực tiếp từ ứng dụng Uway Partner.',
    style: {
      vector: { dy: 0.081, scale: 1, rotate: 0.16, widthPct: 100, heightPct: 102 },
      hero: { width: '65%', height: '65%', dy: 0, scale: 1 },
    },
  },
  {
    key: 's2',
    bg: Images.vector2,
    img: Images.onboard2,
    title: 'Quản lý đơn hàng\nHiệu quả',
    desc: 'Dễ dàng theo dõi, nhận và hoàn thành\nđơn hàng mọi lúc, mọi nơi.',
    style: {
      vector: { dy: -0.081, scale: 1, rotate: 0.16, widthPct: 100, heightPct: 102 },
      hero: { width: '64%', height: '64%', dy: 0.02, scale: 0.98 },
      desc: { maxWidth: scale(320) },
    },
  },
  {
    key: 's3',
    bg: Images.vector3,
    img: Images.onboard3,
    title: 'Hỗ trợ 24/7\nĐồng hành cùng bạn',
    desc: 'Uway luôn ở bên cạnh đối tác\nkhi cần hỗ trợ và giải đáp.',
    style: {
      vector: { dy: 0.05, scale: 1, rotate: 0.16, widthPct: 100, heightPct: 102 },
      hero: { width: '66%', height: '66%', dy: -0.03, scale: 1.03 },
    },
  },
];

export default function Onboarding() {
  const setSeen = appStore(s => s.setHasSeenOnboarding);
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const next = () =>
    index < SLIDES.length - 1
      ? listRef.current?.scrollToIndex({ index: index + 1, animated: true })
      : setSeen(true);

  const prev = () => { if (index > 0) listRef.current?.scrollToIndex({ index: index - 1, animated: true }); };
  const skip = () => setSeen(true);

  return (
    <SafeAreaView style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        {index > 0 ? (
          <Pressable onPress={prev} style={s.backBtn} hitSlop={scale(8)}>
            <Text style={s.backIcon}>‹</Text>
          </Pressable>
        ) : <View style={{ width: scale(32), height: scale(32) }} />}
        <Pressable onPress={skip} hitSlop={scale(8)}><Text style={s.skip}>Bỏ qua</Text></Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={i => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) => {
          const st = item.style ?? {};
          const { dy: hdy = 0, scale: hscale = 1, ...heroStyle } = (st.hero ?? {}) as HeroOverride;

          const v = st.vector ?? {};
          const vStyle: ImageStyle = {
            alignSelf: 'center',
            width: `${v.widthPct ?? 115}%`,
            height: `${v.heightPct ?? 115}%`,
            transform: [
              { translateY: HERO_HEIGHT * (v.dy ?? 0) },
              { scale: v.scale ?? 1 },
              { rotate: `${v.rotate ?? 0}deg` },
            ],
          };

          return (
            <View style={[s.slide, { width }]}>
              {/* Nền vector + illustration */}
              <ImageBackground source={item.bg} style={s.heroWrap} imageStyle={[s.bgImg, vStyle]}>
                <Image
                  source={item.img}
                  style={[
                    s.hero,
                    heroStyle,
                    { transform: [{ translateY: HERO_HEIGHT * hdy }, { scale: hscale }] },
                  ]}
                  resizeMode="contain"
                />
              </ImageBackground>

              {/* Dots + text */}
              <View style={[s.bottomInfo, st.content, { paddingBottom: SPACE_FOR_CTA }]}>
                <DotIndicator count={SLIDES.length} index={i} />
                <View style={s.textBox}>
                  <Text style={[s.title, st.title]}>{item.title}</Text>
                  <Text style={[s.desc, st.desc]}>{item.desc}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* CTA */}
      <View style={s.bottom}>
        <Pressable style={s.cta} onPress={next}>
          <Text style={s.ctaText}>{index === SLIDES.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}</Text>
          <Text style={s.ctaArrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ================= styles ================= */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(12), paddingTop: scale(4) },
  backBtn: { width: scale(32), height: scale(32), borderRadius: scale(16), borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: scale(20), color: '#6B7280', marginTop: -scale(2) },
  skip: { fontSize: scale(14), color: '#6B7280' },

  slide: { flex: 1 },
  heroWrap: { height: HERO_HEIGHT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bgImg: {},
  hero: { width: '65%', height: '65%' },

  bottomInfo: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  textBox: { paddingHorizontal: scale(24), alignSelf: 'stretch', marginTop: scale(8) },
  title: { marginTop: scale(12), fontSize: scale(24), lineHeight: scale(30), fontWeight: '700', color: '#111827', textAlign: 'center' },
  desc: { marginTop: scale(10), fontSize: scale(14), lineHeight: scale(20), color: '#4B5563', textAlign: 'center' },

  bottom: { paddingHorizontal: CTA_RIGHT_PADDING, paddingBottom: CTA_BOTTOM_PADDING, alignItems: 'flex-end' },
  cta: { height: CTA_HEIGHT, paddingHorizontal: scale(16), borderRadius: scale(12), backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(8) },
  ctaText: { color: '#fff', fontSize: scale(16), fontWeight: '600' },
  ctaArrow: { color: '#fff', fontSize: scale(18), marginTop: -scale(1) },
});
