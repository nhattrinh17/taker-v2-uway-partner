import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Modal, StyleSheet, Pressable, Dimensions, Text } from 'react-native';
import { Icons } from '../assets';
const { width, height } = Dimensions.get('window');

export default function ViewImageModal({ images }: { images: string[] }) {
  const [visible, setVisible] = useState(false);
  const [currentImg, setCurrentImg] = useState<string | null>(null);

  const openImage = (uri: string) => {
    setCurrentImg(uri);
    setVisible(true);
  };

  return (
    <View style={styles.container}>
      {images.map((img, idx) => (
        <TouchableOpacity key={idx} onPress={() => openImage(img)}>
          <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
        </TouchableOpacity>
      ))}

      {/* Modal hiển thị ảnh lớn */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.closeArea} onPress={() => setVisible(false)} />
          {currentImg && (
            <Image
              source={{ uri: currentImg }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>      
            <Icons.DeleteCircle height={26} width={26}/>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 8,

  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width * 0.9,
    height: height * 0.8,
  },
  closeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  closeX: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    backgroundColor: 'white',
  },
});
