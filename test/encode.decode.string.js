process.env.EI_ENCODER_SIZE = 15;
var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

test('encode/decode/string', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeString('string');

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.STRING_EXT, 'type');
        t.equals(dec.decodeString(), 'string', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});

test('encode/decode/string-empty', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeString('');

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.NIL_EXT, 'type');
        t.equals(dec.decodeString(), '', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});
