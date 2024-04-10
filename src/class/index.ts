import { BlobFile } from "./blobFile";
/*/
Indexクラス
ステージングエリアのデータを管理するクラス。
addStage():ファイルをステージングエリアに追加する
getStagedFile(): ステージングエリアにある全てのファイルを取得
clearStage(): ステージングエリアの情報をクリアする
/*/
export class Index {
  stagedFiles: { [id: string]: BlobFile };
  constructor() {
    this.stagedFiles = {};
  }

  addStage(file: BlobFile) {
    this.stagedFiles[file.getId()] = file;
  }

  clearStage() {
    this.stagedFiles = {};
  }

  removeStage(file: BlobFile) {
    delete this.stagedFiles[file.getId()];
  }
}
