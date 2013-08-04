var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tape')
    , test = tap.test
;

fs.readFile(path.join(__dirname, 'fixtures', 'string.ebin'), function(error, data) {
    var dec = decoder(data);

    test('decode/string', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.STRING_EXT, 'type');
        t.deepEqual(dec.decodeString(), 'string2', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
