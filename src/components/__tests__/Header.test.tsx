import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../layout/Header';

describe('Header', () => {
  it('renders the Empathy Ledger logo', () => {
    render(<Header />);

    expect(screen.getByText('Empathy Ledger')).toBeInTheDocument();
  });

  it('has navigation links', () => {
    render(<Header />);

    // Use getAllByText for links that appear in both desktop and mobile nav
    expect(screen.getAllByText('About')).toHaveLength(2);
    expect(screen.getAllByText('How It Works')).toHaveLength(2);
    expect(screen.getAllByText('Case Studies')).toHaveLength(2);
  });

  it('has a share story button', () => {
    render(<Header />);

    expect(screen.getByText('Share Story')).toBeInTheDocument();
  });
});
