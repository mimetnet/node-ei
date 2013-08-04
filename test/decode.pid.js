var fs = require('fs')
    , path = require('path')
    , decoder = require('../lib/decoder')
    , EiPid = require('../lib/pid')
    , ei = require('../lib/const')
    , tap = require('tap')
    , test = tap.test
;

fs.readFile(path.join(__dirname, 'fixtures', 'pid.ebin'), function(error, data) {
    var pid, dec;

    dec = decoder(data);
    pid = new EiPid('nonode@nohost', 38, 0, 0);

    test('decode/pid', function(t) {
        t.ok(dec.decodeVersion(), 'version');
        t.equals(dec.getType(), ei.PID_EXT, 'type');
        t.deepEquals(dec.decodePid(), pid, 'value');
        t.equals(dec.index, data.length, 'eof');
        t.end();
    });
});
