
var FileNotFoundError = (function() {
  function FileNotFoundError(path) {
    this.path = path;
  }
  return FileNotFoundError;
})();

module.exports = {
  FileNotFoundError: FileNotFoundError
};
