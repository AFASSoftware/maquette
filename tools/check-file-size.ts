import * as fs from 'fs';
import * as zlib from 'zlib';

let input = fs.createReadStream(__dirname + '/../dist/maquette.umd.min.js');
let stream = input.pipe(zlib.createGzip());
let length = 0;
stream.on('data', function(chunk: any) {
  length += chunk.length;
});
stream.on('end', function() {
  console.log('gzipped size in kB:', length / 1024);
  if (length >= 3.5 * 1024) {
    console.error('Claim that maquette is only 3 kB gzipped no longer holds');
    process.exit(1);
  }
  console.log('File size OK');
  process.exit(0);
});
