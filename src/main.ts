import { Contents } from "./class/contents";
import { Layout } from "./class/layout";
import { Vcs } from "./class/vcs";

class App {
  static async init() {
    await Contents.init();
    Vcs;
    Layout.initPage();
    Layout.createVcsPageLayout();
  }
}

await App.init();
