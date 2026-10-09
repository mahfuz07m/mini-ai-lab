import { Text, View } from "react-native";

export default function PredictionResult({
  result,
}: {
  result: { model: string; prediction: string; description: string } | null;
}) {
  if (!result) return null;

  return (
    <View className="mt-5 rounded-2xl border border-violet-400/20 bg-[#17151f] p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-widest text-violet-300">
          Prediction result
        </Text>
      </View>

      <Text className="text-xs text-gray-400">Algorithm: {result.model}</Text>

      <Text className="mt-2 text-2xl font-bold text-white">
        {result.prediction}
      </Text>

      <Text className="mt-3 text-sm leading-6 text-gray-400">
        {result.description}
      </Text>

      <View className="mt-4 border-t border-white/10 pt-3">
        <Text className="text-xs leading-5 text-gray-500">
          Definitely it can be wrong as it is trained on a small dataset. Please
          use it for educational purposes only.
        </Text>
      </View>
    </View>
  );
}
