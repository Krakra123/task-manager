// test/additional.test.js
const request = require('supertest');
const sinon   = require('sinon');
const { expect } = require('chai');
const boardModel = require('../server/models/board-model');
const app = require('../index');

describe('Additional Endpoint Tests', () => {
  //
  // 1–3: Root & unknown routes
  //
  it('GET / should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
  });

  it('GET / should have HTML content-type', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).to.match(/html/);
  });

  it('GET /notfound should return 404', async () => {
    const res = await request(app).get('/notfound');
    expect(res.status).to.equal(404);
  });

  //
  // 4–5: Chat endpoint
  //
  it('POST /chat without message should return 400 and error', async () => {
    const res = await request(app).post('/chat').send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  // it('POST /chat with message should return 500 and OpenAI error', async () => {
  //   const res = await request(app).post('/chat').send({ message: 'Hello' });
  //   expect(res.status).to.equal(500);
  //   expect(res.body).to.deep.equal({ error: 'Failed to get response from OpenAI.' });
  // });

  //
  // 6–8: /get-board-data endpoint
  //
  describe('POST /get-board-data', () => {
    beforeEach(() => {
      sinon.stub(boardModel.taskCollection, 'findById')
           .resolves({ _id: '1', title: 'Task1', column: 'col1' });
      sinon.stub(boardModel.boardCollection, 'findOne')
           .resolves({ _id: 'b1', title: 'Board1', columns: [{ _id: 'col1' }] });
      sinon.stub(boardModel.boardColumnCollection, 'findById')
           .resolves({ _id: 'col1', title: 'Column1' });
      sinon.stub(boardModel.taskCollection, 'find')
           .resolves([{ title: 'Task1', description: 'Desc1' }]);
    });

    afterEach(() => sinon.restore());

    it('should return formatted board data', async () => {
      const res = await request(app)
        .post('/get-board-data')
        .send({ id: '1' });
      expect(res.status).to.equal(200);
      expect(res.text).to.include('TARGET TASK TITLE: Task1');
      expect(res.text).to.include('BOARD TITLE: Board1');
      expect(res.text).to.include('- Column1: CONTAINS TASKS:');
      expect(res.text).to.include('TITLE: Task1; DESCRIPTION: Desc1');
    });

    it('should return 500 if findById rejects', async () => {
      sinon.restore();
      sinon.stub(boardModel.taskCollection, 'findById')
           .rejects(new Error('DB error'));
      const res = await request(app)
        .post('/get-board-data')
        .send({ id: '1' });
      expect(res.status).to.equal(500);
    });

    it('should still return formatted data even if no id provided', async () => {
      const res = await request(app)
        .post('/get-board-data')
        .send({});
      expect(res.status).to.equal(200);
      expect(res.text).to.include('TARGET TASK TITLE: Task1');
    });
  });

  //
  // 9–10: /xddd endpoint
  //
  describe('GET /xddd', () => {
    beforeEach(() => {
      sinon.stub(global, 'fetch')
           .resolves({ text: async () => 'stubbed data' });
    });
    afterEach(() => sinon.restore());

    it('should return "Response from POST: stubbed data"', async () => {
      const res = await request(app).get('/xddd?id=123');
      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Response from POST: stubbed data');
    });

    it('should return 500 when fetch rejects', async () => {
      sinon.restore();
      sinon.stub(global, 'fetch').rejects(new Error('fetch error'));
      const res = await request(app).get('/xddd?id=123');
      expect(res.status).to.equal(500);
    });
  });
});
