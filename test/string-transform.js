'use strict';

var fs = require('fs')
    , path = require('path')
    , concat = require('concat-stream')
    , transform = require('../lib/string-transform')
    , tap = require('tap')
    , test = tap.test
;



test('string-transform', function(t) {
    var stream;

    t.plan(4);

    stream = fs.createReadStream(path.join(__dirname, 'fixtures', 'string-transform.ebin'));
    stream.on('error', function(error) {
        console.error('ERROR:', error);
        t.end();
    });

    stream.pipe(transform()).pipe(concat(function(data) {
        var str;

        t.type(data, 'Buffer', 'buffer-type');
        t.ok(0 < data.length, 'buffer-length');

        str = data.toString();

        t.type(str, 'string', 'string-type');
        t.ok(0 < str.length, 'string-length');
    }));
});

