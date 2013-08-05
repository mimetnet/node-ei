var fs = require('fs')
    , concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

test('encode/decode/atom-small', function(t) {
    'use strict';

    var enc = encoder();
    enc.encodeVersion();
    enc.encodeAtom('atom');

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.equals(dec.decodeAtom(), 'atom', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});


test('encode/decode/atom', function(t) {
    'use strict';

    var buf, enc, str;

    buf = new Buffer(500);
    buf.fill('a');
    str = buf.toString('utf8');

    enc = encoder();
    enc.encodeVersion();
    enc.encodeAtom(str);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.equals(dec.decodeAtom(), str, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});