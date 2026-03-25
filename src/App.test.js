import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import store from './store';


// Mocking the localStorage
beforeEach(() => {
  localStorage.clear();
});

const renderWithProviders = (ui) => {
  return render(
    <Provider store={store}>
      <Router>{ui}</Router>
    </Provider>
  );
};

describe('App component', () => {
  it('should render the login page when no user is logged in', () => {
    renderWithProviders(<App />);
    
    // Check if login page is displayed
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('should render the client list page after successful login', async () => {
    const mockUser = { username: 'testuser', token: '12345' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<App />);

    // Wait for the routes to load and check if the client list is displayed
    await waitFor(() => screen.getByText(/Client List/i));
    
    expect(screen.getByText(/Client List/i)).toBeInTheDocument();
  });

  it('should redirect to login page if the user is not authenticated', () => {
    renderWithProviders(<App />);

    // The app should redirect to login if no user is found
    expect(window.location.pathname).toBe('/login');
  });

  it('should handle user logout', async () => {
    const mockUser = { username: 'testuser', token: '12345' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<App />);

    // Logout the user
    fireEvent.click(screen.getByText(/Logout/i));

    await waitFor(() => {
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  it('should display the app bar when the user is logged in', async () => {
    const mockUser = { username: 'testuser', token: '12345' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<App />);

    // Wait for the app bar to be rendered
    await waitFor(() => screen.getByText(/App Bar/i));

    expect(screen.getByText(/App Bar/i)).toBeInTheDocument();
  });

  it('should redirect to login if user tries to access protected routes without being logged in', () => {
    renderWithProviders(<App />);

    // Access a protected route (e.g., client list)
    fireEvent.click(screen.getByText(/Clients/i));

    expect(window.location.pathname).toBe('/login');
  });

});
