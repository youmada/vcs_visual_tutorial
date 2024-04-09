import { BlobFile } from "./blobFile";
import { Contents } from "./contents";
import { Repository } from "./repository";

export class Vcs {
  static repository: Repository = new Repository();
  static changeFiles: BlobFile[] = [];

  static checkChangeFile(file: BlobFile): void {
    const ischange = Contents.searchContent(file, Contents.folder) as BlobFile | null;
    if (ischange) {
      Vcs.changeFiles.push(ischange);
    }
  }
}
