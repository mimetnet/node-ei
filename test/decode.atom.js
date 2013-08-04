var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tape')
    , test = tap.test
;

fs.readFile(path.join(__dirname, 'fixtures', 'atom.ebin'), function(error, data) {
    var dec = decoder(data);

    test('decode/atom', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.deepEqual(dec.decodeAtom(), 'true', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
