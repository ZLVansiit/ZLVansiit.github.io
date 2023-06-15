---
layout:     post
title:      "负载均衡之加权轮询算法"
subtitle:   "加权轮询算法，WeightedRound-Robin，简称WRR"
author:     "vansiit"
header-img: "img/bg/output10.jpg"
header-mask:  0.5
catalog: true
tags:
- Java
- util
- 架构
---


| 请求次数 | currentWeight(lastCurrentWeight+weight) | Max(currentWeight) |    return Max    | Max(currentWeight) = currentWeight - totalWeight |
|:----:|:---------------------------------------:|:------------------:|:----------------:|:------------------------------------------------:|
|  1   |            7(A)  2(B)  1(C)             |        7(A)        |        A         |                -3(A)  2(B)  1(C)                 |
|  2   |            4(A)  4(B)  2(C)             |        4(A)        |        A         |                -6(A)  4(B)  2(C)                 |
|  3   |            1(A)  6(B)  3(C)             |        6(B)        |        B         |                1(A)  -4(B)  3(C)                 |
|  4   |            8(A)  -2(B)  4(C)            |        8(A)        |        A         |                -2(A)  -2(B)  4(C)                |
|  5   |            5(A)  0(B)  5(C)             |        5(A)        |        A         |                -5(A)  0(B)  5(C)                 |
|  6   |            2(A)  2(B)  6(C)             |        6(C)        |        C         |                2(A)  2(B)  -4(C)                 |
|  7   |            9(A)  4(B)  -3(C)            |        9(A)        |        A         |                -1(A)  4(B)  -3(C)                |
|  8   |            6(A)  6(B)  -2(C)            |        6(A)        |        A         |                -4(A)  6(B)  -2(C)                |
|  9   |            3(A)  8(B)  -1(C)            |        8(B)        |        B         |                3(A)  -2(B)  -1(C)                |
|  10  |            10(A)  0(B)  0(C)            |       10(A)        |        A         |                 0(A)  0(B)  0(C)                 |
