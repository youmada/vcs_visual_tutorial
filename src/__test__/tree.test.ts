import { describe, test, expect } from "vitest";
import { Tree } from "../class/tree";
import { BlobFile } from "../class/blobFile";
global.crypto = require("crypto");
describe("Treeオブジェクトのテスト", async () => {
  const tree = await Tree.init("tree1");

  test("初期化テスト", () => {
    expect(tree.entry).toEqual({});
    expect(tree.getId()).toBeTypeOf("string");
  });

  test("メソッドテスト", async () => {
    const blobFile = await BlobFile.init("file1", "text", "/");
    tree.addEntry(blobFile);
    expect(tree.entry[blobFile.getId()]).toEqual(blobFile);
    const subTree = await Tree.init("sub");
    subTree.addEntry(blobFile);
    const subTreeId = subTree.getId();
    tree.addEntry(subTree);
    expect(tree.entry[subTreeId]).toEqual(subTree);
    expect(tree.getId()).toBeTruthy;
  });
});
