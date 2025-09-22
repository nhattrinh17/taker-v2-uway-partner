import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootNavigatorParamList } from '../../navigation/typings';
import { navigate } from "../../navigation/utils/navigationUtils";
import { GOONG_API_KEY } from "../../services/APIConfig";

type Props = NativeStackScreenProps<RootNavigatorParamList, 'AddressSearchScreen'>;

export default function AddressSearchScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${text}`
      );
      const data = await res.json();
      setResults(data.predictions || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(
        `https://rsapi.goong.io/Place/Detail?placeid=${placeId}&api_key=${GOONG_API_KEY}`
      );
      const data = await res.json();

      // trả về màn hình gọi
      navigate(route.params.returnScreen, {
        address: {
          address: description,
          location: data.result.geometry.location, // { lat, lng }
        }
      });
    } catch (error) {
      console.error("Detail fetch error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nhập địa chỉ..."
        value={query}
        onChangeText={fetchSuggestions}
        style={styles.input}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item.place_id, item.description)}
            style={styles.item}
          >
            <Text style={styles.itemText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 1 ? (
            <Text style={styles.noResult}>Không có kết quả</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  noResult: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});
