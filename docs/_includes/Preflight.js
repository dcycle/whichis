class Preflight extends Service {
  check() {
    if (location.protocol == 'file:') {
      throw ('Cannot read README.md file from file:// protocol. You might want to try: python3 -m http.server; see https://documentation.dcycle.com for more details.');
    }
  }
}
