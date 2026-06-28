import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { theme } from '../theme';

interface Props {
  onSubmit: (apiKey: string) => Promise<void>;
}

/** First-launch screen where the user pastes their OpenRouter API key. */
export function ApiKeyForm({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!value.trim()) {
      setError('Paste your OpenRouter API key first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(value);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Router Island</Text>
      <Text style={styles.subtitle}>
        Paste your OpenRouter API key. It is stored only on this device.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="sk-or-v1-…"
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        editable={!busy}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <Text style={styles.buttonText}>Save key</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL('https://openrouter.ai/settings/keys')}>
        <Text style={styles.link}>Where do I find my key?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  title: { color: theme.text, fontSize: 34, fontWeight: '800' },
  subtitle: { color: theme.textMuted, fontSize: 15, lineHeight: 21 },
  input: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 14,
    color: theme.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: theme.text, fontSize: 17, fontWeight: '700' },
  link: { color: theme.accent, textAlign: 'center', marginTop: 4 },
  error: { color: theme.danger, fontSize: 14 },
});
