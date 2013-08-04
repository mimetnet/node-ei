var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

test('encode/decode/double', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeDouble(3.56);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.FLOAT_EXT, 'type');
        t.equals(dec.decodeDouble(), 3.56, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});

test('encode/decode/double-negative', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeDouble(-345.56234098259013828);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.FLOAT_EXT, 'type');
        t.equals(dec.decodeDouble(), -345.56234098259013828, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});
