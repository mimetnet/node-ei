var fs = require('fs')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tape')
    , test = tap.test
;

fs.readFile('fixtures/pid.ebin', function(error, data) {
    var dec = decoder(data);

    test('decode/pid', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.PID_EXT, 'type');
        t.type(dec.decodePid(), 'object', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
