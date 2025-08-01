import { BlobFile } from "./blobFile.ts";
import { Folder } from "./folder.ts";
import { Tree } from "./tree.ts";

/**
 * アプリケーションのファイルとフォルダのコンテンツを管理するクラス。
 * @property currentParent 現在の親フォルダ
 * @property folder ルートフォルダ
 */
export class Contents {
  static currentParent: Folder;
  static folder: Folder;

  /**
   * Contents クラスを初期化します。
   * メソッド内でFolderクラスを初期化し、ルートフォルダを作成します。
   * また、currentParent にルートフォルダを設定します。
   * @returns 初期化されたフォルダオブジェクト
   */
  static async init() {
    Contents.folder = await Folder.init("root", null);
    Contents.currentParent = Contents.folder;
    return Contents.folder;
  }

  /**
   * 階層を切り替えるメソッドです。currentParent の値をフォルダ間の移動で切り替えます。
   * @param nextLevel 次の移動先のフォルダ情報
   */
  static nextLevel(nextLevel: Folder) {
    Contents.currentParent = nextLevel;
  }

  /**
   * 現在の階層を一つ上の階層に戻します。
   */
  static prevLevel() {
    if (Contents.currentParent.parent) {
      Contents.currentParent = Contents.currentParent.parent!;
    }
  }

  /**
   * 第一引数に渡したファイル名が、現在の親フォルダに存在するかどうかを確認します。
   * 現在の親フォルダに同じ名前のファイルが存在する場合はファイルの追加を中断します。
   * @param name ファイル名
   * @param text ファイルのテキスト内容
   * @param parent ファイルを追加する親フォルダ
   */
  static async addFile(name: string, text: string, parent: Folder) {
    const isSameName = Contents.folder.isCheckSame(name);
    if (isSameName) {
      const file = await BlobFile.init(name, text, parent.name);
      parent.insertContent(file);
    }
  }

  /**
   * 第一引数に渡したフォルダ名が、現在の親フォルダに存在するかどうか、確認して存在すればフォルダの追加を中断します。
   * @param name フォルダ名
   * @param parent フォルダを追加する親フォルダ
   */
  static async addFolder(name: string, parent: Folder) {
    const isSameName = Contents.folder.isCheckSame(name);
    if (isSameName) {
      const folder = await Folder.init(name, parent);
      parent.insertContent(folder);
    }
  }

  /**
   * フォルダの階層構造から、目的のファイルかフォルダを探します。
   * @param item 捜索対象のファイルまたはフォルダ
   * @param current 現在の階層
   * @returns 目的のファイルまたはフォルダ。見つからない場合は null を返します。
   */
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

  /**
   * チェックアウト時に、コミットのツリー情報を元にファイルとフォルダの内容を更新します。
   * @param tree チェックアウトされたコミットのツリー情報
   */

  private static async updateContents(tree: Tree, parent: Folder): Promise<void> {
    for (const key in tree.entry) {
      const item = tree.entry[key];
      if (item instanceof BlobFile) {
        await Contents.addFile(item.name, item.text, parent);
      } else if (item instanceof Tree) {
        await Contents.addFolder(item.name, parent);
        Contents.currentParent = parent.contents[item.name] as Folder;
        await Contents.updateContents(item, Contents.currentParent);
      }
    }
  }

  /**
   * チェックアウト時の操作を管理します。
   * @param tree チェックアウトされたコミットのツリー情報
   */

  static async checkoutHandler(tree: Tree) {
    Contents.folder.contents = {};
    Contents.currentParent = Contents.folder;
    await Contents.updateContents(tree, Contents.folder);
    // フォルダ構成を復元してから、現在の親フォルダをルートフォルダに設定します。
    Contents.currentParent = Contents.folder;
  }
}
