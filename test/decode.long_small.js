var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
    ;

fs.readFile(path.join(__dirname, 'fixtures', 'integer_small.ebin'), function(error, data) {
    var dec = decoder(data);

    test('decode/long-small', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.SMALL_INTEGER_EXT, 'type');
        t.deepEqual(dec.decodeLong(), 3, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
