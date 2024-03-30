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
    //addStage()のテスト
    index.addStage(files);
    expect(index.stagedFiles).toEqual({ [files[0].id]: files[0], [files[1].id]: files[1] });

    //removeStage()のテスト
    const file = index.stagedFiles[files[0].id];
    index.removeStage(index.stagedFiles[files[0].id]);
    expect(index.stagedFiles).not.toContainEqual(file);

    //clearStage()のテスト
    index.clearStage();
    expect(index.stagedFiles).toEqual({});
  });
});
