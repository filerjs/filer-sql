var path = require('path');
var DB = require('./lib/db.js');

function SQLContext(options) {
  this.readOnly = options.isReadOnly;
  this.keyPrefix = options.keyPrefix;
  this.db = options.db;
}

function prefixKey(prefix, key) {
console.log(arguments);
  return path.join(prefix, key);
}

function _put(db, keyPrefix, key, value, callback) {
  var keyPath = prefixKey(keyPrefix, key);
  db.createOrUpdate(keyPath, value, function(err) {
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
  _put(this.db, this.keyPrefix, key, buf, callback);
};
SQLContext.prototype.putBuffer = function(key, value, callback) {
  if(this.readOnly) {
    return callback(new Error('write operation on read-only context.'));
  }

  _put(this.db, this.keyPrefix, key, value, callback);
};

SQLContext.prototype.delete = function (key, callback) {
  if(this.readOnly) {
    return callback(new Error('write operation on read-only context.'));
  }

  var keyPath = prefixKey(this.keyPrefix, key);
  this.db.remove(keyPath, function(err) {
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

  this.db.clearAll(this.keyPrefix, callback);
};

function _get(db, keyPrefix, key, callback) {
  var keyPath = prefixKey(keyPrefix, key);
  db.find(keyPath, callback);
}
SQLContext.prototype.getObject = function(key, callback) {
  _get(this.db, this.keyPrefix, key, function(err, data) {
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
  _get(this.db, this.keyPrefix, key, callback);
};

function SQLProvider(options) {
  this.options = options || {};
  this.keyPrefix = options.keyPrefix;
  this.name = options.name;
}

SQLProvider.isSupported = function() {
  return (typeof module !== 'undefined' && module.exports);
};

SQLProvider.prototype.open = function(callback) {
  if(!this.keyPrefix) {
    return callback(new Error('missing keyPrefix'));
  }

  this.db = new DB(this.options, function(err) {
    if (err) {
      return callback(err);
    }

    callback();
  });
};

SQLProvider.prototype.getReadOnlyContext = function() {
  return new SQLContext({isReadOnly: true, keyPrefix: this.keyPrefix, db: this.db});
};

SQLProvider.prototype.getReadWriteContext = function() {
  return new SQLContext({isReadOnly: false, keyPrefix: this.keyPrefix, db: this.db});
};

module.exports = SQLProvider;
