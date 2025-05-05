// test/getBoardData.test.js
const request = require('supertest');
const sinon   = require('sinon');
const { expect } = require('chai');

// import app (index.js phải có module.exports = app)
const app = require('../index');

// import các model để stub
const {
  boardCollection,
  boardColumnCollection: columnCollection,
  taskCollection
} = require('../server/models/board-model');

describe('POST /get-board-data', () => {
  let findByIdTask, findOneBoard, findByIdColumn, findTasksInColumn;

  before(() => {
    // 1) Task.findById(id)
    findByIdTask = sinon.stub(taskCollection, 'findById')
      .resolves({ title: 'Mock Task', column: 'col123' });

    // 2) Board.findOne({ "columns._id": columnId })
    findOneBoard = sinon.stub(boardCollection, 'findOne')
      .resolves({ title: 'Mock Board', columns: [{ _id: 'col123' }] });

    // 3) Column.findById(_id)
    findByIdColumn = sinon.stub(columnCollection, 'findById')
      .resolves({ title: 'Column Title' });

    // 4) Task.find({ column: column._id })
    findTasksInColumn = sinon.stub(taskCollection, 'find')
      .resolves([{ title: 'Mock Task', description: 'Desc' }]);
  });

  after(() => {
    sinon.restore();
  });

  it('Trả về thông tin board-data đúng định dạng text', async () => {
    const res = await request(app)
      .post('/get-board-data')
      .send({ id: 'any-id' })
      .expect(200);

    const text = res.text;
    expect(text).to.include('TARGET TASK TITLE: Mock Task');
    expect(text).to.include('BOARD TITLE: Mock Board');
    expect(text).to.include('- Column Title: CONTAINS TASKS:');
    expect(text).to.include('- TITLE: Mock Task; DESCRIPTION: Desc');
  });
});
