import { describe, test, expect } from "vitest";
global.crypto = require("crypto");
import { Commit } from "../class/commit";
import { Tree } from "../class/tree";
describe("commitクラスのテスト", async () => {
  const tree = await Tree.init("tree1");
  const tree2 = await Tree.init("tree2");
  const firstCommit = await Commit.init("最初のコミット", tree);
  const secondCommit = await Commit.init("2回目のコミット", tree2, firstCommit.getId());

  test("初期化テスト", () => {
    expect(firstCommit.message).toBe("最初のコミット");
    expect(firstCommit.getId()).toBeTypeOf("string");
    expect(firstCommit.tree).toBe(tree);
    expect(firstCommit.getParentId()).toBe(null);
    expect(secondCommit.getParentId()).toBe(firstCommit.getId());
  });
});
