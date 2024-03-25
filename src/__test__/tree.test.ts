import { describe, test, expect } from "vitest";
import { Tree } from "../class/tree";
import { BlobFile } from "../class/blobFile";
import { Folder } from "../class/folder";

describe("Treeオブジェクトのテスト", () => {
  const tree = new Tree();

  test("初期化テスト", () => {
    expect(tree.entry).toEqual({});
    expect(tree.id).toBe("");
  });

  test("メソッドテスト", () => {
    const blobFile = new BlobFile("file1", "text", "/");
    blobFile.createId();
    const folder = new Folder("folder");
    folder.createFile("file2", "text2");
    tree.addEntry(blobFile);
    expect(tree.entry[blobFile.id]).toEqual(blobFile);
    tree.addEntry(folder);
    expect(tree.entry[folder.id]).toEqual(folder);
    const subTree = new Tree();
    subTree.addEntry(blobFile);
    subTree.createId();
    const subTreeId = subTree.id;
    tree.addEntry(subTree);
    expect(tree.entry[subTreeId]).toEqual(subTree);
    tree.createId();
    expect(tree.id).toBeTruthy;
    console.log(tree);
    console.log(tree.entry);
  });
});
