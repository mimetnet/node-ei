var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , test = require('tap').test
;

test('encode/decode/list-empty', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeListHeader(0);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.NIL_EXT, 'type');
        t.equals(dec.decodeListHeader(), 0, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});

test('encode/decode/list-3', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeListHeader(4);
    enc.encodeLong(5);
    enc.encodeString('string');
    enc.encodeDouble(5.4321);
    enc.encodeAtom('atom');

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.LIST_EXT, 'type');
        t.equals(dec.decodeListHeader(), 4, 'length');
        t.equals(dec.decodeLong(), 5, 'long');
        t.equals(dec.decodeString(), 'string', 'string');
        t.equals(dec.decodeDouble(), 5.4321, 'double');
        t.equals(dec.decodeAtom(), 'atom', 'atom');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});