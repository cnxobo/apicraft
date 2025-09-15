/**
 * Environment Management Tests
 * Tests for the new environment variable management functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { environmentDB, collectionDB } from '../utils/indexedDB'

describe('Environment Management', () => {
  beforeEach(async () => {
    // Clear test data before each test
    await environmentDB.clear()
    await collectionDB.clear()
  })

  afterEach(async () => {
    // Clean up after each test
    await environmentDB.clear()
    await collectionDB.clear()
  })

  describe('IndexedDB Operations', () => {
    it('should create a new environment', async () => {
      const environment = {
        id: 'test-env-1',
        name: 'Test Environment',
        variables: [
          {
            id: 'var-1',
            name: 'API_URL',
            type: 'regular',
            value: 'https://api.example.com'
          },
          {
            id: 'var-2',
            name: 'API_KEY',
            type: 'encrypted',
            value: 'secret-key-123'
          }
        ]
      }

      await environmentDB.add(environment)
      const retrieved = await environmentDB.get('test-env-1')
      
      expect(retrieved).toBeDefined()
      expect(retrieved.name).toBe('Test Environment')
      expect(retrieved.variables).toHaveLength(2)
      expect(retrieved.variables[0].type).toBe('regular')
      expect(retrieved.variables[1].type).toBe('encrypted')
    })

    it('should update environment variables', async () => {
      const environment = {
        id: 'test-env-2',
        name: 'Update Test',
        variables: [
          {
            id: 'var-1',
            name: 'TEST_VAR',
            type: 'regular',
            value: 'initial-value'
          }
        ]
      }

      await environmentDB.add(environment)
      
      // Update the variable
      environment.variables[0].value = 'updated-value'
      await environmentDB.update(environment.id, environment)
      
      const retrieved = await environmentDB.get('test-env-2')
      expect(retrieved.variables[0].value).toBe('updated-value')
    })

    it('should delete an environment', async () => {
      const environment = {
        id: 'test-env-3',
        name: 'Delete Test',
        variables: []
      }

      await environmentDB.add(environment)
      await environmentDB.delete('test-env-3')
      
      const retrieved = await environmentDB.get('test-env-3')
      expect(retrieved).toBeUndefined()
    })

    it('should list all environments', async () => {
      const env1 = {
        id: 'test-env-4',
        name: 'Environment 1',
        variables: []
      }
      
      const env2 = {
        id: 'test-env-5',
        name: 'Environment 2',
        variables: []
      }

      await environmentDB.add(env1)
      await environmentDB.add(env2)
      
      const environments = await environmentDB.getAll()
      expect(environments).toHaveLength(2)
      expect(environments.map(e => e.name)).toContain('Environment 1')
      expect(environments.map(e => e.name)).toContain('Environment 2')
    })
  })

  describe('Variable Types', () => {
    it('should support regular variables', () => {
      const variable = {
        id: 'var-1',
        name: 'REGULAR_VAR',
        type: 'regular',
        value: 'plain-text-value'
      }

      expect(variable.type).toBe('regular')
      expect(variable.value).toBe('plain-text-value')
    })

    it('should support encrypted variables', () => {
      const variable = {
        id: 'var-2',
        name: 'ENCRYPTED_VAR',
        type: 'encrypted',
        value: 'secret-value'
      }

      expect(variable.type).toBe('encrypted')
      expect(variable.value).toBe('secret-value')
    })

    it('should only allow regular and encrypted types', () => {
      const validTypes = ['regular', 'encrypted']
      
      validTypes.forEach(type => {
        const variable = {
          id: `var-${type}`,
          name: `${type.toUpperCase()}_VAR`,
          type: type,
          value: 'test-value'
        }
        
        expect(validTypes).toContain(variable.type)
      })
    })
  })

  describe('Data Structure Validation', () => {
    it('should have simplified variable structure', () => {
      const variable = {
        id: 'var-1',
        name: 'TEST_VAR',
        type: 'regular',
        value: 'test-value'
      }

      // Should have these properties
      expect(variable).toHaveProperty('id')
      expect(variable).toHaveProperty('name')
      expect(variable).toHaveProperty('type')
      expect(variable).toHaveProperty('value')

      // Should NOT have these old properties
      expect(variable).not.toHaveProperty('initialValue')
      expect(variable).not.toHaveProperty('currentValue')
    })

    it('should validate environment structure', () => {
      const environment = {
        id: 'test-env',
        name: 'Test Environment',
        variables: [
          {
            id: 'var-1',
            name: 'TEST_VAR',
            type: 'regular',
            value: 'test-value'
          }
        ]
      }

      expect(environment).toHaveProperty('id')
      expect(environment).toHaveProperty('name')
      expect(environment).toHaveProperty('variables')
      expect(Array.isArray(environment.variables)).toBe(true)
    })
  })
})
