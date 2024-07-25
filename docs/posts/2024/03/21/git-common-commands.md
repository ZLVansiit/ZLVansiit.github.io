---
outline: deep
title:      "MapStruct使用和详解，看这篇就够了"
subtitle:   "MapStruct是一个生成类型安全，高性能且无依赖的JavaBea 映射代码的注解处理器"
author:     "vansiit"
header-img: "img/bg/output6.jpg"
header-mask:  0.5
catalog: true
foot: true
tags:
    - Java
    - util
---

# Git 常用指令 以及 IDEA常用commit插件推荐

## 前言

![img.png](/public/img/post/1711003537001.png)

- 工作区 (workspace)

> 就是我们当前工作空间，也就是我们当前能在本地文件夹下面看到的文件结构。初始化工作空间或者工作空间 clean 的时候，文件内容和 index 暂存区是一致的，随着修改，工作区文件在没有 add 到暂存区时候，工作区将和暂存区是不一致的。

- 暂存区 (index)

> 老版本概念也叫 Cache 区，就是文件暂时存放的地方，所有暂时存放在暂存区中的文件将随着一个 commit 一起提交到 local repository 此时 local repository 里面文件将完全被暂存区所取代。暂存区是 git 架构设计中非常重要和难理解的一部分。

- 本地仓库 (local repository)

> git 是分布式版本控制系统，和其他版本控制系统不同的是他可以完全去中心化工作，你可以不用和中央服务器 (remote server) 进行通信，在本地即可进行全部离线操作，包括 log，history，commit，diff 等等。完成离线操作最核心是因为 git 有一个几乎和远程一样的本地仓库，所有本地离线操作都可以在本地完成，等需要的时候再和远程服务进行交互。

- 远程仓库 (remote repository)

> 中心化仓库，所有人共享，本地仓库会需要和远程仓库进行交互，也就能将其他所有人内容更新到本地仓库把自己内容上传分享给其他人。结构大体和本地仓库一样。

## git clone 

git checkout -b development 创建本地分支并切换到这个分支

git checkout --track origin/test-dev 从远程拉分支

git push origin development 创建远程分支

git branch -u origin/luozhengshun 建立本地远程联系

git branch -a 查看远程分支

git branch 查看本地分支

git pull 更新本地库

git add .添加到本地库

git commit -m '提交属性' 提交达到本地库

git push 提交远程库

git status 查看状态

git diff xxx查看更改

git log 查看历史

git checkout 分支名切换分支

git branch -d 分支名删除本地分支

git push origin --delete 分支名删除远程分支

git checkout master 切换到Master分支

git merge —no-ff development 对Development分支进行合并

git remote 列出所有远程主机

git remote update origin --prune 更新远程主机origin 整理分支

git branch -r 列出远程分支

git branch -vv 查看本地分支和远程分支对应关系

git checkout -b gpf origin/gpf 新建本地分支gpf与远程gpf分支相关联

git reset --soft HEAD~1 撤销上一次conmmit，1代表上最近1次，若想撤销最近2次则改为2
