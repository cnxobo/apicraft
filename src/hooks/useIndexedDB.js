import { useState, useEffect, useCallback } from 'react'
import { environmentDB, collectionDB, settingsDB, migrationUtils } from '@/utils/indexedDB'

/**
 * Hook for managing IndexedDB operations
 */
export function useIndexedDB() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)

  // Initialize IndexedDB and perform migration if needed
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if migration is needed
        const hasLocalStorageData = localStorage.getItem('environment-storage') || localStorage.getItem('api-storage')
        
        if (hasLocalStorageData) {
          await migrationUtils.migrateFromLocalStorage()
        }
        
        setIsInitialized(true)
      } catch (err) {
        setError(err.message)
        console.error('IndexedDB initialization failed:', err)
      }
    }

    initialize()
  }, [])

  return {
    isInitialized,
    error,
    environmentDB,
    collectionDB,
    settingsDB,
    migrationUtils
  }
}

/**
 * Hook for environment data management
 */
export function useEnvironmentDB() {
  const [environments, setEnvironments] = useState([])
  const [globals, setGlobals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load all environments
  const loadEnvironments = useCallback(async () => {
    try {
      setLoading(true)
      const [envList, globalsData] = await Promise.all([
        environmentDB.getAll(),
        environmentDB.getGlobals()
      ])
      
      // Filter out globals from the list since we handle it separately
      const filteredEnvs = envList.filter(env => env.id !== 'globals')
      
      setEnvironments(filteredEnvs)
      setGlobals(globalsData)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load environments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save environment
  const saveEnvironment = useCallback(async (environment) => {
    try {
      await environmentDB.save(environment)
      if (environment.id === 'globals') {
        setGlobals(environment)
      } else {
        setEnvironments(prev => {
          const index = prev.findIndex(env => env.id === environment.id)
          if (index >= 0) {
            const newEnvs = [...prev]
            newEnvs[index] = environment
            return newEnvs
          } else {
            return [...prev, environment]
          }
        })
      }
      return environment
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Delete environment
  const deleteEnvironment = useCallback(async (id) => {
    try {
      await environmentDB.delete(id)
      setEnvironments(prev => prev.filter(env => env.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Get specific environment
  const getEnvironment = useCallback(async (id) => {
    try {
      if (id === 'globals') {
        return globals || await environmentDB.getGlobals()
      }
      return await environmentDB.get(id)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [globals])

  // Load environments on mount
  useEffect(() => {
    loadEnvironments()
  }, [loadEnvironments])

  return {
    environments,
    globals,
    loading,
    error,
    loadEnvironments,
    saveEnvironment,
    deleteEnvironment,
    getEnvironment
  }
}

/**
 * Hook for collection data management
 */
export function useCollectionDB() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load all collections
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true)
      const collectionList = await collectionDB.getAll()
      setCollections(collectionList || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load collections:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save collection
  const saveCollection = useCallback(async (collection) => {
    try {
      await collectionDB.save(collection)
      setCollections(prev => {
        const index = prev.findIndex(col => col.id === collection.id)
        if (index >= 0) {
          const newCols = [...prev]
          newCols[index] = collection
          return newCols
        } else {
          return [...prev, collection]
        }
      })
      return collection
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Delete collection
  const deleteCollection = useCallback(async (id) => {
    try {
      await collectionDB.delete(id)
      setCollections(prev => prev.filter(col => col.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Get specific collection
  const getCollection = useCallback(async (id) => {
    try {
      return await collectionDB.get(id)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Load collections on mount
  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  return {
    collections,
    loading,
    error,
    loadCollections,
    saveCollection,
    deleteCollection,
    getCollection
  }
}

/**
 * Hook for settings management
 */
export function useSettingsDB() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get setting
  const getSetting = useCallback(async (key) => {
    try {
      const result = await settingsDB.get(key)
      return result?.value
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Save setting
  const saveSetting = useCallback(async (key, value) => {
    try {
      await settingsDB.save(key, value)
      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Delete setting
  const deleteSetting = useCallback(async (key) => {
    try {
      await settingsDB.delete(key)
      setSettings(prev => {
        const newSettings = { ...prev }
        delete newSettings[key]
        return newSettings
      })
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    settings,
    loading,
    error,
    getSetting,
    saveSetting,
    deleteSetting
  }
}
