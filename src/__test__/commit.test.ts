import { describe, test, expect } from "vitest";
import { Commit } from "../class/commit";
import { Tree } from "../class/tree";
describe("commitクラスのテスト", () => {
  const tree = new Tree();
  const tree2 = new Tree();
  const firstCommit = new Commit("test commit1", tree);
  const secondCommit = new Commit("commit 2", tree2, firstCommit.id);
  test("初期化テスト", () => {
    expect(firstCommit.message).toBe("test commit1");
    expect(firstCommit.id);
    expect(firstCommit.tree).toBe(tree);
    expect(firstCommit.parentCommitId).toBe(null);
    expect(secondCommit.parentCommitId).toBe(firstCommit.id);
  });
});
