var ei = require('./const')
    , EiRef = require('./ref')
    , EiPid = require('./pid')
    , EiPort = require('./port')
;

function EiDecoder(buf) {
    if (!Buffer.isBuffer(buf))
        throw new TypeError('invalid Buffer');

    this.buf = buf;
    this.index = 0;
}

EiDecoder.prototype.getType = function() {
    var type;

    if (this.index >= this.buf.length)
        return -1;

    type = this.buf.readUInt8(this.index);

    switch (type) {
        case ei.ATOM_UTF8_EXT:
        case ei.SMALL_ATOM_EXT:
        case ei.SMALL_ATOM_UTF8_EXT:
            type = ei.ATOM_EXT;
            break;

        case ei.FLOAT_EXT:
        case ei.NEW_FLOAT_EXT:
            type = ei.FLOAT_EXT;
            break;
    }

    return type;
};

EiDecoder.prototype.getLength = function() {
    var l = 0;

    if (this.index >= this.buf.length)
        return -1;

    switch (this.buf.readUInt8(this.index)) {
        case ei.SMALL_ATOM_EXT:
        case ei.SMALL_ATOM_UTF8_EXT:
        case ei.SMALL_TUPLE_EXT:
            l = this.buf.readUInt8(this.index+1);
            break;

        case ei.ATOM_UTF8_EXT:
        case ei.ATOM_EXT:
        case ei.STRING_EXT:
            //*len = get16be(s);
            l = this.buf.readUInt16BE(this.index+1);
            break;

        case ei.LARGE_TUPLE_EXT:
        case ei.LIST_EXT:
        case ei.BINARY_EXT:
            //*len = get32be(s);
            l = this.buf.readUInt32BE(this.index+1);
            break;

        case ei.SMALL_BIG_EXT:
            //*len = get8(s); /* #digit_bytes */
            l = this.buf.readUInt8(this.index+1);
            break;

        case ei.LARGE_BIG_EXT:
            //*len = get32be(s); /* #digit_bytes */
            l = this.buf.readUInt32BE(this.index+1);
            break;
    }

    return l;
};

EiDecoder.prototype.skipTerm = function() {
    var type = this.buf.readUInt8(this.index);

    switch (type) {
        case ei.VERSION_MAGIC:
            this.index++;
            break;

        case ei.INTEGER_EXT:
        case ei.SMALL_INTEGER_EXT:
            this.decodeLong();
            break;

        case ei.FLOAT_EXT:
        case ei.NEW_FLOAT_EXT:
            this.decodeDouble();
            break;

        case ei.ATOM_EXT:
        case ei.SMALL_ATOM_EXT:
        case ei.ATOM_UTF8_EXT:
        case ei.SMALL_ATOM_UTF8_EXT:
            this.decodeAtom();
            break;

        case ei.NIL_EXT:
        case ei.STRING_EXT:
            this.decodeString();
            break;

        case ei.LIST_EXT:
            this.index++;
            this.index += this.buf.readUInt32BE(this.index);
            break;

        case ei.PID_EXT:
            this.decodePid();
            break;

        case ei.REFERENCE_EXT:
        case ei.NEW_REFERENCE_EXT:
            this.decodeRef();
            break;

        default:
            throw new Error('Cannot skip unsupported type: ' + type);
    }

    //    var ei.PORT_EXT            = 102; //'f';
    //    var ei.SMALL_TUPLE_EXT     = 104; //'h';
    //    var ei.LARGE_TUPLE_EXT     = 105; //'i';
    //
    //    var ei.BINARY_EXT          = 109; //'m';
    //    var ei.SMALL_BIG_EXT       = 110; //'n';
    //    var ei.LARGE_BIG_EXT       = 111; //'o';
    //    var ei.NEW_FUN_EXT	        = 112; //'p';
    //    var ei.FUN_EXT	            = 117; //'u';
    //    var ei.NEW_CACHE           = 78; //'N';
    //    var ei.CACHED_ATOM         = 67; //'C' ;
};

EiDecoder.prototype.decodeVersion = function() {
    if (ei.VERSION_MAGIC === this.buf.readUInt8(this.index)) {
        this.index++;
        return true;
    }

    return false;
};

EiDecoder.prototype.decodeAtom = function() {
    var ret, enc, len, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.ATOM_EXT:
        case ei.ATOM_UTF8_EXT:
            len = this.buf.readUInt16BE(idx);
            enc = 'ascii';
            idx += 2;
            break;

        case ei.SMALL_ATOM_EXT:
        case ei.SMALL_ATOM_UTF8_EXT:
            len = this.buf.readUInt8(idx);
            enc = 'utf8';
            idx += 1;
            break;

        default:
            throw new Error('Bad type');
    }

    if (enc) {
        ret = this.buf.toString(enc, idx, (this.index = idx + len));
    }

    return ret;
};

EiDecoder.prototype.decodeBool = function() {
    var ret;

    switch (this.decodeAtom()) {
        case 'true':
            ret = true;
            break;

        case 'false':
            ret = false;
            break;

        default:
            ret = null;
            break;
    }

    return ret;
}

EiDecoder.prototype.decodeLong = function() {
    var ret, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.SMALL_INTEGER_EXT:
            ret = this.buf.readInt8(idx);
            idx += 1;
            break;

        case ei.INTEGER_EXT:
            ret = this.buf.readInt32BE(idx);
            idx += 4;
            break;

        case ei.SMALL_BIG_EXT:
        case ei.LARGE_BIG_EXT:
            throw new Error('ei.[SMALL|LARGE]_BIG_EXT are not supported');

        default:
            throw new Error('Bad type');
    }

    this.index = idx;

    return ret;
};

EiDecoder.prototype.decodeULong = function() {
    var ret, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.SMALL_INTEGER_EXT:
            ret = this.buf.readUInt8(idx);
            idx += 1;
            break;

        case ei.INTEGER_EXT:
            ret = this.buf.readUInt32BE(idx);
            idx += 4;
            break;

        case ei.SMALL_BIG_EXT:
        case ei.LARGE_BIG_EXT:
            throw new Error('ei.[SMALL|LARGE]_BIG_EXT are not supported');

        default:
            throw new Error('Bad type');
    }

    this.index = idx;

    return ret;
};


EiDecoder.prototype.decodeDouble = function() {
    var ret, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.FLOAT_EXT:
            ret = parseFloat(this.buf.toString('ascii', idx, idx+=31));
            break;

        case ei.NEW_FLOAT_EXT:
            ret = this.buf.readDoubleBE(idx);
            idx += 8;
            break;

        default:
            throw new Error('Bad type');
    }

    this.index = idx;

    return ret;
};

EiDecoder.prototype.decodeString = function() {
    var ret, enc, len, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.NIL_EXT:
            len = 0;
            enc = 'ascii';
            break;

        case ei.STRING_EXT:
            len = this.buf.readUInt16BE(idx);
            enc = 'ascii';
            idx += 2;
            break;

        case ei.LIST_EXT:
            throw new Error('Cannot decode ei.LIST_EXT');

        default:
            throw new Error('Bad type');
    }

    if (enc) {
        this.index = idx + len
        ret = this.buf.toString(enc, idx, this.index);
    }

    return ret;
};

EiDecoder.prototype.decodeBinary = function() {
    var ret, len, idx = this.index;

    if (ei.BINARY_EXT !== this.buf.readUInt8(idx++))
        throw new Error('Bad type');

    len = this.buf.readInt32BE(idx);
    idx += 4;

    this.index = idx + len;

    return this.buf.slice(idx, this.index);
};

EiDecoder.prototype.decodeListHeader = function() {
    var ret, enc, len, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.NIL_EXT:
            ret = 0;
            break;

        case ei.LIST_EXT:
            ret = this.buf.readUInt32BE(idx);
            idx += 4;
            break;

        default:
            ret = null;
            break;
    }

    this.index = idx;

    return ret;
};

EiDecoder.prototype.decodeTupleHeader = function() {
    var ret, enc, len, idx = this.index;

    switch (this.buf.readUInt8(idx++)) {
        case ei.SMALL_TUPLE_EXT:
            ret = this.buf.readUInt8(idx);
            idx += 1;
            break;

        case ei.LARGE_TUPLE_EXT:
            ret = this.buf.readUInt32BE(idx);
            idx += 4;
            break;

        default:
            throw new Error('Bad type');
    }

    this.index = idx;

    return ret;
};

EiDecoder.prototype.decodePid = function() {
    var node, num, ser, crt, idx;

    if (ei.PID_EXT !== this.buf.readUInt8(this.index++))
        throw new Error('Bad type');

    node = this.decodeAtom();
    idx = this.index;

    num = this.buf.readUInt32BE(idx) & 0x7fff; /* 15 bits */
    idx += 4;

    ser = this.buf.readUInt32BE(idx) & 0x1fff; /* 13 bits */
    idx += 4;

    crt = this.buf.readUInt8(idx) & 0x03; /* 2 bits */
    idx += 1;

    this.index = idx;

    return new EiPid(node, num, ser, crt);
};

EiDecoder.prototype.decodeRef = function() {
    var node, len, nnn = [], crt, cnt = 0, i = 0;

    switch (this.buf.readUInt8(this.index++)) {
        case ei.REFERENCE_EXT:
            throw new Error('ei.REFERENCE_EXT not implemented')
            break;

        case ei.NEW_REFERENCE_EXT:
            len = cnt = this.buf.readUInt16BE(this.index);
            this.index += 2;
            node = this.decodeAtom();
            crt = this.buf.readUInt8(this.index) & 0x03; /* 2 bits */
            this.index += 1;
            break;

        default:
            throw new Error('Bad Type');
    }

    for (; (i<cnt && i<3); i++) {
        nnn.push(this.buf.readUInt32BE(this.index));
        this.index += 4;
    }

    return new EiRef(node, len, nnn, crt);
};

module.exports = function(buffer) {
    return new EiDecoder(buffer);
};