/**
 * Icon Asset Registry
 * 
 * This file is the single source of truth for all icon imports.
 * Icons are organized by category and use lazy loading for better performance.
 * 
 * To add a new icon:
 * 1. For Lucide icons: Add an entry to the icon category below
 * 2. For custom SVG icons: Place the icon file in the appropriate category directory and add an entry
 * 3. For flag images: Place PNG in flags/ directory and add an entry
 * 4. The icon will automatically be available via the Icon component
 */

// ============================================================================
// FLAGS
// PNG flag images for country flags
// ============================================================================
const flags = {
	// Add flag icons here as needed
	// Example: 'flags/USA': () => import('./flags/USA.png'),
} as const;

// ============================================================================
// ICONS
// General SVG icons for UI elements (using Lucide Svelte icons)
// ============================================================================
const icon = {
	// Navigation & UI
	'icon/menu': () => import('@lucide/svelte/icons/menu'),
	'icon/search': () => import('@lucide/svelte/icons/search'),
	'icon/home': () => import('@lucide/svelte/icons/home'),
	'icon/settings': () => import('@lucide/svelte/icons/settings'),
	'icon/user': () => import('@lucide/svelte/icons/user'),
	'icon/users': () => import('@lucide/svelte/icons/users'),
	'icon/bell': () => import('@lucide/svelte/icons/bell'),
	'icon/mail': () => import('@lucide/svelte/icons/mail'),
	
	// Actions
	'icon/plus': () => import('@lucide/svelte/icons/plus'),
	'icon/minus': () => import('@lucide/svelte/icons/minus'),
	'icon/x': () => import('@lucide/svelte/icons/x'),
	'icon/check': () => import('@lucide/svelte/icons/check'),
	'icon/edit': () => import('@lucide/svelte/icons/edit'),
	'icon/trash': () => import('@lucide/svelte/icons/trash'),
	'icon/save': () => import('@lucide/svelte/icons/save'),
	'icon/download': () => import('@lucide/svelte/icons/download'),
	'icon/upload': () => import('@lucide/svelte/icons/upload'),
	
	// Commerce
	'icon/shopping-cart': () => import('@lucide/svelte/icons/shopping-cart'),
	'icon/shopping-bag': () => import('@lucide/svelte/icons/shopping-bag'),
	'icon/package': () => import('@lucide/svelte/icons/package'),
	'icon/credit-card': () => import('@lucide/svelte/icons/credit-card'),
	'icon/store': () => import('@lucide/svelte/icons/store'),
	'icon/trending-up': () => import('@lucide/svelte/icons/trending-up'),
	
	// Media & Files
	'icon/image': () => import('@lucide/svelte/icons/image'),
	'icon/file': () => import('@lucide/svelte/icons/file'),
	'icon/folder': () => import('@lucide/svelte/icons/folder'),
	
	// Arrows & Navigation
	'icon/arrow-left': () => import('@lucide/svelte/icons/arrow-left'),
	'icon/arrow-right': () => import('@lucide/svelte/icons/arrow-right'),
	'icon/arrow-up': () => import('@lucide/svelte/icons/arrow-up'),
	'icon/arrow-down': () => import('@lucide/svelte/icons/arrow-down'),
	'icon/chevron-left': () => import('@lucide/svelte/icons/chevron-left'),
	'icon/chevron-right': () => import('@lucide/svelte/icons/chevron-right'),
	'icon/chevron-down': () => import('@lucide/svelte/icons/chevron-down'),
	'icon/user-plus': () => import('@lucide/svelte/icons/user-plus'),
	'icon/tag': () => import('@lucide/svelte/icons/tag'),
	
	// Status & Feedback
	'icon/info': () => import('@lucide/svelte/icons/info'),
	'icon/alert-circle': () => import('@lucide/svelte/icons/alert-circle'),
	'icon/check-circle': () => import('@lucide/svelte/icons/check-circle'),
	'icon/x-circle': () => import('@lucide/svelte/icons/x-circle'),
	'icon/eye': () => import('@lucide/svelte/icons/eye'),
	'icon/eye-off': () => import('@lucide/svelte/icons/eye-off'),
	
	// Custom SVG icons can be added here:
	// 'icon/custom-name': () => import('./icon/custom-name.svg?component'),
} as const;

// ============================================================================
// SOCIAL
// Social media platform icons
// ============================================================================
const social = {
	// Add social media icons here as needed
	// Example: 'social/Facebook': () => import('./social/Facebook.svg?component'),
} as const;

// ============================================================================
// TECHNOLOGY
// Technology company logos and tech stack icons
// ============================================================================
const technology = {
	// Add technology icons here as needed
	// Example: 'technology/React': () => import('./technology/React.svg?component'),
} as const;

// ============================================================================
// PAYMENT
// Payment method and financial service icons
// ============================================================================
const payment = {
	// Add payment icons here as needed
	// Example: 'payment/Visa': () => import('./payment/Visa.svg?component'),
} as const;

// ============================================================================
// ICON MAP
// Unified map of all icons organized by category
// ============================================================================
export const IconMap = {
	...flags,
	...icon,
	...social,
	...technology,
	...payment,
} as const;

// ============================================================================
// TYPES
// TypeScript types for type-safe icon names
// ============================================================================

/**
 * All available icon names in the format "category/name"
 */
export type IconType = keyof typeof IconMap;

/**
 * Flag icon names (category starts with 'flags/')
 */
export type FlagIconType = Extract<IconType, `flags/${string}`>;

/**
 * General icon names (category starts with 'icon/')
 */
export type GeneralIconType = Extract<IconType, `icon/${string}`>;

/**
 * Social media icon names (category starts with 'social/')
 */
export type SocialIconType = Extract<IconType, `social/${string}`>;

/**
 * Technology icon names (category starts with 'technology/')
 */
export type TechnologyIconType = Extract<IconType, `technology/${string}`>;

/**
 * Payment icon names (category starts with 'payment/')
 */
export type PaymentIconType = Extract<IconType, `payment/${string}`>;

/**
 * Type for the lazy-loaded icon import result
 */
export type IconImport = () => Promise<{ default: any }>;

