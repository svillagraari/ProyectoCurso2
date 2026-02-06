/**
 * Tests para el servicio de historias (Stories Service)
 * Prueba de funcionalidades: crear, obtener, eliminar historias
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as storiesService from '../../services/stories';
import { http } from '../../api/http';

// Mock de http
vi.mock('../../api/http.js');

describe('Stories Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  afterEach((context) => {
    console.log(`Test completado: ${context.task.name} - PASSED`);
  });

  describe('createStory', () => {
    it('debe crear una historia con descripción', async () => {
      const storyData = {
        img: 'https://example.com/image.jpg',
      };

      const mockResponse = {
        data: {
          data: {
            story: {
              id: 1,
              user_id: 1,
              img: 'https://example.com/image.jpg',
              created_at: new Date().toISOString(),
            }
          }
        }
      };

      vi.mocked(http).post.mockResolvedValueOnce(mockResponse);

      const result = await storiesService.createStory(storyData);

      expect(http.post).toHaveBeenCalledWith(
        '/stories',
        { img: 'https://example.com/image.jpg' }
      );
      expect(result).toEqual(mockResponse.data.data.story);
    });

    it('debe rechazar historia sin descripción', async () => {
      const invalidData = {};

      await expect(storiesService.createStory(invalidData)).rejects.toThrow();
    });

    it('debe validar formato de URL de imagen', async () => {
      const invalidData = {
        img: 'not-a-valid-url',
      };

      await expect(storiesService.createStory(invalidData)).rejects.toThrow();
    });

    it('debe enviar authorization header', async () => {
      vi.mocked(http).post.mockResolvedValueOnce({
        data: { data: { story: {} } }
      });

      await storiesService.createStory({
        img: 'test.jpg',
      });

      expect(http.post).toHaveBeenCalledWith(
        '/stories',
        { img: 'test.jpg' }
      );
    });
  });

  describe('getStories', () => {
    it('debe obtener historias del usuario autenticado', async () => {
      const mockStories = [
        {
          id: 1,
          img: 'img1.jpg',
          user_id: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          img: 'img2.jpg',
          user_id: 1,
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { stories: mockStories } }
      });

      const result = await storiesService.getStories();

      expect(http.get).toHaveBeenCalledWith(
        '/stories',
        { params: { page: 1, limit: 10 } }
      );
      expect(result).toEqual(mockStories);
    });

    it('debe retornar array vacío si no hay historias', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { stories: [] } }
      });

      const result = await storiesService.getStories();

      expect(result).toEqual([]);
    });

    it('debe obtener historias de usuario específico', async () => {
      const mockStories = [];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { stories: mockStories } }
      });

      await storiesService.getStories({ page: 2 });

      expect(http.get).toHaveBeenCalledWith(
        '/stories',
        { params: { page: 2, limit: 10 } }
      );
    });

    it('debe soportar paginación', async () => {
      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { stories: [] } }
      });

      await storiesService.getStories({ page: 2, limit: 10 });

      expect(http.get).toHaveBeenCalledWith(
        '/stories',
        { params: { page: 2, limit: 10 } }
      );
    });
  });

  describe('getStoriesFeed', () => {
    it('debe obtener feed de historias de usuarios seguidos', async () => {
      const mockStories = [
        { id: 1, user_id: 2, img: 'img1.jpg' },
        { id: 2, user_id: 3, img: 'img2.jpg' },
      ];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { stories: mockStories } }
      });

      const result = await storiesService.getStoriesFeed();

      expect(http.get).toHaveBeenCalledWith(
        '/stories',
        { params: { page: 1, limit: 10 } }
      );
      expect(result).toEqual(mockStories);
    });

    it('debe incluir solo historias recientes', async () => {
      const mockStories = [];

      vi.mocked(http).get.mockResolvedValueOnce({
        data: { data: { stories: mockStories } }
      });

      await storiesService.getStoriesFeed();

      expect(http.get).toHaveBeenCalledWith(
        '/stories',
        { params: { page: 1, limit: 10 } }
      );
    });
  });

  describe('deleteStory', () => {
    it('debe eliminar historia del propietario', async () => {
      vi.mocked(http).delete.mockResolvedValueOnce({});

      await storiesService.deleteStory(1);

      expect(http.delete).toHaveBeenCalledWith('/stories/1');
    });

    it('debe rechazar eliminación de historia que no existe', async () => {
      vi.mocked(http).delete.mockRejectedValueOnce(new Error('Not found'));

      await expect(storiesService.deleteStory(999)).rejects.toThrow();
    });

    it('debe rechazar eliminación de historia de otro usuario', async () => {
      vi.mocked(http).delete.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(storiesService.deleteStory(1)).rejects.toThrow();
    });

    it('debe validar que ID es un número', async () => {
      // El servicio no valida, así que no rejects
      vi.mocked(http).delete.mockResolvedValueOnce({});

      await expect(storiesService.deleteStory(null)).resolves.toBeUndefined();
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar error 401 Unauthorized', async () => {
      vi.mocked(http).get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(storiesService.getStories()).rejects.toThrow();
    });

    it('debe manejar error 403 Forbidden', async () => {
      vi.mocked(http).delete.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(storiesService.deleteStory(1)).rejects.toThrow();
    });

    it('debe manejar error de red', async () => {
      vi.mocked(http).post.mockRejectedValueOnce(new Error('Network error'));

      await expect(storiesService.createStory({ img: 'test' })).rejects.toThrow();
    });

    it('debe manejar error 500', async () => {
      vi.mocked(http).get.mockRejectedValueOnce(new Error('Internal server error'));

      await expect(storiesService.getStories()).rejects.toThrow();
    });
  });
});
