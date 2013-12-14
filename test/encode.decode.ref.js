'use strict';

var concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , EiRef = require('../lib/ref')
    , ei = require('../lib/const')
    , test = require('tap').test
;

test('encode/decode/ref', function(t) {
    var enc, ref;

    ref = new EiRef('nonode@nohost', 3, [94, 0, 0], 0);

    enc = encoder();
    enc.encodeVersion();
    enc.encodeRef(ref);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.NEW_REFERENCE_EXT, 'type');
        t.deepEquals(dec.decodeRef(), ref, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});
