var fs = require('fs')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tape')
    , test = tap.test
;

fs.readFile('fixtures/bool_bad.ebin', function(error, data) {
    var dec = decoder(data);

    test('decode/bool_bad', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.deepEqual(dec.decodeBool(), null, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
