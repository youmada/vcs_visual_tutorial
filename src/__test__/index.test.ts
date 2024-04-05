import { describe, test, expect } from "vitest";
import { BlobFile } from "../class/blobFile";
import { Index } from "../class";
global.crypto = require("crypto");

describe("indexクラスのテスト", async () => {
  const file1 = await BlobFile.init("test1", "text", "path1");
  const file2 = await BlobFile.init("test2", "text", "path2");
  const files = [file1, file2];
  const index = new Index();
  test("初期化テスト", () => {
    expect(index.stagedFiles).toEqual({});
  });

  test("メソッドテスト", () => {
    //addStage()のテスト
    index.addStage(files);
    expect(index.stagedFiles).toEqual({ [files[0].getId()]: files[0], [files[1].getId()]: files[1] });

    //removeStage()のテスト
    const file = index.stagedFiles[files[0].getId()];
    index.removeStage(index.stagedFiles[files[0].getId()]);
    expect(index.stagedFiles).not.toContainEqual(file);

    //clearStage()のテスト
    index.clearStage();
    expect(index.stagedFiles).toEqual({});
  });
});
