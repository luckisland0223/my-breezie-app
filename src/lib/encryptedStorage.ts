import CryptoJS from 'crypto-js'

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES',
  keySize: 256,
  ivSize: 128,
  saltSize: 128,
  iterations: 10000, // PBKDF2 iterations
}

// Generate encryption key from user password/session
function generateEncryptionKey(userSecret: string, salt: string): string {
  return CryptoJS.PBKDF2(userSecret, salt, {
    keySize: ENCRYPTION_CONFIG.keySize / 32,
    iterations: ENCRYPTION_CONFIG.iterations
  }).toString()
}

// Generate random salt
function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.saltSize / 8).toString()
}

// Generate random IV
function generateIV(): string {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize / 8).toString()
}

// Encrypt data with AES
export function encryptData(data: string, userSecret: string): string {
  try {
    const salt = generateSalt()
    const iv = generateIV()
    const key = generateEncryptionKey(userSecret, salt)
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // Combine salt + iv + encrypted data
    const combined = salt + ':' + iv + ':' + encrypted.toString()
    return btoa(combined) // Base64 encode the final result
    
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

// Decrypt data
export function decryptData(encryptedData: string, userSecret: string): string {
  try {
    // Base64 decode and split components
    const combined = atob(encryptedData)
    const [salt, iv, encrypted] = combined.split(':')
    
    if (!salt || !iv || !encrypted) {
      throw new Error('Invalid encrypted data format')
    }
    
    const key = generateEncryptionKey(userSecret, salt)
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedString) {
      throw new Error('Decryption failed - invalid key or corrupted data')
    }
    
    return decryptedString
    
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Secure localStorage wrapper
export class SecureStorage {
  private userSecret: string
  private keyPrefix: string
  
  constructor(userSecret: string, keyPrefix = 'breezie_') {
    this.userSecret = userSecret
    this.keyPrefix = keyPrefix
  }
  
  // Store encrypted data
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value)
      const encryptedValue = encryptData(serializedValue, this.userSecret)
      const storageKey = this.keyPrefix + key
      
      localStorage.setItem(storageKey, encryptedValue)
      
      // Store metadata for integrity checking
      const metadata = {
        timestamp: Date.now(),
        checksum: CryptoJS.SHA256(serializedValue).toString()
      }
      localStorage.setItem(storageKey + '_meta', JSON.stringify(metadata))
      
    } catch (error) {
      console.error('Secure storage setItem failed:', error)
      throw new Error('Failed to store encrypted data')
    }
  }
  
  // Retrieve and decrypt data
  getItem<T>(key: string): T | null {
    try {
      const storageKey = this.keyPrefix + key
      const encryptedValue = localStorage.getItem(storageKey)
      
      if (!encryptedValue) {
        return null
      }
      
      const decryptedValue = decryptData(encryptedValue, this.userSecret)
      
      // Verify integrity if metadata exists
      const metadataStr = localStorage.getItem(storageKey + '_meta')
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr)
        const currentChecksum = CryptoJS.SHA256(decryptedValue).toString()
        
        if (metadata.checksum !== currentChecksum) {
          console.warn('Data integrity check failed for key:', key)
          this.removeItem(key) // Remove corrupted data
          return null
        }
      }
      
      return JSON.parse(decryptedValue)
      
    } catch (error) {
      console.error('Secure storage getItem failed:', error)
      // Remove corrupted data
      this.removeItem(key)
      return null
    }
  }
  
  // Remove encrypted data
  removeItem(key: string): void {
    const storageKey = this.keyPrefix + key
    localStorage.removeItem(storageKey)
    localStorage.removeItem(storageKey + '_meta')
  }
  
  // Clear all encrypted data for this user
  clear(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.keyPrefix)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
  
  // Get all encrypted keys for this user
  getAllKeys(): string[] {
    const keys: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.keyPrefix) && !key.endsWith('_meta')) {
        keys.push(key.substring(this.keyPrefix.length))
      }
    }
    
    return keys
  }
}

// Factory function to create secure storage instance
export function createSecureStorage(userId: string, sessionToken?: string): SecureStorage {
  // Use combination of userId and session token as encryption secret
  const userSecret = sessionToken ? 
    CryptoJS.SHA256(userId + ':' + sessionToken).toString() :
    CryptoJS.SHA256(userId + ':' + 'fallback-secret').toString()
  
  return new SecureStorage(userSecret, `breezie_${userId}_`)
}

// Migrate existing localStorage data to encrypted storage
export function migrateToEncryptedStorage(userId: string, sessionToken: string): void {
  try {
    const secureStorage = createSecureStorage(userId, sessionToken)
    const keysToMigrate = ['emotion-store', 'auth-store', 'settings-store']
    
    keysToMigrate.forEach(key => {
      const existingData = localStorage.getItem(key)
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData)
          secureStorage.setItem(key, parsedData)
          localStorage.removeItem(key) // Remove unencrypted version
          console.log(`Migrated ${key} to encrypted storage`)
        } catch (error) {
          console.error(`Failed to migrate ${key}:`, error)
        }
      }
    })
    
  } catch (error) {
    console.error('Migration to encrypted storage failed:', error)
  }
}

// Validate encryption setup
export function validateEncryptionSetup(): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  try {
    // Test encryption/decryption
    const testData = 'test-encryption-data'
    const testSecret = 'test-secret-key'
    
    const encrypted = encryptData(testData, testSecret)
    const decrypted = decryptData(encrypted, testSecret)
    
    if (decrypted !== testData) {
      issues.push('Encryption/decryption test failed')
    }
    
    // Test with wrong key
    try {
      decryptData(encrypted, 'wrong-secret')
      issues.push('Decryption with wrong key should fail')
    } catch (error) {
      // This is expected - decryption should fail with wrong key
    }
    
  } catch (error) {
    issues.push(`Encryption setup validation failed: ${error}`)
  }
  
  // Check browser support
  if (typeof localStorage === 'undefined') {
    issues.push('localStorage not available')
  }
  
  if (typeof btoa === 'undefined' || typeof atob === 'undefined') {
    issues.push('Base64 encoding not available')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// Secure data export (encrypted backup)
export function exportSecureData(userId: string, sessionToken: string): string {
  const secureStorage = createSecureStorage(userId, sessionToken)
  const allKeys = secureStorage.getAllKeys()
  
  const exportData: Record<string, any> = {}
  
  allKeys.forEach(key => {
    const data = secureStorage.getItem(key)
    if (data) {
      exportData[key] = data
    }
  })
  
  const exportPayload = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    userId,
    data: exportData
  }
  
  // Encrypt the entire export
  return encryptData(JSON.stringify(exportPayload), sessionToken)
}

// Secure data import (from encrypted backup)
export function importSecureData(encryptedBackup: string, userId: string, sessionToken: string): void {
  try {
    const decryptedBackup = decryptData(encryptedBackup, sessionToken)
    const backupData = JSON.parse(decryptedBackup)
    
    // Validate backup format
    if (!backupData.version || !backupData.data || backupData.userId !== userId) {
      throw new Error('Invalid backup format or user mismatch')
    }
    
    const secureStorage = createSecureStorage(userId, sessionToken)
    
    // Import each data item
    Object.entries(backupData.data).forEach(([key, value]) => {
      secureStorage.setItem(key, value)
    })
    
    console.log('Secure data import completed successfully')
    
  } catch (error) {
    console.error('Secure data import failed:', error)
    throw new Error('Failed to import encrypted backup')
  }
}
