import { BlobFile } from "./blobFile.ts";

/**
 * インデックスクラスは、ステージングエリアのファイルを管理するためのクラスです。
 * @property stagedFiles - ステージングエリアに追加されたファイルのリスト (key: BlobFile.id, value: BlobFile)
 */
export class Index {
  stagedFiles: { [id: string]: BlobFile };

  constructor() {
    this.stagedFiles = {};
  }

  /**
   * 指定されたファイルをステージングエリアに追加します。
   * fileは参照渡しです。
   * @param file - ステージングエリアに追加するファイル
   */
  addStage(file: BlobFile) {
    this.stagedFiles[file.getId()] = file;
  }

  /**
   * ステージングエリアをクリアします。
   */
  clearStage() {
    this.stagedFiles = {};
  }

  /**
   * 指定されたファイルをステージングエリアから削除します。
   * @param file - ステージングエリアから削除するファイル
   */
  removeStage(file: BlobFile) {
    delete this.stagedFiles[file.getId()];
  }
}
