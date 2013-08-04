var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
    ;

fs.readFile(path.join(__dirname, 'fixtures', 'float.ebin'), function(error, data) {
    var dec = decoder(data);

    test('decode/float', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.FLOAT_EXT, 'type');
        t.deepEqual(dec.decodeDouble(), 3.141592653589793, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
