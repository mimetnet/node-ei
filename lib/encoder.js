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
        this.index = 0;
        this.offset = 0;
    }
};

EiEncoder.prototype._read = function(len) {
    'use strict';

    var i = 0, max, cut;

    if (isNaN(len) || 0 >= len) {
        len = this.length;
    }

    if (0 >= (this.index - this.offset)) {
        return this.push(null);
    }

    console.log('_read: push', this.offset, this.index);
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
        this.appendUInt8(val);
    } else if (val <= ei.MAX) {
        this.appendUInt8(ei.INTEGER_EXT);
        this.appendUInt32BE(val);
    } else {
        throw new Error('BIG not implemented');
    }
};

function appender(encoder, len) {
    'use strict';

    return function(data) {
        //if ((len + (this.index - this.offset)) >= this.buf.length) {
        //    console.log('append: grow', len);
        //    this._extend(len);
        //}

        this._extend(len);
        encoder.call(this.buf, data, this.index, false);
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

module.exports = function(options) {
    'use strict';

    return new EiEncoder(options || {});
};
