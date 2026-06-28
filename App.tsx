import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ApiKeyForm } from './src/components/ApiKeyForm';
import { BalanceScreen } from './src/components/BalanceScreen';
import { clearApiKey, getApiKey, saveApiKey } from './src/storage';
import { useCredits } from './src/hooks/useCredits';
import { theme } from './src/theme';

type Status = 'loading' | 'needsKey' | 'ready';

export default function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { snapshot, loading, error, refresh } = useCredits(apiKey);

  useEffect(() => {
    getApiKey()
      .then((key) => {
        setApiKey(key);
        setStatus(key ? 'ready' : 'needsKey');
      })
      .catch(() => setStatus('needsKey'));
  }, []);

  const handleSubmit = useCallback(async (key: string) => {
    await saveApiKey(key);
    setApiKey(key.trim());
    setStatus('ready');
  }, []);

  const handleRemove = useCallback(async () => {
    await clearApiKey();
    setApiKey(null);
    setStatus('needsKey');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : status === 'needsKey' ? (
        <ApiKeyForm onSubmit={handleSubmit} />
      ) : (
        <BalanceScreen
          snapshot={snapshot}
          loading={loading}
          error={error}
          onRefresh={refresh}
          onRemoveKey={handleRemove}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
