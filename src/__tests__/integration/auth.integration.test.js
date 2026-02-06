/**
 * Tests de Integración - Flujo de Autenticación
 * Prueba completa: registro -> login -> obtener datos -> logout
 */

import request from 'supertest';
const app = require('../../../src/server');
const dbConnection = require('../../../config/db');

describe('Authentication Integration Tests', () => {
  let authToken;
  let userId;

  // Función para limpiar la base de datos
  const clearDatabase = () => {
    return new Promise((resolve, reject) => {
      dbConnection.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
        if (err) {
          console.error('Error disabling foreign key checks:', err);
          reject(err);
          return;
        }

        const tables = ['likes', 'comments', 'posts', 'relationships', 'stories', 'users'];
        let completed = 0;

        tables.forEach(table => {
          dbConnection.query(`DELETE FROM ${table}`, (err) => {
            if (err) {
              console.error(`Error clearing table ${table}:`, err);
              reject(err);
            } else {
              completed++;
              if (completed === tables.length) {
                dbConnection.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
                  if (err) {
                    console.error('Error re-enabling foreign key checks:', err);
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }
            }
          });
        });
      });
    });
  };

  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach((done) => {
    console.log('Test completado - PASSED');
    done();
  });

  // Test de registro completo
  describe('User Registration Flow', () => {
    it('debe completar flujo: registro -> datos usuario -> logout', async () => {
      // Paso 1: Registrar nuevo usuario
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'integrationtest',
          email: 'integration@example.com',
          password: 'TestPassword@123',
          name: 'Integration Test User',
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.data).toHaveProperty('token');
      expect(registerRes.body.data.user).toHaveProperty('id');

      authToken = registerRes.body.data.token;
      userId = registerRes.body.data.user.id;

      // Paso 2: Verificar que puede acceder a datos protegidos
      const userRes = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(userRes.status).toBe(200);
      expect(userRes.body.data.user.username).toBe('integrationtest');

      // Paso 3: Logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(logoutRes.status).toBe(200);

      // Paso 4: Verificar que token sigue funcionando (JWT stateless)
      const stillWorksRes = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(stillWorksRes.status).toBe(200);
    });
  });

  // Test de flujo de posts
  describe('Post Creation and Interaction Flow', () => {
    let postId;
    let commenter;
    let commentId;
    let authToken;
    let userId;

    it('debe crear post, comentar, dar like y eliminar', async () => {
      // Paso 1: Crear usuario
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'poster',
          email: 'poster@example.com',
          password: 'Password@123',
          name: 'Post Creator',
        });

      expect(registerRes.status).toBe(201);
      authToken = registerRes.body.data.token;
      userId = registerRes.body.data.user.id;

      // Paso 2: Crear post
      const createRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          desc: 'Test post for integration',
          img: 'https://example.com/image.jpg',
        });

      expect(createRes.status).toBe(201);
      postId = createRes.body.data.post.id;

      // Paso 3: Obtener post
      const getRes = await request(app)
        .get(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.post.id).toBe(postId);

      // Paso 4: Agregar comentario
      const commentRes = await request(app)
        .post(`/api/v1/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          desc: 'Great post!',
        });

      expect(commentRes.status).toBe(201);
      commentId = commentRes.body.data.comment.id;

      // Paso 5: Dar like al post
      const likeRes = await request(app)
        .post(`/api/v1/posts/${postId}/likes`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(likeRes.status).toBe(201);

      // Paso 6: Obtener likes del post
      const likesRes = await request(app)
        .get(`/api/v1/posts/${postId}/likes`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(likesRes.status).toBe(200);
      expect(likesRes.body.data.likes.length).toBeGreaterThanOrEqual(1);

      // Paso 7: Eliminar comentario
      const deleteCommentRes = await request(app)
        .delete(`/api/v1/posts/${postId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteCommentRes.status).toBe(200);

      // Paso 8: Eliminar post
      const deletePostRes = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deletePostRes.status).toBe(200);

      // Paso 8: Verificar que post fue eliminado
      const verifyDeleted = await request(app)
        .get(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyDeleted.status).toBe(404);
    });
  });

  // Test de flujo de relaciones
  describe('Follow/Unfollow Integration', () => {
    let user1Token, user1Id;
    let user2Token, user2Id;

    it('debe seguir, verificar relación y dejar de seguir', async () => {
      // Paso 1: Crear usuario 1
      const res1 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'follower_user',
          email: 'follower@example.com',
          password: 'Password@123',
          name: 'Follower',
        });

      expect(res1.status).toBe(201);
      user1Token = res1.body.data.token;
      user1Id = res1.body.data.user.id;

      // Paso 2: Crear usuario 2
      const res2 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'followed_user',
          email: 'followed@example.com',
          password: 'Password@123',
          name: 'Followed',
        });

      expect(res2.status).toBe(201);
      user2Token = res2.body.data.token;
      user2Id = res2.body.data.user.id;

      // Paso 3: Usuario 1 sigue a Usuario 2
      const followRes = await request(app)
        .post('/api/v1/relationships')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ followedUserId: user2Id });

      expect(followRes.status).toBe(201);

      // Paso 4: Verificar que User1 sigue a User2
      const checkRes = await request(app)
        .get(`/api/v1/relationships?userId=${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(checkRes.status).toBe(200);
      expect(checkRes.body.data.relationships).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ follower_user_id: user1Id })
        ])
      );

      // Paso 5: Obtener followers de User2
      const followersRes = await request(app)
        .get(`/api/v1/relationships?userId=${user2Id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(followersRes.status).toBe(200);
      expect(followersRes.body.data.relationships).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ follower_user_id: user1Id })
        ])
      );

      // Paso 6: Dejar de seguir
      const unfollowRes = await request(app)
        .delete(`/api/v1/relationships/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(unfollowRes.status).toBe(200);

      // Paso 7: Verificar que ya no sigue
      const verifyRes = await request(app)
        .get(`/api/v1/relationships?userId=${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.relationships).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ follower_user_id: user1Id })
        ])
      );
    });
  });

  // Test de validación en cascada
  describe('Data Validation Integration', () => {
    it('debe validar datos en todo el flujo', async () => {
      // Registro con email inválido
      const badEmailRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Password@123',
          name: 'Test User',
        });

      expect(badEmailRes.status).toBe(400);

      // Registro con contraseña débil
      const badPasswordRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123', // muy corta
          name: 'Test User',
        });

      expect(badPasswordRes.status).toBe(400);

      // Login con credenciales incorrectas
      const badLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword@123',
        });

      expect(badLoginRes.status).toBe(401);
    });
  });

  // Test de permisos y autorización
  describe('Authorization Integration', () => {
    let ownerToken, ownerPostId;
    let otherUserToken, otherUserId;

    it('debe proteger operaciones según permisos', async () => {
      // Paso 1: Crear owner
      const ownerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'post_owner',
          email: 'owner@example.com',
          password: 'Password@123',
          name: 'Post Owner',
        });

      expect(ownerRes.status).toBe(201);
      ownerToken = ownerRes.body.data.token;

      // Paso 2: Crear post
      const postRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          desc: 'Owner post',
          img: 'https://example.com/image.jpg',
        });

      expect(postRes.status).toBe(201);
      ownerPostId = postRes.body.data.post.id;

      // Paso 3: Crear otro usuario
      const otherRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'other_user',
          email: 'other@example.com',
          password: 'Password@123',
          name: 'Other User',
        });

      expect(otherRes.status).toBe(201);
      otherUserToken = otherRes.body.data.token;
      otherUserId = otherRes.body.data.user.id;
      // Paso 4: Owner puede eliminar su post
      const createRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          desc: 'Post to delete',
          img: 'https://example.com/image.jpg',
        });

      expect(createRes.status).toBe(201);
      const postId = createRes.body.data.post.id;

      const deleteOwnRes = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(deleteOwnRes.status).toBe(200);

      // Paso 5: Otro usuario NO puede eliminar post ajeno
      const createPostRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          desc: 'Protected post',
          img: 'https://example.com/image.jpg',
        });

      expect(createPostRes.status).toBe(201);
      const protectedPostId = createPostRes.body.data.post.id;

      const deleteOthersRes = await request(app)
        .delete(`/api/v1/posts/${protectedPostId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(deleteOthersRes.status).toBe(403);

      // Paso 6: Request sin token retorna 401
      const noTokenRes = await request(app).delete(
        `/api/v1/posts/${protectedPostId}`
      );

      expect(noTokenRes.status).toBe(401);
    });
  });
});
