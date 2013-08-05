var ei = require('./const')
    , util = require('util')
    , EiRef = require('./ref')
    , EiPid = require('./pid')
    , EiPort = require('./port')
    , Buffers = require('buffers')
    , Readable = require('stream').Readable
    , BUFFER_SIZE = ('undefined' === typeof(process.env.EI_ENCODER_SIZE)?
        256 : parseInt(process.env.EI_ENCODER_SIZE, 10))
;

if (!Readable) {
    Readable = require('readable-stream').Readable;
}

function EiEncoder(options) {
    'use strict';

    if (!(this instanceof EiEncoder)) {
        return new EiEncoder(options);
    }

    Readable.call(this, options);

    this.buffers = new Buffers();
    this.buf = new Buffer(BUFFER_SIZE);
    //this.buf.fill(0);
    this.index = 0;
    this.offset = 0;

    Object.defineProperty(this, 'length', {
        enumerable: true,
        get: function() {
            return ((this.index - this.offset) + this.buffers.length);
        }
    });
}

util.inherits(EiEncoder, Readable);

EiEncoder.prototype._extend = function(len) {
    'use strict';

    len = len || BUFFER_SIZE;

    if ((len + (this.index - this.offset)) > this.buf.length) {
        console.log('EXTEND:', this.index, this.buf.length);
        this.buffers.push(this.buf.slice(this.offset, this.index));

        this.buf = new Buffer(len);
        //this.buf.fill(0);
        this.index = 0;
        this.offset = 0;
    }
};

EiEncoder.prototype._read = function(len) {
    'use strict';

    var i = 0, cut;

    if (isNaN(len) || 0 >= len) {
        len = this.length;
    }

    if (0 >= (this.index - this.offset)) {
        return this.push(null);
    }

    console.log('_read: push (off=%d, idx=%d)', this.offset, this.index);
    this.buffers.push(this.buf.slice(this.offset, this.index));
    this.offset = this.index;

    cut = this.buffers.splice(0, len);

    for (; i < cut.buffers.length; i++) {
        console.log('push:', cut.buffers[i]);
        this.push(cut.buffers[i]);
    }
};

EiEncoder.prototype.encodeVersion = function() {
    'use strict';

    this.appendUInt8(ei.VERSION_MAGIC);
};

EiEncoder.prototype.encodeLong = function(val) {
    'use strict';

    if ((val < 256) && (val >= 0)) {
        this.appendUInt8(ei.SMALL_INTEGER_EXT);
        this.appendInt8(val);
    } else if (val <= ei.MAX && val >= ei.MIN) {
        this.appendUInt8(ei.INTEGER_EXT);
        this.appendInt32BE(val);
    } else {
        throw new Error('BIG not implemented');
    }
};

EiEncoder.prototype.encodeULong = function(val) {
    'use strict';

    if (val < 0) {
        throw new TypeError('Cannot encode less than 0');
    } else if ((val < 256) && (val >= 0)) {
        this.appendUInt8(ei.SMALL_INTEGER_EXT);
        this.appendUInt8(val);
    } else if (val <= ei.MAX) {
        this.appendUInt8(ei.INTEGER_EXT);
        this.appendUInt32BE(val);
    } else {
        throw new Error('BIG not implemented');
    }
};

EiEncoder.prototype.encodeDouble = function(val) {
    'use strict';

    if (typeof(val) !== 'number') {
        throw new TypeError('Only numbers are accepted');
    } else {
        this.appendUInt8(ei.NEW_FLOAT_EXT);
        this.appendDoubleBE(val);
    }
};

EiEncoder.prototype.encodeString = function(val, encoding) {
    'use strict';

    if (typeof(val) !== 'string') {
        throw new TypeError('Only strings are accepted');
    } else if (0 === val.length) {
        this.appendUInt8(ei.NIL_EXT);
    } else if (65535 >= val.length) {
        var buf = new Buffer(val, encoding);

        this.appendUInt8(ei.STRING_EXT);
        this.appendUInt16BE(buf.length);
        this.appendBuffer(buf);
    } else {
        throw new Error('Cannot encode strings as lists yet');
    }
};

EiEncoder.prototype.encodeAtom = function(val, encoding) {
    'use strict';

    var type = typeof(val);

    encoding = (encoding || 'ascii').toLowerCase();

    if (type !== 'string' && type !== 'number') {
        throw new TypeError('Only strings & numbers are accepted');
    } else if (0 === (val = val.toString()).length) {
        throw new Error('Length must be greater than zero');
    } else {
        var buf = new Buffer(val, encoding);

        if (256 < val.length) {
            if ('ascii' === encoding) {
                this.appendUInt8(ei.ATOM_EXT);
            } else {
                this.appendUInt8(ei.ATOM_UTF8_EXT);
            }

            this.appendUInt16BE(buf.length);
        } else {
            if ('ascii' === encoding) {
                this.appendUInt8(ei.SMALL_ATOM_EXT);
            } else {
                this.appendUInt8(ei.SMALL_ATOM_UTF8_EXT);
            }

            this.appendUInt8(buf.length);
        }

        this.appendBuffer(buf);
    }
};

EiEncoder.prototype.encodeBool = function(val) {
    'use strict';

    if (typeof(val) !== 'boolean') {
        throw new TypeError('Only booleans are allowed');
    }

    this.encodeAtom(val.toString());
};

EiEncoder.prototype.encodeBinary = function(val, len) {
    'use strict';

    len = len || val.length;

    if (!Buffer.isBuffer(val)) {
        throw new TypeError('Only Buffers are accepted');
    } else {
        this.appendUInt8(ei.BINARY_EXT);
        this.appendUInt32BE(len);
        this.appendBuffer(val, len);
    }
};

EiEncoder.prototype.encodeListHeader = function(cnt) {
    'use strict';

    if (typeof(cnt) !== 'number') {
        throw new TypeError('Only numbers are accepted');
    } else if (0 > cnt) {
        throw new TypeError('Arity must be >= 0');
    } else if (0 === cnt) {
        this.appendUInt8(ei.NIL_EXT);
    } else {
        this.appendUInt8(ei.LIST_EXT);
        this.appendUInt32BE(cnt);
    }
};

EiEncoder.prototype.encodeTupleHeader = function(cnt) {
    'use strict';

    if (typeof(cnt) !== 'number') {
        throw new TypeError('Only numbers are accepted');
    } else if (0 > cnt) {
        throw new TypeError('Arity must be >= 0');
    } else if (255 <= cnt) {
        this.appendUInt8(ei.SMALL_TUPLE_EXT);
        this.appendUInt8(cnt);
    } else {
        this.appendUInt8(ei.LARGE_TUPLE_EXT);
        this.appendUInt32BE(cnt);
    }
};

function appender(encoder, len) {
    'use strict';

    return function(data) {
        this._extend(len);
        encoder.call(this.buf, data, (this.index - this.offset), false);
        this.index += len;
        return true;
    };
}

EiEncoder.prototype.appendUInt8 = appender(Buffer.prototype.writeUInt8, 1);
EiEncoder.prototype.appendUInt16BE = appender(Buffer.prototype.writeUInt16BE, 2);
EiEncoder.prototype.appendUInt32BE = appender(Buffer.prototype.writeUInt32BE, 4);
EiEncoder.prototype.appendInt8 = appender(Buffer.prototype.writeInt8, 1);
EiEncoder.prototype.appendInt16BE = appender(Buffer.prototype.writeInt16BE, 2);
EiEncoder.prototype.appendInt32BE = appender(Buffer.prototype.writeInt32BE, 4);
EiEncoder.prototype.appendFloatBE = appender(Buffer.prototype.writeFloatBE, 4);
EiEncoder.prototype.appendDoubleBE = appender(Buffer.prototype.writeDoubleBE, 8);
EiEncoder.prototype.appendBuffer = function(val, len) {
    if (!Buffer.isBuffer(val)) {
        throw new Type('Only Buffers are accepted');
    }

    len = len || val.length;

    if (0 < len) {
        this._extend(len);
        val.copy(this.buf, (this.index - this.offset), 0, len);
        this.index += len;
    }
}

module.exports = function(options) {
    'use strict';

    return new EiEncoder(options || {});
};
