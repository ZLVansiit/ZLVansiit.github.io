---
layout:     post
title:      "APP扫码登录设计：不只有原理，直接上代码"
subtitle:   "APP扫码登录设计：不只有原理，直接上代码"
author:     "vansiit"
header-img: "img/bg/20230615135535.png"
header-mask:  0.5
catalog: true
tags:
- Java
- util
- 架构
---



```mermaid
	sequenceDiagram
	Client->>Gateway : 发送JSON RPC请求
	Gateway-->>Client : 把JSON RPC响应发送给客户端
```

```sequence
title:APP扫码登录设计图
participant APP
participant PC
APP->PC: 连接
```



![img.png](https://zlvansiit.github.io/img/qrcode/scan-qrcode.jpg)
