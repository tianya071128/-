# 入口和上下文[entry and context]

entry 对象是用于 webpack 查找启动并构建 bundle。其上下文是入口文件所处的目录的绝对路径的字符串。

```javascript
// 默认为 './src'
// 这里应用程序开始执行
// webpack 开始打包
entry: "./app/entry", // string | object | array
entry: ["./app/entry1", "./app/entry2"],
entry: {
  a: "./app/entry-a",
  b: ["./app/entry-b1", "./app/entry-b2"]
},
// webpack 的主目录
// entry 和 module.rules.loader 选项
// 相对于此目录解析
context: __dirname, // string（绝对路径！）
```



## context

`string`

基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader

```javascript
module.exports = {
    //...
    context: path.resolve(__dirname, 'app');
}
```

默认使用当前目录，但是推荐在配置中传递一个值。这使得你的配置独立于 CWD（cuurent working directory - 当前执行路径）。



## entry

`string | [string] | object { <key>: string | [string] } | (function: () => string | [string] | object { <key>: string | [string] })`

起点或是应用程序的起点入口。从这个起点开始，应用程序启动执行。如果传递一个数组，那么数组的每一项都会执行。

**动态加载的模块不是入口起点。**

简单规则：每个 HTML 页面都有一个入口起点。单页应用（SPA）：一个入口起点，多页应用（MPA）：多个入口起点

```javascript
module.exports = {
    //... 
    entry: {
        home: './home.js',
        about: './about.js',
        contact: './contact.js'
    }
}
```



### 命名规则

如果传入一个字符串或字符串数组，chunk 会被命名为 main。如果传入一个对象，则每个键（key）会是 chunk 的名称，该值描述了 chunk 的入口起点。



### 动态入口

如果传递了函数，则将在每个 make 事件上调用该函数。

> 请注意，make 事件在 webpack 启动时触发，并且在监视文件更改时触发每个无效事件。

```javascript
module.exports = {
    //...
    entry: () => './demo',
    // 或者
    entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))
}
```

