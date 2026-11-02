export const colors = {
  background: '#0b0f1a',
  panel: '#151b2b',
  panelBorder: '#26304a',
  text: '#e5e7eb',
  textMuted: '#8b95a9',
  gold: '#fbbf24',
  hp: '#ef4444',
  mana: '#3b82f6',
  ok: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  str: '#f97316',
  agi: '#10b981',
  int: '#8b5cf6',
  def: '#94a3b8',
  console: '#05070d',
  consoleText: '#a3e635',
};

export const panelStyle = {
  backgroundColor: colors.panel,
  borderColor: colors.panelBorder,
  borderWidth: 1,
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
} as const;

export const zoneTitleStyle = {
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: '700',
  letterSpacing: 1.2,
  marginBottom: 10,
} as const;
