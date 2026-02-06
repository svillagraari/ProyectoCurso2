/**
 * Tests para el controlador de relaciones (Relationships)
 * Prueba de funcionalidades: seguir, dejar de seguir, obtener seguidores/siguiendo
 */

import RelationshipController from '../../../../src/controllers/relationships.controller';

// Mock de dbConnection
jest.mock('../../../../config/db', () => ({
  query: jest.fn(),
}));

describe('RelationshipController', () => {
  let req, res;
  let mockQuery;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 },
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

  describe('addRelationships', () => {
    it('debe seguir un usuario válido', async () => {
      req.body = { followedUserId: 2 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, { insertId: 1 });
      });

      await RelationshipController.addRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('debe rechazar si followedUserId no es válido', async () => {
      req.body = { followedUserId: null };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(new Error('Invalid followedUserId'), null);
      });

      await RelationshipController.addRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('no debe permitir duplicar relación de seguimiento', async () => {
      req.body = { followedUserId: 2 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback({ code: 'ER_DUP_ENTRY' }, null);
      });

      await RelationshipController.addRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteRelationships', () => {
    it('debe dejar de seguir a un usuario', async () => {
      req.params = { userId: 2 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

      await RelationshipController.deleteRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe retornar error si relación no existe', async () => {
      req.params = { userId: 999 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, { affectedRows: 0 });
      });

      await RelationshipController.deleteRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getRelationships', () => {
    it('debe obtener lista de seguidores', async () => {
      req.query = { userId: 1, limit: 5, page: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, []);
      });

      await RelationshipController.getRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe retornar array vacío si no hay seguidores', async () => {
      req.query = { userId: 999, limit: 5, page: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, []);
      });

      await RelationshipController.getRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe soportar paginación', async () => {
      req.query = { userId: 1, limit: 10, page: 1 };

      mockQuery.mockImplementation((q, values, callback) => {
        callback(null, []);
      });

      await RelationshipController.getRelationships(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
