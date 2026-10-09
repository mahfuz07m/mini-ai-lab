import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Link } from "expo-router";
import InputField from "../components/InputField";
import ModelSelector from "../components/ModelSelector";
import PredictionResult from "../components/PredictionResult";

import { predictSpam } from "../models/classification";
import { predictStudentCluster } from "../models/clustering";
import { predictFruit } from "../models/fruitClassification";
import { predictHousePrice } from "../models/regression";

const MODEL_INFO = {
  spam: {
    name: "Spam detection",
    description: "Classify a message as spam or not spam.",
    fields: [
      {
        key: "message",
        label: "Email or message",
        placeholder: "e.g. Congratulations! You won a prize",
        keyboardType: "default",
        multiline: true,
        hint: "",
      },
    ],
  },
  regression: {
    name: "House price prediction",
    description: "Estimate a price from the house area.",
    fields: [
      {
        key: "area",
        label: "House area",
        placeholder: "900",
        keyboardType: "numeric",
        multiline: false,
        hint: "sq ft",
      },
    ],
  },
  clustering: {
    name: "Student clustering",
    description: "Explore groups based on study and sleep habits.",
    fields: [
      {
        key: "study",
        label: "Study hours per day",
        placeholder: "5",
        keyboardType: "numeric",
        multiline: false,
        hint: "hours",
      },
      {
        key: "sleep",
        label: "Sleep hours per day",
        placeholder: "7",
        keyboardType: "numeric",
        multiline: false,
        hint: "hours",
      },
    ],
  },
  deep: {
    name: "Fruit classification",
    description: "Classify a fruit using numerical features.",
    fields: [
      {
        key: "weight",
        label: "Fruit weight",
        placeholder: "150",
        keyboardType: "numeric",
        multiline: false,
        hint: "grams",
      },
      {
        key: "color",
        label: "Color score",
        placeholder: "0.9",
        keyboardType: "decimal-pad",
        multiline: false,
        hint: "0–1",
      },
    ],
  },
} as const;

type ModelKey = keyof typeof MODEL_INFO;

const INITIAL_VALUES = {
  message: "Congratulations! You won a free prize",
  area: "900",
  study: "5",
  sleep: "7",
  weight: "150",
  color: "0.9",
};

export default function HomeScreen() {
  const [selected, setSelected] = useState<ModelKey>("spam");
  const [values, setValues] = useState(INITIAL_VALUES);
  const [result, setResult] = useState<{
    model: string;
    prediction: string;
    description: string;
  } | null>(null);
  const [error, setError] = useState("");

  const model = MODEL_INFO[selected];

  function changeModel(id: ModelKey) {
    setSelected(id);
    setResult(null);
    setError("");
  }

  function updateField(key: string, value: string) {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));

    setResult(null);
    setError("");
  }

  function handlePredict() {
    setResult(null);
    setError("");

    const missing = model.fields.some((field) => !values[field.key].trim());

    if (missing) {
      setError("Please complete all fields before predicting.");
      return;
    }

    try {
      let output;

      switch (selected) {
        case "spam": {
          output = predictSpam(values.message);

          setResult({
            model: output.model,
            prediction: output.prediction,
            description:
              `Model confidence: ${output.confidence}%. ` +
              "Educational sample only, not a real spam-security tool.",
          });
          break;
        }

        case "regression": {
          const area = Number(values.area);

          if (!Number.isFinite(area) || area <= 0) {
            throw new Error("Enter a house area greater than zero.");
          }

          output = predictHousePrice(area);

          setResult({
            model: output.model,
            prediction: `${output.prediction.toFixed(1)} lakh BDT`,
            description:
              `Estimated for ${area.toLocaleString()} sq ft using ` +
              "illustrative training data, not real market data.",
          });
          break;
        }

        case "clustering": {
          output = predictStudentCluster(values.study, values.sleep);

          setResult(output);
          break;
        }

        case "deep": {
          output = predictFruit(values.weight, values.color);

          setResult({
            model: output.model,
            prediction: output.prediction,
            description:
              `${output.description} ` +
              `Neighbor vote: ${output.confidence}%.`,
          });
          break;
        }

        default:
          throw new Error("Unknown model selected.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Prediction failed. Please check your input.",
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" backgroundColor="#24242b" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 36 }}
        >
          {/* Header */}
          <View className="px-5 pb-6 pt-4">
            <View className="mb-5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15">
                  <Text className="text-2xl text-white">✳</Text>
                </View>

                <View>
                  <Text className="text-2xl font-bold tracking-tight text-white">
                    Mini AI Lab
                  </Text>
                  <Text className="mt-1 text-sm text-gray-400">
                    Learn AI by experimenting
                  </Text>
                </View>
              </View>
            </View>
            {/* Intro banner */}
            <View className="rounded-2xl border border-white/10 bg-[#131316] p-4">
              <Text className="text-base font-semibold text-white">
                Personal AI playground
              </Text>
              <Text className="mt-2 text-sm leading-6 text-gray-400">
                Explore machine learning models through small, interactive
                experiments.
              </Text>
              <Link
                href="https://github.com/mahfuz07m/mini-ai-lab"
                target="_blank"
                className="rounded-2xl border bg-violet-500 w-max p-4 mt-2"
              >
                <Text className="text-base font-semibold text-white">
                  🐙 Github Repository
                </Text>
              </Link>
            </View>
          </View>

          {/* Main form */}
          <View className="mx-5 rounded-3xl border border-white/10 bg-[#101012] p-5">
            <View className="mb-5">
              <Text className="text-lg font-bold text-white">
                Select a model
              </Text>
              <Text className="mt-1 text-sm text-gray-400">
                These are examples of machine learning models.
              </Text>
            </View>

            {/* @ts-ignore */}
            <ModelSelector selected={selected} onSelect={changeModel} />

            <View className="my-6 h-px bg-white/10" />

            {/* Dynamic input section */}
            <View className="mb-5">
              <Text className="text-lg font-bold text-white">
                Selected Model
              </Text>
              <Text className="mt-1 text-sm leading-5 text-gray-400">
                {model.description}
              </Text>
            </View>

            <View className="gap-5">
              {model.fields.map((field) => (
                <InputField
                  key={`${selected}-${field.key}`}
                  label={field.label}
                  value={values[field.key]}
                  onChangeText={(value) => updateField(field.key, value)}
                  placeholder={field.placeholder}
                  multiline={field.multiline}
                  keyboardType={field.keyboardType || "default"}
                  hint={field.hint}
                />
              ))}
            </View>

            {!!error && (
              <View className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3">
                <Text className="text-sm leading-5 text-red-300">{error}</Text>
              </View>
            )}

            {/* Predict button */}
            <Pressable
              onPress={handlePredict}
              accessibilityRole="button"
              className="mt-6 flex-row items-center justify-center rounded-2xl bg-violet-500 px-5 py-4 active:bg-violet-600"
            >
              <Text className="mr-2 text-base font-bold text-white">✳</Text>
              <Text className="text-base font-bold text-white">Predict</Text>
            </Pressable>
          </View>

          {/* Result appears below the form after Predict */}
          <View className="mx-5">
            <PredictionResult result={result} />
          </View>

          {/* Footer */}
          <View className="items-center px-8 pb-4 pt-7">
            <Text className="text-center text-sm text-gray-400 leading-5">
              Built with 💜 by Md Mahfuzur Rahman Rafi
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
