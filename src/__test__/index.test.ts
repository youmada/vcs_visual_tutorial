import { describe, test, expect } from "vitest";
import { BlobFile } from "../class/blobFile";
import { Index } from "../class";
const files = [new BlobFile("test1", "text", "path1"), new BlobFile("test2", "text", "path2")];

describe("indexクラスのテスト", () => {
  const index = new Index();
  test("初期化テスト", () => {
    expect(index.stagedFiles).toEqual({});
  });

  test("メソッドテスト", () => {
    index.addStage(files);
    console.log(index.stagedFiles);
    expect(index.stagedFiles).toEqual({ test1: files[0], test2: files[1] });
    expect(index.getStagedFiles()).toEqual([index.stagedFiles["test1"], index.stagedFiles["test2"]]);
    index.clearStage();
    expect(index.stagedFiles).toEqual({});
  });
});
