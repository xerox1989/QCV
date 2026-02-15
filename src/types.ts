export interface VaultItem { id: string; title: string; type: 'password' | 'note' | 'card'; content: any; created_at: string; }
export interface UserProfile { name: string; email: string; avatar?: string; }
export interface AppCustomization { theme: 'dark' | 'light'; primaryColor: string; }
export type VaultItemType = 'password' | 'note' | 'card';
export interface UserConfig { biometricEnabled: boolean; cloudSync: boolean; }
