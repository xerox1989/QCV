
export enum VaultItemType {
  PASSWORD = 'PASSWORD',
  ID = 'ID',
  ID_CARD = 'ID_CARD',
  CERTIFICATE = 'CERTIFICATE',
  AUTHENTICATION_DATA = 'AUTHENTICATION_DATA',
  NOTE = 'NOTE',
  BANK_CARD = 'BANK_CARD'
}

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  username?: string; 
  password?: string;
  blob?: string; 
  fields: Record<string, string>;
  tags: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    data: string; // Base64
    size: number;
    timestamp: number;
  }>;
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
  authType?: string;
  provider?: string;
  remarks?: string;
  deviceAuthSaved?: boolean;
  certData?: {
    publicKey: string;
    privateKey: string;
    format: string;
  };
}

export interface UserPermissions {
  allowExport: boolean;
  allowShare: boolean;
  isAdmin?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: number;
  permissions?: UserPermissions;
}

export interface BiometricCredential {
  id: string; // Base64 Credential ID
  publicKey: string; // Base64 Public Key
  encryptedPin: string; // Master PIN encrypted with a local key unlocked by biometrics
}

export interface AuthMethodConfig {
  id: string;
  type: 'pin' | 'biometric' | 'passkey' | 'recovery';
  label: string;
  enabled: boolean;
  lastUsed?: number;
}

export interface UserConfig {
  userId: string;
  setupComplete: boolean;
  masterHash: string;
  biometricsEnabled: boolean;
  biometricCredential?: BiometricCredential;
  recoveryEmail: string;
  recoveryHint?: string; 
  autoLockTimer: number;
  theme: 'cyan' | 'monochrome' | 'cyberpunk' | 'matrix' | 'obsidian' | string;
  clipboardProtection?: boolean;
  compactMode?: boolean; 
  developerMode?: boolean;
  securityLevel?: 'standard' | 'high' | 'paranoid';
  backupFrequency?: 'none' | 'daily' | 'weekly';
  backupProviders?: ('gdrive' | 'onedrive' | 'dropbox')[];
  lastSyncTimestamp?: number;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;   
    secondary: string; 
    accent: string;    
    bg: string;        
    bgGradientEnd?: string; 
  };
}

export interface AppCustomization {
  appTitle: string;
  appFooter: string;
  appIcon: 'Shield' | 'Lock' | 'Hexagon' | 'Terminal' | 'Box';
  subscriptionTiers: Array<{name: string, price: string, features: string[]}>;
  activeAnnouncement: string | null;
  customThemes?: CustomTheme[];
  enableCloudSync?: boolean;
  enableAIAnalysis?: boolean;
  enableP2PSharing?: boolean;
  enforceComplexity?: boolean;
  allowGuestMode?: boolean;
  maintenanceMode?: boolean;
  supportContact?: string;
  globalSecurityLevel?: 'low' | 'medium' | 'high';
}

export interface GeminiResponse {
  text: string;
  analysis?: any;
}