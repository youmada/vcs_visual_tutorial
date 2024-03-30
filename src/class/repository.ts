/*/
Repository

/*/

import { Index } from ".";
import { BlobFile } from "./blobFile";
import { Commit } from "./commit";
import { Folder } from "./folder";
import { Tree } from "./tree";

export class Repository {
  rootFolder: Folder;
  index: Index;
  head: string | null;
  commitList: { [name: string]: Commit };
  fileList: { [name: string]: BlobFile };
  treeList: { [name: string]: Tree };

  constructor() {
    this.rootFolder = new Folder("root");
    this.index = new Index();
    this.head = null;
    this.commitList = {};
    this.fileList = {};
    this.treeList = {};
  }

  stage(files: BlobFile[]) {
    this.index.addStage(files);
  }

  unstage(file: BlobFile) {
    this.index.removeStage(file);
  }

  resetStage() {
    this.index.clearStage();
  }

  commit(message: string) {
    const newTree = this.generateRepositoryTree();
    this.treeList[newTree.id] = newTree;
    const newCommit = new Commit(message, newTree, this.head);
    this.commitList[newCommit.id] = newCommit;
    this.head = newCommit.id;
    this.index.clearStage();
    return newCommit.id;
  }

  generateTree(folder: Folder): Tree {
    const tree = new Tree();
    const entries = Object.entries(folder.contents);
    for (const [name, entry] of entries) {
      if (entry instanceof BlobFile && this.index.stagedFiles[name]) {
        tree.addEntry(entry);
      } else if (entry instanceof Folder) {
        const subTree = this.generateTree(entry);
        if (subTree) {
          tree.addEntry(subTree);
        }
      }
    }
    return tree;
  }

  generateRepositoryTree(): Tree {
    return this.generateTree(this.rootFolder);
  }
}
