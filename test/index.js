var expect = require('chai').expect;
var level = require('level');
var db = level('testdb', {valueEncoding: 'json'});

var Person = require('open-app-person-domain')({
  db: db,
})

var Circle = require('../')({
  db: db,
});

describe("#Circle", function () {
  it("should CRUD circle model", function (done) {
    var member = Person.create({
      name: "Bob Loblaw",
      email: "bobloblawlawblog.com",
    });
    member.save(function (err) {
      expect(err).to.not.exist;
      var newCircle = Circle.create({
        name: "Law Firm",
        member: [member],
      });
      newCircle.save(function (err) {
        expect(err).to.not.exist;
        var key = newCircle.key;
        expect(key).to.exist;
        Circle.get(key, function (err, getCircle) {
          expect(err).to.not.exist;
          expect(getCircle.toJSON()).to.deep.equal(newCircle.toJSON());
          Circle.update(key, { member: []}, function (err, updateCircle) {
            expect(err).to.not.exist;
            expect(updateCircle.toJSON()).to.deep.equal({
              name: newCircle.name,
              member: [],
            });
            done();
          });
        });
      });
    });
  });
  
  afterEach(function (done) {
    // del all objects in db
    db.createKeyStream()
    .on('data', function (k) {
      db.del(k);
    })
    .on('close', function () {
      done();
    });
  });
});

