import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../layout/Header'

describe('Header', () => {
  it('renders the Empathy Ledger logo', () => {
    render(<Header />)
    
    expect(screen.getByText('Empathy Ledger')).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Case Studies')).toBeInTheDocument()
  })

  it('has a share story button', () => {
    render(<Header />)
    
    expect(screen.getByText('Share Story')).toBeInTheDocument()
  })
})