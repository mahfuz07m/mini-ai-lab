import { Pressable, Text, View } from "react-native";

const MODELS = [
  {
    id: "spam",
    title: "Spam detection",
    subtitle: "Classification",
    symbol: "✉",
  },
  {
    id: "regression",
    title: "House price prediction",
    subtitle: "Regression",
    symbol: "⌂",
  },
  {
    id: "clustering",
    title: "Student clustering",
    subtitle: "Unsupervised learning",
    symbol: "◉",
  },
  {
    id: "deep",
    title: "Fruit classification",
    subtitle: "Deep learning",
    symbol: "✳",
  },
];

export default function ModelSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View className="gap-3">
      {MODELS.map((model) => {
        const active = selected === model.id;

        return (
          <Pressable
            key={model.id}
            onPress={() => onSelect(model.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            className={`flex-row items-center rounded-2xl border p-3 ${
              active
                ? "border-violet-400 bg-violet-500/10"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <View
              className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                active ? "bg-violet-500/20" : "bg-white/[0.06]"
              }`}
            >
              <Text
                className={`text-xl ${
                  active ? "text-violet-300" : "text-gray-300"
                }`}
              >
                {model.symbol}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-white">{model.title}</Text>
              <Text className="mt-1 text-xs text-gray-400">
                {model.subtitle}
              </Text>
            </View>

            <View
              className={`h-5 w-5 items-center justify-center rounded-full border ${
                active ? "border-violet-400" : "border-gray-500"
              }`}
            >
              {active && (
                <View className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
