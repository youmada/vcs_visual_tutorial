import { Folder } from "./class/folder";
import { Layout } from "./class/layout";
import { Vcs } from "./class/vcs";

class App {
  static rootFolder: Folder = new Folder("root");

  static startVcs() {
    Layout.initProcess();
    Layout.createVcsPageLayout();
  }
}

App.startVcs();
