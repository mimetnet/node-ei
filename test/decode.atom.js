var fs = require('fs')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

fs.readFile('fixtures/atom.ebin', function(error, data) {
    var dec = decoder(data);

    test('decode/atom', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.deepEqual(dec.decodeAtom(), 'true', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
