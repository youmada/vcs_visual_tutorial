import { BlobFile } from "./blobFile";
import { Folder } from "./folder";

export class Contents {
  static currentParent: Folder;
  static folder: Folder;

  static async init() {
    Contents.folder = await Folder.init("root", null);
    Contents.currentParent = Contents.folder;
    return Contents.folder;
  }


  // 階層を切り替えるメソッド。currentParentの値をフォルダ間の移動で切り替える。
  // nextLevel: 次の移動先のフォルダ情報
  static nextLevel(nextLevel: Folder) {
    Contents.currentParent = nextLevel;
  }
  static prevLevel() {
    if (Contents.currentParent.parent) {
      Contents.currentParent = Contents.currentParent.parent!;
    }
  }

  static async addFile(name: string, text: string, parent: Folder) {
    const isSameName = Contents.folder.isCheckSame(name);
    if (isSameName) {
      const file = await BlobFile.init(name, text, parent.name);
      parent.insertContent(file);
    }
  }

  static async addFolder(name: string, parent: Folder) {
    const isSameName = Contents.folder.isCheckSame(name);
    if (isSameName) {
      const folder = await Folder.init(name, parent);
      parent.insertContent(folder);
    }
  }

  // folderの階層構造から、目的のファイルかフォルダを探す
  // itemは捜索対象
  // currentは現在の階層
  static searchContent(item: BlobFile | Folder, current: Folder) {
    const currentLevel = current.contents;
    for (const contentKey in currentLevel) {
      const content = currentLevel[contentKey];
      if (content instanceof BlobFile) {
        if (content.getId() === item.getId()) {
          return content;
        }
      } else if (content instanceof Folder) {
        if (content.getId() === item.getId()) {
          return content;
        }
        if (Contents.searchContent(item, content)) {
          return content;
        }
      }
    }
    return null;
  }
}
