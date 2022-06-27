const fs = require('fs');
const readline = require('readline');

const readFileFromLine = (path, callback) => {
  var fRead = fs.createReadStream(path);
  var objReadline = readline.createInterface({
    input: fRead
  });
  var arr = new Array();
  objReadline.on('line', function (line) {
    arr.push(line);
  });
  objReadline.on('close', function () {
    callback(arr);
  });
}

module.exports = {
  readFileFromLine
}