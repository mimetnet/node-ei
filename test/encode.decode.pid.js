'use strict';

var concat = require('concat-stream')
    , encoder = require('../lib/encoder')
    , decoder = require('../lib/decoder')
    , EiPid = require('../lib/pid')
    , ei = require('../lib/const')
    , test = require('tap').test
;

test('encode/decode/pid', function(t) {
    var enc, pid;

    pid = new EiPid('nonode@nohost', 1, 2, 3);

    enc = encoder();
    enc.encodeVersion();
    enc.encodePid(pid);

    enc.pipe(concat(function(data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.PID_EXT, 'type');
        t.deepEquals(dec.decodePid(), pid, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    }));
});
