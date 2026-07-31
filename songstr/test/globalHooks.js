process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';

exports.mochaHooks = {
  beforeAll(done) {
    console.log('[Test Suite] Global setup initialized.');
    done();
  },
  afterAll(done) {
    console.log('[Test Suite] Global teardown finished.');
    done();
  }
};
