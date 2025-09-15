/**
 * IndexedDB utilities for APIcraft
 * Provides persistent storage for environments and collections
 */

const DB_NAME = 'apicraft-db'
const DB_VERSION = 1

// Object store names
const STORES = {
  ENVIRONMENTS: 'environments',
  COLLECTIONS: 'collections',
  SETTINGS: 'settings'
}

/**
 * Initialize IndexedDB database
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Create environments store
      if (!db.objectStoreNames.contains(STORES.ENVIRONMENTS)) {
        const envStore = db.createObjectStore(STORES.ENVIRONMENTS, { keyPath: 'id' })
        envStore.createIndex('name', 'name', { unique: false })
      }
      
      // Create collections store
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        const collStore = db.createObjectStore(STORES.COLLECTIONS, { keyPath: 'id' })
        collStore.createIndex('name', 'name', { unique: false })
      }
      
      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

/**
 * Generic function to get data from a store
 */
async function getData(storeName, key = null) {
  const db = await initDB()
  const transaction = db.transaction([storeName], 'readonly')
  const store = transaction.objectStore(storeName)
  
  return new Promise((resolve, reject) => {
    let request
    
    if (key) {
      request = store.get(key)
    } else {
      request = store.getAll()
    }
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(new Error(`Failed to get data from ${storeName}`))
    }
  })
}

/**
 * Generic function to save data to a store
 */
async function saveData(storeName, data) {
  const db = await initDB()
  const transaction = db.transaction([storeName], 'readwrite')
  const store = transaction.objectStore(storeName)
  
  return new Promise((resolve, reject) => {
    const request = store.put(data)
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(new Error(`Failed to save data to ${storeName}`))
    }
  })
}

/**
 * Generic function to delete data from a store
 */
async function deleteData(storeName, key) {
  const db = await initDB()
  const transaction = db.transaction([storeName], 'readwrite')
  const store = transaction.objectStore(storeName)
  
  return new Promise((resolve, reject) => {
    const request = store.delete(key)
    
    request.onsuccess = () => {
      resolve(true)
    }
    
    request.onerror = () => {
      reject(new Error(`Failed to delete data from ${storeName}`))
    }
  })
}

/**
 * Environment-specific functions
 */
export const environmentDB = {
  // Get all environments
  getAll: () => getData(STORES.ENVIRONMENTS),
  
  // Get specific environment
  get: (id) => getData(STORES.ENVIRONMENTS, id),
  
  // Save environment
  save: (environment) => saveData(STORES.ENVIRONMENTS, environment),
  
  // Delete environment
  delete: (id) => deleteData(STORES.ENVIRONMENTS, id),
  
  // Get globals environment (special case)
  getGlobals: async () => {
    const globals = await getData(STORES.ENVIRONMENTS, 'globals')
    if (!globals) {
      // Create default globals environment
      const defaultGlobals = {
        id: 'globals',
        name: 'Globals',
        variables: []
      }
      await saveData(STORES.ENVIRONMENTS, defaultGlobals)
      return defaultGlobals
    }
    return globals
  }
}

/**
 * Collection-specific functions
 */
export const collectionDB = {
  // Get all collections
  getAll: () => getData(STORES.COLLECTIONS),
  
  // Get specific collection
  get: (id) => getData(STORES.COLLECTIONS, id),
  
  // Save collection
  save: (collection) => saveData(STORES.COLLECTIONS, collection),
  
  // Delete collection
  delete: (id) => deleteData(STORES.COLLECTIONS, id)
}

/**
 * Settings-specific functions
 */
export const settingsDB = {
  // Get setting
  get: (key) => getData(STORES.SETTINGS, key),
  
  // Save setting
  save: (key, value) => saveData(STORES.SETTINGS, { key, value }),
  
  // Delete setting
  delete: (key) => deleteData(STORES.SETTINGS, key)
}

/**
 * Migration utilities
 */
export const migrationUtils = {
  // Migrate from localStorage to IndexedDB
  async migrateFromLocalStorage() {
    try {
      // Migrate environment data
      const envData = localStorage.getItem('environment-storage')
      if (envData) {
        const parsed = JSON.parse(envData)
        if (parsed.state?.environmentData) {
          const { globals, environments } = parsed.state.environmentData

          // Save globals
          if (globals) {
            await environmentDB.save(globals)
          }

          // Save environments
          if (environments && Array.isArray(environments)) {
            for (const env of environments) {
              await environmentDB.save(env)
            }
          }
        }
      }

      // Migrate collections data
      const apiData = localStorage.getItem('api-storage')
      if (apiData) {
        const parsed = JSON.parse(apiData)
        if (parsed.state?.collections) {
          for (const collection of parsed.state.collections) {
            await collectionDB.save(collection)
          }
        }
      }

      console.log('Migration from localStorage completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)
    }
  },

  // Clear all data (for development/testing)
  async clearAll() {
    const db = await initDB()
    const transaction = db.transaction([STORES.ENVIRONMENTS, STORES.COLLECTIONS, STORES.SETTINGS], 'readwrite')

    await Promise.all([
      new Promise((resolve) => {
        const request = transaction.objectStore(STORES.ENVIRONMENTS).clear()
        request.onsuccess = () => resolve()
      }),
      new Promise((resolve) => {
        const request = transaction.objectStore(STORES.COLLECTIONS).clear()
        request.onsuccess = () => resolve()
      }),
      new Promise((resolve) => {
        const request = transaction.objectStore(STORES.SETTINGS).clear()
        request.onsuccess = () => resolve()
      })
    ])
  }
}

export { STORES, initDB }
