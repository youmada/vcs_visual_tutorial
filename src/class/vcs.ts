import { BlobFile } from "./blobFile";
import { Contents } from "./contents";
import { Folder } from "./folder";
import { Repository } from "./repository";

/**
 * バージョン管理システムを表すクラス。
 * このクラスは、リポジトリ、変更されたファイルのリスト、およびリポジトリの状態を管理します。
 * @property repository - リポジトリを表す Repository インスタンス。
 * @property changeFiles - 変更されたファイルのリスト。ファイルが変更されると、このリストに追加されます。
 */

export class Vcs {
  static repository: Repository = new Repository();
  static changeFiles: BlobFile[] = [];
  /**
   * ステージングエリアにすでに同じファイルが存在するか確認する。
   * @param file - ステージングエリアに追加するファイル
   * @returns 同じファイルが存在する場合は、そのファイルを返します。そうでない場合は、null を返します。
   */
  static checkSameFile(file: BlobFile) {
    const files = Object.values(Vcs.repository.index.stagedFiles);
    const sameFile = files.find((f) => {
      return f.name === file.name;
    });
    return sameFile ? sameFile : null;
  }

  /**
   * ファイルが変更されたかどうかを確認し、変更された場合は変更されたファイルを changeFiles プロパティに追加します。
   * @param newFile - ファイルの内容を書き換えた BlobFile インスタンス。
   * @param prevId - ファイルの ID。 このIDはファイルを書き換えて、IDを変更する前のIDです。
   * @returns ファイルが変更された場合は、changeFiles プロパティにファイルを追加します。
   */
  static checkChangeFile(newFile: BlobFile, prevId: string): void {
    const ischange = Vcs.searchChangeFile(newFile, prevId, Contents.folder) as BlobFile | null;
    // ischange == null つまり、ファイルが変更された場合
    if (ischange == null) {
      Vcs.changeFiles.map((file, index) => {
        if (file.name === newFile.name) {
          Vcs.changeFiles.splice(index, 1);
        }
      });
      Vcs.changeFiles.push(newFile);
    }
  }

  /**
   指定されたフォルダとそのサブフォルダから、指定された名前と ID を持つファイルを検索する。
   *
   * @param item - 検索するファイルを表す BlobFile インスタンス。このインスタンスの 'name' プロパティが検索に使用されます。
   * @param id - 検索するファイルの ID。
   * @param folder - ファイルを検索する Folder インスタンス。
   * @returns 与えられた名前と ID を持つファイルが見つかった場合は、見つかったファイルを表す BlobFile インスタンスを返します。
   * そうでない場合は、null を返します。
   **/
  static searchChangeFile(item: BlobFile, id: string, folder: Folder): BlobFile | null {
    for (const contentName in folder.contents) {
      const content = folder.contents[contentName];
      if (content instanceof BlobFile) {
        // ファイル名が一致する場合、IDを照合
        if (content.name === item.name && content.getId() === id) {
          return content;
        }
      } else if (content instanceof Folder) {
        // 下位フォルダを探索
        const found = Vcs.searchChangeFile(item, id, content);
        if (found) {
          return found;
        }
      }
    }
    // 一致するファイルが見つからない場合、nullを返す
    return null;
  }
}
