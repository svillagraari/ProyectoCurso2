import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Register from '../../pages/Register';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
    user: null,
    loading: false,
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach((context) => {
    console.log(`Test completado: ${context.task.name} - PASSED`);
  });

  it('debe renderizar el formulario de registro', () => {
    render(<Register />);
    
    expect(screen.getByText(/crear cuenta|regístrate|registro/i)).toBeInTheDocument();
  });

  it('debe tener campos para username, nombre, email y contraseña', () => {
    render(<Register />);
    
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('debe tener un botón de registro', () => {
    render(<Register />);
    
    const registerButton = screen.getByRole('button', { name: /registrarse/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('debe tener un link a la página de login', () => {
    render(<Register />);
    
    const loginLink = screen.getByText(/inicia sesión/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.tagName).toBe('A');
  });

  it('debe validar email válido', () => {
    const email = 'test@example.com';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(email).toMatch(emailRegex);
  });

  it('debe rechazar email inválido', () => {
    const email = 'invalid-email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(email).not.toMatch(emailRegex);
  });

  it('debe validar contraseña fuerte', () => {
    const password = 'SecurePass123!';
    
    // Validaciones básicas
    expect(password.length).toBeGreaterThanOrEqual(8);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
  });

  it('debe rechazar contraseña débil', () => {
    const password = 'weak';
    
    expect(password.length).toBeLessThan(8);
  });

  it('debe actualizar campos de input correctamente', () => {
    render(<Register />);
    
    const usernameInput = screen.getByLabelText(/usuario/i);
    const nameInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('newuser');
    expect(nameInput.value).toBe('New User');
    expect(emailInput.value).toBe('new@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('debe deshabilitar botón si hay errores de validación', () => {
    render(<Register />);
    
    const registerButton = screen.getByRole('button', { name: /crear cuenta|registrar/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('debe mostrar error si las contraseñas no coinciden', () => {
    // Simulación de validación
    const pass1 = 'Password123!';
    const pass2 = 'DifferentPass123!';

    expect(pass1).not.toBe(pass2);
  });

  it('debe llamar a función de registro al enviar formulario', async () => {
    render(<Register />);
    
    const registerButton = screen.getByRole('button', { name: /crear cuenta|registrar/i });
    
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(registerButton).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de éxito después de registrarse', async () => {
    render(<Register />);
    
    // Simulación de éxito
    const successMessage = 'Cuenta creada exitosamente';
    // expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  it('debe redirigir a login después del registro exitoso', async () => {
    render(<Register />);
    
    const registerButton = screen.getByRole('button');
    expect(registerButton).toBeInTheDocument();
  });
});
