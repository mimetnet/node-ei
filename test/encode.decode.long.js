var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tape')
    , test = tap.test
;

test('encode/decode/long', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeLong(3000);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.INTEGER_EXT, 'type');
        t.deepEqual(dec.decodeLong(), 3000, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});


test('encode/decode/long-small', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeLong(54);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.SMALL_INTEGER_EXT, 'type');
        t.deepEqual(dec.decodeLong(), 54, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});