import { Commit } from "../class/commit.ts";
import { Tree } from "../class/tree.ts";

describe("コミットオブジェクトテスト", () => {
  let commit: Commit;
  let tree: Tree;
  let message: string;

  beforeEach(async () => {
    tree = await Tree.init("tree");
    message = "コミットテスト";
    commit = await Commit.init(message, tree, null, "master");
  });

  it("初期化テスト", () => {
    expect(commit.message).toBe(message);
    expect(commit.tree).toBe(tree);
    expect(commit.getParentId()).toBeNull();
  });

  it("parentIdの取得テスト", async () => {
    const message = "Second commit";
    const secondCommit = await Commit.init(message, tree, commit.getId(), "master");
    expect(secondCommit.message).toBe(message);
    expect(secondCommit.tree).toBe(tree);
    expect(secondCommit.getParentId()).toMatch(/^[0-9a-f]{40}$/i);
  });
});
