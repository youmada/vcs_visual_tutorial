import { describe, test, expect } from "vitest";
import { Tree } from "../class/tree";
import { BlobFile } from "../class/blobFile";

describe("Treeオブジェクトのテスト", () => {
  const tree = new Tree();

  test("初期化テスト", () => {
    expect(tree.entry).toEqual({});
    expect(tree.id).toBe("");
  });

  test("メソッドテスト", () => {
    const blobFile = new BlobFile("file1", "text", "/");
    blobFile.createId();
    tree.addEntry(blobFile);
    expect(tree.entry[blobFile.id]).toEqual(blobFile);
    const subTree = new Tree();
    subTree.addEntry(blobFile);
    const subTreeId = subTree.id;
    tree.addEntry(subTree);
    expect(tree.entry[subTreeId]).toEqual(subTree);
    expect(tree.id).toBeTruthy;
  });
});
