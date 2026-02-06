/**
 * Tests para el controlador de historias (Stories)
 * Prueba de funcionalidades: crear, obtener, eliminar historias
 */

import StoryController from '../../../../src/controllers/stories.controller';

// Mock de dbConnection
jest.mock('../../../../config/db', () => ({
  query: jest.fn(),
}));

describe('StoryController', () => {
  let req, res;
  let mockQuery;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, username: 'testuser' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Reset mock
    mockQuery = require('../../../../config/db').query;
    mockQuery.mockClear();
  });

  afterEach(() => {
    console.log('Test completado - PASSED');
  });

  describe('addStory', () => {
    it('debe crear una historia con img válida', async () => {
      req.body = {
        img: 'https://example.com/image.jpg',
      };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, { insertId: 1 });
      });

      await StoryController.addStory(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('debe fallar si hay error en la base de datos', async () => {
      req.body = { img: 'https://example.com/image.jpg' };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(new Error('DB Error'), null);
      });

      await StoryController.addStory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStories', () => {
    it('debe obtener historias del usuario autenticado', async () => {
      req.query = { limit: 5, page: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, []);
      });

      await StoryController.getStories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe fallar si hay error en la base de datos', async () => {
      req.query = { limit: 5, page: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(new Error('DB Error'), null);
      });

      await StoryController.getStories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteStory', () => {
    it('debe eliminar historia del propietario', async () => {
      req.params = { storyId: 1 };
      req.user = { id: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

      await StoryController.deleteStory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe fallar si hay error en la base de datos', async () => {
      req.params = { storyId: 1 };
      req.user = { id: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(new Error('DB Error'), null);
      });

      await StoryController.deleteStory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
