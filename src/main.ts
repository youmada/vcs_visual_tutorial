import { Contents } from "./class/contents";
import { Folder } from "./class/folder";
import { Layout } from "./class/layout";
import { Vcs } from "./class/vcs";

class App {
  static rootFolder: Folder;
  static async init() {
    this.rootFolder = await Contents.init();
    Layout.initPage();
    Layout.createVcsPageLayout();
  }
}

await App.init();
