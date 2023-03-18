# この？？？について
## 本書の目的
## 想定する対象者
## 意識すること
- なるべくインクリメンタルに


# Vue.jsとは


# Vue.jsを構成するコンポーネント
## リアクティブシステム
## 
## 宣言的UI

## コンパイラ
### テンプレート
### SFC (Single File Component)

## 仮想DOM
### パッチレンリング

## コンポーネント思考


# Vue.jsの全体像と本書の流れ


# 環境構築


# createApp API
## はじめてのレンダリング
- renderオプション
## イベントハンドリング


# 小さいリアクティブシステム
## リアクティブシステムのおさらい
## リアクティブシステムの全体像 (流れ)
### 主要なコンポーネント
- Observer Pattern
  - deps
    - Target Map
  - track
  - trigger
- Proxy
## reactive APIを実装してみる
## リアクティブにレンダリングしてみる



# ルートコンポーネント
## コンポーネントが持つ情報はなにか
- render関数
- effect / effectScope
- setup context
- その他 (vnode, next, subtree, update)
### 設計
- proxy


# 仮想DOM
## 仮想DOM とは
## h関数の実装とレンダリング (パッチレンダリング無し)
## リアクティブに

## パッチレンダリング


# テンプレートのコンパイラ
## コンパイラとはなにか
### ASTについて
## Vue.jsにおけるコンパイラの種類
## テンプレートのコンパイラの全体像
### AST
### parse
### transform
### codegen
### new Function
## v-onディレクティブ実装 


# Single File Component対応 (Vite Plugin)
## SFCとはなにか
## どういうふうに実装されているか
### ViteとVite Pluginについて
### 使用する外部パッケージについて
- babel parser
- magic-string
## 実装してみる
### SFC descriptor
### script block
### template block

# 一段落


# パッチレンダリングの改良
## key属性


# その他のリアクティブAPI
## ref
## computed


# その他のディレクティブ
## v-bind
## v-for
- container nodeについて
## v-if


# コンポーネントシステム
## props
## emit


# script setup
## compiler macro


# おまけ
## Lifecycle Hooks
## Plugin
### router
### store
### typescript対応