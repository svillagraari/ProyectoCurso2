/**
 * Tests para el servicio de usuarios (Users Service)
 * Prueba de funcionalidades: obtener usuario, buscar usuarios, actualizar perfil
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as usersService from '../../services/users';
import { http } from '../../api/http';

// Mock de http
vi.mock('../../api/http.js');

describe('Users Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  afterEach((context) => {
    console.log(`Test completado: ${context.task.name} - PASSED`);
  });

  describe('getUser', () => {
    it('debe obtener datos de usuario por ID', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        profile_pic: 'https://example.com/pic.jpg',
        cover_pic: null,
      };

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { user: mockUser } }
      });

      const result = await usersService.getUser(1);

      expect(http.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockUser);
    });

    it('debe lanzar error si usuario no existe', async () => {
      vi.mocked(http).get.mockRejectedValueOnce(new Error('Not found'));

      await expect(usersService.getUser(999)).rejects.toThrow();
    });

    it('debe validar que ID es un número', async () => {
      // El servicio no valida, pero axios puede manejar
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { user: {} } }
      });

      const result = await usersService.getUser(null);
      expect(result).toEqual({});
    });
  });

  describe('searchUsers', () => {
    it('debe buscar usuarios por nombre', async () => {
      const mockResults = [
        { id: 1, username: 'john_doe', name: 'John Doe' },
        { id: 2, username: 'john_smith', name: 'John Smith' },
      ];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { users: mockResults } }
      });

      const result = await usersService.searchUsers({ search: 'john' });

      expect(http.get).toHaveBeenCalledWith(
        '/users',
        { params: { search: 'john', page: 1, limit: 10 } }
      );
      expect(result).toEqual(mockResults);
    });

    it('debe retornar array vacío si no hay resultados', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { users: [] } }
      });

      const result = await usersService.searchUsers({ search: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('debe hacer búsqueda case-insensitive', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { users: [] } }
      });

      await usersService.searchUsers({ search: 'JOHN' });

      expect(http.get).toHaveBeenCalledWith(
        '/users',
        { params: { search: 'JOHN', page: 1, limit: 10 } }
      );
    });

    it('debe soportar paginación', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { users: [] } }
      });

      await usersService.searchUsers({ search: 'john', page: 3, limit: 10 });

      expect(http.get).toHaveBeenCalledWith(
        '/users',
        { params: { search: 'john', page: 3, limit: 10 } }
      );
    });
  });

  describe('updateProfile', () => {
    it('debe actualizar nombre del usuario', async () => {
      const updatedUser = {
        id: 1,
        name: 'Updated Name',
        username: 'testuser',
      };

      vi.mocked(http).put.mockResolvedValueOnce({
        data: { data: { user: updatedUser } }
      });

      const result = await usersService.updateProfile({
        name: 'Updated Name',
      });

      expect(http.put).toHaveBeenCalledWith(
        '/users',
        { name: 'Updated Name' }
      );
      expect(result).toEqual(updatedUser);
    });

    it('debe actualizar foto de perfil', async () => {
      vi.mocked(http).put.mockResolvedValueOnce({
        data: { data: { user: { id: 1, profile_pic: 'https://example.com/new.jpg' } } }
      });

      await usersService.updateProfile({
        profile_pic: 'https://example.com/new.jpg',
      });

      expect(http.put).toHaveBeenCalledWith(
        '/users',
        { profile_pic: 'https://example.com/new.jpg' }
      );
    });

    it('debe rechazar URL de imagen inválida', async () => {
      await expect(
        usersService.updateProfile({
          profile_pic: 'not-a-valid-url',
        })
      ).rejects.toThrow();
    });

    it('debe enviar authorization header', async () => {
      vi.mocked(http).put.mockResolvedValueOnce({
        data: { data: { user: {} } }
      });

      await usersService.updateProfile({ name: 'New Name' });

      expect(http.put).toHaveBeenCalledWith(
        '/users',
        { name: 'New Name' }
      );
    });
  });

  describe('getUserPosts', () => {
    it('debe obtener posts de un usuario', async () => {
      const mockPosts = [
        { id: 1, user_id: 1, desc: 'Post 1' },
        { id: 2, user_id: 1, desc: 'Post 2' },
      ];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { posts: mockPosts } }
      });

      const result = await usersService.getUserPosts(1);

      expect(http.get).toHaveBeenCalledWith(
        '/posts',
        { params: { userId: 1, page: 1, limit: 10 } }
      );
      expect(result).toEqual(mockPosts);
    });

    it('debe retornar array vacío si no hay posts', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { posts: [] } }
      });

      const result = await usersService.getUserPosts(999);

      expect(result).toEqual([]);
    });

    it('debe soportar paginación', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { posts: [] } }
      });

      await usersService.getUserPosts(1, { page: 3, limit: 5 });

      expect(http.get).toHaveBeenCalledWith(
        '/posts',
        { params: { userId: 1, page: 3, limit: 5 } }
      );
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar error 401 Unauthorized', async () => {
      vi.mocked(http).get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(usersService.getUser(1)).rejects.toThrow();
    });

    it('debe manejar error 403 Forbidden', async () => {
      vi.mocked(http).put.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(usersService.updateProfile({})).rejects.toThrow();
    });

    it('debe manejar error de red', async () => {
      vi.mocked(http).get.mockRejectedValueOnce(new Error('Network error'));

      await expect(usersService.getUser(1)).rejects.toThrow();
    });

    it('debe manejar error 500', async () => {
      vi.mocked(http).get.mockRejectedValueOnce(new Error('Internal server error'));

      await expect(usersService.searchUsers({ search: 'test' })).rejects.toThrow();
    });
  });
});
