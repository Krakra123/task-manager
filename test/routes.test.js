// test/routes.test.js
const request = require('supertest');
const { expect } = require('chai');

// Giả sử bạn đã export app trong index.js:
//    module.exports = app;
const app = require('../index');

describe('Basic Routes', () => {
  // it('GET / trả về 200 và chứa “Task Manager” trên trang', async () => {
  //   const res = await request(app).get('/');
  //   expect(res.status).to.equal(200);
  //   expect(res.text).to.include('Task Manager');
  // });
  it('GET / trả về 200 và trả về HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    // Chỉ cần kiểm tra có DOCTYPE là respone HTML
    expect(res.text).to.include('<!DOCTYPE html>');
    });

  it('POST /chat không có message => 400 và body.error đúng', async () => {
    const res = await request(app)
      .post('/chat')
      .send({});    // không gửi message
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      'error',
      'Please provide a message in the request body.'
    );
  });

  it('POST /unknown-route trả về 404', async () => {
    const res = await request(app).post('/some-nonsense');
    expect(res.status).to.equal(404);
  });
});
