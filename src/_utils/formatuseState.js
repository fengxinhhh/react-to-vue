const formatUseStateAction = (action) => {
  return action.slice(0, 1).toUpperCase() + action.slice(1);
}

module.exports = {
  formatUseStateAction
}