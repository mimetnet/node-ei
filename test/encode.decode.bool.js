var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

test('encode/decode/bool-true', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeBool(true);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.deepEquals(dec.decodeBool(), true, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});


test('encode/decode/bool-false', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeBool(false);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.deepEquals(dec.decodeBool(), false, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});