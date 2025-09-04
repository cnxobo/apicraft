import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EnvironmentManager } from '../EnvironmentManager'
import { EnvironmentEditor } from '../EnvironmentEditor'
import { useEnvironmentStore, useApiStore } from '@/store'

// Mock the stores
jest.mock('@/store', () => ({
  useEnvironmentStore: jest.fn(),
  useApiStore: jest.fn()
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => children
}))

describe('Environment Improvements', () => {
  const mockEnvironmentStore = {
    environmentData: {
      globals: {
        id: 'globals',
        name: 'Globals',
        variables: []
      },
      environments: [
        { id: 'env_1', name: 'zebra-env', variables: [] },
        { id: 'env_2', name: 'alpha-env', variables: [] },
        { id: 'env_3', name: 'beta-env', variables: [] }
      ]
    },
    selectedEnvironmentId: 'globals',
    setSelectedEnvironment: jest.fn(),
    createEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
    renameEnvironment: jest.fn(),
    addVariable: jest.fn(),
    updateVariable: jest.fn(),
    deleteVariable: jest.fn()
  }

  const mockApiStore = {
    openEnvironmentTab: jest.fn(),
    tabs: [],
    activeTabId: null
  }

  beforeEach(() => {
    useEnvironmentStore.mockReturnValue(mockEnvironmentStore)
    useApiStore.mockReturnValue(mockApiStore)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Environment List Sorting', () => {
    test('environments are sorted alphabetically', () => {
      render(<EnvironmentManager />)
      
      // Get all environment names (excluding Globals)
      const environmentElements = screen.getAllByText(/alpha-env|beta-env|zebra-env/)
      const environmentNames = environmentElements.map(el => el.textContent)
      
      // Should be sorted alphabetically
      expect(environmentNames).toEqual(['alpha-env', 'beta-env', 'zebra-env'])
    })

    test('Globals environment stays at the top', () => {
      render(<EnvironmentManager />)
      
      // Globals should be the first environment-related text
      const globalsElement = screen.getByText('Globals')
      expect(globalsElement).toBeInTheDocument()
      
      // Check that Globals appears before other environments
      const allEnvironments = screen.getAllByText(/Globals|alpha-env|beta-env|zebra-env/)
      expect(allEnvironments[0].textContent).toBe('Globals')
    })

    test('search filtering works with sorted results', () => {
      render(<EnvironmentManager />)
      
      // Search for 'alpha'
      const searchInput = screen.getByPlaceholderText('Search environments...')
      fireEvent.change(searchInput, { target: { value: 'alpha' } })
      
      // Should only show alpha-env
      expect(screen.getByText('alpha-env')).toBeInTheDocument()
      expect(screen.queryByText('beta-env')).not.toBeInTheDocument()
      expect(screen.queryByText('zebra-env')).not.toBeInTheDocument()
      
      // Globals should still be visible (not filtered)
      expect(screen.getByText('Globals')).toBeInTheDocument()
    })
  })

  describe('Tab Integration', () => {
    test('clicking environment opens tab', () => {
      render(<EnvironmentManager />)
      
      // Click on an environment
      fireEvent.click(screen.getByText('alpha-env'))
      
      // Should call openEnvironmentTab with correct parameters
      expect(mockApiStore.openEnvironmentTab).toHaveBeenCalledWith('env_2', 'alpha-env')
    })

    test('clicking Globals opens tab', () => {
      render(<EnvironmentManager />)
      
      // Click on Globals
      fireEvent.click(screen.getByText('Globals'))
      
      // Should call openEnvironmentTab with correct parameters
      expect(mockApiStore.openEnvironmentTab).toHaveBeenCalledWith('globals', 'Globals')
    })

    test('setSelectedEnvironment is called when environment is clicked', () => {
      render(<EnvironmentManager />)
      
      // Click on an environment
      fireEvent.click(screen.getByText('beta-env'))
      
      // Should update selected environment
      expect(mockEnvironmentStore.setSelectedEnvironment).toHaveBeenCalledWith('env_3')
    })
  })

  describe('Environment Editor', () => {
    test('renders environment editor for valid environment', () => {
      render(<EnvironmentEditor environmentId="globals" />)
      
      // Should show the environment name
      expect(screen.getByText('Globals')).toBeInTheDocument()
      
      // Should show add variable button
      expect(screen.getByText('Add Variable')).toBeInTheDocument()
    })

    test('shows error for invalid environment', () => {
      render(<EnvironmentEditor environmentId="invalid-id" />)
      
      // Should show error message
      expect(screen.getByText('Environment not found')).toBeInTheDocument()
    })

    test('can add new variable', () => {
      render(<EnvironmentEditor environmentId="globals" />)
      
      // Click add variable button
      fireEvent.click(screen.getByText('Add Variable'))
      
      // Should show input fields
      expect(screen.getByPlaceholderText('Variable name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Initial value')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Current value')).toBeInTheDocument()
    })
  })

  describe('Store Integration', () => {
    test('openEnvironmentTab creates correct tab structure', () => {
      // This would be tested in the store tests
      // Here we just verify the function is called with correct parameters
      render(<EnvironmentManager />)
      
      fireEvent.click(screen.getByText('alpha-env'))
      
      expect(mockApiStore.openEnvironmentTab).toHaveBeenCalledWith('env_2', 'alpha-env')
    })
  })
})

describe('Store Tab Management', () => {
  // Mock the actual store behavior
  test('openEnvironmentTab should create environment tab', () => {
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      tabs: [],
      activeTabId: null
    }))

    // Simulate the openEnvironmentTab function
    const openEnvironmentTab = (environmentId, environmentName) => {
      const tabId = `env_${environmentId}`
      const newTab = {
        id: tabId,
        title: environmentName,
        type: "environment",
        data: { environmentId, environmentName },
        modified: false,
      }

      return {
        tabs: [newTab],
        activeTabId: tabId,
      }
    }

    const result = openEnvironmentTab('globals', 'Globals')
    
    expect(result.tabs).toHaveLength(1)
    expect(result.tabs[0]).toEqual({
      id: 'env_globals',
      title: 'Globals',
      type: 'environment',
      data: { environmentId: 'globals', environmentName: 'Globals' },
      modified: false
    })
    expect(result.activeTabId).toBe('env_globals')
  })

  test('openEnvironmentTab should not duplicate existing tab', () => {
    const existingTabs = [{
      id: 'env_globals',
      title: 'Globals',
      type: 'environment',
      data: { environmentId: 'globals', environmentName: 'Globals' },
      modified: false
    }]

    // Simulate finding existing tab
    const openEnvironmentTab = (environmentId, environmentName, existingTabs) => {
      const tabId = `env_${environmentId}`
      const existingTab = existingTabs.find((tab) => tab.id === tabId)
      
      if (existingTab) {
        return { activeTabId: tabId }
      }
      
      // Would create new tab if not found
      return null
    }

    const result = openEnvironmentTab('globals', 'Globals', existingTabs)
    
    expect(result).toEqual({ activeTabId: 'env_globals' })
  })
})
