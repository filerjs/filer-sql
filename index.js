var DB = require('./lib/db.js');

function SQLContext(options) {
  this.readOnly = options.isReadOnly;
  this.db = options.db;
}

function _put(db, key, value, callback) {
  db.createOrUpdate(key, value, function(err) {
    if(err) {
      return callback(err);
    }

    callback();
  });
}
SQLContext.prototype.putObject = function(key, value, callback) {
  if(this.readOnly) {
    return callback(new Error('write operation on read-only context.'));
  }

  var json = JSON.stringify(value);
  var buf = new Buffer(json, 'utf8');
  _put(this.db, key, buf, callback);
};
SQLContext.prototype.putBuffer = function(key, value, callback) {
  if(this.readOnly) {
    return callback(new Error('write operation on read-only context.'));
  }

  _put(this.db, key, value, callback);
};

SQLContext.prototype.delete = function (key, callback) {
  if(this.readOnly) {
    return callback(new Error('write operation on read-only context.'));
  }

  this.db.remove(key, function(err) {
    if(err) {
      return callback(err);
    }
    callback();
  });
};

SQLContext.prototype.clear = function (callback) {
  if(this.readOnly) {
    return callback(new Error('write operation on read-only context.'));
  }

  this.db.clearAll(callback);
};

function _get(db, key, callback) {
  db.find(key, callback);
}
SQLContext.prototype.getObject = function(key, callback) {
  _get(this.db, key, function(err, data) {
    if(err) {
      return callback(err);
    }

    if(data) {
      try {
        data = JSON.parse(data.toString('utf8'));
      } catch(e) {
        return callback(e);
      }
    }

    callback(null, data);
  });
};
SQLContext.prototype.getBuffer = function(key, callback) {
  _get(this.db, key, callback);
};

function SQLProvider(options) {
  this.options = options || {};
  this.user = options.user;
}

SQLProvider.isSupported = function() {
  return (typeof module !== 'undefined' && module.exports);
};

SQLProvider.prototype.open = function(callback) {
  if(!this.user) {
    return callback(new Error('missing user'));
  }

  this.db = new DB(this.options, function(err) {
    if (err) {
      return callback(err);
    }

    callback();
  });
};

SQLProvider.prototype.getReadOnlyContext = function() {
  return new SQLContext({isReadOnly: true, db: this.db});
};

SQLProvider.prototype.getReadWriteContext = function() {
  return new SQLContext({isReadOnly: false, db: this.db});
};

// Forward db type constants
SQLProvider.MYSQL = DB.MYSQL;
SQLProvider.SQLITE = DB.SQLITE;
SQLProvider.POSTGRES = DB.POSTGRES;
SQLProvider.MARIADB = DB.MARIADB;

module.exports = SQLProvider;
