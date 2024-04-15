import { Commit } from "./commit";
import { Layout } from "./layout";
import { Vcs } from "./vcs";

export class RepositoryAreaLayout {
  /**
   * リポジトリエリアを作成します。
   * @returns 作成されたリポジトリエリアのHTMLDivElement
   *
   */
  static createRepositoryArea(): HTMLDivElement {
    // リポジトリエリアのタイトルを作成
    const title = document.createElement("h3");
    title.classList.add("area-title");
    title.textContent = "リポジトリ";

    // 要素をリポジトリエリアに追加
    Layout.repository.innerHTML = "";
    Layout.repository.appendChild(title);
    Layout.repository.appendChild(RepositoryAreaLayout.createCommitTree());

    return Layout.repository;
  }

  /**
   * コミット要素を作成する。
   * @param commit commitListの要素
   * @returns 作成されたコミット要素のHTMLDivElement
   */
  private static commitElement(commit: Commit): HTMLDivElement {
    const commitElement = document.createElement("div");
    commitElement.classList.add("commit-element");
    const commitMessage = document.createElement("p");
    commitMessage.textContent = commit.message;
    commitElement.appendChild(commitMessage);

    return commitElement;
  }

  /**
   * コミットツリーを作成する。
   * @returns 作成されたコミットツリーのHTMLDivElement
   */
  static createCommitTree(): HTMLDivElement {
    const commitTree = document.createElement("div");
    commitTree.classList.add("commit-tree");
    const commitList = Vcs.repository.commitList;
    for (const commit in commitList) {
      const commitElement = RepositoryAreaLayout.commitElement(commitList[commit]);
      commitTree.appendChild(commitElement);
    }

    return commitTree;
  }
}
