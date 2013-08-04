var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , EiRef = require('../lib/ref')
    , ei = require('../lib/const')
    , tap = require('tape')
    , test = tap.test
    ;

fs.readFile(path.join(__dirname, 'fixtures', 'ref.ebin'), function(error, data) {
    var ref, dec;

    dec = decoder(data);
    ref = new EiRef('nonode@nohost', 3, [94, 0, 0], 0);

    test('decode/ref', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.NEW_REFERENCE_EXT, 'type');
        t.deepEquals(dec.decodeRef(), ref, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
