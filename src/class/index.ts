import { BlobFile } from "./blobFile";
/*/
Indexクラス
ステージングエリアのデータを管理するクラス。
addStage():ファイルをステージングエリアに追加する
getStagedFile(): ステージングエリアにある全てのファイルを取得
clearStage(): ステージングエリアの情報をクリアする
/*/
export class Index {
  stagedFiles: { [name: string]: BlobFile };
  constructor() {
    this.stagedFiles = {};
  }

  addStage(files: BlobFile[]) {
    for (const file of files) {
      this.stagedFiles[file.name] = file;
    }
  }

  getStagedFiles(): BlobFile[] {
    return Object.values(this.stagedFiles);
  }

  clearStage() {
    this.stagedFiles = {};
  }
}
