import { describe, test, expect } from "vitest";
import { Repository } from "../class/repository";
import { Folder } from "../class/folder";
import { Index } from "../class";
import { BlobFile } from "../class/blobFile";
import { Commit } from "../class/commit";
import { Tree } from "../class/tree";

describe("Repositoryクラスのテスト", () => {
  const repository = new Repository();

  test("初期化テスト", () => {
    const folder = new Folder("root");
    const index = new Index();
    expect(repository.rootFolder).toEqual(folder);
    expect(repository.index).toEqual(index);
    expect(repository.head).toBe(null);
    expect(repository.commitList).toEqual({});
    expect(repository.fileList).toEqual({});
    expect(repository.treeList).toEqual({});
  });

  test("ステージングテスト", () => {
    const index = new Index();
    const file = new BlobFile("file1", "test text1", "/");
    index.addStage([file]);
    repository.stage([file]);
    expect(repository.index.stagedFiles).toEqual(index.stagedFiles);
    repository.unstage(file);
    expect(repository.index.stagedFiles).toEqual({});
    repository.stage([file]);
    expect(repository.index.stagedFiles).toEqual(index.stagedFiles);
    repository.resetStage();
    expect(repository.index.stagedFiles).toEqual({});
  });

  test("コミットのテスト", () => {
    const file = new BlobFile("file1", "test text1");
    file.createId();
    repository.stage([file]);
    // 通常ではファイルを作成してからステージングするので、rootFolderには何かしらのファイルが存在している。今回は自分で作成する必要がある。
    repository.rootFolder.contents[file.id] = file;
    const commitID = repository.commit("test commit 1");
    const commit = repository.commitList[commitID];
    expect(commit).toBeInstanceOf(Commit);
    expect(repository.index).toBeInstanceOf(Index);
    expect(commit.message).toBe("test commit 1");
    expect(commit.tree).toBeInstanceOf(Tree);
    expect(Object.values(repository.treeList)).toContainEqual(commit.tree);
    expect(repository.head).toEqual(commitID);
  });

  test("複数回コミットテスト", () => {
    const file2 = new BlobFile("file2", "test text2");
    file2.createId();
    repository.stage([file2]);
    repository.rootFolder.contents[file2.id] = file2;
    const commitID = repository.commit("test commit 2");
    const commit = repository.commitList[commitID];
    expect(commit.message).toBe("test commit 2");
    expect(Object.values(repository.treeList)).toContainEqual(commit.tree);
    expect(repository.head).toEqual(commitID);
    expect(commit.parentCommitId).toBeTruthy;
    expect(repository.commitList[commit.parentCommitId!]).toBeInstanceOf(Commit);
  });
});

/*/
2:gitにコミットする
3:ブランチの機能を作る
4:ブランチのテスト
5:マージの機能作る
6:マージテスト
/*/
