import { Modal } from "./class/modal";
import { manageModals } from "./util";

export const startModal = [
  new Modal(
    "VVTへようこそ！！",
    "",
    "",
    "このアプリでは、Gitベースの擬似的なバージョン管理ツール(vcs)を通してvcsの基本的な操作を学習して行きましょう！"
  ),
];

export const whatIsVVT = [
  new Modal(
    "VVTとは？",
    "",
    "",
    "VVTとは、Gitをベースにした擬似vcs(バージョン管理ツール)です。このツールを通して、Gitの基本的な機能を学ぶことができます。"
  ),
];

export const whatIsVCS = [
  new Modal(
    "VCSとは？",
    "",
    "",
    "VCS(Version Control System)とは、バージョン管理システムのことです。バージョン管理システムは、ファイルの変更履歴を管理するためのシステムです。"
  ),
];

export const whatIsGit = [
  new Modal("Gitとは？", "", "", "Gitは、分散型バージョン管理システムの一つです。Gitは、ファイルの変更履歴を管理するためのツールです。"),
];

export const howToUseVVTFunction = [
  new Modal("VVTの機能一覧", "", "", "次のページからVVTで使える機能の一覧を確認できます。"),
  new Modal(
    "ワーキングエリアについて",
    "",
    "",
    "ワーキングエリアでは、擬似的なファイルシステムを通して、ファイルとフォルダを作成することができます。/n 'ファイル作成'ボタンを押すことで、ファイル作成画面に切り替わります。ファイル作成画面では、ファイル名とファイルの内容を入力して、送信を押すことでファイルが作成されます。＊ファイル名は変更できません。'フォルダ作成'ボタンを押すことで、フォルダを作成することができます。"
  ),
  new Modal(
    "ステージングエリアについて",
    "",
    "",
    "ステージングエリアでは、ワーキングエリアで作成したファイルやフォルダをステージングエリアに追加することができます。"
  ),
];

export const guideContent = [
  {
    title: "VVTとは？",
    callback: () => {
      manageModals(whatIsVVT);
    },
  },
  {
    title: "そもそもVCSとは？",
    callback: () => {
      manageModals(whatIsVCS);
    },
  },
  {
    title: "gitとは？",
    callback: () => {
      manageModals(whatIsGit);
    },
  },
  {
    title: "VVTの機能一覧",
    callback: () => {
      manageModals(howToUseVVTFunction);
    },
  },
  {
    title: "VVTの使い方",
    callback: () => {
      manageModals(startModal);
    },
  },
];
