import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D141A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  scrollContentWithInstallPrompt: {
    paddingBottom: 220,
  },
  screenFrame: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  loggedInLayout: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
    gap: 18,
  },
  installCard: {
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    minHeight: 196,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 18,
  },
  installOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  installModal: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 30,
    overflow: 'hidden',
    // @ts-ignore - boxShadow is valid on web, elevation on native
    boxShadow: '0px 10px 20px rgba(0,0,0,0.24)',
    elevation: 16,
  },
  installCardDark: {
    backgroundColor: '#14212A',
    borderWidth: 1,
    borderColor: '#22323D',
  },
  installCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1DE',
  },
  installCopy: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  installTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  installTitleDark: {
    color: '#F7F4EC',
  },
  installTitleLight: {
    color: '#101418',
  },
  installText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 520,
  },
  installTextDark: {
    color: '#B8C2CC',
  },
  installTextLight: {
    color: '#5F6A72',
  },
  installActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  installSecondaryButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  installSecondaryDark: {
    backgroundColor: '#0F1920',
  },
  installSecondaryLight: {
    backgroundColor: '#EEF3F1',
  },
  installSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  installSecondaryTextDark: {
    color: '#F7F4EC',
  },
  installSecondaryTextLight: {
    color: '#101418',
  },
  installPrimaryButton: {
    backgroundColor: '#33A06F',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  installPrimaryButtonText: {
    color: '#F7FBF9',
    fontSize: 14,
    fontWeight: '800',
  },
  loggedInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  loggedInHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  loggedInTitle: {
    color: '#F7F4EC',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  loggedInSubtitle: {
    color: '#B8C2CC',
    fontSize: 14,
  },
  headerLogoutButton: {
    backgroundColor: '#F3EDE2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  headerLogoutButtonCompact: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  headerLogoutText: {
    color: '#101418',
    fontSize: 14,
    fontWeight: '800',
  },
  dashboardContainer: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
  },
  loadingText: {
    color: '#D7E0E8',
    fontSize: 15,
  },
  heroPanel: {
    backgroundColor: '#14212A',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#22323D',
    // @ts-ignore - boxShadow is valid on web, elevation on native
    boxShadow: '0px 12px 24px rgba(0,0,0,0.28)',
    elevation: 8,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#1E322B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
  },
  brandBadgeText: {
    color: '#7FD1AE',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#F7F4EC',
    fontSize: 33,
    lineHeight: 39,
    fontWeight: '800',
    marginBottom: 12,
  },
  heroDescription: {
    color: '#B8C2CC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },
  featureList: {
    backgroundColor: '#0F1920',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#7FD1AE',
    marginTop: 5,
  },
  featureText: {
    flex: 1,
    color: '#D7E0E8',
    fontSize: 14,
    lineHeight: 20,
  },
  formPanel: {
    backgroundColor: '#F3EDE2',
    borderRadius: 30,
    padding: 24,
  },
  eyebrow: {
    color: '#5B655D',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 8,
  },
  formTitle: {
    color: '#101418',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  formSubtitle: {
    color: '#5F6A72',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  inputGroup: {
    gap: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: '#172128',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7CCB9',
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#172128',
  },
  inputError: {
    borderColor: '#A63A2E',
  },
  fieldErrorText: {
    color: '#A63A2E',
    fontSize: 12,
    lineHeight: 16,
  },
  optionRow: {
    marginTop: 18,
    marginBottom: 14,
    backgroundColor: '#E8DFD1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    color: '#172128',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#667078',
    fontSize: 13,
    lineHeight: 18,
  },
  helperText: {
    color: '#52606A',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
    minHeight: 38,
  },
  helperTextError: {
    color: '#A63A2E',
  },
  primaryButton: {
    backgroundColor: '#101418',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    marginBottom: 18,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#F7F4EC',
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: {
    color: '#5F6A72',
    fontSize: 14,
  },
  footerLink: {
    color: '#101418',
    fontSize: 14,
    fontWeight: '800',
  },
});

export const dashboardStyles = StyleSheet.create({
  page: {
    flex: 1,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsRow: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    padding: 8,
    gap: 8,
    alignItems: 'stretch',
    height: 64,
  },
  tabButton: {
    width: 148,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonCompact: {
    width: 128,
    height: 44,
    paddingHorizontal: 10,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    gap: 18,
  },
  contentInnerCompact: {
    padding: 14,
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
  },
  heroSubtitleCompact: {
    maxWidth: '100%',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    minWidth: 112,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  riskBadgeCompact: {
    alignSelf: 'stretch',
    width: '100%',
  },
  riskValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  riskLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  stackGrid: {
    flexDirection: 'column',
  },
  statCard: {
    flexGrow: 1,
    minWidth: 160,
    borderRadius: 22,
    borderWidth: 1,
    borderTopWidth: 4,
    padding: 18,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionCard: {
    flexGrow: 1,
    minWidth: 0,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowCardCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  rowPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowPrimaryCompact: {
    alignItems: 'flex-start',
  },
  rowEmoji: {
    fontSize: 24,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  rowMeta: {
    fontSize: 13,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  smallAction: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallActionCompact: {
    alignSelf: 'flex-start',
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scannerBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  scannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  scannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  sectionButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipList: {
    marginTop: 16,
    gap: 10,
  },
  tipCard: {
    borderRadius: 16,
    padding: 14,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingRowCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  settingText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
