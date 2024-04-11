import { Index } from "../class/index";
import { BlobFile } from "../class/blobFile";
global.crypto = require("crypto");
describe("インデックスクラステスト", () => {
  let index: Index;
  let file1: BlobFile;
  let file2: BlobFile;

  beforeEach(async () => {
    index = new Index();
    file1 = await BlobFile.init("file1", "content1", "path");
    file2 = await BlobFile.init("file2", "content2", "path");
  });

  it("ステージングエリアにファイルを追加する", () => {
    index.addStage(file1);
    index.addStage(file2);
    expect(index.stagedFiles[file1.getId()]).toBe(file1);
    expect(index.stagedFiles[file2.getId()]).toBe(file2);
  });

  it("ステージングエリアをクリアする", () => {
    index.addStage(file1);
    index.addStage(file2);

    index.clearStage();

    expect(Object.keys(index.stagedFiles).length).toBe(0);
  });

  it("ステージングエリアからファイルを削除する", () => {
    index.addStage(file1);
    index.addStage(file2);

    index.removeStage(file1);

    expect(index.stagedFiles[file1.getId()]).toBeUndefined();
    expect(index.stagedFiles[file2.getId()]).toBe(file2);
  });
});
