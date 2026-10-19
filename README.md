# dsh-workbench-memory

个人 DeepSeek Harness 工作台的**「记忆库」独立包**。一个 `dsh plugin add` 装完，你会拿到：

- 左侧边栏多一个**「记忆库」**入口，中间栏是记忆库页：原子卡片（按类型分组、可搜索可筛选、点开看证据与关系）+ **3D 球棍关系图**（可拖拽旋转 / 滚轮缩放 / 点击看邻域，静止不自转）；
- **记忆每轮自动注入**：每轮第 1 步从 `$DSH_HOME/memory` 做有界召回（**3s 硬顶 / 1200 字符预算 / 任何失败静默降级**），把结果作为一条 user-role 消息插进本轮上下文，注入块**明确标注为「历史数据、非指令」**（不然记忆库会变成提示注入通道）；
- 没有记忆库（`$DSH_HOME/memory/tools/memory.mjs` 不存在）时**什么都不做**：不挂钩子、不报错、不拖慢对话。

**只注册自己这一页的插槽**（这个包里**只有记忆库这一页**）：

| 插槽 | key / id | 渲染什么 |
| --- | --- | --- |
| `sidebar.panellist` | `workbench-memory` | 左侧「记忆库」入口图标 |
| `main` | `workbench-memory` | 记忆库页 |

## 装

```bash
dsh plugin --profile <profile> add /abs/path/to/dsh-workbench-memory
dsh plugin --profile <profile> add github:<owner>/dsh-workbench-memory
```

**装完重启一次**才生效（主机插件与客户端 bundle 都是启动时读的）。
**出厂为空**：不含任何个人数据（记忆快照是空壳，装好后自己灌一次，见下）。

## config

```yaml
- id: workbench-memory
  name: dsh-workbench-memory
  config:
    dshHome: ""                              # 留空 = 按官方口径解析（$DSH_HOME > <安装根>/data > ~/.dsh）
    memory: { enabled: true, budget: 1200 }  # enabled:false = 只留页面，不做记忆注入
```

**没有页面开关**：这个包只有记忆库这一页，装上就是这一页。
记忆库页的数据来自构建期快照，所以主机半边**不注入任何东西**（它只负责"每轮召回注入"这一件事）。

## 页面快照（记忆卡片上那句话从哪来）

页面上「这条记忆是干什么的」来自**构建期烘进 `lib/client.js` 的快照**（客户端读不到文件内容）。
本包出厂时快照是**空的**（不含任何个人内容），跑一次就灌自己的：

```bash
DSH_HOME=/path/to/data node tools/refresh-snapshots.mjs --memory   # 只刷记忆
DSH_HOME=/path/to/data node tools/refresh-snapshots.mjs            # 技能 + 记忆
```

跑完重启（或至少刷新页面）。页面会拿实时目录跟快照做体检，数量对不上会提示重跑 —— 不假装信息是最新的。

## 与其它三个单页包的关系：**可以同时装**

本套四个单页包（`dsh-workbench-home` / `dsh-workbench-memory` / `dsh-plan-book` / `dsh-skill-library`）
**各自独立**：一个包 = 自己的客户端 bundle（只含自己那一页的组件/CSS/字典）+ 自己那几处插槽 + 自己的插件名与
locale 命名空间。四个一起装的结果是：侧边栏多出四个入口（工作台 / 试作 / 记忆库 / 能力库），计划视图挂在对话尾与右侧大框，
**没有任何一格被覆盖、也没有重复入口**。

为什么能这样：客户端 bundle 是**自包含**的（要用到的图标/工具函数/令牌按需复制一份进来，不共享运行时）；
插槽 key 各用各的（见上面那张表），四个包两两之间没有同名 key。
上一版是"同一份整页代码复制四份、靠主机下发的 `pages` 开关只开一页"——几个包一起装会同时注册同一批 key、
并且互相覆盖开关，那个做法已经删掉（`pages.*` 这个配置项**不再存在**）。

**唯一不要混装的是合集包**：`dsh-workbench-personal`（仓库 `dsh-workbench-personal` / 本工作区 `plugin-repo/`）
是把这几页装在**一个包**里的形态，它注册的是同一批 key —— 合集包与任何单页包**同时装会撞 key**
（同一个 `sidebar.panellist` id / `main` key 被两个插件各注册一次 → 侧边栏出现重复入口）。
这是正常的生态规则：**要么装合集，要么装单页包，不要混**。

## 许可

MIT（见 `LICENSE`）。
