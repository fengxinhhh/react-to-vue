const computeFileLines = (templates, scripts) => {          //计算template、script行数
  let totalLine = 0;
  templates.forEach(line => {
    line = line.split('\n');
    totalLine += line.length;
  })
  scripts.forEach(line => {
    line = line.split('\n');
    totalLine += line.length;
  })
  return totalLine;
}

module.exports = {
  computeFileLines
}