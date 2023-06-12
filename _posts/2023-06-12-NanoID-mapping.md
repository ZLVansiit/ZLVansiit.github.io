---
layout:     post
title:      "使用NanoID替换整型ID"
subtitle:   "业务重构，使用NanoID替换整型ID，增加映射修改"
author:     "vansiit"
header-img: "img/bg/output7.jpg"
header-mask:  0.5
catalog: true
tags:
- Java
- util
- 日常
- 架构
- 重构
---

# 背景介绍
接口使用自增长整型作为唯一ID，数据和缓存查询都是用ID获取是常规方案。随着公司业务的发展，少数不法分子通过爬虫抓取接口数据，作为非法盈利之用。本司主营业务是长视频播放服务，存储和CND费用更加昂贵。其中一种爬取方案是，自增长ID轮询接口数据，所以此文的目的就是把所有暴露出来的资源ID都替换成随机字符串。

诚然，此方案防爬效果有限。须配合多种方案，验签、加密、限流、用户行为记录、CND加密、二次校验，这些不在此文讨论范围。


# 具体方案
网站主要涉及到电影剧集短视频，片单，文章资讯，复杂度在数据不仅要落库，还需要处理现有的缓存数据。

## 一.电影剧集ID

### 1.增加映射表 cms_content_id_mapping

```sql
CREATE TABLE `cms_content_id_mapping` (
  `id` varchar(25) NOT NULL COMMENT 'id',
  `category` TINYINT(4) NOT NULL COMMENT '内容类型，0,电影，1剧集，2短视频',
  `mapping_id` varchar(25) NOT NULL COMMENT '映射ID',
  PRIMARY KEY (`id`, `category`) USING BTREE,
  KEY `idx_mapping_id` (`mapping_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源ID映射表';
```

### 2.增加双向缓存
原缓存不动
使用hash存储mappingId和contentId的双向关系，并且可以批量获取
详情见 groot.cms.cache.ContentMappingCache

### 3.获取电影剧集详情接口修改如下
```java
if (StringUtils.isNumeric(id)) {
    // 增加配置开关，暂时保留旧的ID
    if (!websiteMappingConfig.getOldIdIsOpen()){
        throw new RequestParameterException();
    }
} else {
    id = contentMappingCache.getContentIdCacheByMappingId(id, category);
}
```

## 二.片单ID

### 1.增加字段 mapping_id

```sql
alter table cms_album add column `mapping_id` varchar(25) NOT NULL COMMENT '映射ID' after id;
```

### 2.新增索引

```sql
alter table cms_album add index idx_mapping_id(mapping_id) USING BTREE;
```

### 3.新增缓存

### 4.片单缓存增加字段mappingId


## 三.文章资讯ID
    文章资讯不需要处理缓存数据

### 1.新增字段 mapping_id

```sql
alter table cms_news add column `mapping_id` varchar(25) NOT NULL COMMENT '映射ID' after sort;
```

### 2.新增索引

```sql
alter table cms_news add index idx_mapping_id(mapping_id) USING BTREE;
```

## 四.数据和缓存初始化

```java
public void initData(){
    StopWatch stopWatch = new StopWatch();

    // contentMappingCache
    for (ContentCategoryEnum categoryEnum : ContentCategoryEnum.values()) {
        stopWatch.start(categoryEnum.getDesc() + "初始化 ");
        initMovieMapping(categoryEnum);
        stopWatch.stop();
    }

    // alumCache
    stopWatch.start("片单初始化");
    initAlbumMapping();
    stopWatch.stop();

    // cmsNews
    stopWatch.start("新闻资讯初始化");
    initNewsMapping();
    stopWatch.stop();

    log.info(stopWatch.prettyPrint());
}
```

## 五.修改原来的sitemap.xml相关接口
修改原有ID生成逻辑，其他保持不变

## 六.映射ID生成逻辑
    鉴于UUID长度太长，这里的mappingId是用NanoId。
    修改默认字符集为“0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ”，去除默认的“_-”，防止和URL中的字符冲突，长度使用默认的21位
    具体代码如下：

```java
public class NanoIdUtil {
    public static final SecureRandom DEFAULT_NUMBER_GENERATOR = new SecureRandom();

    /**
     * The default alphabet used by this class.
     * Creates url-friendly NanoId Strings using 64 unique symbols.
     */
    public static final char[] DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();

    /**
     * The default size used by this class.
     * Creates NanoId Strings with slightly more unique values than UUID v4.
     */
    public static final int DEFAULT_SIZE = 21;

    public static String randomNanoId(){
        return NanoIdUtils.randomNanoId(DEFAULT_NUMBER_GENERATOR, DEFAULT_ALPHABET, DEFAULT_SIZE);
    }
}
```

    使用方法如下：

```java
public static void main(String[] args) {
    System.out.println(NanoIdUtil.randomNanoId());
}
```

    Maven 坐标：
```java
<dependency>
  <groupId>com.aventrix.jnanoid</groupId>
  <artifactId>jnanoid</artifactId>
  <version>2.0.0</version>
</dependency>
```

      修改后的网站url效果如下
```java
http://xxxxxx.com/detail/movie/76Y3TWpZDR8aOhbd19cyT-Double-Dad
http://xxxxxx.com/collection/QXUGQIYQcYKM1jDSwY83G-afdfadggd?name=qins
```

## 七.参考资料：

[github] : <https://zlvansiit.github.io/2023/06/12/NanoId.html>
