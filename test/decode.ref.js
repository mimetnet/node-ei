var fs = require('fs')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
    ;

fs.readFile('fixtures/ref.ebin', function(error, data) {
    var dec = decoder(data);

    test('decode/ref', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.NEW_REFERENCE_EXT, 'type');
        t.type(dec.decodeRef(), 'object', 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
