import { BlobFile } from "./blobFile";
import { Contents } from "./contents";
import { Folder } from "./folder";
import { Repository } from "./repository";

export class Vcs {
  static repository: Repository = new Repository();
  static changeFiles: BlobFile[] = [];

  static checkChangeFile(file: BlobFile, id: string): void {
    const ischange = Vcs.searchChangeFile(file, id, Contents.folder) as BlobFile | null;
    if (ischange == null) {
      Vcs.changeFiles.push(file);
    }
  }

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
