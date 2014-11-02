var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

test('encode/decode/bin', function(t) {
    'use strict';

    var enc, buf;

    buf = new Buffer('Hello World This is a Buffer of something weird and random! Beep Boop!');

    enc = encoder();
    enc.encodeVersion();
    enc.encodeBinary(buf);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.BINARY_EXT, 'type');
        t.deepEquals(dec.decodeBinary(), buf, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});

test('encode/decode/bin-empty', function(t) {
    'use strict';

    var enc, buf;

    buf = new Buffer(0);

    enc = encoder();
    enc.encodeVersion();
    enc.encodeBinary(buf);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.BINARY_EXT, 'type');
        t.deepEquals(dec.decodeBinary(), buf, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});
