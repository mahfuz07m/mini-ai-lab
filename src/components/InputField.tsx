import { Text, TextInput, View } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
  keyboardType?: string;
}

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  hint,
}: InputFieldProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center">
        <Text className="text-sm font-medium text-gray-200">{label}</Text>
        {hint ? (
          <Text className="text-xs text-gray-500 ml-3">({hint})</Text>
        ) : null}
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        multiline={multiline}
        keyboardType={keyboardType as any}
        accessibilityLabel={label}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-2xl border border-white/10 bg-[#111113] px-4 text-base text-white ${
          multiline ? "min-h-28 py-4" : "h-14"
        }`}
      />
    </View>
  );
}
