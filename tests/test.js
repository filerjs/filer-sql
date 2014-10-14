var expect = require('expect.js');
var SQLProvider = require('..');

// Use either sqlite or mysql, depending on env vars
var type = process.env.DB_TYPE || SQLProvider.SQLITE;
var name = process.env.DB_NAME || 'makedrive';
var username = process.env.DB_USERNAME;
var password = process.env.DB_PASSWORD;

function guid() {
  if(!guid.id) {
    guid.id = 0;
  }
  return 'id:' + guid.id++;
}

describe("Filer.FileSystem.providers.SQLProvider", function() {
  var _provider;
  var _context;

  beforeEach(function(done) {
    _provider = new SQLProvider({
      type: type,
      logging: console.log,
      user: guid(),
      db: {
        name: name,
        username: username,
        password: password
      }
    });

    _provider.open(function(err) {
      if(err) {
        throw err;
      }

      _context = _provider.getReadWriteContext();
      done();
    });
  });

  afterEach(function(done){
    _context.clear(function(err) {
      if(err) {
        throw err;
      }
      done();
    });
  });

  it("is supported -- if it isn't, none of these tests can run.", function() {
    expect(SQLProvider.isSupported).to.be.true;
  });

  it("has open, getReadOnlyContext, and getReadWriteContext instance methods", function() {
    var sql = new SQLProvider({type: 'sqlite'});
    expect(sql.open).to.be.a('function');
    expect(sql.getReadOnlyContext).to.be.a('function');
    expect(sql.getReadWriteContext).to.be.a('function');
  });

  it("should allow putObject() and getObject()", function(done) {
    var data = {
      key: "value",
      number: 35,
      flag: true,
      arr: [1,2,3]
    };

    _context.putObject("key", data, function(error) {
      if(error) {
        throw error;
      }
      _context.getObject("key", function(error, result) {
        expect(error).not.to.exist;
        expect(result).to.exist;
        expect(result).to.eql(data);
        done();
      });
    });
  });

  it("should allow putBuffer() and getBuffer()", function(done) {
    var data = new Buffer([5, 2, 5]);
    _context.putBuffer("key", data, function(error) {
      if(error) {
        throw error;
      }
      _context.getBuffer("key", function(error, result) {
        expect(error).not.to.exist;
        expect(result).to.exist;
        expect(result).to.eql(data);
        done();
      });
    });
  });

  it("should allow putBuffer() to update an existing record", function(done) {
    var data1 = new Buffer([1, 2, 3]);
    var data2 = new Buffer([4, 5, 6]);

    _context.putBuffer("key", data1, function(error) {
      if(error) {
        throw error;
      }

      _context.putBuffer("key", data2, function(error) {
        if(error) {
          throw error;
        }

        _context.getBuffer("key", function(error, result) {
          expect(error).not.to.exist;
          expect(result).to.exist;
          expect(result).to.eql(data2);
          done();
        });
      });
    });
  });

  it("should allow delete()", function(done) {
    _context.putObject("key", "value", function(error) {
      if (error) {
        throw error;
      }
      _context.delete("key", function(error) {
        if (error) {
          throw error;
        }
        _context.getObject("key", function(error, result) {
          expect(error).not.to.exist;
          expect(result).not.to.exist;
          done();
        });
      });
    });
  });

  it("should allow clear()", function(done) {
    var data1 = new Buffer([5, 2, 5]);
    var data2 = new Buffer([10, 20, 50]);

    _context.putBuffer("key1", data1, function(error) {
      if (error) {
        throw error;
      }
      expect(error).not.to.exist;
      _context.putBuffer("key2", data2, function(error) {
        if (error) {
          throw error;
        }
        expect(error).not.to.exist;
        _context.clear(function(error) {
          if (error) {
            throw error;
          }
          _context.getBuffer("key1", function(error, result) {
            expect(error).to.exist;
            expect(result).not.to.exist;

            _context.getBuffer("key2", function(error, result) {
              expect(error).to.exist;
              expect(result).not.to.exist;
              done();
            });
          });
        });
      });
    });
  });

  it("should fail when trying to write on ReadOnlyContext", function(done) {
    var data1 = new Buffer([5, 2, 5]);
    _context.putBuffer("key1", data1, function(error) {
      expect(error).to.exist;
      done();
    });
  });

});
