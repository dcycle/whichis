/** In a console, run SelfTester.test() to make sure stuff works. */
class SelfTester extends Service {

  test() {
    new Preflight(new MockServices()).check();
    new UrlTest().run();
    new MultilingualTest().run();
  }

}
