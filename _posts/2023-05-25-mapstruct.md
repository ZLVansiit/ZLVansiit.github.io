---
layout:     post
title:      "MapStruct 看这篇就够了"
subtitle:   "MapStruct是一个生成类型安全，高性能且无依赖的JavaBea 映射代码的注解处理器"
author:     "vansiit"
header-img: "img/bg/output6.jpg"
header-mask:  0.5
catalog: true
tags:
- Java
- util
---

# MapStruct
> 在一个Java工程中会涉及到多种对象，po、vo、dto、entity、do、domain这些定义的对象运用在不同的场景模块中，这种对象与对象之间的互相转换，就需要有一个专门用来解决转换问题的工具。以往的方式要么是自己写转换器，要么是用Apache或Spring的BeanUtils来实现转换。无论哪种方式都存在明显的缺点，比如手写转换器既浪费时间， 而且在添加新的字段的时候也要进行方法的修改；而无论是 BeanUtils, BeanCopier 等都是使用反射来实现，效率低下并且仅支持属性名一致时的转换。
---
## 一、各大对象映射框架性能对比
![img.png](https://zlvansiit.github.io/img/mapstruct/img.png)
---
## 二、实现原理

> MapStruct 是一个生成类型安全， 高性能且无依赖的 JavaBean 映射代码的注解处理器。

> 您要做的就是定义一个映射器接口，该接口声明任何必需的映射方法。在编译期间，MapStruct将生成此接口的实现。此实现使用简单的Java方法调用在源对象和目标对象之间进行映射，即没有反射或类似内容。
---

## 三、使用方法
### 1.Maven引入

```maven
<dependency>
    <groupId>org.mapstruct</groupId> 
    <artifactId>mapstruct-jdk8</artifactId> 
    <version>1.3.1.Final</version>
</dependency> 
<dependency> 
    <groupId>org.mapstruct</groupId> 
    <artifactId>mapstruct-processor</artifactId> 
    <version>1.3.1.Final</version> 
</dependency>
```
---
### 2.Gradle引入

```java
...
plugins {
    ...
    id "com.diffplug.eclipse.apt" version "3.26.0" // Only for Eclipse
}

dependencies {
    ...
    implementation "org.mapstruct:mapstruct:${mapstructVersion}"
    annotationProcessor "org.mapstruct:mapstruct-processor:${mapstructVersion}"

    // If you are using mapstruct in test code
    testAnnotationProcessor "org.mapstruct:mapstruct-processor:${mapstructVersion}"
}
```
---
## 四、实例

### 1.创建接口、抽象类

```java
@Mapper
public abstract class CashAccountConverter {

    public static CashAccountConverter INSTANCE = Mappers.getMapper(CashAccountConverter.class);

    public abstract CashAccountBo po2bo(CashAccountPo cashAccount);

    public abstract CashAccountPo bo2po(CashAccountBo cashAccount);

}
```
---
### 2.Spring bean 注入或者Mappers.getMapper

```java
@Mapper(componentModel = "spring")
 public interface ChallengeCheckinConverter {

     @Mapping(target = "checkinType" , expression = "java(checkinTypeMapping(checkin.getCheckinType()))")
     @Mapping(target = "examineStatus" , expression = "java(examineStatusMapping(checkin.getExamineStatus()))")
     ChallengeCheckinBo po2bo(ChallengeCheckinPo checkin);

     @Mapping(target = "checkinType" , source = "checkinType.type")
     @Mapping(target = "examineStatus" , source = "examineStatus.status")
     ChallengeCheckinPo bo2po(ChallengeCheckinBo checkin);

     default CheckinTypeEnum checkinTypeMapping(Integer checkinType){
         return CheckinTypeEnum.map(checkinType);
     }
     default CheckinExamineStatus examineStatusMapping(Integer status){
         return CheckinExamineStatus.map(status);
     }
 }
```
```java
@Mappings({
         @Mapping(target = "id", ignore = true) ,// 忽略字段
         @Mapping(target = "createTime", expression = "java(new java.util.Date())"), // java方法
         @Mapping(target = "checkinType" , expression = "java(checkinTypeMapping(people.getCheckinType()))"), // java方法
         @Mapping(target = "birthday" , expression = "java(com.tuibian.server.util.DateUtil.localDateTimeToMilli(people.getBirthday()))"), // java方法
         @Mapping(target = "countryName" , source = "country.name"), // 来源多个
         @Mapping(target = "countryCode" , source = "country.code"), // 来源多个
         @Mapping(target = "age" , source = "age"), // 来源多个
         @Mapping(target = "name" , source = "people.name"), // 来源多个，名称冲突
         @Mapping(target = "money", source = "people.money", numberFormat = "$#.00"), // 数字格式化
         @Mapping(target = "updateTime", source = "people.updateTime", dateFormat = "yyyy.MM.dd HH:mm:ss"), // 时间格式化
 })
 PeopleVO po2bo(PeopleDO people, CountryDO country, Integer age);
```
---

## 五、注解大全
+ @Mapper
+ @Mapping
+ @Mappings
+ @BeforeMapping
+ @AfterMapping
+ @BeanMapping
+ @InheritConfiguration
+ @InheritInverseConfiguration
+ @IterableMapping
+ @ValueMapping
+ @ValueMappings
+ @SubclassMapping
+ @SubclassMappings
+ @TargetType@Named
+ @MapperConfig
+ @EnumMapping
+ @DecoratedWith
+ @Context
+ @Condition
+ @DeepClone
+ @MappingControl
+ @MappingControls
+ @NoComplexMapping


### @Mapper

> @Mapper将接口或抽象类标记为映射器，并自动生成映射实现类代码。

```java
public @interface Mapper {
	// 引入其他其他映射器
    Class<?>[] uses() default {};
	// 将类import 到生成的实现类中
	// 可以使用 {@link mapping#expression（）}表达式中引用这些类型，{@link Mapping#defaultExpression（）}使用他们简单的名字，而不是完全限定的名字。
    Class<?>[] imports() default {};
	// 源类型未被映射时的策略，默认忽略
    ReportingPolicy unmappedSourcePolicy() default ReportingPolicy.IGNORE;
	// 目标类型未被映射时的策略，默认警告
    ReportingPolicy unmappedTargetPolicy() default ReportingPolicy.WARN;
	// 转换存在精度损失的的策略
    ReportingPolicy typeConversionPolicy() default ReportingPolicy.IGNORE;
	// 指定生成的映射器应该使用的组件模型，比如Spring bean、CDI等
    String componentModel() default "default";
	// 指定实现类的名称。默认加上Impl 后缀
    String implementationName() default "<CLASS_NAME>Impl";
	//  指定生成实现类的包名。默认当前包
    String implementationPackage() default "<PACKAGE_NAME>";
	// 引入一个用 {@link MapperConfig} 注解的配置
    Class<?> config() default void.class;
	// 集合类型属性的值时应用的策略。
    CollectionMappingStrategy collectionMappingStrategy() default CollectionMappingStrategy.ACCESSOR_ONLY;
	// 当 {@code null} 作为源参数值传递给此映射器的方法时要应用的策略。
    NullValueMappingStrategy nullValueMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	// 当 {@code null} 作为源参数值传递给 {@link IterableMapping} 时应用的策略
    NullValueMappingStrategy nullValueIterableMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	//  当 {@code null} 作为源参数值传递给 {@link MapMapping} 时应用的策略
    NullValueMappingStrategy nullValueMapMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	// 当源属性为 {@code null} 或不存在时应用的策略。
    NullValuePropertyMappingStrategy nullValuePropertyMappingStrategy() default NullValuePropertyMappingStrategy.SET_TO_NULL;
	//  用于在接口中应用原型方法的方法级配置注解的策略
    MappingInheritanceStrategy mappingInheritanceStrategy() default MappingInheritanceStrategy.EXPLICIT;
	// 确定何时对 bean 映射的源属性值进行空检查。
    NullValueCheckStrategy nullValueCheckStrategy() default NullValueCheckStrategy.ON_IMPLICIT_CONVERSION;
	// 确定在使用 {@link SubclassMapping} 时如何处理超类的缺失实现。
    SubclassExhaustiveStrategy subclassExhaustiveStrategy() default SubclassExhaustiveStrategy.COMPILE_ERROR;
	//  确定是使用字段注入还是构造函数注入
    InjectionStrategy injectionStrategy() default InjectionStrategy.FIELD;
	// 是否禁用自动生成子映射方法
    boolean disableSubMappingMethodsGeneration() default false;
	// 构建器信息
    Builder builder() default @Builder;
	// 允许详细控制映射过程。
    Class<? extends Annotation> mappingControl() default MappingControl.class;
	// 如果没有与枚举匹配的映射，则生成的代码应抛出异常。
    Class<? extends Exception> unexpectedValueMappingException() default IllegalArgumentException.class;
	// 指示是否应禁止在 {@code @Generated} 注释中添加时间戳的标志。
    boolean suppressTimestampInGenerated() default false;
}
```
---
### @Mapping

> @Mapping用于配置属性或枚举常量的映射关系。

```java
public @interface Mapping {
	// JavaBeans 规范定义的目标帝乡配置属性的名称
    String target();
	// 用于此映射的源
    String source() default "";
	// 可被 {@link SimpleDateFormat} 处理的日期格式字符串。
    String dateFormat() default "";
	//  可被 {@link DecimalFormat} 处理的十进制格式字符串。
    String numberFormat() default "";
	// 一个常量 {@link String} 将基于它来设置指定的目标属性。
    String constant() default "";
	// 一个表达式 {@link String} 将基于它来设置指定的目标属性。
    String expression() default "";
	// 一个 defaultExpression {@link String}，基于它来设置指定的目标属性， 当且仅当指定的源属性为空时。
    String defaultExpression() default "";
	// 通过 {@link #target()} 指定的属性是否应该被生成的映射方法忽略。
    boolean ignore() default false;
	// 可以指定限定符以帮助选择合适的映射器。
    Class<? extends Annotation>[] qualifiedBy() default {};
	// 一个或多个限定符名称
    String[] qualifiedByName() default {};
	// 指定在多个映射方法符合条件时要使用的映射方法的结果类型。
    Class<?> resultType() default void.class;
	// 映射属性的依赖关系
    String[] dependsOn() default {};
	// 在源属性为 {@code null} 的情况下设置的默认值。
    String defaultValue() default "";
	// 确定何时对 bean 映射的源属性值进行空检查。
    NullValueCheckStrategy nullValueCheckStrategy() default NullValueCheckStrategy.ON_IMPLICIT_CONVERSION;
	//  {@code null} 作为源属性值或源属性传递时应用的策略
    NullValuePropertyMappingStrategy nullValuePropertyMappingStrategy() default NullValuePropertyMappingStrategy.SET_TO_NULL;
}
```
---
### @Mappings

> @Mappings 用于声明多个@Mapping。

```java
public @interface Mappings {
    Mapping[] value();
}
```
---
### @BeforeMapping

### @AfterMapping

> @BeforeMapping和@AfterMapping 标记在映射方法开始或结束后时需要调用的方法，也就是可以在映射开始、结束后调用。
可以在映射前后做一些自定义操作，类似AOP中的切面。

---

### @BeanMapping

> 配置两种bean类型之间的映射。
@BeanMapping 用于控制整个映射方法。可以通过设置 @BeanMapping 的 NullValueCheckStrategy 使整个方法都生效。

参考：
[mapstruct BeanMapping] <https://mapstruct.org/documentation/stable/reference/html/>

```java
public @interface BeanMapping {
	//  指定在多个工厂方法符合条件时使用的工厂方法的结果类型，
    Class<?> resultType() default void.class;
	// 指定限定符以帮助选择合适的工厂方法
    Class<? extends Annotation>[] qualifiedBy() default {};
	// 使用限定符名称查找
    String[] qualifiedByName() default {};
	// 当 {@code null} 作为源值传递给此映射的方法时要应用的策略。
    NullValueMappingStrategy nullValueMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	// {@code null} 作为源属性值或源属性传递时应用的策略
    NullValuePropertyMappingStrategy nullValuePropertyMappingStrategy() default NullValuePropertyMappingStrategy.SET_TO_NULL;
	// 如何做空检查策略
    NullValueCheckStrategy nullValueCheckStrategy() default NullValueCheckStrategy.ON_IMPLICIT_CONVERSION;
	// 确定在使用 {@link SubclassMapping} 时如何处理超类缺失。
    SubclassExhaustiveStrategy subclassExhaustiveStrategy() default SubclassExhaustiveStrategy.COMPILE_ERROR;
	// 默认忽略所有映射。所有映射都必须手动定义。不会发生自动映射。
    boolean ignoreByDefault() default false;
	// 未映射的源属性将被忽略。
    String[] ignoreUnmappedSourceProperties() default {};
	// 如何报告映射的目标类型的未映射属性。
    ReportingPolicy unmappedTargetPolicy() default ReportingPolicy.WARN;
	// 指定构建者
    Builder builder() default @Builder;
	//  允许详细控制映射过程。
    Class<? extends Annotation> mappingControl() default MappingControl.class;
}
```
---

### @IterableMapping

> @IterableMapping用于配置两个几个类似类型之间的映射，
例如 {@code List<String>} 和 {@code List<Date>}。

```java
public @interface IterableMapping {
	// 可被 {@link SimpleDateFormat} 处理的日期格式字符串。
    String dateFormat() default "";
	// 可被 {@link DecimalFormat} 处理的十进制格式字符串。
    String numberFormat() default "";
	// 可以指定限定符以帮助选择合适的映射器。
    Class<? extends Annotation>[] qualifiedBy() default {};
	// 一个或多个限定符名称
    String[] qualifiedByName() default {};
	// 指定要在映射方法的结果中使用的元素的类型，以防多重映射方法符合条件。
    Class<?> elementTargetType() default void.class;
	//  当 {@code null} 作为源值传递给此可迭代映射时要应用的策略。
    NullValueMappingStrategy nullValueMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	// 允许详细控制映射过程
    Class<? extends Annotation> elementMappingControl() default MappingControl.class;
}
```
---
### @ValueMapping @ValueMappings

> @ValueMapping 配置源常量值到目标常量值的映射，支持枚举到枚举，@ValueMappings就是可以写多个@ValueMapping 。

```java
public @interface ValueMapping {
    String source();

    String target();
}

public @interface ValueMappings {
    ValueMapping[] value();
}
```

---

### @SubclassMapping 

### @SubclassMappings

> @ValueMapping 配置映射子类，也就是参数和目标对象为父类时，执行其子类的映射关系，@SubclassMappings就是可以写多个@SubclassMapping。

```java
public @interface SubclassMapping {
	//  要映射的子类
    Class<?> source();
	// 要映射到的子类
    Class<?> target();
}

public @interface SubclassMappings {
    SubclassMapping[] value();
}
```
---
### @TargetType

> @TargetType可以在自定义映射方法的参数中声明目标对象的类型。比如返回类型为泛型，这个时候可以在参数中指定目标的类型。

> 不能将多个参数声明为{@code TargetType},并且该参数必须是{@link Class}类型或者它的超类型。

```java
public class EntityFactory {
public <T extends BaseEntity> T createEntity(@TargetType Class entityClass) {
 	return // ... custom factory logic
  }
 }
```
---
### @MapperConfig

> 将类或接口标记为配置，允许在多个映射器类之间共享通用配置。

```java
public @interface MapperConfig {
	// 使用其他的映射器
    Class<?>[] uses() default {};
	// 将类import 到生成的实现类中
	// 可以使用 {@link mapping#expression（）}表达式中引用这些类型，{@link Mapping#defaultExpression（）}使用他们简单的名字，而不是完全限定的名字。
    Class<?>[] imports() default {};
	// 映射的源类型的存在未映射属性应该如何报告
    ReportingPolicy unmappedSourcePolicy() default ReportingPolicy.IGNORE;
	// 映射的目标类型存在未映射属性应该如何映射
    ReportingPolicy unmappedTargetPolicy() default ReportingPolicy.WARN;
	// 存在精度损失，如何报告
    ReportingPolicy typeConversionPolicy() default ReportingPolicy.IGNORE;
	// 映射器组件模型
    String componentModel() default "default";
	// 指定实现类的名称。默认后缀为Impl
    String implementationName() default "<CLASS_NAME>Impl";
	// 指定包名
    String implementationPackage() default "<PACKAGE_NAME>";
	// 集合类型属性的值时应用的策略。
    CollectionMappingStrategy collectionMappingStrategy() default CollectionMappingStrategy.ACCESSOR_ONLY;
	// 当 {@code null} 作为源参数值传递给此映射器的方法时要应用的策略。
    NullValueMappingStrategy nullValueMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	// 当 {@code null} 作为源参数值传递给 {@link IterableMapping} 时应用的策略
    NullValueMappingStrategy nullValueIterableMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	//  当 {@code null} 作为源参数值传递给 {@link MapMapping} 时应用的策略
    NullValueMappingStrategy nullValueMapMappingStrategy() default NullValueMappingStrategy.RETURN_NULL;
	// 当源属性为 {@code null} 或不存在时应用的策略。
    NullValuePropertyMappingStrategy nullValuePropertyMappingStrategy() default NullValuePropertyMappingStrategy.SET_TO_NULL;
	//  用于在接口中应用原型方法的方法级配置注解的策略
    MappingInheritanceStrategy mappingInheritanceStrategy() default MappingInheritanceStrategy.EXPLICIT;
	// 确定何时对 bean 映射的源属性值进行空检查。
    NullValueCheckStrategy nullValueCheckStrategy() default NullValueCheckStrategy.ON_IMPLICIT_CONVERSION;
	// 确定在使用 {@link SubclassMapping} 时如何处理超类的缺失实现。
    SubclassExhaustiveStrategy subclassExhaustiveStrategy() default SubclassExhaustiveStrategy.COMPILE_ERROR;
	//  确定是使用字段注入还是构造函数注入
    InjectionStrategy injectionStrategy() default InjectionStrategy.FIELD;
    // 是否禁用自动生成子映射方法
    boolean disableSubMappingMethodsGeneration() default false;
	// 构建器信息
    Builder builder() default @Builder;
	// 允许详细控制映射过程。
    Class<? extends Annotation> mappingControl() default MappingControl.class;
	// 如果没有与枚举匹配的映射，则生成的代码应抛出异常。
    Class<? extends Exception> unexpectedValueMappingException() default IllegalArgumentException.class;
	// 指示是否应禁止在 {@code @Generated} 注释中添加时间戳的标志。
    boolean suppressTimestampInGenerated() default false;
}
```
---

### @EnumMapping

> 配置两种枚举类型之间的映射。

```java
public @interface EnumMapping {
	// 指定应该用于枚举之间的隐式映射的名称转换策略。
    String nameTransformationStrategy() default "";
	// 应该在适当的名称转换策略上传递的配置。
    String configuration() default "";
	// 应该在生成的代码中使用的异常
    Class<? extends Exception> unexpectedValueMappingException() default IllegalArgumentException.class;
}
```
> nameTransformationStrategy属性
指定枚举常量映射的策略，如增加/去掉前缀或者后缀，大写、小写以及首字符大写等。
取值范围有：
+ MappingConstants.SUFFIX_TRANSFORMATION

    在源枚举常量上加上configuration属性指定的后缀。

+ MappingConstants.STRIP_SUFFIX_TRANSFORMATION

    从源枚举常量中删除configuration属性指定的后缀。

+ MappingConstants.PREFIX_TRANSFORMATION

    在源枚举常量上加上configuration属性指定的前缀。

+ MappingConstants.STRIP_PREFIX_TRANSFORMATION
  
  从源枚举常量中删除configuration属性指定的前缀。

+ MappingConstants.CASE_TRANSFORMATION

nameTransformationStrategy属性指定值为MappingConstants.CASE_TRANSFORMATION时，configuration属性可选的值有三个：

upper：对源枚举执行大写转换。

lower：对源枚举执行小写转换。

capital：对源枚举中每个被“_”分割的单词的第一个字符进行大写，并将其他所有字符都小写。

---

### @ValueMapping 

### @ValueMappings

> @ValueMapping 配置源常量值到目标常量值的映射，支持枚举到枚举，@ValueMappings就是可以写多个@ValueMapping 。

```java
public @interface ValueMapping {
    String source();

    String target();
}

public @interface ValueMappings {
    ValueMapping[] value();
}
```

---

参考资料

[官网]：<https://mapstruct.org>

[Github地址]：<https://github.com/mapstruct/mapstruct/>

[实例demo]：<https://github.com/mapstruct/mapstruct-examples>
