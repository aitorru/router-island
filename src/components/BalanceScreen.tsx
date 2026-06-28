import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { formatCredits, type CreditsSnapshot } from '../openrouter';
import { theme } from '../theme';

interface Props {
  snapshot: CreditsSnapshot | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onRemoveKey: () => void;
}

function relativeTime(epoch: number): string {
  const seconds = Math.round((Date.now() - epoch) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function BalanceScreen({ snapshot, loading, error, onRefresh, onRemoveKey }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={theme.text} />
      }
    >
      <Text style={styles.label}>OpenRouter credits left</Text>

      <Text style={styles.balance}>
        {snapshot ? formatCredits(snapshot.remaining) : loading ? '…' : '—'}
      </Text>

      {snapshot ? (
        <View style={styles.metaRow}>
          <Meta title="Used" value={formatCredits(snapshot.used)} />
          <Meta
            title="Total"
            value={snapshot.total != null ? formatCredits(snapshot.total) : '—'}
          />
          <Meta title="Source" value={snapshot.source === 'credits' ? 'Account' : 'Key'} />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {snapshot ? (
        <Text style={styles.updated}>Updated {relativeTime(snapshot.fetchedAt)}</Text>
      ) : null}

      <View style={styles.hint}>
        <Text style={styles.hintTitle}>Show it in the Dynamic Island</Text>
        <Text style={styles.hintBody}>
          Add the “Display OpenRouter credits left” shortcut to Siri to pop your balance into
          the Dynamic Island any time — no need to open this app.
        </Text>
      </View>

      <TouchableOpacity style={styles.refresh} onPress={onRefresh} disabled={loading}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRemoveKey}>
        <Text style={styles.remove}>Remove API key</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Meta({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 18 },
  label: { color: theme.textMuted, fontSize: 15, textAlign: 'center' },
  balance: {
    color: theme.positive,
    fontSize: 64,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  meta: { alignItems: 'center', gap: 2 },
  metaValue: { color: theme.text, fontSize: 17, fontWeight: '700' },
  metaTitle: { color: theme.textMuted, fontSize: 12 },
  updated: { color: theme.textMuted, fontSize: 13, textAlign: 'center' },
  error: { color: theme.danger, fontSize: 14, textAlign: 'center' },
  hint: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginTop: 8,
  },
  hintTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  hintBody: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
  refresh: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  refreshText: { color: theme.text, fontSize: 17, fontWeight: '700' },
  remove: { color: theme.danger, textAlign: 'center', marginTop: 2 },
});
