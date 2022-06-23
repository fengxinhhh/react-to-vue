/*
* remove bad code with hard code for now
*/
function removeBadCode(con) {
  return con.replace(/\.\.\.(\w+),\n/, function (a, v) { return '...' + v + '\n' })
}

module.exports = {
  removeBadCode
}