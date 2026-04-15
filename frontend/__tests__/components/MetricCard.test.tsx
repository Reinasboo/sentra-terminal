import { render, screen } from '@testing-library/react'
import MetricCard from '@/components/widgets/MetricCard'

describe('MetricCard Component', () => {
  it('renders metric label and value', () => {
    render(
      <MetricCard
        label="Price"
        value="$45,000"
        change={2.5}
        hasPositive={true}
      />
    )
    
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
  })

  it('displays positive change indicator', () => {
    render(
      <MetricCard
        label="Volume"
        value="$1.2M"
        change={5.3}
        hasPositive={true}
      />
    )
    
    const changeElement = screen.getByText(/5.30/)
    expect(changeElement).toBeInTheDocument()
  })
})
