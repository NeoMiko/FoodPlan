import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    minHeight: '100%',
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
    // @ts-ignore
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
    // @ts-ignore
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
    minHeight: '100%',
  },
  tabsRow: {
    margin: 12,
    marginBottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
    gap: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tabButton: {
    minWidth: 80,
    flexGrow: 1,
    height: 38,
    borderRadius: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonCompact: {
    width: 100,
    height: 38,
    paddingHorizontal: 6,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 14,
    gap: 14,
  },
  contentInnerCompact: {
    padding: 10,
    gap: 10,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 460,
  },
  heroSubtitleCompact: {
    maxWidth: '100%',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    minWidth: 90,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  riskBadgeCompact: {
    alignSelf: 'stretch',
    width: '100%',
  },
  riskValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  riskLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  stackGrid: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderTopWidth: 4,
    padding: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 18,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionCard: {
    flexGrow: 1,
    minWidth: 0,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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
    gap: 10,
    flex: 1,
  },
  rowPrimaryCompact: {
    alignItems: 'flex-start',
  },
  rowEmoji: {
    fontSize: 22,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowMeta: {
    fontSize: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  smallAction: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallActionCompact: {
    alignSelf: 'flex-start',
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scannerBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  scannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  scannerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  sectionButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sectionButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingVertical: 7,
  },
  historyDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 5,
  },
  historyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  tipList: {
    marginTop: 12,
    gap: 8,
  },
  tipCard: {
    borderRadius: 14,
    padding: 12,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
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
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  settingText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
