import { BlobFile } from "../class/blobFile";
import { Tree } from "../class/tree";
global.crypto = require("crypto");

describe("ツリーオブジェクトテスト", () => {
  let tree: Tree;
  let file: BlobFile;

  beforeEach(async () => {
    tree = await Tree.init("tree");
    file = await BlobFile.init("file", "text", "parent");
  });

  it("初期化テスト", () => {
    expect(tree.name).toBe("tree");
    expect(tree.getId()).toMatch(/^[0-9a-f]{40}$/i);
  });

  it("エントリの追加テスト", () => {
    tree.addEntry(file);
    expect(tree.entry[file.getId()]).toBe(file);
  });
});
