const fs = require('fs');
const path = require('path');
const jsts = require('json-schema-to-typescript');

const modelDir = path.join(__dirname, '../../model/');
const outputDir = path.join(__dirname, '../src/types/blogs.d.ts');

fs.readdir(modelDir, function(err, files) {
  if (err) throw err;

  // delete and refresh everytime
  fs.unlinkSync(outputDir);
  fs.writeFileSync(outputDir);

  for (const file of files) {
    console.log(file);
    jsts.compileFromFile(path.join(modelDir, file)).then(ts => {
      if (ts) {
        fs.appendFileSync(outputDir, ts);
      }
    });
  }
})
