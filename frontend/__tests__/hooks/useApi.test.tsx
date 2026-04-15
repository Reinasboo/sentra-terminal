import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from '@/lib/queryClient'
import { useMarket } from '@/hooks/useApi'

describe('useMarket Hook', () => {
  it('should fetch market data', async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useMarket('BTC'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading || result.current.data).toBeDefined()
    })
  })
})

import { renderHook } from '@testing-library/react'
