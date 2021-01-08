export default class Utils {
  static path(meta) {
    if (!meta || !meta.url) throw URIError('Please provide correct import metadata');

    return meta.url.replace('index.js', '').replace('file://', '');
  }
}
