---
outline: deep
title: APP扫码登录：不只有原理，直接上代码
---

# APP扫码登录：不只有原理，直接上代码

## 一.背景

扫码登录前提是要有APP端，和PC端。其目的是为了让用户在使用的PC端时登录更加方便和安全，使用手机扫一扫就可以登录和使用服务。

还有一个重要原因就是引导用户下载APP。

前段时间正好接到这么一个需求，设计和相关代码都会在本文贴出来。

话不多说，进入正题。

***

## 二.原理和时序图

![img.png](https://zlvansiit.github.io/img/qrcode/scan-qrcode.jpg)

>二维码状态
>- INIT(1, "初始状态"),
>- SCANNING(2, "扫码中"),
>- CANCEL(3, "取消"),
>- CONFIRM(4, "确定登录"),
>- EXPIRE(5, "过期");

1. 用户在PC端请求二维码信息

2. 服务端初始化二维码信息
生成二维码唯一的oauthKey，存储到Redis，设置过期时间，这里我配置的60S，过期时间看自己需求。
这时候二维码的状态是 INIT

3. 服务端返回二维码信息给PC端
返回约定好的信息给PC端，我们这里还有APP的跳转链接。
PC端拿到二维码信息后生成二维码展示给用户

4. PC端定时轮询二维码信息 PC端根据二维码的状态做想应的处理，比如：
- 扫码中  ->  置灰二维码，
- 取消    -> 弹框提示和刷新二维码
- 确定登录 -> 拿到token，调取用户信息接口，取消二维码页面
- 过期    -> 弹框提示和刷新二维码

5. 服务端返回此二维码的状态和登录信息

6. 用户使用APP扫描二维码

7. APP解析二维码，获取oauthkey

8. APP使用oauthkey校验二维码信息

9. 查询二维码信息是否有效，是否过期

10. 返回校验结果给到APP
APP根据校验结果，有效就弹出确认框或者取消框，无效就弹框提示

11. 确认登录 
用户在APP上点击确认登录按钮，确认登录

12. 服务端登录逻辑
- 更新二维码状态为确认登录
- 判断APP的用户的登录状态
- 判断登录的设备个数
- 生成token , 记录想应的缓存信息

13. 第4步的轮询接口返回登录token

14. PC端使用token请求获取用户信息，和其他接口

15. 登录完成

***

## 三.代码

### controller

```java
@Slf4j
@RestController
@RequestMapping(value = "/user/qrcode")
@Api(tags = "WEB端扫码API")
public class ScanQrcodeLoginController {
    @Autowired
    private ScanQrcodeLoginService scanQrcodeLoginService;

    /**
     * 获取二维码链接和信息
     */
    @ApiOperation(value = "获取二维码链接和信息")
    @GetMapping(value = "/info")
    public ResultResponse<LoginUrlVO> getQrcodeInfo(){
        return ResultResponse.success(scanQrcodeLoginService.getQrcodeInfo());
    }

    /**
     * 获取二维码扫描状态
     */
    @ApiOperation(value = "获取二维码扫描状态")
    @GetMapping(value = "/state")
    public ResultResponse<QrcodeStateVO> getQrcodeState(@RequestParam(value = "oauthKey") String oauthKey){
        return ResultResponse.success(scanQrcodeLoginService.getQrcodeState(oauthKey));
    }
}


@Slf4j
@RestController
@RequestMapping(value = "/user/app/qrcode")
@Api(tags = "APP端扫码API")
public class AppScanQrcodeLoginController extends BaseController {
    @Autowired
    private ScanQrcodeLoginService scanQrcodeLoginService;

    /**
     * 二维码扫描
     */
    @ApiOperation(value = "二维码扫描")
    @GetMapping(value = "/scan")
    public ResultResponse<QrcodeScanResultVO> scan(@RequestParam(value = "oauthKey") String oauthKey){
        Long userId = getCurrentUserId(false);
        return ResultResponse.success(scanQrcodeLoginService.scan(oauthKey, userId));
    }

    /**
     * 二维码取消
     */
    @ApiOperation(value = "二维码取消")
    @GetMapping(value = "/cancel")
    public ResultResponse<QrcodeCancelResultVO> cancel(@RequestParam(value = "oauthKey") String oauthKey){
        Long userId = getCurrentUserId(true);
        return ResultResponse.success(scanQrcodeLoginService.cancel(oauthKey, userId));
    }

    /**
     * 二维码确定登录
     */
    @ApiOperation(value = "二维码确定登录")
    @GetMapping(value = "/confirm")
    public ResultResponse<QrcodeConfirmResultVO> confirm(@RequestParam(value = "oauthKey") String oauthKey){
        Long userId = getCurrentUserId(true);
        return ResultResponse.success(scanQrcodeLoginService.confirm(oauthKey, userId));
    }
}

@Slf4j
@RestController
@RequestMapping(value = "/user/web/login")
@Api(tags = "WEB端-登录接口")
public class WebLoginController extends BaseController {

    @Autowired
    private WebUserLoginService webUserLoginService;

    /**
     * 获取登录用户信息
     */
    @ApiOperation(value = "获取登录用户信息")
    @GetMapping(value = "/info")
    public ResultResponse<WebUserInfoVo> getWebUserInfo() {
        Long userId = getCurrentUserId(true);
        return ResultResponse.success(webUserLoginService.getWebUserInfo(userId));
    }

    /**
     * 退出登录
     */
    @ApiOperation(value = "退出登录")
    @GetMapping(value = "/logout")
    public ResultResponse<Void> webLogout() throws UserRequestParameterException {
        Long userId = getCurrentUserId(true);
        String token = HttpUtils.getToken();
        log.info("web logout userId: {}, token: {}", userId, token);
        webUserLoginService.webLogout(userId, token);
        return ResultResponse.success();
    }
}
```

### service

```java
@Service
@Slf4j
public class ScanQrcodeLoginServiceImpl implements ScanQrcodeLoginService {

    @Autowired
    private OauthKeyHelp oauthKeyHelp;

    @Autowired
    private WebLoginConfig webLoginConfig;

    @Autowired
    private RedissonClient redissonClient;

    @Override
    public LoginUrlVO getQrcodeInfo() {
        String oauthKey = UUID.randomUUID().toString().replaceAll("-", "");
        LoginUrlVO loginUrlVO = new LoginUrlVO();
        loginUrlVO.setOauthKey(oauthKey);
        loginUrlVO.setUrl(webLoginConfig.getQrcodeUrl() + oauthKey);
        oauthKeyHelp.init(oauthKey);
        return loginUrlVO;
    }

    @Override
    public QrcodeStateVO getQrcodeState(String oauthKey) {
        QrcodeStateVO stateVO = new QrcodeStateVO();
        if (!oauthKeyHelp.verify(oauthKey)) {
            stateVO.setStatus(QrcodeStatus.EXPIRE.getStatus());
            return stateVO;
        }
        OauthTicket oauthTicket = oauthKeyHelp.getStatus(oauthKey);
        if (Objects.isNull(oauthTicket)) {
            stateVO.setStatus(QrcodeStatus.EXPIRE.getStatus());
            return stateVO;
        }
        stateVO.setStatus(oauthTicket.getStatus());
        stateVO.setJwtToken(oauthTicket.getToken());
        stateVO.setUserId(oauthTicket.getUserId());
        return stateVO;
    }

    @Override
    public QrcodeScanResultVO scan(String oauthKey, Long userId) {
        QrcodeScanResultVO resultVO = new QrcodeScanResultVO();
        if (!oauthKeyHelp.verify(oauthKey)) {
            resultVO.setStatus(Boolean.FALSE);
            return resultVO;
        }
        oauthKeyHelp.scan(oauthKey, userId);
        resultVO.setStatus(Boolean.TRUE);
        return resultVO;
    }

    @Override
    public QrcodeCancelResultVO cancel(String oauthKey, Long userId) {
        QrcodeCancelResultVO resultVO = new QrcodeCancelResultVO();
        if (!oauthKeyHelp.verify(oauthKey)) {
            resultVO.setStatus(Boolean.FALSE);
            return resultVO;
        }
        oauthKeyHelp.cancel(oauthKey);
        resultVO.setStatus(Boolean.TRUE);
        return resultVO;
    }

    @Override
    public QrcodeConfirmResultVO confirm(String oauthKey, Long userId) {
        QrcodeConfirmResultVO resultVO = new QrcodeConfirmResultVO();
        String lockKey = "web:user:login:lock:oauthKey:" + oauthKey;
        RLock lock = redissonClient.getLock(lockKey);
        try {
            if (lock.isLocked() && !lock.isHeldByCurrentThread()) {
                resultVO.setStatus(Boolean.FALSE);
                return resultVO;
            }
            lock.lock(10, TimeUnit.SECONDS);

            OauthTicket oauthTicket = oauthKeyHelp.getStatus(oauthKey);
            if (Objects.isNull(oauthTicket) || (Objects.equals(QrcodeStatus.CONFIRM.getStatus(), oauthTicket.getStatus()) || Objects.equals(QrcodeStatus.EXPIRE.getStatus(), oauthTicket.getStatus()))) {
                resultVO.setStatus(Boolean.FALSE);
                return resultVO;
            }
            resultVO.setStatus(Boolean.TRUE);
            // 登录逻辑，自己实现
            String token = getToken(userId, oauthTicket);
            oauthKeyHelp.confirm(oauthKey, userId, token);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            resultVO.setStatus(Boolean.FALSE);
            return resultVO;
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
        return resultVO;
    }
}


@Component
@Slf4j
public class OauthKeyHelp {
    @Autowired
    private RedisTemplate redisTemplate;

    @Autowired
    private WebLoginConfig webLoginConfig;

    private static final Integer TIME_OUT = 300;

    private static final String REDIS_KEY_PREFIX = "qrcode:%s";

    private static final String HASH_FIELD_OAUTH_KEY = "oauthKey";

    private static final String HASH_FIELD_USERID = "userId";

    private static final String HASH_FIELD_STATUS = "status";

    private static final String HASH_FIELD_TOKEN = "token";


    private String redisKey(String oauthKey){
        return String.format(REDIS_KEY_PREFIX, oauthKey);
    }

    public void init(String oauthKey){
        add(oauthKey, null, QrcodeStatus.INIT.getStatus(), null);
    }

    public void scan(String oauthKey, Long userId){
        add(oauthKey, userId, QrcodeStatus.SCANNING.getStatus(), null);
    }

    public void cancel(String oauthKey){
        add(oauthKey, null, QrcodeStatus.CANCEL.getStatus(), null);
    }

    public void confirm(String oauthKey, Long userId, String token){
        add(oauthKey, userId, QrcodeStatus.CONFIRM.getStatus(), token);
    }

    public Boolean verify(String oauthKey){
        return redisTemplate.hasKey(redisKey(oauthKey));
    }

    public OauthTicket getStatus(String oauthKey){
        Map<String, Object> map = redisTemplate.opsForHash().entries(redisKey(oauthKey));
        if (map.isEmpty()){
            return null;
        }
        return JSONObject.parseObject(JSONObject.toJSONString(map), OauthTicket.class);
    }

    public void add(String oauthKey, Long userId, Integer status, String token){
        String redisKey = redisKey(oauthKey);
        Map<String, Object> map = Maps.newHashMapWithExpectedSize(3);
        map.put(HASH_FIELD_OAUTH_KEY, oauthKey);
        map.put(HASH_FIELD_STATUS, status);
        if (Objects.nonNull(userId)){
            map.put(HASH_FIELD_USERID, userId);
        }
        if (Objects.nonNull(token)){
            map.put(HASH_FIELD_TOKEN, token);
        }
        redisTemplate.opsForHash().putAll(redisKey, map);
        if (QrcodeStatus.INIT.getStatus().equals(status)){
            redisTemplate.expire(redisKey, TIME_OUT, TimeUnit.SECONDS);
            redisTemplate.expire(redisKey, webLoginConfig.getQrcodeTimeout(), TimeUnit.SECONDS);
        }
    }
}


@AllArgsConstructor
@NoArgsConstructor
public enum QrcodeStatus {
    INIT(1, "初始状态"),
    SCANNING(2, "扫码中"),
    CANCEL(3, "取消"),
    CONFIRM(4, "确定登录"),
    EXPIRE(5, "过期");

    /**
     * 状态
     */
    @Getter
    private Integer status;

    /**
     * 描述
     */
    @Getter
    private String remark;
}

```

***

# 五.其他思考

### 轮询和websocket

#### 轮询
前端每隔固定时间向后台发送一次请求，查询新数据

优点：

- 实现简单
- 没有兼容性问题

缺点:
- 延迟，需要固定的轮询时间，不一定是实时数据
- 大量耗费服务器内存和宽带资源，因为不停的请求服务器，很多时候 并没有新的数据更新，因此绝大部分请求都是无效请求


#### Websocket
Webscoket是Web浏览器和服务器之间的一种全双工通信协议，其中WebSocket协议由IETF定为标准，WebSocket API由W3C定为标准。一旦Web客户端与服务器建立起连接，之后的全部数据通信都通过这个连接进行。通信过程中，可互相发送JSON、XML、HTML或图片等任意格式的数据。

- 传统的http请求，其并发能力都是依赖同时发起多个TCP连接访问服务器实现的(因此并发数受限于浏览器允许的并发连接数)，而websocket则允许我们在一条ws连接上同时并发多个请求，即在A请求发出后A响应还未到达，就可以继续发出B请求。由于TCP的慢启动特性（新连接速度上来是需要时间的），以及连接本身的握手损耗，都使得websocket协议的这一特性有很大的效率提升。
- http协议的头部太大，且每个请求携带的几百上千字节的头部大部分是重复的，很多时候可能响应都远没有请求中的header空间大。如此多无效的内容传递是因为无法利用上一条请求内容，websocket则因为复用长连接而没有这一问题。
- websocket支持服务器推送消息，这带来了及时消息通知的更好体验，也是ajax请求无法达到的。

缺点
- 服务器长期维护长连接需要一定的成本
- 各个浏览器支持程度不一
- websocket 是长连接，受网络限制比较大，需要处理好重连，比如用户进电梯或电信用户打个电话网断了，这时候就需要重连
