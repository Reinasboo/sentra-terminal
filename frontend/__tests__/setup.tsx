"""
Test configuration and fixtures for frontend tests
"""
import React from 'react'
import { render } from '@testing-library/react'


/**
 * Custom render function that includes all providers
 */
const customRender = (
  ui,
  options = {}
) => {
  const AllProviders = ({ children }) => {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        {children}
      </React.Suspense>
    )
  }

  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
