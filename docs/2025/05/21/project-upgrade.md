
---
outline: deep
title: Java项目升级实战：从JDK8到JDK17的完整迁移指南
description: 详细记录Java项目从JDK8升级到JDK17的完整过程，包括Spring Boot 3.x迁移、依赖包升级、安全漏洞修复等实战经验
keywords: Java项目升级,JDK17迁移,Spring Boot 3.x,依赖升级,安全漏洞修复,javax到jakarta,POI升级,FastJSON替换
author: Z.L Vansiit
date: 2025-05-21
lastmod: 2025-05-21
category: 技术分享
tags:
  - Java
  - Spring Boot
  - 项目升级
  - JDK17
  - 安全修复
image: /img/project-upgrade/1.png
---

# Java 项目升级遇到的那些事儿

某日，甲方爸爸丢过来一个excel。你们项目有漏洞啊，安全性怎么保证，赶紧全部修复掉，立刻马上。

遂打开excel，还好还好，10万行而已 QvQ

简单肉眼扫描了一下，主要分两大类。一是服务器相关的，部署机数据库之类；二是jar包漏掉类的。

好，现在的问题就是主要升级jar到没有安全漏掉的版本。打开 https://mvnrepository.com ，逐一升级。

分析一下：项目最早提交代码的时间是2018年，有jsp，还有vue... 先把JDK升级到17，javax.servlet升级成jakarta.servlet，spring-boot升级到3.4.5。重点点名一下，poi，httpclient，fastjson，mybatis plus，这几个包的升级。

期间各种版本兼容问题，代码写法问题，特此记录一下，希望能帮助到后来者。

## 一、spring框架相关
### 1. xml配置文件修改成java-config或者yml
    包括不仅限于 spring database，spring security，web.xml，用xml定义的bean

### 2. 自己注入自己（OvO，就是这么吊）
```java
@Service
public class UserSubscribeMsgServiceImpl extends ServiceImpl<UserSubscribeMsgMapper, UserSubscribeMsg>
        implements IUserSubscribeMsgService {

    @Autowired
    private IUserSubscribeMsgService userSubscribeMsgService;

    @Override
    public JsonVO sendByPromoterMobile(PromoterSubMsgVO promoterSubMsgVO) throws Exception {
        // ...
        // 修改这里的调用方式
        userSubscribeMsgService.updateById(userSubscribeMsg);
        // 或使用代理确保事务
        // ((IUserSubscribeMsgService) AopContext.currentProxy()).updateById(userSubscribeMsg);
    }
}
```

### 3. 先有鸡还是先有蛋，天才，自己看代码吧
```jva
@Autowired
UserEndpointRegistration registration;

@Bean
public UserEndpointRegistration userEndpointRegistration() {
    return new BasicUserEndpointRegistration();
}
```

### 4. 注入没有一个实现类的Bean
```java
@Autowired
List<UserEndpointDefine> defines;
```

### 5. spring注解错用
```java
// 修改前
@RequestMapping(value = "/testValidateGetParams", method = RequestMethod.GET)
public void testValidateGetParams(@RequestParam(name = "id", required = true) String id,
                                  @Min(value = 1, message = "年龄最小只能1")
                                  @Max(value = 120, message = "年龄最大只能120")
                                  @RequestParam(name = "age", required = true, value = "0") int age) {
}

// 修改后 自己看哪里错了吧
@RequestMapping(value = "/testValidateGetParams", method = RequestMethod.GET)
public void testValidateGetParams(
    @RequestParam(name = "id", required = true) String id,
    @Min(value = 1, message = "年龄最小只能1")
    @Max(value = 120, message = "年龄最大只能120")
    @RequestParam(name = "age", required = true, defaultValue = "0") int age
) {
}
```

### 6. 循环依赖(多如牛毛，只举一例)
```java
// 在 YuouerShopPromoterServiceImpl 类中，为 ILiveInfoService 字段添加 @Lazy 注解
@Autowired
@Lazy  // 添加此注解
private ILiveInfoService liveInfoService;

// 在 LiveInfoServiceImpl 类中，为 IYuouerShopPromoterService 字段添加 @Lazy 注解
@Autowired
@Lazy  // 添加此注解
private IYuouerShopPromoterService yuouerShopPromoterService;
```

## 二、二方包相关
这类也是此次升级的痛点，由于项目久远，很多二方包连代码仓库都找不着了，都是从mavan私服直接update的jar包。

很多二方包的springboot版本不一致，javax.servlet升级到jakarta.servlet，只能把相关二方包全部干掉，手动把相关代码迁移到现有项目中。

这里总结一下，希望大家有所启发。小项目也好，大项目也一样，不要为了模块化而模块化，不要为了解耦而解耦，要考虑实际情况，很多时候微服务也是桎梏，小项目优先考虑的是功能完整性和稳定性。

优化方案：
> 1. 优先考虑到的方案是反编译jar出来，然后把代码按照包名迁移到现有项目中，可能是我用的工具问题，jd-gui反编译出来的代码会添加很多的无效代码、行号、注释。后面就放弃反编译的做法了。
> 2. 直接一个一个文件新建到项目里面，这样也好，只要项目需要的文件。


## 三、三方包相关
### mybatis plus 合集
    升级过程中，遇到很多坑，情绪一直很稳定。

    直到遇到mybatis plus，真是无力吐槽。升级就升级，把所有的包名路径全改了几个意思，Wrapper的用法也大调整，能不能向下兼容一下。

    大变动的新版本升级一个新的artifactId，叫mybatis-plus3，旧的mybatis-plus漏洞修复一下，停更不就行了嘛。

    你或者像jakarta也行，直接改名，我也只用javax.servlet全局替换成jakarta.servlet

#### 1. 举例几个包调整的例子
> com.baomidou.mybatisplus.mapper -> com.baomidou.mybatisplus.core.mapper
> com.baomidou.mybatisplus.service.impl -> com.baomidou.mybatisplus.extension.service.impl
> com.baomidou.mybatisplus.annotations -> com.baomidou.mybatisplus.annotation

详细的看图吧
![img.png](https://vansiit.cc/img/project-upgrade/1.png)
![img.png](https://vansiit.cc/img/project-upgrade/2.png)

####  2. 不支持联合主键
```java
@TableId("component_appid")
private String component_appid;

@TableId("authorizer_appid")
private String authorizerAppid;
```

#### 3. EntityWrapper查询废弃，改用QueryWrapper
com.baomidou.mybatisplus.mapper.EntityWrapper -> com.baomidou.mybatisplus.core.conditions.query.QueryWrapper
这个是最可恶的，涉及到大量代码的修改，包括不仅限于eq、orderBy
举例：
```java
// 旧写法
EntityWrapper<WxMiniPushError> wrapper = new EntityWrapper<WxMiniPushError>();
wrapper.eq("result", 1);
wrapper.eq("push_type", pushLog.getPushType());
wrapper.eq("user_id", pushLog.getUserId());
List<WxMiniPushError> pushErrorList = pushErrorMapper.selectList(wrapper);

// 新写法
LambdaQueryWrapper<WxMiniPushError> wrapper = new LambdaQueryWrapper<WxMiniPushError>();
wrapper.eq(WxMiniPushError::getResult, 1);
wrapper.eq(WxMiniPushError::getPushType, pushLog.getPushType());
wrapper.eq(WxMiniPushError::getUserId, pushLog.getUserId());
List<WxMiniPushError> pushErrorList = pushErrorMapper.selectList(wrapper);
```

### 2.httpclient的升级client5
这个升级也很麻烦，但是影响的范围有限，只需要把相关的几个工具类修改写法就可以了。
贴一个import类的区别吧
```java
// 旧版
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

// 新版
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.socket.ConnectionSocketFactory;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.config.Registry;
import org.apache.hc.core5.http.config.RegistryBuilder;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.ssl.SSLContexts;
import org.apache.hc.core5.util.Timeout;

```

## 四，AI工具
此次升级过程中，AI工具的帮助很大。

秉承着遇到问题解决问题的思路，一步一步从解决报错->编译通过->打包通过->启动成功->解决所有运行报错。

每一步都配合AI工具，帮助解决各种问题。主要使用的是chatgpt，DeepSeek，cursor这三个工具，再配合偶尔使用的搜索引擎。把一个2016年启动的java jsp项目，从java8升级到17，springboot升级到3，tomcat升级到10，前后累计工时不超过10天，AI大模型的作用完全发挥出来了。

网上很多人都会谈论各种大模型的优劣势，这个好，那个不好。从我一直使用的过程中来看，市面免费的大模型都用过，就不举例了。

这些大模型的比较差距没有代差，很多问题给出的结果思路几乎一致，我们从中筛选一个即可，配合自己的经验，基本就可以解决大部分问题。
