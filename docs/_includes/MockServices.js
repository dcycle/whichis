class MockServices {

  constructor(
    services,
  ) {
    this.services = services;
  }

  get(
    name,
  ) {
    return this.services[name];
  }

}
