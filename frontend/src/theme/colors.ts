// Centralized Theme Color System for Seedha Properties (NoBroker Palette)
// Palette definition:
// Primary: #009587 (NoBroker Teal / Jade)
// PrimaryDark: #004953 (NoBroker Deep Petrol / Dark Teal)
// Secondary: #1F5A60 (NoBroker Slate Cyan)
// Accent: #FD3752 (NoBroker Iconic Red / Coral CTA)
// Background: #F7F9FA (NoBroker Clean Light Canvas)
// Surface: #FFFFFF (Crisp White Card)
// Text: #222222 (Deep Charcoal) / #555555 / #888888

export const colors = {
  // Core Brand Palette (NoBroker Style)
  primary: '#009587',          // NoBroker Signature Teal
  secondary: '#1F5A60',        // Deep Slate Teal
  tertiary: '#E2E8F0',         // Subtle Border Gray
  accent: '#FD3752',           // NoBroker Signature Coral Red (CTA, Alerts)
  background: '#F7F9FA',       // Clean, high-readability backdrop

  // Derived Variations & Soft Background Tints
  primaryDark: '#004953',      // Dark teal for contrast headers/footers
  primaryLight: '#26A69A',     // Vibrant mint/teal
  primaryBg: 'rgba(0, 149, 135, 0.08)', // Soft teal wash for chips & cards

  secondaryLight: '#3A7D84',
  secondaryDark: '#00353C',
  secondaryBg: 'rgba(31, 90, 96, 0.08)',

  tertiaryLight: '#F1F5F9',
  tertiaryDark: '#94A3B8',
  tertiaryBg: 'rgba(226, 232, 240, 0.4)',

  accentLight: '#FFEBEF',      // Soft red/pink tint for badges & favorites
  accentDark: '#E2233E',       // Deeper red for active/pressed states
  accentBg: 'rgba(253, 55, 82, 0.08)',

  // Surfaces & Cards
  surface: '#FFFFFF',          // Pure clean card surface
  surfaceSoft: '#F8FAFC',

  // Borders & Dividers
  border: '#E2E8F0',           // Modern subtle border
  borderLight: '#EDF2F7',      // Ultra light divider
  divider: '#E2E8F0',

  // Text Colors
  textPrimary: '#222222',      // Crisp dark text for optimal readability
  textSecondary: '#555555',    // Secondary body & descriptions
  textMuted: '#888888',        // Form hints, icons, timestamps
  textLight: '#F7F9FA',
  textWhite: '#FFFFFF',
  textAccent: '#FD3752',       // Red highlights
  textSecondaryColor: '#009587', // Teal link/highlights

  // Status & Badges
  success: '#009587',          // Teal verified check / success
  successBg: '#E6F7F5',
  danger: '#FD3752',           // Coral Red for danger / cancellations
  dangerBg: '#FFEBEF',
  warning: '#FF9F00',          // Amber/Gold for ratings and reviews
  warningBg: '#FFF8E1',
  info: '#004953',
  infoBg: '#E0F2F1',

  // Overlay tokens (refined for clear image visibility & readability)
  overlaySubtle: 'rgba(0, 73, 83, 0.20)',
  overlayLight: 'rgba(0, 73, 83, 0.35)',
  overlayMedium: 'rgba(0, 73, 83, 0.50)',
  overlayDark: 'rgba(0, 35, 40, 0.65)',
  backdropOverlay: 'rgba(0, 0, 0, 0.45)',
  modalOverlay: 'rgba(0, 0, 0, 0.50)',

  // Shadow Colors & Constants
  shadowColor: '#004953',

  // Typography Standard Sizes
  fontSizeXs: 11,
  fontSizeSm: 13,
  fontSizeMd: 15,
  fontSizeLg: 18,
  fontSizeXl: 24,

  // Uniform Corner Radius Tokens
  radiusSm: 8,      // Small tags, badges, chips
  radiusMd: 12,     // Inputs, buttons, small cards
  radiusLg: 16,     // Large cards, modals, containers
  radiusPill: 24,   // Segment controls, pill buttons

  // Typography Tokens & Font Family
  fontFamily: 'Plus Jakarta Sans',
  fontFamilyStack: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemiBold: '600',
  fontWeightBold: '700',
  fontWeightExtraBold: '800',

  // Dark Canvas (For splash or dark highlights)
  darkBg: '#004953',
};

export default colors;
