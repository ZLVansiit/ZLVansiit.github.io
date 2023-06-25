---
layout:     post
title:      "负载均衡之平滑加权轮询算法"
subtitle:   "平滑it加权轮询算法，Smooth Weighted Round Robin"
author:     "vansiit"
header-img: "img/bg/output10.jpg"
header-mask:  0.5
catalog: true
tags:
- Java
- 架构
- 算法
---

## 一.加权轮询算法

引用自：维基百科，[加权轮询算法](https://zh.wikipedia.org/wiki/%E5%8A%A0%E6%9D%83%E8%BD%AE%E8%AF%A2%E7%AE%97%E6%B3%95)
> 加权轮询（ Weighted round robin ）是网络中用于调度数据流的算法，也可用于调度进程。
> 
> 加权轮询是轮询调度的一般化。加权轮询在队列或一系列任务上循环，每个轮次中各数据包或进程按权重获得运行机会。

所谓的加权轮询也就是在配置服务器列表时，给每一台服务器配置一个权重值。 

举个例子：现在有3台服务器(A:3)(B:2)(C:1)，数字分别代表它们的权重值，数字越大表示所能承受的压力越大。将3台服务器的权重值相加3+2+1=6,也就是说现在每6个请求进来其中会有3个分配个A，2个分配个B，剩下的一个分配给C，依次循环A-A-A-B-B-C-A-A-A-B-B-C...

## 二.平滑的加权轮询算法

所谓平滑，就是在一段时间内，不仅服务器被选择的次数的分布和它们的权重一致，而且调度算法还比较均匀的选择服务器，而不会集中一段时间之内只选择某一个权重比较高的服务器。

如果使用随机算法选择或者普通的基于权重的轮询算法，就比较容易造成某个服务集中被调用压力过大。

还是上面的例子：分配轮询的结果就是A-B-A-C-B-A A-B-A-C-B-A...

是不是一下子就看出来不同了

算法执行2步，选择出1个当前节点。
1. 每个节点，用它们的当前值加上它们自己的权重。
2. 选择当前值最大的节点为选中节点，并把它的当前值减去所有节点的权重总和。

```java
package com.vansiit.wrr;

import java.util.Arrays;

/**
 * @Author: vansiit
 * @DateTime: 2023/3/24 17:29
 * @Description: 加权轮询算法
 */
public class WrrSmooth {
    final Wrr[] cachedWeights;
    public WrrSmooth(Element[] element) {
        this.cachedWeights = Arrays.stream(element).map(Wrr::new).toArray(Wrr[]::new);
    }

    class Wrr{
        Element ele;
        int current = 0;

        public Wrr(Element ele){
            this.ele = ele;
        }

        @Override
        public String toString() {
            return "Wrr{" +
                    "ele=" + ele +
                    ", current=" + current +
                    '}';
        }
    }

    //@Override
    public Wrr next() {
        int total = 0;
        Wrr shed = cachedWeights[0];
        for (Wrr cachedWeight : cachedWeights) {
            int weight = cachedWeight.ele.weight;
            total += weight;

            cachedWeight.current += weight;
            if (cachedWeight.current > shed.current){
                shed = cachedWeight;
            }
        }
        shed.current -= total;
        return shed;
    }

    public static void main(String[] args) {
        Element[] elements = new Element[]{
                new Element("A", 7),
                new Element("B", 2),
                new Element("C", 1),
        };
        int count = 10;
        WrrSmooth wrr = new WrrSmooth(elements);

        for (int i = 0; i < count; i++) {
            System.out.println("third" + i + ", " + wrr.next().toString() + ",");
        }

    }
}

```

| 次数  | lastCurrentWeight+weight  | Max(currentWeight) |    return Max    |  currentWeight - totalWeight    |
|:---:|:-------------------------:|:------------------:|:----------------:|:-------------------------------:|
|  1  |     7(A)  2(B)  1(C)      |        7(A)        |        A         |        -3(A)  2(B)  1(C)        |
|  2  |     4(A)  4(B)  2(C)      |        4(A)        |        A         |        -6(A)  4(B)  2(C)        |
|  3  |     1(A)  6(B)  3(C)      |        6(B)        |        B         |        1(A)  -4(B)  3(C)        |
|  4  |     8(A)  -2(B)  4(C)     |        8(A)        |        A         |       -2(A)  -2(B)  4(C)        |
|  5  |     5(A)  0(B)  5(C)      |        5(A)        |        A         |        -5(A)  0(B)  5(C)        |
|  6  |     2(A)  2(B)  6(C)      |        6(C)        |        C         |        2(A)  2(B)  -4(C)        |
|  7  |     9(A)  4(B)  -3(C)     |        9(A)        |        A         |       -1(A)  4(B)  -3(C)        |
|  8  |     6(A)  6(B)  -2(C)     |        6(A)        |        A         |       -4(A)  6(B)  -2(C)        |
|  9  |     3(A)  8(B)  -1(C)     |        8(B)        |        B         |       3(A)  -2(B)  -1(C)        |
| 10  |     10(A)  0(B)  0(C)     |       10(A)        |        A         |        0(A)  0(B)  0(C)         |

我们可以发现，A, B, C选择的次数符合7:2:1，而且权重大的不会被连接选择。10轮选择后， 当前值又回到0(A)  0(B)  0(C)，以上操作可以一直循环，一样符合平滑和基于权重。

参考资料：

[nginx平滑的基于权重轮询算法分析](https://tenfy.cn/2018/11/12/smooth-weighted-round-robin/)

[Upstream: smooth weighted round-robin balancing](https://github.com/phusion/nginx/commit/27e94984486058d73157038f7950a0a36ecc6e35)
