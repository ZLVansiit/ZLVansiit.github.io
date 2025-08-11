---
outline: deep
title: MySQL字符集详解：utf8与utf8mb4的区别及最佳实践
description: 深入解析MySQL中utf8和utf8mb4字符集的区别、应用场景和配置方法，包含字符编码原理、存储差异和性能对比分析
keywords: MySQL字符集,utf8,utf8mb4,字符编码,数据库配置,MySQL优化,中文编码,emoji存储
author: Z.L Vansiit
date: 2023-12-02
lastmod: 2023-12-02
category: 技术分享
tags:
  - MySQL
  - 数据库
  - 字符编码
  - 数据库优化
  - 配置管理
image: /img/favicon.ico
---

# utf8和utf8mb4的区别 - MySQL字符集和比较规则

## 一、基础概念

### 1、位 / 比特位 （bit）

位/比特位/bit，数据存储的最小单位。每个二进制数字0或者1就是1个位。

---

### 2、字节（Byte）

字节(Byte)是一种计量单位，表示数据量多少，它是计算机信息技术用于计量存储容量的一种计量单位。

8个位构成一个字节。即：1 byte (字节)= 8 bit (位)；

1 B = 1 byte(字节);

1 KB = 1024 B(字节);

1 MB = 1024 KB;(2^10 B)

1 GB = 1024 MB;(2^20 B)

1 TB = 1024 GB;(2^30 B)

---

### 3、字符（Character）

字符是指计算机中使用的文字和符号，比如1、2、3、A、B、C、~！·#￥%……—* () ——+、等等。

a、A、中、+、*、の…均表示一个字符；

一般 utf-8 编码下，一个汉字字符占用 3 个 字节；

一般 gbk 编码下，一个汉字字符占用 2 个 字节；

> ### 小贴士
> 
> “字节”与“字符”
> 
>它们完全不是一个维度的概念，所以两者之间没有“区别”这个说法。不同编码里，字符和字节的对应关系不同：
> 
>①ASCII码中，一个英文字母(不分大小写)占一个字节的空间，一个中文汉字占两个字节的空间。一个二进制数字序列，在计算机中作为一个数字单元，一般为8位二进制数，换算为十进制。最小值0，最大值255。
>
>②UTF-8编码中，一个英文字符等于一个字节，一个中文(含繁体)等于三个字节。
> 
>③Unicode编码中，一个英文等于两个字节，一个中文(含繁体)等于两个字节。
> 
>符号：英文标点占一个字节，中文标点占两个字节。举例：英文句号“.”占1个字节的大小，中文句号“。”占2个字节的大小。
>
>④UTF-16编码中，一个英文字母字符或一个汉字字符存储都需要2个字节(Unicode扩展区的一些汉字存储需要4个字节)。
>
>⑤UTF-32编码中，世界上任何字符的存储都需要4个字节。

---

### 4、字符集（Character Set）

字符集是指多个字符的集合。

不同的字符集包含的字符个数不一样、包含的字符不一样、对字符的编码方式也不一样。

例如GB2312是中国国家标准的简体中文字符集，GB2312收录简化汉字（6763个）及一般符号、序号、数字、拉丁字母、日文假名、希腊字母、俄文字母、汉语拼音符号、汉语注音字母，共 7445 个图形字符。

而ASCII字符集只包含了128字符，这个字符集收录的主要字符是英文字母、阿拉伯字母和一些简单的控制字符。

另外，还有其他常用的字符集有 GBK字符集、GB18030字符集、Big5字符集、Unicode字符集等。

---

### 5、字符编码（Character Encoding）

字符编码是指一种映射规则，根据这个映射规则可以将某个字符映射成其他形式的数据以便在计算机中存储和传输。

例如ASCII字符编码规定使用单字节中低位的7个比特去编码所有的字符，在这个编码规则下字母A的编号是65（ASCII码），用单字节表示就是0x41，因此写入存储设备的时候就是二进制的 01000001。

每种字符集都有自己的字符编码规则，常用的字符集编码规则还有 UTF-8编码、GBK编码、Big5编码等。

---

## 二、MySQL中的字符集

> MySQL中并不区分字符集和编码方案的概念，所以后边把utf8、utf16、utf32都当作一种字符集对待。

MySQL中的utf8和utf8mb4

我们上边说utf8字符集表示一个字符需要使用1～4个字节，但是我们常用的一些字符使用1～3个字节就可以表示了。

而在MySQL中字符集表示一个字符所用最大字节长度在某些方面会影响系统的存储和性能，所以MySQL的设计者们定义了两个概念：

utf8mb3：阉割过的utf8字符集，只使用1～3个字节表示字符。

utf8mb4：正宗的utf8字符集，使用1～4个字节表示字符。

MySQL有4个级别的字符集和比较规则：服务器级别、数据库级别、表级别、列级别。也就是说可以单独设置服务器、DB、Table、Column的字符集和比较规则，当然前提是更高级别的字符集支持。

> ### 小贴士
> 
> 有一点需要大家十分的注意，在MySQL中utf8是utf8mb3的别名，所以之后在MySQL中提到utf8就意味着使用1~3个字节来表示一个字符，如果大家有使用4字节编码一个字符的情况，比如存储一些emoji表情，那请使用utf8mb4。
> 
> 所以大家在创建数据库和表的时候，千万要注意，以免后续更改字符集造成很大的麻烦。
> 
> 在MySQL8.0中，已经极大程度优化了utf8mb4字符集的性能，并将其设置为默认字符集

---

## 三、比较规则

> #### 小贴士
> 将字符映射成二进制数据的过程叫做编码
> 
> 将二进制数据映射到字符的过程叫做解码

前面介绍了字符集和字符编码，那么如何比较两个字符的大小呢?

例如：直接比较这两个字符对应的二进制编码的大小

或将两个大小写不同的字符全部都转为大写或者小写，再比较这两个字符对应的二进制数据

___

### 1. 比较规则的查看

```sql
SHOW COLLATION [LIKE 匹配的模式];
```

一种字符集可能对应着若干种比较规则，MySQL支持的字符集就已经非常多了，所以支持的比较规则更多，我们先只查看一下utf8字符集下的比较规则：

```sql
mysql> SHOW COLLATION LIKE 'utf8\_%';
+--------------------------+---------+-----+---------+----------+---------+
| Collation                | Charset | Id  | Default | Compiled | Sortlen |
+--------------------------+---------+-----+---------+----------+---------+
| utf8_general_ci          | utf8    |  33 | Yes     | Yes      |       1 |
| utf8_bin                 | utf8    |  83 |         | Yes      |       1 |
| utf8_unicode_ci          | utf8    | 192 |         | Yes      |       8 |
| utf8_icelandic_ci        | utf8    | 193 |         | Yes      |       8 |
| utf8_latvian_ci          | utf8    | 194 |         | Yes      |       8 |
| utf8_romanian_ci         | utf8    | 195 |         | Yes      |       8 |
| utf8_slovenian_ci        | utf8    | 196 |         | Yes      |       8 |
| utf8_polish_ci           | utf8    | 197 |         | Yes      |       8 |
| utf8_estonian_ci         | utf8    | 198 |         | Yes      |       8 |
| utf8_spanish_ci          | utf8    | 199 |         | Yes      |       8 |
| utf8_swedish_ci          | utf8    | 200 |         | Yes      |       8 |
| utf8_turkish_ci          | utf8    | 201 |         | Yes      |       8 |
| utf8_czech_ci            | utf8    | 202 |         | Yes      |       8 |
| utf8_danish_ci           | utf8    | 203 |         | Yes      |       8 |
| utf8_lithuanian_ci       | utf8    | 204 |         | Yes      |       8 |
| utf8_slovak_ci           | utf8    | 205 |         | Yes      |       8 |
| utf8_spanish2_ci         | utf8    | 206 |         | Yes      |       8 |
| utf8_roman_ci            | utf8    | 207 |         | Yes      |       8 |
| utf8_persian_ci          | utf8    | 208 |         | Yes      |       8 |
| utf8_esperanto_ci        | utf8    | 209 |         | Yes      |       8 |
| utf8_hungarian_ci        | utf8    | 210 |         | Yes      |       8 |
| utf8_sinhala_ci          | utf8    | 211 |         | Yes      |       8 |
| utf8_german2_ci          | utf8    | 212 |         | Yes      |       8 |
| utf8_croatian_ci         | utf8    | 213 |         | Yes      |       8 |
| utf8_unicode_520_ci      | utf8    | 214 |         | Yes      |       8 |
| utf8_vietnamese_ci       | utf8    | 215 |         | Yes      |       8 |
| utf8_general_mysql500_ci | utf8    | 223 |         | Yes      |       1 |
+--------------------------+---------+-----+---------+----------+---------+
27 rows in set (0.00 sec)
```

这些比较规则的命名还挺有规律的，具体规律如下：

比较规则名称以与其关联的字符集的名称开头。如上图的查询结果的比较规则名称都是以utf8开头的。

后边紧跟着该比较规则主要作用于哪种语言，比如utf8_polish_ci表示以波兰语的规则比较，utf8_spanish_ci是以西班牙语的规则比较，utf8_general_ci是一种通用的比较规则。

名称后缀意味着该比较规则是否区分语言中的重音、大小写啥的，具体可以用的值如下：

| 后缀  | 英文释义  | 描述 |
|:---:|:-------------------------:|:------------------:|
|_ai	|accent insensitive	|不区分重音
|_as	|accent sensitive	|区分重音
|_ci	|case insensitive	|不区分大小写
|_cs	|case sensitive	    |区分大小写
|_bin	|binary	            |以二进制方式比较

___

### 2.比较规则的应用

在对字符串进行比较，或者对某个字符串列执行排序操作时，如果没有得到想象中的结果，需要思考一下是不是比较规则的问题。

___

# 总结

1. 字符集指的是某个字符范围的编码规则。

2. 比较规则是针对某个字符集中的字符比较大小的一种规则。

3. 在MySQL中，一个字符集可以有若干种比较规则，其中有一个默认的比较规则，一个比较规则必须对应一个字符集。

4. 查看MySQL中查看支持的字符集和比较规则的语句如下：

```sql
SHOW (CHARACTER SET|CHARSET) [LIKE 匹配的模式];
SHOW COLLATION [LIKE 匹配的模式];
```

5. MySQL有四个级别的字符集和比较规则


    a.服务器级别

character_set_server表示服务器级别的字符集，collation_server表示服务器级别的比较规则。

    b. 数据库级别

创建和修改数据库时可以指定字符集和比较规则：

```sql
CREATE DATABASE 数据库名
    [[DEFAULT] CHARACTER SET 字符集名称]
    [[DEFAULT] COLLATE 比较规则名称];

ALTER DATABASE 数据库名
    [[DEFAULT] CHARACTER SET 字符集名称]
    [[DEFAULT] COLLATE 比较规则名称];
```

character_set_database表示当前数据库的字符集，collation_database表示当前默认数据库的比较规则，这两个系统变量是只读的，不能修改。如果没有指定当前默认数据库，则变量与相应的服务器级系统变量具有相同的值。

    c. 表级别

创建和修改表的时候指定表的字符集和比较规则：

```sql
CREATE TABLE 表名 (列的信息)
    [[DEFAULT] CHARACTER SET 字符集名称]
    [COLLATE 比较规则名称]];

ALTER TABLE 表名
    [[DEFAULT] CHARACTER SET 字符集名称]
    [COLLATE 比较规则名称];
```

    d. 列级别

创建和修改列定义的时候可以指定该列的字符集和比较规则：

```sql
CREATE TABLE 表名(
    列名 字符串类型 [CHARACTER SET 字符集名称] [COLLATE 比较规则名称],
    其他列...
);

ALTER TABLE 表名 MODIFY 列名 字符串类型 [CHARACTER SET 字符集名称] [COLLATE 比较规则名称];
```

