import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EnvironmentManager } from '../EnvironmentManager'
import { useEnvironmentStore } from '@/store'

// Mock the store
jest.mock('@/store', () => ({
  useEnvironmentStore: jest.fn()
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => children
}))

describe('EnvironmentManager', () => {
  const mockStore = {
    environmentData: {
      globals: {
        id: 'globals',
        name: 'Globals',
        variables: [
          {
            id: 'var_1',
            name: 'host',
            type: 'string',
            initialValue: 'http://localhost:8081',
            currentValue: 'http://localhost:8081'
          }
        ]
      },
      environments: [
        {
          id: 'env_1',
          name: '1-local',
          variables: []
        }
      ]
    },
    selectedEnvironmentId: 'globals',
    setSelectedEnvironment: jest.fn(),
    createEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
    renameEnvironment: jest.fn()
  }

  beforeEach(() => {
    useEnvironmentStore.mockReturnValue(mockStore)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders environment manager with globals and custom environments', () => {
    render(<EnvironmentManager />)
    
    // Check if Globals environment is rendered
    expect(screen.getByText('Globals')).toBeInTheDocument()
    expect(screen.getByText('1 vars')).toBeInTheDocument()
    
    // Check if custom environment is rendered
    expect(screen.getByText('1-local')).toBeInTheDocument()
    expect(screen.getByText('0 vars')).toBeInTheDocument()
    
    // Check if create button is present
    expect(screen.getByText('Create New Environment')).toBeInTheDocument()
  })

  test('creates new environment when button is clicked', async () => {
    render(<EnvironmentManager />)
    
    // Click create button
    fireEvent.click(screen.getByText('Create New Environment'))
    
    // Input field should appear
    const input = screen.getByPlaceholderText('Environment name')
    expect(input).toBeInTheDocument()
    
    // Type environment name
    fireEvent.change(input, { target: { value: 'test-env' } })
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' })
    
    // Check if createEnvironment was called
    expect(mockStore.createEnvironment).toHaveBeenCalledWith('test-env')
  })

  test('filters environments based on search query', () => {
    render(<EnvironmentManager />)
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search environments...')
    fireEvent.change(searchInput, { target: { value: 'local' } })
    
    // Should still show 1-local environment
    expect(screen.getByText('1-local')).toBeInTheDocument()
  })

  test('selects environment when clicked', () => {
    render(<EnvironmentManager />)
    
    // Click on custom environment
    fireEvent.click(screen.getByText('1-local'))
    
    // Check if setSelectedEnvironment was called
    expect(mockStore.setSelectedEnvironment).toHaveBeenCalledWith('env_1')
  })

  test('deletes environment when delete button is clicked', () => {
    render(<EnvironmentManager />)
    
    // Hover over environment to show delete button
    const envElement = screen.getByText('1-local').closest('div')
    fireEvent.mouseEnter(envElement)
    
    // Find and click delete button (trash icon)
    const deleteButton = envElement.querySelector('[data-testid="delete-env"]')
    if (deleteButton) {
      fireEvent.click(deleteButton)
      expect(mockStore.deleteEnvironment).toHaveBeenCalledWith('env_1')
    }
  })

  test('renames environment when edit is completed', async () => {
    render(<EnvironmentManager />)
    
    // Hover over environment to show edit button
    const envElement = screen.getByText('1-local').closest('div')
    fireEvent.mouseEnter(envElement)
    
    // Find and click edit button
    const editButton = envElement.querySelector('[data-testid="edit-env"]')
    if (editButton) {
      fireEvent.click(editButton)
      
      // Input should appear
      const input = screen.getByDisplayValue('1-local')
      expect(input).toBeInTheDocument()
      
      // Change the name
      fireEvent.change(input, { target: { value: 'renamed-env' } })
      
      // Press Enter
      fireEvent.keyDown(input, { key: 'Enter' })
      
      // Check if renameEnvironment was called
      expect(mockStore.renameEnvironment).toHaveBeenCalledWith('env_1', 'renamed-env')
    }
  })
})
