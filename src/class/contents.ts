import { BlobFile } from "./blobFile";
import { Folder } from "./folder";

export class Contents {
  path: string;
  static folder: Folder;
  constructor() {
    this.path = "/";
  }

  static async init() {
    Contents.folder = await Folder.init("root", "/");
    return Contents.folder;
  }

  static async addFile(name: string, parent: Folder) {
    const isSameName = Contents.folder.isCheckSame(name);
    if (isSameName) {
      const file = await BlobFile.init(name, "", parent.name);
      parent.insertContent(file);
    }
  }

  static async addFolder(name: string, parent: Folder) {
    const isSameName = Contents.folder.isCheckSame(name);
    if (isSameName) {
      const folder = await Folder.init(name, parent.name);
      parent.insertContent(folder);
    }
  }

  static searchContent(item: BlobFile | Folder, current: Folder) {
    const currentLevel = current.contents;
    for (const contentKey in currentLevel) {
      const content = currentLevel[contentKey];
      if (content instanceof BlobFile) {
        if (content.getId() === item.getId()) {
          return true;
        }
      } else if (content instanceof Folder) {
        if (content.getId() === item.getId()) {
          return true;
        }
        if (Contents.searchContent(item, content)) {
          return true;
        }
      }
    }
    return false;
  }
}
