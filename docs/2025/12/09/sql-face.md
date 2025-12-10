---
outline: deep
title: 高频Sql面试实战题目（mysql）的解答思路
description: 高频Sql面试题目及答案和解答思路
keywords: java, java面试, sql
author: Z.L Vansiit
date: 2025-12-09
lastmod: 2025-12-09
category: java
tags:
  - java面试
---

# 高频Sql面试题目及答案和解答思路

## 第一部分：基础实战题（查询 / 分组 / 去重）

### 1.查询最近 30 天下单的用户数（去重）

orders(id, user_id, amount, created_at)

> 写出 SQL，统计最近 30 天内有下单的“独立用户总数”。

思路：
. 使用 DATE_SUB 函数
. COUNT(DISTINCT user_id)

```sql
SELECT COUNT(DISTINCT user_id) AS user_count
FROM orders
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 2. 查询每个用户的最新一笔订单

orders(id, user_id, amount, created_at)

> 给定订单表，返回每个 user_id 最新的订单记录（整行数据）。

思路：

可以使用 JOIN + MAX(created_at) 的子查询方式，也可以使用窗口函数。MySQL 8 后窗口函数基本是标配考点

#### 子查询

```sql
select a.*
from orders a
JOIN (
select user_id, max(created_at) max_created_at from orders GROUP BY user_id
) b on a.user_id=b.user_id and a.created_at=b.max_created_at
```

#### 窗口函数

```sql
SELECT *
FROM (
    SELECT o.*,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders o
) t
WHERE rn = 1;
```

### 3. 查询下单金额大于用户平均订单金额的订单

思路：

使用 JOIN + AVG(amount) 的子查询方式

```sql
SELECT o.*
FROM orders o
JOIN (
    SELECT user_id, AVG(amount) AS avg_amount
    FROM orders
    GROUP BY user_id
) t ON o.user_id = t.user_id
WHERE o.amount > t.avg_amount;
```


### 4. 查询连续下单 3 天以上的用户

表中只有 created_at（日期），判断用户是否连续 3 天有订单。



### 5. 查询本周每天的订单量，没有订单的日期也要显示 0

要求：返回一周 7 天的完整统计（date, count），缺的日期补 0。


## 第二部分：中级实战（多表关联 / 聚合 / 复杂条件）

### 6. 查询某用户的“未支付订单金额总和”

order(id, user_id, status, amount)

status: 0-待支付 1-已支付

用户 9527 目前所有未支付订单的金额总和是多少？

—

### 7. 查询每个品类下销量最高的商品（Top1）

category(id, name)
product(id, category_id, name)
order_item(id, product_id, quantity)

找出每个 category 对应“销量最高”的 product。

窗口函数必须会。

—

### 8. 查询 2024 年每个月的 GMV（成交额）

要求返回 2024 年 1~12 月，哪怕某月是 0。

—

### 9. 统计每个用户的下单金额区间（0~100、100~500、500+）

类似电商用户分层，写 SQL 得到用户处于哪个金额段。

### —

### 10. 查询“只买过一次”的用户名单

用户 lifetime 只有一单的 user_id。

## 第三部分：进阶实战（窗口函数 / 反复过滤 / 子查询）

### 11. 查询用户最近一次下单距今多少天

now() - 用户最后一单 created_at → 返回天数。

—

### 12. 查询某用户前 3 次订单（按金额排序）

user_id = X，amount 降序，取 Top3。

—

### 13. 查询每个用户近 5 次订单的平均金额

考点：窗口函数 + 分区 + order

—

### 14. 查询“未支付金额 > 已支付金额”的用户

sum(未支付) > sum(已支付)，返回 user_id。

（思路关键：group by + 条件聚合）

—

### 15. 查询同一个用户上一笔订单距离下一笔订单相差多少天

典型的 LEAD / LAG 窗口函数题。

要求返回：

user_id | order_id | created_at | next_created_at | interval_days

## 🧨 🔥 第四部分：高难度（业务场景 + 常考）

### 16. 查询商品的“30 天滚动销售额”

对每个商品每天算一个 “过去 30 天窗口” 的销售额（滑动窗口）。

需要窗口函数：

range between interval 29 day preceding and current row


—

### 17. 查询“近 7 天连续无登录”的用户

login(user_id, login_at)

某用户 7 天内完全没有登录过 → 返回这些 user_id。

（涉及补全日期 + group by + max/min）

—

### 18. 找出被“重复提交”的订单（相同 user、相同金额、相同时间段）

判断风控类问题：短时间内几乎相同的订单。

（考点：分组、having、近时间窗口）

—

### 19. 查询门店每天的“新增用户数”

用户第一单发生在该店，即视为该店新增。

（关键：min(created_at)）

—

### 20. 查询“最近 10 分钟内下单次数 > 5 次”的用户（防刷）

典型反作弊滑窗题，有时需自连接或窗口函数实现。
