'use strict';

var fs = require('fs')
    , util = require('util')
    , Transform = require('stream').Transform
    , ei = require('./const')
    , decoder = require('./decoder')
    , BUFFER_SIZE = 1024
;

function StringTransform()
{
    Transform.call(this);

    this.buf = new Buffer(BUFFER_SIZE);
    this.idx = 0;
}

util.inherits(StringTransform, Transform);

StringTransform.prototype._pushBuffer = function(val) {
    var eos, len;

    do {
        eos = this.buf.length - this.idx;
        len = Math.min(Buffer.byteLength(val), eos);

        this.idx += this.buf.write(val, this.idx, len);

        if (val.length >= eos) {
            this.push(this.buf.slice(0, this.idx));
            this.buf = new Buffer(BUFFER_SIZE);
            this.idx = 0;
        }

        val = val.substring(len);
    } while (0 < val.length);
};

StringTransform.prototype._transformType = function(dec, done) {
    var cnt, beg, end, type;

    cnt = 0;
    type = dec.getType();

    switch (type) {
        case ei.VERSION_MAGIC:
            dec.decodeVersion();
            break;
        case ei.SMALL_INTEGER_EXT:
        case ei.INTEGER_EXT:
            this._pushBuffer(dec.decodeLong().toString());
            break;
        case ei.FLOAT_EXT:
            this._pushBuffer(dec.decodeFloat().toString());
            break;
        case ei.ATOM_EXT:
            this._pushBuffer(dec.decodeAtom());
            break;
        case ei.REFERENCE_EXT:
        case ei.NEW_REFERENCE_EXT:
            var ref = dec.decodeRef();
            this._pushBuffer(util.format('#Ref<%s>', ref.n.join('.')));
            break;
        case ei.PORT_EXT:
            var port = dec.decodePort();
            this._pushBuffer(util.format('#Port<%d.%d>', port.id, port.creation));
            break;
        case ei.PID_EXT:
            var pid = dec.decodePid();
            this._pushBuffer(util.format('<%s.%d.%d>', pid.node, pid.number, pid.serial));
            break;
        case ei.SMALL_TUPLE_EXT:
        case ei.LARGE_TUPLE_EXT:
            cnt = dec.decodeTupleHeader();
            beg = '{';
            end = '}';
            break;
        case ei.NIL_EXT:
            cnt = dec.decodeListHeader();
            break;
        case ei.STRING_EXT:
            this._pushBuffer('"' + dec.decodeString() + '"');
            break;
        case ei.LIST_EXT:
            cnt = dec.decodeListHeader();
            beg = '[';
            end = ']';
            break;
        case ei.BINARY_EXT:
            throw new Error('BINARY_EXT not convertible');
        case ei.SMALL_BIG_EXT:
            throw new Error('SMALL_BIG_EXT not convertible');
        case ei.LARGE_BIG_EXT:
            throw new Error('LARGE_BIG_EXT not convertible');
        case ei.NEW_FUN_EXT:
            throw new Error('NEW_FUN_EXT not convertible');
        case ei.FUN_EXT:
            throw new Error('FUN_EXT not convertible');
        case ei.NEW_CACHE:
            throw new Error('NEW_CACHE not convertible');
        case ei.CACHED_ATOM:
            throw new Error('CACHED_ATOM not convertible');
        case ei.END_OF_STREAM:
            break;
        default:
            return done(new TypeError('Unknown Type ' + type));
    }

    if (0 < cnt) {
        this._pushBuffer(beg);
        while (cnt--) {
            if (true !== this._transformType(dec, done)) {
                break;
            }

            if (cnt) {
                this._pushBuffer(', ');
            }
        }
        this._pushBuffer(end);
    }

    return true;
};

StringTransform.prototype._transform = function(chunk, encoding, done) {
    var dec, ret;

    if (!Buffer.isBuffer(chunk)) {
        return done(new TypeError('chunk must be a Buffer'));
    }

    dec = decoder(chunk);

    do {
        if (true !== (ret = this._transformType(dec, done))) {
            break;
        }
    } while (0 < dec.getType());

    if (true === ret) {
        done();
    }
};

StringTransform.prototype._flush = function(done) {
    if (0 < this.idx) {
        this.push(this.buf.slice(0, this.idx));
        this.buf = null;
        this.idx = 0;
    }

    done();
};

module.exports = function() {
    return new StringTransform();
};