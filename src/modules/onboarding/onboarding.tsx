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

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(height * 0.58, 420);

// CTA để chừa chỗ cho text đứng ngay trên nút
const CTA_HEIGHT = 48;
const CTA_RIGHT_PADDING = 24;
const CTA_BOTTOM_PADDING = 24;
const GAP_TEXT_TO_CTA = 8;
const EXTRA_SAFE = Platform.OS === 'ios' ? 4 : 0;
const SPACE_FOR_CTA = CTA_HEIGHT + CTA_BOTTOM_PADDING + GAP_TEXT_TO_CTA + EXTRA_SAFE;

/** --- TYPES cho override --- */
type VectorOverride = {
  dy?: number;          // dịch dọc theo tỉ lệ HERO_HEIGHT (âm: lên, dương: xuống)
  scale?: number;       // phóng to / thu nhỏ
  rotate?: number;      // độ (deg), ví dụ -0.16
  widthPct?: number;    // % bề rộng ảnh nền (mặc định 115)
  heightPct?: number;   // % bề cao ảnh nền (mặc định 115)
};

type HeroOverride = ImageStyle & { dy?: number; scale?: number };

type PerSlideStyle = {
  vector?: VectorOverride;  // ⭐ chỉnh “vector” nền theo slide ở đây
  hero?: HeroOverride;      // tuỳ chọn: chỉnh ảnh minh hoạ theo slide
  content?: ViewStyle;
  title?: TextStyle;
  desc?: TextStyle;
};

type Slide = {
  key: string;
  bg: any;   // vector PNG nền
  img: any;  // illustration
  title: string;
  desc: string;
  style?: PerSlideStyle;
};

/** --- KHAI BÁO SLIDES: chỉnh tại đây --- */
const SLIDES: Slide[] = [
  {
    key: 's1',
    bg: Images.vector1,
    img: Images.onboard1,
    title: 'Uway – Đặt & Dùng,\nDễ như chạm tay',
    desc: 'Đặt xe, giao hàng, mua sắm, giặt giày…\nTất cả trong một ứng dụng – Uway.',
    style: {
      vector: {
        dy: 0.02,       // Nâng nhẹ để khớp với slide 2
        scale: 1,
        rotate: 0.16,
        widthPct: 100,
        heightPct: 95    // Giảm chiều cao để không quá cao so với slide 2
      },
      hero: { width: '65%', height: '65%', dy: 0, scale: 1 },
    },
  },
  {
    key: 's2',
    bg: Images.vector2,
    img: Images.onboard2,
    title: 'Giặt & đánh giày',
    desc: 'Đặt lịch vệ sinh giày nhanh chóng,\nchuyên nghiệp ngay tại nhà.',
    style: {
      vector: {
        dy: 0,          // Làm chuẩn cho slide 2
        scale: 1,
        rotate: 0.16,
        widthPct: 100,
        heightPct: 100   // Chiều cao chuẩn
      },
      hero: { width: '64%', height: '64%', dy: -0.02, scale: 0.98 },
      desc: { maxWidth: 320 },
    },
  },
  {
    key: 's3',
    bg: Images.vector3,
    img: Images.onboard3,
    title: 'Giao hàng & đặt xe –\nCần là có ngay!',
    desc: 'Uway đồng hành cùng bạn mọi nơi.\nNhanh, tiện, không lo nghĩ.',
    style: {
      vector: {
        dy: -0.02,      // Hạ nhẹ để khớp với slide 2
        scale: 1,
        rotate: 0.16,
        widthPct: 100,
        heightPct: 95    // Giảm chiều cao để không quá cao so với slide 2
      },
      hero: { width: '66%', height: '66%', dy: 0.01, scale: 1.03 },
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
          <Pressable onPress={prev} style={s.backBtn} hitSlop={8}>
            <Text style={s.backIcon}>‹</Text>
          </Pressable>
        ) : <View style={{ width: 32, height: 32 }} />}
        <Pressable onPress={skip} hitSlop={8}><Text style={s.skip}>Bỏ qua</Text></Pressable>
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
          // === HERO transform (tách dy/scale khỏi ImageStyle để tránh lỗi TS)
          const { dy: hdy = 0, scale: hscale = 1, ...heroStyle } = (st.hero ?? {}) as HeroOverride;
          // === VECTOR style cho imageBackground.imageStyle
          const v = st.vector ?? {};
          const vStyle: ImageStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: width,        // mỗi slide full width màn hình
            height: HERO_HEIGHT, // cùng chiều cao
            resizeMode: 'stretch', // ép căng cho liền nhau
            transform: [
              { translateY: HERO_HEIGHT * (v.dy ?? 0) },
            ],
          };


          return (
            <View style={[s.slide, { width }]}>
              {/* Nền vector + illustration */}
              <ImageBackground source={item.bg} style={s.heroWrap} imageStyle={[s.bgImg, vStyle]}>
                <Image
                  source={item.img}
                  style={[s.hero, heroStyle, { transform: [{ translateY: HERO_HEIGHT * hdy }, { scale: hscale }] }]}
                  resizeMode="contain"
                />
              </ImageBackground>

              {/* Dots + text (đứng ngay trên CTA) */}
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

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  backBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: '#6B7280', marginTop: -2 },
  skip: { fontSize: 14, color: '#6B7280' },

  slide: { flex: 1 },
  heroWrap: { height: HERO_HEIGHT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bgImg: {},  // imageStyle nền vector; phần “vStyle” sẽ ghi đè width/height/transform
  hero: { width: '65%', height: '65%' },

  bottomInfo: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  textBox: { paddingHorizontal: 24, alignSelf: 'stretch', marginTop: 8 },
  title: { marginTop: 12, fontSize: 24, lineHeight: 30, fontWeight: '700', color: '#111827', textAlign: 'center' },
  desc: { marginTop: 10, fontSize: 14, lineHeight: 20, color: '#4B5563', textAlign: 'center' },

  bottom: { paddingHorizontal: CTA_RIGHT_PADDING, paddingBottom: CTA_BOTTOM_PADDING, alignItems: 'flex-end' },
  cta: { height: CTA_HEIGHT, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ctaArrow: { color: '#fff', fontSize: 18, marginTop: -1 },
});