var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

fs.readFile(path.join(__dirname, 'fixtures', 'bool_bad.ebin'), function(error, data) {
    var dec = decoder(data);

    test('decode/bool_bad', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.ATOM_EXT, 'type');
        t.deepEqual(dec.decodeBool(), null, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
