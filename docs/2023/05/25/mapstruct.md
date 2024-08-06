---
outline: deep
title: MapStruct使用和详解，看这篇就够了
description: MapStruct使用和详解，看这篇就够了
head: [['meta', { name: 'keywords', content: 'MapStruct,mapstruct,mapstruct使用,mapstruct详解,mapstruct使用和详解,mapstruct使用和详解, Java, JavaBeans, JavaBeans映射, JavaBean映射, JavaBean映射框架, JavaBean映射框架' }]]
---

# MapStruct使用和详解，看这篇就够了


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
### @BeforeMapping @AfterMapping

> @BeforeMapping和@AfterMapping 标记在映射方法开始或结束后时需要调用的方法，也就是可以在映射开始、结束后调用。
> 可以在映射前后做一些自定义操作，类似AOP中的切面。

---

## 参考资料

* [ github / mapstruct ](https://github.com/xiaohongshu/mapstruct-demo)

* [ mapstruct.org ](https://mapstruct.org/)
