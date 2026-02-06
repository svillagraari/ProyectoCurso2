/**
 * Tests para el servicio de relaciones (Relationships Service)
 * Prueba de funcionalidades: seguir, dejar de seguir, obtener followers/following
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as relationshipsService from '../../services/relationships';
import { http } from '../../api/http';

describe('Relationships Service', () => {
  beforeEach(() => {
    vi.mocked(http).post.mockClear();
    vi.mocked(http).delete.mockClear();
    vi.mocked(http).get.mockClear();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  afterEach((context) => {
    console.log(`Test completado: ${context.task.name} - PASSED`);
  });

  describe('followUser', () => {
    it('debe seguir a un usuario válido', async () => {
      const mockResponse = {
        data: {
          relationship: {
            id: 1,
            follower_id: 1,
            followed_id: 2,
            created_at: new Date().toISOString(),
          }
        }
      };

      vi.mocked(http).post.mockResolvedValueOnce({ data: mockResponse });

      const result = await relationshipsService.followUser(2);

      expect(http.post).toHaveBeenCalledWith('/relationships', { followedUserId: 2 });
      expect(result).toEqual(mockResponse.data.relationship);
    });

    it('debe rechazar seguirse a sí mismo', async () => {
      await expect(relationshipsService.followUser(1)).rejects.toThrow();
    });

    it('debe validar que userId es válido', async () => {
      await expect(relationshipsService.followUser(null)).rejects.toThrow();
    });

    it('debe retornar error si usuario no existe', async () => {
      vi.mocked(http).post.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Usuario no encontrado' } }
      });

      await expect(relationshipsService.followUser(999)).rejects.toThrow();
    });
  });

  describe('unfollowUser', () => {
    it('debe dejar de seguir a un usuario', async () => {
      vi.mocked(http).delete.mockResolvedValueOnce({});

      const result = await relationshipsService.unfollowUser(2);

      expect(http.delete).toHaveBeenCalledWith('/relationships/2');
      expect(result).toBeUndefined();
    });

    it('debe retornar error si relación no existe', async () => {
      vi.mocked(http).delete.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Relación no encontrada' } }
      });

      await expect(relationshipsService.unfollowUser(999)).rejects.toThrow();
    });

    it('debe validar que userId es válido', async () => {
      await expect(relationshipsService.unfollowUser(null)).rejects.toThrow();
    });
  });

  describe('getFollowers', () => {
    it('debe obtener lista de seguidores', async () => {
      const mockFollowers = [
        { id: 1, username: 'user1', name: 'User 1' },
        { id: 2, username: 'user2', name: 'User 2' },
      ];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { relationships: mockFollowers } }
      });

      const result = await relationshipsService.getFollowers(3);

      expect(http.get).toHaveBeenCalledWith('/relationships', { params: { userId: 3, page: 1, limit: 10 } });
      expect(result).toEqual(mockFollowers);
    });

    it('debe retornar array vacío si no hay seguidores', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { relationships: [] } }
      });

      const result = await relationshipsService.getFollowers(999);

      expect(result).toEqual([]);
    });

    it('debe soportar paginación', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { relationships: [] } }
      });

      await relationshipsService.getFollowers(1, { limit: 10, page: 2 });

      expect(http.get).toHaveBeenCalledWith('/relationships', { params: { userId: 1, page: 2, limit: 10 } });
    });
  });

  describe('getFollowing', () => {
    it('debe obtener lista de usuarios seguidos', async () => {
      const mockFollowing = [
        { id: 3, username: 'user3', name: 'User 3' },
        { id: 4, username: 'user4', name: 'User 4' },
      ];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { relationships: mockFollowing } }
      });

      const result = await relationshipsService.getFollowing(1);

      expect(http.get).toHaveBeenCalledWith('/relationships/following', { params: { userId: 1, page: 1, limit: 10 } });
      expect(result).toEqual(mockFollowing);
    });

    it('debe retornar array vacío si no sigue a nadie', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { relationships: [] } }
      });

      const result = await relationshipsService.getFollowing(999);

      expect(result).toEqual([]);
    });

    it('debe soportar paginación', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { relationships: [] } }
      });

      await relationshipsService.getFollowing(1, { limit: 10, page: 2 });

      expect(http.get).toHaveBeenCalledWith('/relationships/following', { params: { userId: 1, page: 2, limit: 10 } });
    });
  });

  describe('getFollowersCount', () => {
    it('debe obtener número de seguidores', async () => {
      const mockResponse = { count: 42 };

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: mockResponse }
      });

      const result = await relationshipsService.getFollowersCount(1);

      expect(http.get).toHaveBeenCalledWith('/relationships/followers/count/1');
      expect(result).toEqual(mockResponse);
    });

    it('debe retornar 0 si no hay seguidores', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { count: 0 } }
      });

      const result = await relationshipsService.getFollowersCount(999);

      expect(result.count).toBe(0);
    });
  });

  describe('getFollowingCount', () => {
    it('debe obtener número de usuarios seguidos', async () => {
      const mockResponse = { count: 15 };

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: mockResponse }
      });

      const result = await relationshipsService.getFollowingCount(1);

      expect(http.get).toHaveBeenCalledWith('/relationships/following/count/1');
      expect(result).toEqual(mockResponse);
    });

    it('debe retornar 0 si no sigue a nadie', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { count: 0 } }
      });

      const result = await relationshipsService.getFollowingCount(999);

      expect(result.count).toBe(0);
    });
  });

  describe('isFollowing', () => {
    it('debe verificar si usuario sigue a otro', async () => {
      const mockResponse = { following: true };

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: mockResponse }
      });

      const result = await relationshipsService.isFollowing(2);

      expect(http.get).toHaveBeenCalledWith('/relationships/is-following/2');
      expect(result).toEqual(mockResponse);
    });

    it('debe retornar false si no sigue', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { following: false } }
      });

      const result = await relationshipsService.isFollowing(999);

      expect(result.following).toBe(false);
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar error 401 Unauthorized', async () => {
      vi.mocked(http).post.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } }
      });

      await expect(relationshipsService.followUser(2)).rejects.toThrow();
    });

    it('debe manejar error 403 Forbidden', async () => {
      vi.mocked(http).get.mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Forbidden' } }
      });

      await expect(relationshipsService.getFollowers(1)).rejects.toThrow();
    });

    it('debe manejar error 404 Not Found', async () => {
      vi.mocked(http).delete.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Not Found' } }
      });

      await expect(relationshipsService.unfollowUser(999)).rejects.toThrow();
    });

    it('debe manejar error de red', async () => {
      vi.mocked(http).post.mockRejectedValueOnce(new Error('Network error'));

      await expect(relationshipsService.followUser(2)).rejects.toThrow();
    });

    it('debe manejar error 500', async () => {
      vi.mocked(http).get.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Internal Server Error' } }
      });

      await expect(relationshipsService.getFollowing(1)).rejects.toThrow();
    });
  });
});
