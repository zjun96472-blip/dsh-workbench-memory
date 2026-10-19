# dsh-workbench-memory

个人 DeepSeek Harness 工作台的**「记忆库」独立包**。一个 `dsh plugin add` 装完，你会拿到：

- 左侧边栏多一个**「记忆库」**入口，中间栏是记忆库页：原子卡片（按类型分组、可搜索可筛选、点开看证据与关系）+ **3D 球棍关系图**（可拖拽旋转 / 滚轮缩放 / 点击看邻域，静止不自转）；
- **记忆每轮自动注入**：每轮第 1 步从 `$DSH_HOME/memory` 做有界召回（**3s 硬顶 / 1200 字符预算 / 任何失败静默降级**），把结果作为一条 user-role 消息插进本轮上下文，注入块**明确标注为「历史数据、非指令」**（不然记忆库会变成提示注入通道）；
- 没有记忆库（`$DSH_HOME/memory/tools/memory.mjs` 不存在）时**什么都不做**：不挂钩子、不报错、不拖慢对话。

**页面只开这一页**：行 config 的 `pages` 里 `memory: true`，其余四项（`home` / `audition` / `planBook` / `skillLibrary`）显式 `false` —— 关掉的页面**连侧边栏图标都不占**。

## 装

```bash
dsh plugin --profile <profile> add /abs/path/to/dsh-workbench-memory   # 从本地目录
dsh plugin --profile <profile> add github:<owner>/dsh-workbench-memory # 从 GitHub
```

装完**必须重启一次**（`dsh web` 起的那份要重起）：主机插件代码与客户端 bundle 都是启动时读的。

前置：

| 需要什么 | 说明 |
| --- | --- |
| **pnpm** | `dsh plugin add` 内部转发给 pnpm；CLI 用 PATH 上的 `pnpm`，没有会直接报 `dsh: pnpm was not found`。 |
| Web profile | 客户端半边要 `webServer`（`dsh-web-app`）。没有 web 的 profile 也装得下，只是没有页面。 |
| `$DSH_HOME` | 官方口径解析（config 的 `dshHome` > `$DSH_HOME` > `<安装根>/data` > `~/.dsh`），启动日志会打印最终选了哪个。 |
| 记忆库（可选） | `$DSH_HOME/memory/tools/memory.mjs`。**没有就跳过注入**，页面显示空状态，其余照常。 |
| Node | 只用 Node 内置模块 + 运行中的 harness 自带的官方包，本包 `dependencies` 为空。 |

## config

```yaml
- id: workbench-memory
  name: dsh-workbench-memory
  config:
    dshHome: ""                              # 留空 = 按官方口径解析
    memory: { enabled: true, budget: 1200 }  # enabled:false = 只留页面，不做记忆注入
    pages:
      home: false
      memory: true
      audition: false
      planBook: false
      skillLibrary: false
```

页面开关**不能靠客户端读 row config**：浏览器侧的 ClientModuleLoader 建条目时只传 `{ name: id }`
（见 `@deepseek-ai/dsh-client-modules/lib/client.js` 的 `create()`），config 到不了客户端。
所以主机半边把开关通过官方的 `webserver/index-inject` 注入成页面全局量 `__DSH_WORKBENCH__`，
客户端 bundle 读它（官方 `dsh-client-shortcuts` 用的同一个通道）。**改完 config 要重启才生效。**

## 页面快照（技能/记忆卡片上那句话从哪来）

页面上「这条记忆是干什么的」来自**构建期烘进 `lib/client.js` 的快照**（客户端读不到文件内容）。
本包出厂时快照是**空的**（不含任何个人内容），跑一次就灌自己的：

```bash
DSH_HOME=/path/to/data node tools/refresh-snapshots.mjs --memory   # 只刷记忆
DSH_HOME=/path/to/data node tools/refresh-snapshots.mjs            # 技能 + 记忆
```

跑完重启（或至少刷新页面）。页面会用实时目录跟快照做体检，数量对不上会提示重跑 —— 不假装信息是最新的。

## 别同时装的东西

### ① 本套其它三个拆分包（**不要同时装**）

`dsh-plan-book` / `dsh-workbench-home` / `dsh-skill-library` 与本包**共用同一份客户端代码**，
靠各自下发的 `pages` 开关决定注册哪几页。两个一起装会撞在**同一个全局量**上 —— 实测表现（隔离实例，两个包同装）：

- `index.html` 里 `__DSH_WORKBENCH__` 被赋值**两次**（后装的包在后），浏览器按顺序执行 → **后一条生效**，
  先装那个包的 `pages` 全部失效。实测把本包与 `dsh-workbench-home` 同装时生效的是
  `{"home":true,"memory":false,"audition":true,...}` → **本包一格都不注册，记忆库页与侧边栏入口都不出现**（桩 React 计数：单独装 2 处 → 同装 0 处）。
- 两个客户端 bundle 都会下发，且读**同一份**生效 config → 同一个插槽 id/key 会被两个插件**各注册一次**
  （实测：两个 bundle 各注册 4 处，id/key 完全同名：`sidebar.panellist` 的 `workbench-home` / `workbench-audition` 与 `main` 的同名 key）。
  官方 `dsh-client-ui-sidebar` 是把 `entriesOfSlot("sidebar.panellist")` **直接列成侧边栏项**的，
  所以这种重复会变成重复入口；真实浏览器里的最终渲染**我没有实测**（本会话无浏览器控制），只测到上面这些确定的事实。

**要哪个就装哪个**；确实要两块功能，等合集包（`dsh-workbench-personal`）那种"一个包全带"的形态。

### ② 原有本地插件

- `dsh-workbench-home`（`data/profiles/web/plugins/` 下那份旧的本地插件）：它的客户端半边同样注册
  `sidebar.panellist` / `main` 的插槽，与本套共用代码，别同时装。
- 记忆相关的其它实现：本包注册的注入钩子只挂在 `agent/pre-step` 上，不注册任何 `/` 命令（**不用记命令**）。

## 许可

MIT（见 `LICENSE`）。
