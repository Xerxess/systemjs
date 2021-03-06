suite('AMD tests', function () {

  test('Multiple Errors', function () {
    window.onerror = undefined;
    return System.import('fixtures/amd-error.js').then(function (m) {
      assert.fail('Should fail');
    }, function (err) {
      assert.ok(err);
      return System.import('fixtures/amd-ok.js')
      .then(function (m) {
        assert.ok(m);
      });
    });
  });

  test('Loading an AMD module', function () {
    return System.import('fixtures/amd-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.amd, true);
      assert.equal(m.default.dep.amd, 'dep');
    });
  });

  test('Loading AMD exports dependency', function () {
    return System.import('fixtures/amd-exports.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.test, 'hi');
      assert.equal(m.default.dep.amd, 'dep');
      assert.equal(m.default.mod.amd, true);
    });
  });

  test('AMD Circular', function () {
    return System.import('fixtures/amd-circular1.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.outFunc(), 5);
    });
  });

  test('Loading an AMD named define', function () {
    return System.import('fixtures/nameddefine.js').then(function (m1) {
      assert.ok(m1.default);
      assert.equal(m1.default.another, 'define');
    });
  });

  test('Loading an AMD bundle with multiple anonymous defines', function () {
    return System.import('fixtures/multiple-anonymous.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.anon, true);
    });
  });

  test('AMD falls back to global support', function () {
    return System.import('fixtures/global2.js').then(function (m) {
      assert.equal(m.default, 'hi');
    });
  });

});