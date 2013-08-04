var fs = require('fs')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

fs.readFile('fixtures/string.ebin', function(error, data) {
    var dec = decoder(data);

    test('decode/string', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.STRING_EXT, 'type');
        t.deepEqual(dec.decodeString(), 'string', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
