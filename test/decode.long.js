var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
    ;

test('decode/long', function(t) {
    fs.readFile(path.join(__dirname, 'fixtures', 'integer.ebin'), function(error, data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.INTEGER_EXT, 'type');
        t.equals(dec.decodeLong(), -345, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});

test('decode/ulong', function(t) {
    fs.readFile(path.join(__dirname, 'fixtures', 'u-integer.ebin'), function(error, data) {
        var dec = decoder(data);

        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.INTEGER_EXT, 'type');
        t.equals(dec.decodeULong(), 345, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});