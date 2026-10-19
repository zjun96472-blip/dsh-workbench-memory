// dsh-workbench-memory —— 客户端半边（记忆库页）
//
// 页面：左侧「记忆库」入口（原子卡片 + 3D 球棍关系图）。记忆的每轮召回注入在主机半边做。
//
// 本文件**只含自己那一页**的组件、CSS 与字典 —— 客户端 bundle 是自包含的，不与其它包共享运行时
// （要用到的图标/工具函数/令牌按需复制一份进来）。
// 插槽注册只做自己那几处 key（见下面的 apply），所以四个包同时装也不会互相覆盖、不会出现重复入口。
// 模块 id 必须等于包名（加载器按包名 require）；插件名与 locale 命名空间也一包一个，互不重名。
window.__ModuleLoader__.load({
	id: "dsh-workbench-memory",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const h = React.createElement;

		/** 客户端插件名（cordis 插件体 name）：与其它三个包**不重名**。 */
		const PLUGIN_NAME = "workbench-memory";
		/** locale 命名空间：一包一个，字典不互相覆盖。 */
		const LOCALE_NS = "workbench-memory";
		/** 侧边栏入口图标插槽（list）与中间栏面板插槽（keyed）的注册键必须同名。 */
		const PANEL_SLOT = "sidebar.panellist";
		const MAIN_SLOT = "main";
		/** 「记忆库」页的插槽 id / main key。 */
		const PANEL_KEY_MEMORY = "workbench-memory";
		/** 本页数据来自构建期快照（MEMORY_INDEX），不需要主机注入任何路径，也不需要页面开关。 */

		const DICT_ZH = {
			"panel.label": "工作台",
			"mem.panel": "记忆库",
			"mem.crumb": "工作台",
			"mem.sub": "沉淀的判断，按类型浏览；点某类只看那一类。",
			"mem.graph": "关系图",
			"mem.graphTitle": "球棍模型：每个球是一个原子，每根杆是一条关系",
			"mem.atoms": "原子",
			"mem.search": "搜索记忆：关键词 / 标签，例如 重启、客户端插件",
			"mem.clear": "清空搜索",
			"mem.clearSearch": "清空搜索",
			"mem.tagHint": "常用标签（点一下即搜）：",
			"mem.legend": "球色 = 类型 · 灰杆 = 关系（实线/虚线分两族）",
			"mem.graphHint": "拖拽旋转 · 滚轮缩放 · 点一个球看它的邻域",
			"mem.graphAria": "3D 球棍关系图（可拖拽旋转、滚轮缩放、点选原子）",
			"mem.nomatch": "没有匹配的原子",
			"mem.pick": "点一个节点或卡片，看它的证据与关系。",
			"mem.title": "记忆库",
			"mem.hint": "沉淀的判断，按类型浏览；点某类只看那一类。",
			"mem.all": "全部",
			"mem.empty": "这一类还没有原子。",
			"mem.emptyHint": "攒到相关判断后它就会出现；也可以在收尾时让我提候选。",
			"mem.evidence": "证据",
			"mem.source": "出处",
			"mem.relations": "关系",
			"mem.hub": "枢纽原子（关系最多的几条）",
			"mem.edgeUnit": "条关系",
			"mem.generated": "索引生成于",
			"mem.scoreAvg": "均分",
			"mem.scoreHint": "每条原子按四维打 0–10 分（证据×3 · 复用×3 · 范围×2 · 新鲜×1）；分数只决定池内先后，低分只出清理建议，不自动删。",
			"mem.eligHint": "注入资格只看手工 tier 标签（tier1/tier2 才进注入池，tier3 不进）；分数只决定池内排序 —— 徽标上的层级是分数算出的，仅供参考。",
			"mem.scoreDims": "分数",
			"mem.hits": "被使用",
			"mem.scoredUnit": "条已打分",
			"mem.scoreHistory": "历史记录",
			"mem.scoreHistoryUnit": "条",
			"mem.unscored": "未打分",
			"mem.tier.tier1": "tier1 宪法",
			"mem.tier.tier2": "tier2 常用",
			"mem.tier.tier3": "tier3 参考",
			"mem.elig": "注入资格",
			"mem.eligNo": "（不进自动注入）",
			"mem.type.经验": "经验",
			"mem.type.教训": "教训",
			"mem.type.约束": "约束",
			"mem.type.原则": "原则",
			"mem.type.偏好": "偏好",
			"mem.type.决策": "决策",
			"lib.unit": "条",
			"lib.close": "关闭",
		};

		const DICT_EN = {
			"panel.label": "Workbench",
			"mem.panel": "Memory bank",
			"mem.crumb": "Workbench",
			"mem.sub": "Settled judgments, browsed by type; pick a type to see only that one.",
			"mem.graph": "Relation graph",
			"mem.graphTitle": "Ball-and-stick: every ball is an atom, every rod a relation",
			"mem.atoms": "Atoms",
			"mem.search": "Search memories: keyword or tag, e.g. 重启",
			"mem.clear": "Clear search",
			"mem.clearSearch": "Clear search",
			"mem.tagHint": "Common tags (click to search):",
			"mem.legend": "Ball colour = type · grey rod = relation (solid/dashed)",
			"mem.graphHint": "Drag to rotate · scroll to zoom · click a ball to see its neighbourhood",
			"mem.graphAria": "3D ball-and-stick relation graph (drag to rotate, scroll to zoom, click to select an atom)",
			"mem.nomatch": "No matching atoms",
			"mem.pick": "Pick a node or card to see its evidence and relations.",
			"mem.title": "Memory bank",
			"mem.hint": "Settled judgments, browsed by type; pick a type to see only that one.",
			"mem.all": "All",
			"mem.empty": "No atoms in this type yet.",
			"mem.emptyHint": "They appear once related judgments accumulate; or ask me to propose candidates at wrap-up.",
			"mem.evidence": "Evidence",
			"mem.source": "Source",
			"mem.relations": "Relations",
			"mem.hub": "Hub atoms (most relations)",
			"mem.edgeUnit": "relations",
			"mem.generated": "Index built at",
			"mem.scoreAvg": "avg",
			"mem.scoreHint": "Every atom is scored 0–10 on four dimensions (evidence ×3 · reuse ×3 · scope ×2 · freshness ×1); the score only orders atoms inside the pool. Low scores only produce cleanup suggestions — nothing is deleted automatically.",
			"mem.eligHint": "Injection eligibility comes from the manual tier tag only (tier1/tier2 enter the pool, tier3 never does); the score only orders the pool — the tier on a badge is score-derived and for reference only.",
			"mem.scoreDims": "Score",
			"mem.hits": "Used",
			"mem.scoredUnit": "scored",
			"mem.scoreHistory": "history",
			"mem.scoreHistoryUnit": "records",
			"mem.unscored": "unscored",
			"mem.tier.tier1": "tier1 core",
			"mem.tier.tier2": "tier2 common",
			"mem.tier.tier3": "tier3 reference",
			"mem.elig": "Injection",
			"mem.eligNo": " (never auto-injected)",
			"mem.type.经验": "Experience",
			"mem.type.教训": "Lesson",
			"mem.type.约束": "Constraint",
			"mem.type.原则": "Principle",
			"mem.type.偏好": "Preference",
			"mem.type.决策": "Decision",
			"lib.unit": "items",
			"lib.close": "Close",
		};

		/* MEMORY-INDEX:BEGIN —— 由 tools/refresh-snapshots.mjs 生成，勿手改；加/改记忆后重跑本脚本 */
		/* 空壳快照：本包不含任何个人记忆内容；装好后跑 tools/refresh-snapshots.mjs 灌自己的 */
		const MEMORY_INDEX = { generatedAt: "", atoms: [], edges: [], stats: { atoms: 0, edges: 0 } };
		/* MEMORY-INDEX:END */

		const PAGE_CSS = [
			".wbm-page{height:100%;overflow:auto;box-sizing:border-box;padding:34px 38px 56px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",sans-serif)}",
			".wbm-hero{position:relative;display:flex;gap:28px;align-items:flex-start;justify-content:space-between;padding:26px 28px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-panel,16px);background:linear-gradient(135deg,var(--dsw-alias-bg-layer-2,rgba(127,127,127,.06)),transparent 62%);box-shadow:0 1px 2px rgba(0,0,0,.04),0 20px 52px -26px rgba(0,0,0,.3)}",
			".wbm-heroMain{min-width:0}",
			".wbm-crumb{font-size:11px;letter-spacing:.02em;color:var(--dsw-alias-label-secondary)}",
			".wbm-titlerow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:10px}",
			".wbm-title{margin:0;font-size:28px;font-weight:700;letter-spacing:-.01em;line-height:1.15}",
			".wbm-count{font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:3px 10px}",
			".wbm-scorebadge{font-size:11px;font-weight:600;color:var(--dsw-alias-brand-primary);border:1px solid var(--dsw-alias-brand-primary);border-radius:999px;padding:3px 10px}",
			".wbm-tierpill{font-size:11px;font-weight:500;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:3px 10px}",
			".wbm-tierpill-tier1{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}",
			".wbm-scorehint{margin:8px 0 0;font-size:11px;color:var(--dsw-alias-label-secondary)}",
			".wbm-score{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;border-radius:999px;padding:2px 9px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.08))}",
			".wbm-score-tier1{color:var(--dsw-alias-brand-primary)}",
			".wbm-score-tier3{opacity:.72}",
			".wbm-sub{margin:12px 0 0;max-width:58ch;font-size:13px;line-height:1.65;color:var(--dsw-alias-label-secondary)}",
			".wbm-stats{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}",
			".wbm-stat{display:flex;flex-direction:column;gap:2px;align-items:flex-start;min-width:76px;padding:11px 15px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.06));cursor:pointer;transition:border-color 170ms cubic-bezier(.22,.8,.3,1),transform 170ms cubic-bezier(.22,.8,.3,1)}",
			".wbm-stat:hover{border-color:var(--dsw-alias-brand-primary);transform:translateY(-2px)}",
			".wbm-stat.is-on{border-color:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary)}",
			".wbm-statdot{width:6px;height:6px;border-radius:50%}",
			".wbm-statnum{font-size:20px;font-weight:700;line-height:1.1}",
			".wbm-statlabel{font-size:10px;color:var(--dsw-alias-label-secondary)}",
			".wbm-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 20px}",
			".wbm-spacer{flex:1;min-width:8px}",
			".wbm-chip{font:inherit;font-size:11px;font-weight:500;display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);background:transparent;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:5px 12px;cursor:pointer;transition:border-color 170ms,color 170ms}",
			".wbm-chip:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}",
			".wbm-chip.is-on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}",
			".wbm-chipdot{width:6px;height:6px;border-radius:50%}",
			".wbm-searchbar{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin:26px 0 14px}",
			".wbm-searchwrap{display:flex;align-items:center;gap:8px;width:min(560px,100%);padding:8px 12px;border:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1,transparent)}",
			".wbm-searchwrap:focus-within{border-color:var(--dsw-alias-brand-primary)}",
			".wbm-searchicon{flex:none;color:var(--dsw-alias-label-secondary)}",
			".wbm-hits{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
			".wbm-searchclear{flex:none;font:inherit;font-size:14px;line-height:1;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);background:transparent;border:0;border-radius:50%;cursor:pointer}",
			".wbm-searchclear:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary)}",
			".wbm-tagrow{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0}",
			".wbm-tagrowlabel{font-size:10px;color:var(--dsw-alias-label-secondary)}",
			".wbm-tagchip{font:inherit;font-size:11px;color:var(--dsw-alias-label-secondary);background:transparent;border:1px dashed var(--dsw-alias-border-l1);border-radius:999px;padding:3px 10px;cursor:pointer;transition:border-color 160ms,color 160ms}",
			".wbm-tagchip:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}",
			".wbm-tagchip.is-on{border-style:solid;border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}",
			".wbm-emptyhint{margin-top:6px}",
			".wbm-search{font:inherit;font-size:12px;flex:1;min-width:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1,transparent);border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,8px);padding:7px 11px}",
			".wbm-graph{border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-panel,16px);padding:20px 22px 10px;background:var(--dsw-alias-bg-layer-1,transparent);box-shadow:0 1px 2px rgba(0,0,0,.03),0 16px 40px -28px rgba(0,0,0,.26)}",
			".wbm-graphtop{display:flex;flex-direction:column;align-items:flex-start;gap:3px}",
			".wbm-graphtoprow{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}",
			".wbm-listtop{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}",
			".wbm-sectiontitle{font-size:12px;font-weight:600}",
			".wbm-graphtitle{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-size:16px;font-weight:700;line-height:1.4;color:var(--dsw-alias-label-primary)}",
			".wbm-legend{font-size:10px;color:var(--dsw-alias-label-secondary)}",
			".wbm3d-stage{position:relative;margin-top:10px;border:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:var(--dsw-radius-lg,12px);overflow:hidden;background:var(--dsw-alias-bg-module-platform,#f5f6f7)}",
			".wbm3d-canvas{display:block;width:100%;height:min(64vh,600px);touch-action:none;cursor:grab;outline:none}",
			".wbm3d-stage.is-drag .wbm3d-canvas{cursor:grabbing}",
			".wbm3d-canvas:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary)}",
			".wbm3d-hint{position:absolute;left:14px;bottom:11px;font-size:11px;letter-spacing:.02em;color:var(--dsw-alias-label-secondary);pointer-events:none}",
			".wbm3d-keys{position:absolute;right:14px;top:12px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px 12px;max-width:52%;font-size:11px;color:var(--dsw-alias-label-secondary);pointer-events:none}",
			".wbm3d-key{display:inline-flex;align-items:center;gap:5px}",
			".wbm3d-keydot{width:7px;height:7px;border-radius:50%;flex:none;background-image:radial-gradient(circle at 32% 30%,rgba(255,255,255,.75),rgba(255,255,255,0) 62%);box-shadow:inset 0 0 0 .5px rgba(0,0,0,.22)}",
			".wbm-list{margin-top:26px}",
			".wbm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;align-items:start;margin-top:14px}",
			".wbm-card{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px);padding:15px 17px;background:var(--dsw-alias-bg-layer-1,transparent);cursor:pointer;transition:border-color 170ms cubic-bezier(.22,.8,.3,1),transform 170ms cubic-bezier(.22,.8,.3,1),box-shadow 170ms}",
			".wbm-card:hover{border-color:var(--dsw-alias-brand-primary);transform:translateY(-2px);box-shadow:0 1px 2px rgba(0,0,0,.04),0 18px 44px -26px rgba(0,0,0,.3)}",
			".wbm-card.is-on{border-color:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary)}",
			".wbm-cardhead{display:flex;align-items:center;gap:8px;justify-content:space-between}",
			".wbm-type{font-size:10px;font-weight:600;border:1px solid currentColor;border-radius:999px;padding:1px 8px}",
			".wbm-rel{font-size:10px;color:var(--dsw-alias-label-secondary)}",
			".wbm-claim{margin:10px 0 0;font-size:13px;line-height:1.6;overflow-wrap:anywhere}",
			".wbm-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:11px;font-size:10px;color:var(--dsw-alias-label-secondary)}",
			".wbm-tag{border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:1px 7px}",
			".wbm-state{margin-left:auto}",
			".wbm-detail{display:flex;flex-direction:column;gap:7px;margin-top:13px;padding-top:13px;border-top:1px solid var(--dsw-alias-border-l1);font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}",
			".wbm-reltitle{font-size:10px;font-weight:600;color:var(--dsw-alias-label-secondary)}",
			".wbm-relrow{display:flex;gap:8px;align-items:baseline;text-align:left;font:inherit;font-size:12px;background:transparent;border:0;padding:4px 0;cursor:pointer;color:var(--dsw-alias-label-primary)}",
			".wbm-relrow:hover{text-decoration:underline}",
			".wbm-relkind{flex:none;font-size:10px;font-weight:600}",
			".wbm-relclaim{overflow-wrap:anywhere}",
			".wbm-hubs{display:flex;flex-direction:column;gap:5px;margin-top:26px;padding-top:18px;border-top:1px dashed var(--dsw-alias-border-l1)}",
			".wbm-hubrow{display:flex;gap:9px;align-items:baseline;text-align:left;font:inherit;font-size:12px;line-height:1.6;background:transparent;border:0;padding:3px 0;cursor:pointer;color:var(--dsw-alias-label-primary)}",
			".wbm-hubrow:hover{text-decoration:underline}",
			".wbm-hubdeg{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary)}",
			".wbm-empty{margin-top:14px;padding:40px 22px;text-align:center;font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);border:1px dashed var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px)}",
			".wbm-note{margin-top:20px;font-size:10px;color:var(--dsw-alias-label-secondary)}",
			"@media (max-width:960px){.wbm-page{padding:22px 18px 40px}.wbm-hero{flex-direction:column;gap:18px}.wbm-stats{justify-content:flex-start}.wbm-grid{grid-template-columns:1fr}}",
			"@media (prefers-reduced-motion:reduce){.wbm-stat,.wbm-card,.wbm-chip{transition:none}.wbm-stat:hover,.wbm-card:hover{transform:none}}",
		].join("\n");

		/** 图标：记忆库（节点 + 连线）。 */
		function GraphIcon(props) {
			// 侧边栏会传 size（与官方图标一致）；页面内图标默认 16。
			const size = props !== undefined && typeof props.size === "number" ? props.size : 16;
			return h(
				"svg",
				{ width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", style: { display: "block" } },
				h("circle", { cx: "12", cy: "6.2", r: "2.6", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }),
				h("circle", { cx: "6.4", cy: "17.2", r: "2.4", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }),
				h("circle", { cx: "17.6", cy: "17.2", r: "2.4", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }),
				h("path", { d: "M10.9 8.5l-2.8 6.3M13.1 8.5l2.8 6.3M8.8 17.2h6.4", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })
			);
		}

		/** 类型配色（低饱和、与官方令牌不冲突）。 */
		const MEM_TYPE_COLORS = { "经验": "#5b8def", "教训": "#e4794c", "约束": "#c4553d", "原则": "#6e7bd9", "偏好": "#3fa98a", "决策": "#a66bd4" };
		/** 关系配色。 */
		const MEM_REL_COLORS = { "同构": "#7c8b9c", "先例": "#3fa98a", "相斥": "#c4553d", "因果": "#e4794c", "通则": "#5b8def", "联想": "#a66bd4", "取代": "#8a8f98" };
		const memTypeColor = (type) => MEM_TYPE_COLORS[type] ?? "#7c8b9c";
		const memRelColor = (rel) => MEM_REL_COLORS[rel] ?? "#7c8b9c";

		/* MEM3D:BEGIN —— 关系图的「球棍模型」引擎（纯函数 + 一块 canvas；零依赖，可整段切片复用）
		 * 为什么自己写：本工作台不许装包 / 不许引 CDN（AGENTS.md），而 DOM 逐点定位在 260+ 个点上会卡，
		 * 所以走 canvas 2D 自投影 —— 每帧只改数字、不动 DOM。
		 * 观感目标（用户验收标准）：像化学课本里的球棍图 —— 实心球 + 直杆键 + 纸面底；**不是**星空。
		 * 明确不要：深空背景 / 雾 / 光晕 / 霓虹 / 自转 / 拿微小散点当星空纹理。
		 * 这段是**自包含**的（只依赖 Math 与入参）：tools/preview-memory-3d.mjs 会把这段原样切下来
		 * 塞进离线预览页截图自审 —— 改这里就等于改预览，两边不会漂移。
		 */

		/** 焦距（世界单位，整体半径约 0.95）：越大越"平"，越小越"广角"。 */
		const MEM3D_FOCAL = 3.4;
		/**
		 * 透视缩放 s 的硬夹取区间（s = focal/(focal − z)，世界半径归一化到 1 时真实值是 0.79–1.31）。
		 * 为什么要夹：s 是**屏幕坐标的乘数**，一旦 z 靠近 focal（或数据被换成没归一化的野值），
		 * s 会爆掉/变负 → 坐标飞到画布外 → 满屏飞线。夹取之后最坏情况只是"某个球大小不对"，
		 * 而不是"整张图被一条线拉穿"。
		 */
		const MEM3D_S_MIN = 0.5;
		const MEM3D_S_MAX = 2.0;
		/** 相机空间深度上限：把 z 归一化成 0..1 的"远近"（只用来分档变暗，不做雾）。 */
		const MEM3D_DEPTH = 1.45;
		/** 初始视角（确定性）。 */
		const MEM3D_VIEW0 = { rotX: -0.24, rotY: 0.72, scale: 1 };
		/** 缩放夹持范围（别让人把球转丢）。 */
		const MEM3D_SCALE_MIN = 0.55;
		const MEM3D_SCALE_MAX = 2.6;
		/** canvas 里取不到 CSS 变量，这里写与 --dsw-font-family 同一套兜底栈。 */
		const MEM3D_FONT = "'PingFang SC','Microsoft YaHei',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

		/** 球的半径分级：有连接的明显更大（度数越高越大），孤立的也在 5px 上下 —— 看得出是个球，不是尘埃。 */
		function mem3dRadius(degree) {
			const d = degree > 0 ? degree : 0;
			return (3.2 + Math.min(d, 6) * 1.15) * (d === 0 ? 1.06 : 1);
		}

		/** "#rrggbb" → [r,g,b]；非法色值退回中性灰。 */
		function mem3dRgb(color) {
			const text = String(color === undefined || color === null ? "" : color);
			if (/^#[0-9a-fA-F]{6}$/.test(text)) {
				return [parseInt(text.slice(1, 3), 16), parseInt(text.slice(3, 5), 16), parseInt(text.slice(5, 7), 16)];
			}
			return [134, 144, 156];
		}

		/** 往中性灰降饱和（浅色主题上不刺眼；六色仍是六色，只是不再荧光）。 */
		function mem3dCalm(color) {
			const base = mem3dRgb(color);
			const mix = [126, 130, 138];
			const k = 0.26;
			const v = [0, 1, 2].map((i) => Math.round(base[i] + (mix[i] - base[i]) * k));
			return [v[0], v[1], v[2]];
		}

		/**
		 * 球面明暗：基色 → 8 档（暗 → 本色 → 亮 → 高光）。
		 * 只往白里调，不往黑里去 —— 浅色主题上"压黑"会把球糊成一团墨点。
		 * @param base - 降饱和后的 `[r,g,b]`。
		 */
		function mem3dShades(base) {
			const out = new Array(8);
			const ink = [0, 1, 2].map((i) => Math.round(base[i] * 0.74));
			for (let band = 0; band < 8; band++) {
				let v = null;
				if (band <= 2) {
					const k = (2 - band) / 2;
					v = [0, 1, 2].map((i) => Math.round(base[i] + (ink[i] - base[i]) * k));
				} else {
					const k = (band - 3) / 4;
					const lit = 0.2 + 0.28 * (band === 7 ? 1 : k);
					v = [0, 1, 2].map((i) => Math.round(base[i] + (255 - base[i]) * lit));
				}
				out[band] = "rgb(" + v[0] + "," + v[1] + "," + v[2] + ")";
			}
			return out;
		}

		/**
		 * 六个类型的轴向（确定性、写死的一张表）：
		 * 上下各一个 + 赤道平面上按 72° 均匀摆五个（含 36° 错位）——**三个轴都有分量**，
		 * 所以整朵结构有厚度，不是一张平面圆环，也不会有一半类型挤在同一个平面上。
		 */
		function mem3dAxis(i) {
			const TAN = 0.7265425;   // tan36°，赤道环的轻微倾斜
			const axes = [
				[0, 0, 1],
				[0, 0, -1],
				[Math.sin(0.6283185307), Math.cos(0.6283185307), TAN],
				[Math.sin(1.2566370614), Math.cos(1.2566370614), -TAN],
				[Math.sin(1.8849555922), Math.cos(1.8849555922), TAN],
				[Math.sin(2.5132741229), Math.cos(2.5132741229), -TAN]
			];
			const a = axes[Math.abs(Math.round(i)) % axes.length];
			const len = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
			return { x: a[0] / len, y: a[1] / len, z: a[2] / len };
		}

		/** 确定性散列 0..1（替代随机数：同一份数据每次都长一样，刷新不跳）。 */
		function mem3dHash(n, salt) {
			const x = Math.sin(n * 12.9898 + salt * 78.233 + 4.14) * 43758.5453;
			return x - Math.floor(x);
		}

		/**
		 * 确定性 3D 球棍布局：**按类型分簇的实心分子团**。
		 * 每条边把两端往中间拉 → 有连接的原子自己聚成分子；类型心撑开 → 跨类边连成更大的结构；
		 * 孤立原子往簇心收成小团（不是撒成星空）。全程无随机（只有确定性散列）→ 刷新不跳（本仓库铁律）。
		 * @param atoms - 原子数组（当前筛选后的）。
		 * @param edges - 边数组（两端都在 atoms 里）。
		 * @param colorOf - `(atom) => "#rrggbb"`（由调用方注入，避免两处配色漂移）。
		 * @param relColorOf - `(rel) => "#rrggbb"`（球棍模型的杆是中性灰，这里只用来分粗细）。
		 * @returns 模型：定长类型化数组（**只在这里分配一次，之后每帧复用**）。
		 */
		function mem3dBall(atoms, edges, colorOf, relColorOf) {
			const count = atoms.length;
			const edgeCount = edges.length;
			const idIndex = new Map();
			const ids = new Array(count);
			const base = new Float32Array(count);
			const deg = new Int16Array(count);
			const rgb = new Float32Array(count * 3);
			const shades = new Array(count);
			const xs = new Float32Array(count);
			const ys = new Float32Array(count);
			const zs = new Float32Array(count);
			const eFrom = new Int32Array(edgeCount);
			const eTo = new Int32Array(edgeCount);
			const eWidth = new Float32Array(edgeCount);
			const eDash = new Uint8Array(edgeCount);
			atoms.forEach((atom, i) => {
				idIndex.set(atom.id, i);
				ids[i] = atom.id;
				const calm = mem3dCalm(colorOf(atom));
				rgb[i * 3] = calm[0];
				rgb[i * 3 + 1] = calm[1];
				rgb[i * 3 + 2] = calm[2];
				shades[i] = mem3dShades(calm);
			});
			edges.forEach((edge, j) => {
				const a = idIndex.has(edge.from) ? idIndex.get(edge.from) : -1;
				const b = idIndex.has(edge.to) ? idIndex.get(edge.to) : -1;
				eFrom[j] = a;
				eTo[j] = b;
				if (a >= 0 && b >= 0) {
					deg[a] += 1;
					deg[b] += 1;
				}
				// 杆是中性灰（不用关系的彩虹色），只按关系类型分**两族**：粗实线（结构性的关系）
				// 与细虚线（弱连接）。relColorOf 仍然叫一次，是为了保持调用方注入配色的契约不变。
				void relColorOf(edge.rel);
				const weak = edge.rel === "相斥" || edge.rel === "取代" || edge.rel === "联想";
				eWidth[j] = weak ? 1.6 : 2.4;
				eDash[j] = weak ? 1 : 0;
			});
						// —— 布点：**按类型分锥**（一个类型 = 一根从中心往外辐射的锥），不是按连通分量分团 ——
			// 为什么改：这份数据里 327 条边把 264 个原子连成**一个**连通分量，其中 188 条是跨类型的。
			// 老写法"一个连通分量 = 一个分子、一个分子占一个锥位"于是退化成"全体共用一根锥"：类型信息在布点
			// 阶段就丢了，接着的弹簧松弛再把六类揉进同一小团（实测最小质心夹角 2.2°、同类/全体均距 0.979、
			// 质心半径只剩 0.08–0.27，六类成了一坨）。新写法把**类型放回第一位**：原子落在哪根锥里由它的类型定。
			// 关键性质：键要短，跨类型的两端**各自沿自己那根锥往里收**就够了 —— 不必跑到别的类型的地盘上。
			// 于是"键短"与"类型分得开"在这里不打架（老写法里二者不可能同时成立：一个分子只有一根锥）。
			const groups = new Map();
			atoms.forEach((atom, i) => {
				if (!groups.has(atom.type)) groups.set(atom.type, []);
				groups.get(atom.type).push(i);
			});
			const typeNames = [...groups.keys()];
			const typeCount = Math.max(1, typeNames.length);
			// —— 类型 → 方向：按"关系密度"分配 ——
			// 跨类型的键要短，那么**关系最密的两个类型就该摆在夹角最小的两根轴上**（否则它们的键会横穿整朵结构）。
			// 六个方向只有 720 种摆法：全枚举，取"按边数加权的夹角和"最小的那一种。纯算术、确定性（不随刷新变）。
			const typeIndex = new Map(typeNames.map((type, ti) => [type, ti]));
			const affinity = typeNames.map(() => new Float64Array(typeCount));
			for (let j = 0; j < edgeCount; j++) {
				const a = eFrom[j];
				const b = eTo[j];
				if (a < 0 || b < 0) continue;
				const ia = typeIndex.get(atoms[a].type);
				const ib = typeIndex.get(atoms[b].type);
				if (ia === ib) continue;
				affinity[ia][ib] += 1;
				affinity[ib][ia] += 1;
			}
			const axisDirs = [];
			for (let i = 0; i < typeCount; i++) axisDirs.push(mem3dAxis(i));
			const angleOf = (p, q) => Math.acos(Math.max(-1, Math.min(1, p.x * q.x + p.y * q.y + p.z * q.z)));
			const slots = [];
			for (let i = 0; i < typeCount; i++) slots.push(i);
			let bestOrder = slots.slice();
			let bestCost = Infinity;
			const walk = (k) => {
				if (k === slots.length) {
					let cost = 0;
					for (let i = 0; i < slots.length; i++) {
						for (let j = i + 1; j < slots.length; j++) cost += affinity[i][j] * angleOf(axisDirs[slots[i]], axisDirs[slots[j]]);
					}
					if (cost < bestCost - 1e-9) {
						bestCost = cost;
						bestOrder = slots.slice();
					}
					return;
				}
				for (let i = k; i < slots.length; i++) {
					const held = slots[k];
					slots[k] = slots[i];
					slots[i] = held;
					walk(k + 1);
					const back = slots[k];
					slots[k] = slots[i];
					slots[i] = back;
				}
			};
			walk(0);
			// 密度 → 形状参数（纯函数，便于自审与量尺）：边越多，锥越"硬"（收拢力越大），类与类也拉得越开
			const shape = mem3dShape(edgeCount, count);
			const axisX = new Float32Array(count);
			const axisY = new Float32Array(count);
			const axisZ = new Float32Array(count);
			const homeRho = new Float32Array(count);
			/** 把"绕 +Z 轴的锥面点"旋到某个类型的轴向：罗德里格斯公式（纯算术，无随机）。 */
			const tilt = (dir, ux, uy, uz) => {
				const d = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z) || 1;
				const ax = dir.x / d;
				const ay = dir.y / d;
				const az = dir.z / d;
				// +Z → ax,ay,az 轴的旋转矩阵（az = −1 的退化情形单独处理）
				if (az < -0.999999) return { x: ux, y: -uy, z: -uz };
				const k = 1 / (1 + az);
				return {
					x: ax * uz + (1 - ax * ax * k) * ux - ax * uy,
					y: ay * uz - ay * ax * k * ux + (1 - ay * ay * k) * uy,
					z: (1 - az * az * k) * uz - az * ax * k * ux - az * ay * k * uy
				};
			};
			typeNames.forEach((type, ti) => {
				const dir = typeCount === 1 ? { x: 0, y: 0, z: 1 } : axisDirs[bestOrder[ti]];
				// 度数高的先摆：枢纽落在锥的"脊"上（靠近轴 → 也靠近中心，跨类型的键最容易在这里接上），
				// 叶子铺到锥的外缘。排序确定性（度数降序、同度按下标）→ 刷新不跳。
				const members = groups.get(type).slice().sort((a, b) => deg[b] - deg[a] || a - b);
				// 锥的半角按这一类的份额定（大类占宽一点、小类收窄），但绝不宽到吃掉邻居的方向。
				// 太窄（细射线）：点云被拉成"六根射线"，中位点对距离掉下来、键就相对变长（实测中位只有 0.75）；
				// 太宽（大扇面）：同类摊得太散，"同类比"又上去了。下面这个 sqrt 份额是量尺扫出来的平衡点。
				const cone = Math.min(shape.coneMax, shape.coneMin + shape.coneScale * Math.pow(members.length / Math.max(1, count), shape.conePow));
				members.forEach((i, k) => {
					const ring = Math.sqrt((k + 0.5) / members.length);       // 0..1：锥心 → 锥缘（面积均匀）
					const phi = k * 2.3999632297 + ti * 0.7853981634;         // 黄金角：同类内部不扎堆
					const cw = Math.cos(cone * ring);
					const sw = Math.sin(cone * ring);
					const local = { x: Math.cos(phi) * sw, y: Math.sin(phi) * sw, z: cw };
					const turned = tilt(dir, local.x, local.y, local.z);
					// 半径：一半按"度数序"（枢纽靠近锥心 → 也靠近全图中心，跨类型的键在这里接得上），
					// 一半按与角度**去相关**的低差异序列（锥铺满 → 有厚度、不是一层空壳）。
					const u = (k * 0.7548776662466927 + ti * 0.3183098862 + 0.5) % 1;
					const rad = shape.radMix * ((k + 0.5) / members.length) + (1 - shape.radMix) * u;
					const rho = shape.inner + (shape.outer - shape.inner) * (0.12 + 0.88 * rad);
					xs[i] = turned.x * rho;
					ys[i] = turned.y * rho;
					zs[i] = turned.z * rho;
					axisX[i] = dir.x;
					axisY[i] = dir.y;
					axisZ[i] = dir.z;
					homeRho[i] = rho;
				});
			});
			// —— 松开：确定性的"球不相撞"松弛 ——
			// 布点只保证"类型在正确的锥里"；球与球还叠着，杆会看不见。这里用**网格近邻**（不是 O(n²) 全配对）
			// 做几轮互相推开，同时让键把两端拉近、让类型收拢力把原子按回自己的锥 —— 三股力都是纯算术、无随机
			// → 同一份数据每次得到同一朵结构，刷新不跳。
			const gaps = new Float32Array(count);
			for (let i = 0; i < count; i++) gaps[i] = deg[i] > 0 ? shape.gapLinked : shape.gapLone;
			const crossEdge = new Uint8Array(edgeCount);
			for (let j = 0; j < edgeCount; j++) {
				const a = eFrom[j];
				const b = eTo[j];
				crossEdge[j] = a >= 0 && b >= 0 && atoms[a].type !== atoms[b].type ? 1 : 0;
			}
			const CELL = 0.24;
			const grid = new Map();
			const cellOf = (v) => Math.floor(v / CELL);
			// 网格键用**整数**而不是字符串：每轮要重建 count 次、每点再查 27 格，字符串拼键是这里最大的一笔开销。
			// 整数键让同样的 160+ 轮松弛比老写法（140 轮 + 字符串键）还快（见 tools/measure-memory-3d.mjs 的耗时）。
			// 进制要够宽：每维给 4096 档（±2048 格 = ±490 世界单位，远超构图半径），否则会撞键
			const keyOf = (a, b, c) => (a + 2048) * 16777216 + (b + 2048) * 4096 + (c + 2048);
			for (let pass = 0; pass < shape.passes; pass++) {
				grid.clear();
				for (let i = 0; i < count; i++) {
					const key = keyOf(cellOf(xs[i]), cellOf(ys[i]), cellOf(zs[i]));
					const held = grid.get(key);
					if (held === undefined) grid.set(key, [i]);
					else held.push(i);
				}
				const fx = new Float32Array(count);
				const fy = new Float32Array(count);
				const fz = new Float32Array(count);
				for (let i = 0; i < count; i++) {
					const gx = cellOf(xs[i]);
					const gy = cellOf(ys[i]);
					const gz = cellOf(zs[i]);
					for (let a = -1; a <= 1; a++) {
						for (let b = -1; b <= 1; b++) {
							for (let c = -1; c <= 1; c++) {
								const held = grid.get(keyOf(gx + a, gy + b, gz + c));
								if (held === undefined) continue;
								for (const j of held) {
									if (j <= i) continue;
									const want = (gaps[i] + gaps[j]) * 0.78;
									const dx = xs[j] - xs[i];
									const dy = ys[j] - ys[i];
									const dz = zs[j] - zs[i];
									const dist2 = dx * dx + dy * dy + dz * dz;
									if (dist2 >= want * want || dist2 < 1e-9) continue;
									const dist = Math.sqrt(dist2);
									const push = ((want - dist) / dist) * 0.5;
									fx[i] -= dx * push;
									fy[i] -= dy * push;
									fz[i] -= dz * push;
									fx[j] += dx * push;
									fy[j] += dy * push;
									fz[j] += dz * push;
								}
							}
						}
					}
				}
				// 键的两端互相吸引（杆的长短决定分子的形状；但别短到把球叠起来）。
				// **同类型**的键走常规弹簧（两端对拉，锥内更紧）。
				// **跨类型**的键也拉，但拉得**轻**（shape.cross）：它一边把键拉短，一边被"按回自己那根锥轴"的
				// 收拢力顶住 —— 两股力的大小都随边密度缩放（见 mem3dShape），所以边越密，类型结构反而**越稳**。
				// （试过"跨类型只沿各自锥轴往里收、完全不施加拉力"的写法：不动的方向守住了，但键短不下来，
				//   实测超过中位数的边从 8 条涨到 64 条 —— 所以这里选"轻拉 + 硬收拢"这条更稳的路。）
				for (let j = 0; j < edgeCount; j++) {
					const a = eFrom[j];
					const b = eTo[j];
					if (a < 0 || b < 0) continue;
					const want = (gaps[a] + gaps[b]) * shape.link;
					const dx = xs[b] - xs[a];
					const dy = ys[b] - ys[a];
					const dz = zs[b] - zs[a];
					const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
					const pull = Math.max(-shape.pullCap, Math.min(shape.pullCap, (dist - want) * shape.spring * (crossEdge[j] === 1 ? shape.cross : 1)));
					fx[a] += (dx / dist) * pull;
					fy[a] += (dy / dist) * pull;
					fz[a] += (dz / dist) * pull;
					fx[b] -= (dx / dist) * pull;
					fy[b] -= (dy / dist) * pull;
					fz[b] -= (dz / dist) * pull;
				}
				// 每轮每个原子最多走 shape.step 这么远（**阻尼**）。为什么不直接全量走：球的互斥力在"两球快贴上"时
				// 会突然变得极大（push ∝ 1/距离），全量走会让整个系统在几十轮之后**一直抖**（实测 500 轮后每轮总位移
				// 仍在 65–75 之间来回，永不收敛）—— 那样"跑多少轮"就决定最终形状，同一份数据换个轮数就换一朵结构。
				// 夹住步长后系统会真的停下来，收敛判定才有意义，轮数也不再是形状的隐藏参数。
				let moved = 0;
				for (let i = 0; i < count; i++) {
					const ax = axisX[i];
					const ay = axisY[i];
					const az = axisZ[i];
					// ① 方向：偏离锥轴的**垂直分量**按回去（管"类型分不分得开"，随密度变硬）
					const along = xs[i] * ax + ys[i] * ay + zs[i] * az;
					// ② 半径：沿轴按回"本垒半径"（**故意比 ① 弱** —— 跨类型的键要靠沿轴滑动把键拉短）
					const backR = (homeRho[i] - along) * shape.rho;
					let dx = fx[i] - (xs[i] - along * ax) * shape.cohere + ax * backR;
					let dy = fy[i] - (ys[i] - along * ay) * shape.cohere + ay * backR;
					let dz = fz[i] - (zs[i] - along * az) * shape.cohere + az * backR;
					const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
					if (mag > shape.step) {
						const cut = shape.step / mag;
						dx *= cut;
						dy *= cut;
						dz *= cut;
					}
					xs[i] += dx;
					ys[i] += dy;
					zs[i] += dz;
					moved += (dx < 0 ? -dx : dx) + (dy < 0 ? -dy : dy) + (dz < 0 ? -dz : dz);
				}
				if (moved < count * 0.0008) break;
			}
		
			// 构图居中（减去质心）→ 旋转是绕自己的中心转；再归一化到半径约 1（投影视野与数据规模无关）
			let mx = 0;
			let my = 0;
			let mz = 0;
			for (let i = 0; i < count; i++) {
				mx += xs[i];
				my += ys[i];
				mz += zs[i];
			}
			mx /= Math.max(1, count);
			my /= Math.max(1, count);
			mz /= Math.max(1, count);
			let reach = 0.0001;
			for (let i = 0; i < count; i++) {
				const x = xs[i] - mx;
				const y = ys[i] - my;
				const z = zs[i] - mz;
				reach = Math.max(reach, Math.sqrt(x * x + y * y + z * z));
			}
			const fit = 1 / reach;
			for (let i = 0; i < count; i++) {
				xs[i] = (xs[i] - mx) * fit;
				ys[i] = (ys[i] - my) * fit;
				zs[i] = (zs[i] - mz) * fit;
				base[i] = mem3dRadius(deg[i]);
			}
			// 帧缓冲：投影结果 + 画家排序 + 球面/杆的渐变缓存，都在这里一次分配、每帧复用。
			// ok 默认全 1：没投影过就按"都有效"处理（与老行为一致，不会因为漏调 project 而白屏）。
			const frame = {
				sx: new Float32Array(count),
				sy: new Float32Array(count),
				r: new Float32Array(count),
				z: new Float32Array(count),
				s: new Float32Array(count),
				ok: new Uint8Array(count).fill(1),
				key: new Float32Array(count + edgeCount),
				order: new Int32Array(count + edgeCount),
				sphere: new Array(count),
				rod: null
			};
			return { count, edgeCount, ids, xs, ys, zs, base, deg, rgb, shades, eFrom, eTo, eWidth, eDash, frame };
		}

		/**
		* 边密度 → 形状参数（纯函数，便于自审与量尺）。
		* `dens` = 每个原子摊到的边数（本快照 327 / 264 = 1.24；旧世界 27 / 256 ≈ 0.11）。
		* 边越多，三样东西一起变硬 —— 这就是"布局随边密度缩放"的落点：
		*   · cone  —— 每根锥的半角（类型之间在方向上留出空档）
		*   · cohere—— 把原子按回**自己那根锥轴**的力（管类型分不分得开）
		*   · rho   —— 沿轴按回"本垒半径"的力（管锥的长短与厚度）
		* 关键是 cohere 比 rho 硬得多：方向被钉住、半径可以滑。跨类型的键于是只能把两端**沿各自的锥**往里收，
		* 既把键拉短、又不会把两类拽成一团 —— "键短"与"类型分得开"因此能同时成立。
		* 密度低时它几乎不介入（27 条边的旧世界照旧由弹簧主导），密度高时类型结构由它兜住。
		*/
		function mem3dShape(edgeCount, count) {
			const dens = Math.min(3, edgeCount / Math.max(1, count));
			const hard = 1 + Math.min(1.5, dens * 0.62);
				const ramp = Math.min(90, Math.round(dens * 42));      // 1.00（稀疏）→ 1.77（本快照）
			return {
				dens: dens,
				inner: 0.15,
				outer: 1.00,
				coneMin: 0.25,
				coneMax: 1.45,
				coneScale: 1.02,
				conePow: 1.15,
				radMix: 0.55,
				gapLinked: 0.22,
				gapLone: 0.24,
				link: 0.9,
				spring: 0.35,
				pullCap: 0.2,
				step: 0.22,
				cross: 1.0,
				cohere: 0.085 * hard,
				rho: 0.03 * hard,
				passes: 96 + ramp
			};
		}
	


		/** 相机旋转（先偏航后俯仰）+ 透视投影：写进复用缓冲，不分配。z 越大越近。 */
		function mem3dProject(model, view, width, height) {
			const cosY = Math.cos(view.rotY);
			const sinY = Math.sin(view.rotY);
			const cosX = Math.cos(view.rotX);
			const sinX = Math.sin(view.rotX);
			// 视野：归一化后整体半径约 1、透视最大放大约 1.2×，乘这两个系数后整朵球棍留在画布内（不切边）
			const spread = Math.min(width * 0.47, height * 0.44) * view.scale;
			const ox = width / 2;
			const oy = height / 2;
			const frame = model.frame;
			for (let i = 0; i < model.count; i++) {
				const x = model.xs[i];
				const y = model.ys[i];
				const z = model.zs[i];
				const ax = x * cosY + z * sinY;
				const az = z * cosY - x * sinY;
				const ay = y * cosX - az * sinX;
				const bz = az * cosX + y * sinX;
				// 夹取（NaN 比不出大小 → 原样漏到下面的有限性检查里被判无效，不会伪装成正常点）
				let s = MEM3D_FOCAL / (MEM3D_FOCAL - bz);
				if (s < MEM3D_S_MIN) s = MEM3D_S_MIN;
				else if (s > MEM3D_S_MAX) s = MEM3D_S_MAX;
				frame.sx[i] = ox + ax * s * spread;
				frame.sy[i] = oy + ay * s * spread;
				frame.s[i] = s;
				frame.z[i] = bz;
				frame.r[i] = model.base[i] * s;
					if (!Number.isFinite(frame.sx[i]) || !Number.isFinite(frame.sy[i])) {
						frame.sx[i] = -1e6; frame.sy[i] = -1e6; frame.r[i] = 0;   // 兜底：非有限坐标踢出画面
					}
				// 兜底：非有限值、或**超出画布 3 倍**的点一律标成"无效"——绘制与命中都会跳过它们。
				// （只把坐标推到 -1e6 是不够的：杆会从 -1e6 拉回画布，闭合成一条穿屏的斜线。）
				frame.ok[i] = frame.sx[i] > -3 * width && frame.sx[i] < 3 * width && frame.sy[i] > -3 * height && frame.sy[i] < 3 * height ? 1 : 0;
			}
		}

		/** 画家算法：节点与杆合成一条按深度升序（远的先画）的序列，写进复用缓冲。 */
		function mem3dOrder(model) {
			const frame = model.frame;
			const count = model.count;
			for (let i = 0; i < count; i++) {
				frame.order[i] = i;
				frame.key[i] = frame.z[i];
			}
			for (let j = 0; j < model.edgeCount; j++) {
				const code = count + j;
				frame.order[code] = code;
				const a = model.eFrom[j];
				const b = model.eTo[j];
				// 端点缺失或端点被判无效（非有限/飞出画布 3 倍）的杆：沉到最底、且绘制时会被跳过
				frame.key[code] = a < 0 || b < 0 || frame.ok[a] === 0 || frame.ok[b] === 0 ? -9 : (frame.z[a] + frame.z[b]) / 2;
			}
			frame.order.sort((a, b) => frame.key[a] - frame.key[b]);
			return frame.order;
		}

		/** 深度 0（最远）..1（最近）。 */
		function mem3dDepth(frame, index) {
			const raw = (frame.z[index] + MEM3D_DEPTH) / (MEM3D_DEPTH * 2);
			return raw < 0 ? 0 : raw > 1 ? 1 : raw;
		}

		/** 屏幕命中测试：最近的那个球赢（"被遮住"的球不该被点中），没有则空串。 */
		function mem3dPick(model, x, y, scale) {
			const frame = model.frame;
			const px = Math.pow(scale, 0.72);
			let best = "";
			let bestDepth = -Infinity;
			for (let i = 0; i < model.count; i++) {
				if (frame.ok[i] === 0) continue;   // 无效点（非有限/飞出画布 3 倍）不参与命中
				const dx = frame.sx[i] - x;
				const dy = frame.sy[i] - y;
				const reach = Math.max(2.2, frame.r[i] * px) + 3;
				if (dx * dx + dy * dy > reach * reach) continue;
				if (frame.z[i] > bestDepth) {
					bestDepth = frame.z[i];
					best = model.ids[i];
				}
			}
			return best;
		}

		/** 拖拽 → 新视角（纯函数，便于桩测）。rotX 夹在 ±1.35，免得翻过头。 */
		function mem3dDrag(view, dx, dy) {
			const rotX = view.rotX + dy * 0.0055;
			return { rotX: rotX < -1.35 ? -1.35 : rotX > 1.35 ? 1.35 : rotX, rotY: view.rotY + dx * 0.0055, scale: view.scale };
		}

		/** 缩放夹持（纯函数）。 */
		function mem3dScore(scale) {
			return scale < MEM3D_SCALE_MIN ? MEM3D_SCALE_MIN : scale > MEM3D_SCALE_MAX ? MEM3D_SCALE_MAX : scale;
		}

		/** 滚轮 → 新缩放（纯函数）：指数缩放 + 夹到合理范围。 */
		function mem3dZoom(view, deltaY) {
			return { rotX: view.rotX, rotY: view.rotY, scale: mem3dScore(view.scale * Math.exp(-deltaY * 0.0012)) };
		}

		/** 清空画布（纯函数；没有背景色 —— 底色交给 CSS 的宿主令牌，深浅主题都对）。 */
		function mem3dClear(ctx, width, height, dpr = 1) {
			// 画布落在设备像素上（width×dpr）：必须先擦满整块，否则每帧只擦掉左上四分之一，
			// 历史帧会一帧帧叠上去（真机表现为「下面堆积一大团线条轨迹」）。
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, width * dpr, height * dpr);
			// 擦完恢复 DPR 变换：之后绘制与命中都用 CSS 像素坐标（与指针事件同一套）。
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		/** 选中节点的邻居 id 集合（高亮邻域用）。 */
		function mem3dNeighbors(picked, edges) {
			const out = new Set();
			if (picked === "") return out;
			for (const edge of edges) {
				if (edge.from === picked) out.add(edge.to);
				else if (edge.to === picked) out.add(edge.from);
			}
			return out;
		}

		/** 球面渐变缓存（按 ctx 认领：换画布后旧梯度不可再用）。 */
		const MEM3D_INK = new WeakMap();
		/**
		 * 球的径向渐变：单位圆 + `ctx.scale(r)`，可以按 8 档明暗缓存复用。
		 * 高光只在浅档出现（暗档给个很淡的底光）——这一条就是"实心球"和"发光点"的分界。
		 */
		function mem3dSphereInk(ctx, model, i, band, down) {
			const list = MEM3D_INK.get(ctx);
			const held = list === undefined ? undefined : list.sphere[i];
			if (held !== undefined && held.band === band && held.down === down) return held.grad;
			const shades = model.shades[i];
			const at = Math.max(0, Math.min(shades.length - 1, band));
			const base = shades[at];
			const light = shades[down ? Math.min(7, at + 1) : Math.min(7, at + 3)];
			const spot = down ? 0.42 : 0.32;
			const grad = ctx.createRadialGradient(-spot, -spot, 0.06, 0, 0, 1.02);
			grad.addColorStop(0, light);
			grad.addColorStop(0.5, base);
			grad.addColorStop(1, shades[Math.max(0, at - 2)]);
			const box = list === undefined ? { sphere: [], rod: null } : list;
			box.sphere[i] = { band: band, down: down, grad: grad };
			MEM3D_INK.set(ctx, box);
			return grad;
		}

		/** 球面高光的渐变（每张画布缓存一份：白色 → 透明，与球的颜色无关）。 */
		function mem3dGlintInk(ctx) {
			const list = MEM3D_INK.get(ctx);
			if (list !== undefined && list.glint !== null && list.glint !== undefined) return list.glint;
			const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
			grad.addColorStop(0, "rgba(255,255,255,.95)");
			grad.addColorStop(0.6, "rgba(255,255,255,.35)");
			grad.addColorStop(1, "rgba(255,255,255,0)");
			const box = list === undefined ? { sphere: [], rod: null, glint: grad } : list;
			box.glint = grad;
			MEM3D_INK.set(ctx, box);
			return grad;
		}

		/** 杆的高亮渐变（选中时给它的键）：中性灰两端淡、中间实。 */
		function mem3dRodInk(ctx) {
			const list = MEM3D_INK.get(ctx);
			if (list !== undefined && list.rod !== null && list.rod !== undefined) return list.rod;
			const grad = ctx.createLinearGradient(0, 0, 1, 0);
			grad.addColorStop(0, "rgba(92,99,110,.12)");
			grad.addColorStop(0.5, "rgba(78,85,96,.92)");
			grad.addColorStop(1, "rgba(92,99,110,.12)");
			const box = list === undefined ? { sphere: [], rod: grad } : list;
			box.rod = grad;
			MEM3D_INK.set(ctx, box);
			return grad;
		}

		/**
		 * 画一帧。顺序 = 先杆后球：**杆的两端被球盖住**，不会露出接头（化学键是插进球里的）。
		 * 深度线索只做两件：近大远小（r×s）、远处略暗（球面明暗降档）—— 没有雾、没有光晕、没有星星。
		 * 选中 = 该球描边加粗 + 它的杆高亮；标签只给选中/邻居/悬停，其余一律安静。
		 * @param ctx - CanvasRenderingContext2D（已按 dpr 设好 transform）。
		 * 注意：投影由**调用方**先做（），draw 只消费 frame —— 组件每帧的顺序是 project → draw。
		 * @param model - mem3dBall 的返回值。
		 * @param view - `{rotX, rotY, scale}`。
		 * @param width/height - CSS 像素尺寸。
		 * @param opts - `{picked, hovered, neighbors, labelOf, progress}`。
		 */
		function mem3dDraw(ctx, model, view, width, height, opts) {
			const options = opts === undefined || opts === null ? {} : opts;
			const picked = options.picked === undefined || options.picked === null ? "" : options.picked;
			const hovered = options.hovered === undefined || options.hovered === null ? "" : options.hovered;
			const near = options.neighbors === undefined || options.neighbors === null ? null : options.neighbors;
			const labelOf = typeof options.labelOf === "function" ? options.labelOf : null;
			const raw = options.progress === undefined || options.progress === null ? 1 : options.progress;
			const fade = raw < 0 ? 0 : raw > 1 ? 1 : raw;
			const frame = model.frame;
			const order = mem3dOrder(model);
			const px = Math.pow(view.scale, 0.72);
			const twoPi = Math.PI * 2;
			mem3dClear(ctx, width, height, (opts && opts.dpr) || 1);
			// —— 杆：直杆（不是曲线）。两端各缩进球半径的 0.86，插进球里 ——
			for (let k = 0; k < order.length; k++) {
				const code = order[k];
				if (code < model.count) continue;
				const j = code - model.count;
				const a = model.eFrom[j];
				const b = model.eTo[j];
				if (a < 0 || b < 0) continue;
				// 端点无效（非有限值 / 飞出画布 3 倍）的杆整根跳过 —— 否则它会从画面外向画面内拉一条穿屏长线
				if (frame.ok[a] === 0 || frame.ok[b] === 0) continue;
				const depth = mem3dDepth(frame, a) * 0.5 + mem3dDepth(frame, b) * 0.5;
				const touch = picked !== "" && (model.ids[a] === picked || model.ids[b] === picked);
				const nearEdge = picked !== "" && near !== null && near.has(model.ids[a]) && near.has(model.ids[b]);
				const dx = frame.sx[b] - frame.sx[a];
				const dy = frame.sy[b] - frame.sy[a];
				const len = Math.sqrt(dx * dx + dy * dy) || 1;
				const trimA = Math.min(len * 0.38, model.base[a] * frame.s[a] * px * 0.78);
				const trimB = Math.min(len * 0.38, model.base[b] * frame.s[b] * px * 0.78);
				if (len - trimA - trimB < 1.5) continue;
				const x1 = frame.sx[a] + (dx / len) * trimA;
				const y1 = frame.sy[a] + (dy / len) * trimA;
				const x2 = frame.sx[b] - (dx / len) * trimB;
				const y2 = frame.sy[b] - (dy / len) * trimB;
				ctx.globalAlpha = (picked === "" ? 0.55 + 0.34 * depth : touch ? 0.82 + 0.18 * depth : nearEdge ? 0.32 : 0.12) * fade;
				ctx.strokeStyle = touch ? mem3dRodInk(ctx) : "rgba(88,95,106,.86)";
				ctx.lineWidth = touch ? 2.6 : model.eWidth[j];
				if (model.eDash[j] === 1) ctx.setLineDash([5, 4]);
				else ctx.setLineDash([]);
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}
			ctx.setLineDash([]);
			// —— 球：实心（球面明暗梯度），不是发光点 ——
			for (let k = 0; k < order.length; k++) {
				const code = order[k];
				if (code >= model.count) continue;
				const i = code;
				if (frame.ok[i] === 0) continue;   // 无效点不画（宁可少一个球，也不画一个飞到画布外的球）
				const depth = mem3dDepth(frame, i);
				const id = model.ids[i];
				const isPicked = picked !== "" && id === picked;
				const isNear = picked !== "" && near !== null && near.has(id);
				const isHover = hovered !== "" && id === hovered;
				const dim = picked !== "" && !isPicked && !isNear;
				const x = frame.sx[i];
				const y = frame.sy[i];
				const r = Math.max(2.2, frame.r[i] * px);
				const band = Math.max(0, Math.min(7, Math.round(depth * 5) + 1));
				const down = depth < 0.34;
				// 远的球更薄（不是雾：不做颜色混合，只让远的稍微退后半步，近的仍然是实心球）
				const alpha = (dim ? 0.52 : 0.42 + 0.58 * Math.pow(depth, 1.15)) * fade;
				// 邻居/悬停：脚下垫一圈冷灰（"被指着"的提示，不是发光）
				if (isHover || isNear) {
					ctx.globalAlpha = 0.4 * alpha;
					ctx.fillStyle = "rgba(96,104,116,.5)";
					ctx.beginPath();
					ctx.arc(x, y, r + 2.2, 0, twoPi);
					ctx.fill();
				}
				ctx.globalAlpha = alpha;
				ctx.fillStyle = mem3dSphereInk(ctx, model, i, band, down);
				ctx.beginPath();
				ctx.arc(x, y, r, 0, twoPi);
				ctx.fill();
				// 球面高光：一小块柔和的亮斑（径向渐变，不是发光点/不是光晕）
				if (r > 3) {
					ctx.globalAlpha = (dim ? 0.18 : 0.72) * fade;
					ctx.fillStyle = mem3dGlintInk(ctx);
					ctx.save();
					ctx.translate(x - r * 0.32, y - r * 0.34);
					ctx.scale(r * 0.4, r * 0.4);
					ctx.beginPath();
					ctx.arc(0, 0, 1, 0, twoPi);
					ctx.fill();
					ctx.restore();
				}
				// 轮廓：往里一圈极淡的暗描边（球体的边）——光晕是往外的，这条是往里的
				if (!dim && r > 4.2) {
					ctx.globalAlpha = 0.22 * alpha;
					ctx.strokeStyle = "rgba(24,28,34,.9)";
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(x, y, r - 0.4, 0, twoPi);
					ctx.stroke();
				}
				// 选中 = 描边加粗（不是光晕）：外圈先垫一道极淡的纸色，让描边在任何底色上都清楚
				if (isPicked) {
					ctx.globalAlpha = 0.22;
					ctx.fillStyle = "rgba(252,252,250,.95)";
					ctx.beginPath();
					ctx.arc(x, y, r + 3.6, 0, twoPi);
					ctx.fill();
					ctx.globalAlpha = 0.92 * fade;
					ctx.strokeStyle = "rgba(52,58,68,.95)";
					ctx.lineWidth = 2.2;
					ctx.beginPath();
					ctx.arc(x, y, r + 3.6, 0, twoPi);
					ctx.stroke();
				} else if (isHover || isNear) {
					ctx.globalAlpha = 0.55 * alpha;
					ctx.strokeStyle = "rgba(110,118,130,.85)";
					ctx.lineWidth = 1.2;
					ctx.beginPath();
					ctx.arc(x, y, r + 2.6, 0, twoPi);
					ctx.stroke();
				}
			}
			// —— 标签：只给选中 / 邻居 / 悬停（260+ 个标签全显示=灾难）；互相压住的邻居标签直接不画，
			//    但选中/悬停那个必须画（它最后画，永远在最上面） ——
			if (labelOf !== null && (picked !== "" || hovered !== "")) {
				ctx.globalAlpha = fade;
				ctx.font = "11px " + MEM3D_FONT;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				const boxes = [];
				const clash = (box) => {
					for (let b = 0; b < boxes.length; b++) {
						const other = boxes[b];
						if (box.x0 < other.x1 && box.x1 > other.x0 && box.y0 < other.y1 && box.y1 > other.y0) return true;
					}
					return false;
				};
				const label = (code, primary) => {
					const id = model.ids[code];
					const value = labelOf(id);
					const full = String(value === undefined || value === null ? id : value);
					const limit = primary ? 18 : 10;
					const text = full.length > limit ? full.slice(0, limit) + "…" : full;
					const wide = ctx.measureText(text).width;
					const radius = Math.max(2.2, frame.r[code] * px);
					// 夹在画布内，别把字切掉
					const x = Math.max(wide / 2 + 7, Math.min(width - wide / 2 - 7, frame.sx[code]));
					const y = Math.max(11, Math.min(height - 11, frame.sy[code] - radius - 10));
					const box = { x0: x - wide / 2 - 4, x1: x + wide / 2 + 4, y0: y - 8, y1: y + 8 };
					if (!primary && clash(box)) return;
					boxes.push(box);
					// 纸色小牌（不是深空黑条）：浅色主题下也清楚，也不像霓虹标
					ctx.globalAlpha = 0.92 * fade;
					ctx.fillStyle = "rgba(250,250,248,.94)";
					ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
					ctx.globalAlpha = (primary ? 0.98 : 0.72) * fade;
					ctx.fillStyle = "rgba(30,34,40,.95)";
					ctx.fillText(text, x, y);
				};
				for (let k = order.length - 1; k >= 0; k--) {
					const code = order[k];
					if (code >= model.count) continue;
					const id = model.ids[code];
					if (id === picked || id === hovered) continue;
					if (picked !== "" && near !== null && near.has(id)) label(code, false);
				}
				for (let i = 0; i < model.count; i++) {
					if (model.ids[i] === picked || model.ids[i] === hovered) {
						if (frame.ok[i] === 0) continue;   // 无效点不画标签
						label(i, true);
					}
				}
			}
			ctx.globalAlpha = 1;
		}

		/* MEM3D:END */

				/**
		 * 关系图的球棍模型：一块 canvas + 自投影 + 拖拽旋转 + 滚轮缩放 + 点选。
		 * 交互状态（角度 / 缩放 / 悬停 / 淡入进度）全放 ref：拖拽**不触发 React 重渲**，只改下一帧要画的数字。
		 * **静止**：没有自转、没有常驻 rAF —— 只有交互（拖拽/滚轮/键盘/悬停/选中/resize）才重画一帧，
		 * 所以 reduced-motion 下天然"完全静止"，其它情况下也不烧 CPU。
		 * @param props - `{atoms, edges, picked, neighbors, onPick, t}`。
		 */
		function MemoryGraph3D(props) {
			const atoms = props.atoms;
			const edges = props.edges;
			const picked = props.picked;
			const neighbors = props.neighbors;
			const onPick = props.onPick;
			const t = props.t;
			const holderRef = React.useRef(null);
			const canvasRef = React.useRef(null);
			const modelRef = React.useRef(null);
			const fadeRef = React.useRef(1);
			const viewRef = React.useRef({ rotX: MEM3D_VIEW0.rotX, rotY: MEM3D_VIEW0.rotY, scale: MEM3D_VIEW0.scale });
			const hoverRef = React.useRef("");
			const liveRef = React.useRef({ picked: picked, neighbors: neighbors, onPick: onPick, labelOf: null });
			liveRef.current.picked = picked;
			liveRef.current.neighbors = neighbors;
			liveRef.current.onPick = onPick;
			const labels = new Map();
			for (const atom of atoms) labels.set(atom.id, atom.claim);
			liveRef.current.labelOf = (id) => (labels.has(id) ? labels.get(id) : id);
			// 数据没变就复用同一朵球棍（确定性布局；每帧更不会重建数组）
			const signature = atoms.length + "|" + edges.length + "|" + (atoms.length > 0 ? atoms[0].id : "") + "|" + (atoms.length > 0 ? atoms[atoms.length - 1].id : "") + "|" + (edges.length > 0 ? edges[0].from + edges[0].rel + edges[0].to : "");
			const cached = modelRef.current;
			const model = cached !== null && cached !== undefined && cached.signature === signature
				? cached.model
				: mem3dBall(atoms, edges, (atom) => memTypeColor(atom.type), (rel) => memRelColor(rel));
			modelRef.current = { signature: signature, model: model };
			React.useEffect(() => {
				const canvas = canvasRef.current;
				const holder = holderRef.current;
				if (canvas === null || canvas === undefined || holder === null || holder === undefined) return undefined;
				if (typeof canvas.getContext !== "function") return undefined;
				let ctx = null;
				try {
					ctx = canvas.getContext("2d");
				} catch (error) {
					ctx = null;
				}
				if (ctx === null) return undefined;
				const view = viewRef.current;
				const live = liveRef.current;
				const nowMs = () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());
				const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
				// 状态变化的淡入（约 130ms）：不是"装饰动效"，是让人看清"状态变了"。
				// reduced-motion 下把时长压到 0 —— 状态差异（描边/加粗/高亮）仍然保留，只是不渐变。
				const FADE_MS = reduced ? 0 : 130;
				let running = false;
				let raf = 0;
				let fadeStart = 0;
				let visible = true;
				let onScreen = true;
				let needPaint = true;
				let dragging = false;
				let moved = 0;
				let lastX = 0;
				let lastY = 0;
				let size = { w: 900, h: 520, dpr: 1 };
				const measure = () => {
					const rect = typeof holder.getBoundingClientRect === "function" ? holder.getBoundingClientRect() : null;
					const w = Math.max(240, Math.round(rect !== null && rect.width > 0 ? rect.width : 900));
					const h = Math.max(220, Math.round(rect !== null && rect.height > 0 ? rect.height : 520));
					const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
					size = { w: w, h: h, dpr: dpr };
					const pw = Math.round(w * dpr);
					const ph = Math.round(h * dpr);
					if (canvas.width !== pw || canvas.height !== ph) {
						canvas.width = pw;
						canvas.height = ph;
					}
				};
				const paint = () => {
					measure();
					ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
					mem3dProject(model, view, size.w, size.h);
					mem3dDraw(ctx, model, view, size.w, size.h, {
						dpr: size.dpr,
						picked: live.picked,
						hovered: hoverRef.current,
						neighbors: live.neighbors,
						labelOf: live.labelOf,
						progress: fadeRef.current
					});
					fadeRef.current = 1;
					needPaint = false;
				};
				// 只在"刚变更"的这几帧里跑 rAF；淡入走完就停（**没有自转**，静止时一帧都不画）
				const tick = (now) => {
					running = false;
					if (!visible || !onScreen) return;
					const stamp = typeof now === "number" ? now : 0;
					if (reduced || FADE_MS === 0) fadeRef.current = 1;
					else fadeRef.current = Math.min(1, Math.max(0, (stamp - fadeStart) / FADE_MS));
					paint();
					if (fadeRef.current < 1 && !running) {
						running = true;
						raf = window.requestAnimationFrame(tick);
					}
				};
				const start = () => {
					// 注意：这里**不许**再"首帧画过就提前 return"（老写法是 `fadeRef.current >= 1 && !needPaint` 就退出）。
					// 那句会让"首帧之后的所有状态变化"（悬停、选中、容器尺寸变化）**一帧都不重画**：
					// 点一个球，state 变了、画布却还是旧的一帧 —— 真机上就被读成「点不了」。
					needPaint = true;
					if (reduced || FADE_MS === 0) {
						fadeRef.current = 1;
						paint();
						return;
					}
					if (fadeRef.current >= 1) {
						fadeRef.current = 0;
						fadeStart = nowMs();
					}
					if (running || !visible || !onScreen) return;
					if (typeof window.requestAnimationFrame !== "function") {
						fadeRef.current = 1;
						paint();
						return;
					}
					running = true;
					raf = window.requestAnimationFrame(tick);
				};
				const stop = () => {
					running = false;
					if (raf !== 0) {
						window.cancelAnimationFrame(raf);
						raf = 0;
					}
				};
				const local = (event) => {
					const rect = canvas.getBoundingClientRect();
					return { x: event.clientX - rect.left, y: event.clientY - rect.top };
				};
				/** 立刻重画一帧（不淡入）：给"选中/邻居变了、容器尺寸变了"这类外部状态用。 */
				const repaint = () => {
					fadeRef.current = 1;
					needPaint = true;
					paint();
				};
				live.repaint = repaint;
				/**
				 * 命中之前先对齐尺寸：容器尺寸变了（侧栏拖动 / 窗口缩放 / 首屏布局落定）但还没重画时，
				 * frame 里存的是**旧尺寸**下算出来的屏幕坐标；拿它做命中就会"差一截"——
				 * 宽高比差得越多偏得越远（3:1 宽画布上能偏掉半个画布）。量到尺寸真变了就顺手重画一帧，
				 * 保证"屏幕上看到的球"和"点中的球"用的是同一套坐标。
				 */
				const syncSize = () => {
					const before = size.w + "x" + size.h + "@" + size.dpr;
					measure();
					const after = size.w + "x" + size.h + "@" + size.dpr;
					if (before !== after) {
						repaint();
						return true;
					}
					return false;
				};
				const onDown = (event) => {
					if (typeof event.button === "number" && event.button !== 0) return;
					dragging = true;
					moved = 0;
					lastX = event.clientX;
					lastY = event.clientY;
					if (typeof canvas.setPointerCapture === "function" && typeof event.pointerId === "number") {
						try {
							canvas.setPointerCapture(event.pointerId);
						} catch (error) {
							// 抓不到指针也无所谓：只是拖出画布会断
						}
					}
					if (holder.classList !== undefined) holder.classList.add("is-drag");
					event.preventDefault();
				};
				const onMove = (event) => {
					if (dragging) {
						const dx = event.clientX - lastX;
						const dy = event.clientY - lastY;
						lastX = event.clientX;
						lastY = event.clientY;
						moved += Math.abs(dx) + Math.abs(dy);
						const turned = mem3dDrag(view, dx, dy);
						view.rotX = turned.rotX;
						view.rotY = turned.rotY;
						// 拖拽中不淡入：跟着手指立刻重画
						fadeRef.current = 1;
						needPaint = true;
						paint();
						return;
					}
					const at = local(event);
					const hit = mem3dPick(model, at.x, at.y, view.scale);
					if (hit !== hoverRef.current) {
						hoverRef.current = hit;
						canvas.style.cursor = hit === "" ? "grab" : "pointer";
						start();
					}
				};
				const onUp = (event) => {
					if (holder.classList !== undefined) holder.classList.remove("is-drag");
					if (!dragging) return;
					dragging = false;
					if (moved > 5) return;
					syncSize();   // 先让"画出来的"和"要命中的"是同一套坐标（尺寸变过就顺手重画）
					const at = local(event);
					const hit = mem3dPick(model, at.x, at.y, view.scale);
					if (typeof live.onPick === "function") live.onPick(hit === live.picked ? "" : hit);
				};
				const onLeave = () => {
					hoverRef.current = "";
					canvas.style.cursor = "grab";
					start();
				};
				const onWheel = (event) => {
					event.preventDefault();
					const zoomed = mem3dZoom(view, event.deltaY);
					view.scale = zoomed.scale;
					fadeRef.current = 1;
					needPaint = true;
					paint();
				};
				const onKey = (event) => {
					const dx = event.key === "ArrowLeft" ? -18 : event.key === "ArrowRight" ? 18 : 0;
					const dy = event.key === "ArrowUp" ? -14 : event.key === "ArrowDown" ? 14 : 0;
					if (dx === 0 && dy === 0) return;
					event.preventDefault();
					const turned = mem3dDrag(view, dx, dy);
					view.rotX = turned.rotX;
					view.rotY = turned.rotY;
					fadeRef.current = 1;
					needPaint = true;
					paint();
				};
				const onVisibility = () => {
					visible = document.visibilityState !== "hidden";
					if (!visible) stop();
					else if (needPaint || fadeRef.current < 1) start();
				};
				canvas.addEventListener("pointerdown", onDown);
				canvas.addEventListener("pointermove", onMove);
				canvas.addEventListener("pointerup", onUp);
				canvas.addEventListener("pointercancel", onUp);
				canvas.addEventListener("pointerleave", onLeave);
				canvas.addEventListener("wheel", onWheel, { passive: false });
				canvas.addEventListener("keydown", onKey);
				document.addEventListener("visibilitychange", onVisibility);
				let watcher = null;
				if (typeof IntersectionObserver === "function") {
					watcher = new IntersectionObserver((entries) => {
						for (const entry of entries) onScreen = entry.isIntersecting;
						if (!onScreen) stop();
						else if (needPaint || fadeRef.current < 1) start();
					});
					try {
						watcher.observe(canvas);
					} catch (error) {
						watcher = null;
					}
				}
				// 尺寸变化（侧栏拖动 / 窗口缩放）要重画：这里只标脏，不立刻量布局
				let resizer = null;
				if (typeof ResizeObserver === "function") {
					resizer = new ResizeObserver(() => {
						if (reduced || FADE_MS === 0) {
							fadeRef.current = 1;
							needPaint = true;
							paint();
							return;
						}
						start();
					});
					try {
						resizer.observe(holder);
					} catch (error) {
						resizer = null;
					}
				}
				fadeRef.current = 1;
				needPaint = true;
				paint();
				return () => {
					stop();
					live.repaint = null;
					canvas.removeEventListener("pointerdown", onDown);
					canvas.removeEventListener("pointermove", onMove);
					canvas.removeEventListener("pointerup", onUp);
					canvas.removeEventListener("pointercancel", onUp);
					canvas.removeEventListener("pointerleave", onLeave);
					canvas.removeEventListener("wheel", onWheel);
					canvas.removeEventListener("keydown", onKey);
					document.removeEventListener("visibilitychange", onVisibility);
					if (watcher !== null) watcher.disconnect();
					if (resizer !== null) resizer.disconnect();
				};
			}, [model]);
			// 选中 / 邻居变了要**重画一帧**：主 effect 只依赖 model（数据没变就不重建），
			// 少了这一条，点球只改 state、画布却纹丝不动 —— 真机上就是「点了没反应 / 点不了」。
			const nearKey = neighbors === null || neighbors === undefined ? -1 : neighbors.size;
			React.useEffect(() => {
				const live = liveRef.current;
				if (typeof live.repaint === "function") live.repaint();
			}, [picked, nearKey]);
			const typeList = [];
			for (const atom of atoms) if (!typeList.includes(atom.type)) typeList.push(atom.type);
			return h(
				"div",
				{ className: "wbm3d-stage", ref: holderRef },
				h("canvas", {
					ref: canvasRef,
					className: "wbm3d-canvas",
					role: "img",
					tabIndex: 0,
					"aria-label": t("mem.graphAria") + "：" + atoms.length + " " + t("lib.unit") + " · " + edges.length + " " + t("mem.edgeUnit")
				}),
				h(
					"span",
					{ className: "wbm3d-keys" },
					typeList.map((name) => h("span", { key: name, className: "wbm3d-key" }, h("i", { className: "wbm3d-keydot", style: { background: memTypeColor(name) } }), t("mem.type." + name)))
				),
				h("span", { className: "wbm3d-hint" }, t("mem.graphHint"))
			);
		}

/**
		 * 「记忆库」独立页：hero（标题/计数/副标题/分类分布）+ 关系图 + 类型筛选与搜索 + 原子卡片 + 详情。
		 * 数据来自构建期快照 `MEMORY_INDEX`（客户端读不到 data/memory —— 见 AGENTS.md）。
		 * @param props - `t` 文案函数。
		 */
		function MemoryPage(props) {
			const t = props.t;
			const index = typeof MEMORY_INDEX === "undefined" ? null : MEMORY_INDEX;
			const [type, setType] = React.useState("");
			const [query, setQuery] = React.useState("");
			const [picked, setPicked] = React.useState("");
			if (index === null || !Array.isArray(index.atoms) || index.atoms.length === 0) {
				return h(
					"div",
					{ className: "wbm-page" },
					h(
						"div",
						{ className: "wbm-hero" },
						h("div", { className: "wbm-crumb" }, `${t("mem.crumb")} › ${t("mem.title")}`),
						h("h1", { className: "wbm-title" }, t("mem.title")),
						h("p", { className: "wbm-sub" }, t("mem.pick"))
					)
				);
			}
			const allAtoms = index.atoms;
			const allEdges = Array.isArray(index.edges) ? index.edges : [];
			const types = Array.isArray(index.types) && index.types.length > 0 ? index.types : [...new Set(allAtoms.map((atom) => atom.type))];
			// 打分系统 v1（2026-10-14）：分数来自快照（口径只在 data/memory/tools/memory.mjs 里定义一次）。
			// 页面展示的是"最新一条打分为准"的分数与由它算出的 tier —— 手工 tier 标签留在 tags 里，不丢。
			const scoreSummary = index.scoreSummary ?? null;
			const tierLabel = (tier) => t(`mem.tier.${tier}`);
			const scoreText = (atom) => (typeof atom.score === "number" ? atom.score.toFixed(1) : t("mem.unscored"));
			const needle = query.trim().toLowerCase();
			const shown = allAtoms.filter((atom) => {
				if (type !== "" && atom.type !== type) return false;
				if (needle === "") return true;
				return [atom.claim, atom.evidence, atom.source, (atom.tags ?? []).join(" ")].join(" ").toLowerCase().includes(needle);
			});
			const visible = new Set(shown.map((atom) => atom.id));
			const edges = allEdges.filter((edge) => visible.has(edge.from) && visible.has(edge.to));
			const degreeOf = (id) => allEdges.filter((edge) => edge.from === id || edge.to === id).length;
			const neighborsOf = (id) =>
				allEdges.filter((edge) => edge.from === id || edge.to === id).map((edge) => {
					const outgoing = edge.from === id;
					const otherId = outgoing ? edge.to : edge.from;
					const other = allAtoms.find((atom) => atom.id === otherId);
					return { key: `${edge.rel}-${otherId}`, rel: edge.rel, dir: outgoing ? "→" : "←", otherId, text: other === undefined ? otherId : other.claim };
				});
			const neighborIds = new Set(neighborsOf(picked).map((n) => n.otherId));
			const hubs = [...allAtoms].filter((atom) => degreeOf(atom.id) >= 2).sort((x, y) => degreeOf(y.id) - degreeOf(x.id));
			// 常用标签：出现次数最多的前 8 个 —— 点一下就等于搜它，不用猜该输什么词
			const tagCount = new Map();
			for (const atom of allAtoms) for (const tag of atom.tags ?? []) tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
			const topTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag);
			return h(
				"div",
				{ className: "wbm-page" },
				h(
					"header",
					{ className: "wbm-hero" },
					h(
						"div",
						{ className: "wbm-heroMain" },
						h("div", { className: "wbm-crumb" }, `${t("mem.crumb")} › ${t("mem.title")}`),
						h("div", { className: "wbm-titlerow" }, h("h1", { className: "wbm-title" }, t("mem.title")), h("span", { className: "wbm-count" }, `${index.count} ${t("lib.unit")} · ${index.edgeCount} ${t("mem.edgeUnit")}`),
							scoreSummary === null || scoreSummary.avg === null ? null : h("span", { className: "wbm-scorebadge" }, `${t("mem.scoreAvg")} ${scoreSummary.avg}`),
							scoreSummary === null || !Array.isArray(scoreSummary.byTier) ? null : scoreSummary.byTier.map(([tier, n]) => h("span", { key: tier, className: `wbm-tierpill wbm-tierpill-${tier}` }, `${tierLabel(tier)} ${n}`))),
						h("p", { className: "wbm-sub" }, t("mem.sub")),
						scoreSummary === null ? null : h("p", { className: "wbm-scorehint" }, `${t("mem.scoreHint")}（${scoreSummary.scored}/${index.count} ${t("mem.scoredUnit")} · ${t("mem.scoreHistory")} ${scoreSummary.history} ${t("mem.scoreHistoryUnit")}）`),
						h("p", { className: "wbm-scorehint" }, t("mem.eligHint"))
					),
					h(
						"div",
						{ className: "wbm-stats" },
						types.map((name) =>
							h(
								"button",
								{ key: name, type: "button", className: `wbm-stat${type === name ? " is-on" : ""}`, onClick: () => setType(type === name ? "" : name) },
								h("span", { className: "wbm-statdot", style: { background: memTypeColor(name) } }),
								h("span", { className: "wbm-statnum" }, String(allAtoms.filter((atom) => atom.type === name).length)),
								h("span", { className: "wbm-statlabel" }, t(`mem.type.${name}`))
							)
						)
					)
				),
				h(
					"div",
					{ className: "wbm-searchbar" },
					h(
						"label",
						{ className: "wbm-searchwrap" },
						h("svg", { className: "wbm-searchicon", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" },
							h("circle", { cx: "11", cy: "11", r: "6.4", stroke: "currentColor", strokeWidth: "1.8" }),
							h("path", { d: "M15.8 15.8L21 21", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })),
						h("input", { className: "wbm-search", type: "search", value: query, placeholder: t("mem.search"), "aria-label": t("mem.search"), onChange: (event) => setQuery(event.target.value) }),
						query === "" ? null : h("span", { className: "wbm-hits" }, `${shown.length} / ${allAtoms.length}`),
						query === "" ? null : h("button", { type: "button", className: "wbm-searchclear", onClick: () => setQuery(""), title: t("mem.clear") }, "×")
					),
					h(
						"div",
						{ className: "wbm-tagrow" },
						h("span", { className: "wbm-tagrowlabel" }, t("mem.tagHint")),
						topTags.map((tag) => h("button", { key: tag, type: "button", className: `wbm-tagchip${query === tag ? " is-on" : ""}`, onClick: () => setQuery(query === tag ? "" : tag) }, tag))
					)
				),
				h(
					"div",
					{ className: "wbm-bar" },
					h("button", { type: "button", className: `wbm-chip${type === "" ? " is-on" : ""}`, onClick: () => setType("") }, `${t("mem.all")} ${index.count}`),
					types.map((name) =>
						h(
							"button",
							{ key: name, type: "button", className: `wbm-chip${type === name ? " is-on" : ""}`, onClick: () => setType(type === name ? "" : name) },
							h("span", { className: "wbm-chipdot", style: { background: memTypeColor(name) } }),
							`${t(`mem.type.${name}`)} ${allAtoms.filter((atom) => atom.type === name).length}`
						)
					)
				),
				h(
					"section",
					{ className: "wbm-graph" },
					h(
						"div",
						{ className: "wbm-graphtop" },
						h("div", { className: "wbm-graphtoprow" }, h("span", { className: "wbm-sectiontitle" }, t("mem.graph")), h("span", { className: "wbm-legend" }, t("mem.legend"))),
						h("h2", { className: "wbm-graphtitle" }, t("mem.graphTitle"))
					),
					shown.length === 0
						? h(
									"div",
									{ className: "wbm-empty" },
									h("div", null, h("b", null, t("mem.nomatch"))),
									h("div", { className: "wbm-emptyhint" }, t("mem.emptyHint")),
									query === "" ? null : h("button", { type: "button", className: "wbm-chip", onClick: () => setQuery("") }, t("mem.clearSearch"))
								)
						: h(MemoryGraph3D, { atoms: shown, edges: edges, picked: picked, neighbors: neighborIds, onPick: setPicked, t: t })
				),
				h(
					"section",
					{ className: "wbm-list" },
					h(
						"div",
						{ className: "wbm-listtop" },
						h("span", { className: "wbm-sectiontitle" }, t("mem.atoms")),
						h("span", { className: "wbm-legend" }, `${shown.length} / ${index.count}`),
						h("span", { className: "wbm-spacer" }),
						picked === "" ? h("span", { className: "wbm-legend" }, t("mem.pick")) : h("button", { type: "button", className: "wbm-chip", onClick: () => setPicked("") }, t("lib.close"))
					),
					shown.length === 0
						? h("div", { className: "wbm-empty" }, h("b", null, type === "" ? t("mem.nomatch") : t("mem.empty")), " · ", t("mem.emptyHint"))
						: h(
								"div",
								{ className: "wbm-grid" },
								shown.map((atom) =>
									h(
										"article",
										{
											key: atom.id,
											className: `wbm-card${picked === atom.id ? " is-on" : ""}`,
											style: { borderLeftColor: memTypeColor(atom.type) },
											onClick: () => setPicked(picked === atom.id ? "" : atom.id)
										},
										h("div", { className: "wbm-cardhead" }, h("span", { className: "wbm-type", style: { color: memTypeColor(atom.type), borderColor: memTypeColor(atom.type) } }, t(`mem.type.${atom.type}`)),
											h("span", { className: `wbm-score wbm-score-${atom.tier ?? "tier2"}` }, `${scoreText(atom)} · ${tierLabel(atom.tier ?? "tier2")}`),
											h("span", { className: `wbm-tierpill wbm-tierpill-${atom.manualTier ?? "tier2"}` }, `${t("mem.elig")} ${tierLabel(atom.manualTier ?? "tier2")}`),
											h("span", { className: "wbm-rel" }, `${t("mem.relations")} ${degreeOf(atom.id)}`)),
										h("p", { className: "wbm-claim" }, atom.claim),
										h(
										"div",
										{ className: "wbm-meta" },
										(atom.tags ?? []).map((tag) => h("span", { key: tag, className: "wbm-tag" }, tag)),
										h("span", { className: "wbm-state" }, `${atom.confidence} · ${atom.status}`)
									),
									picked === atom.id
										? h(
												"div",
												{ className: "wbm-detail" },
												h("div", null, h("b", null, `${t("mem.evidence")}：`), atom.evidence),
												h("div", null, h("b", null, `${t("mem.source")}：`), atom.source),
												atom.dims === null || atom.dims === undefined ? null : h("div", null, h("b", null, `${t("mem.scoreDims")}：`), `${scoreText(atom)} / 10 · ${tierLabel(atom.tier ?? "tier2")} · ${t("mem.hits")} ${atom.hits ?? 0}（证据 ${atom.dims.evidence}/3 · 复用 ${atom.dims.reuse}/3 · 范围 ${atom.dims.scope}/2 · 新鲜 ${atom.dims.fresh}/2）`),
											h("div", null, h("b", null, `${t("mem.elig")}：`), `${tierLabel(atom.manualTier ?? "tier2")}${(atom.manualTier ?? "tier2") === "tier3" ? t("mem.eligNo") : ""}`),
												h("div", { className: "wbm-reltitle" }, t("mem.relations")),
												neighborsOf(atom.id).length === 0 ? h("div", { className: "wbm-legend" }, "（暂无关系）") : null,
												neighborsOf(atom.id).map((n) =>
													h(
														"button",
														{ key: n.key, type: "button", className: "wbm-relrow", onClick: (event) => { event.stopPropagation(); setPicked(n.otherId); } },
														h("span", { className: "wbm-relkind", style: { color: memRelColor(n.rel) } }, `${n.dir} ${n.rel}`),
														h("span", { className: "wbm-relclaim" }, n.text)
													)
												)
											  )
											: null
									)
								)
						  ),
					hubs.length === 0 ? null : h("div", { className: "wbm-hubs" }, h("div", { className: "wbm-sectiontitle" }, t("mem.hub")), hubs.slice(0, 5).map((hub) => h("button", { key: hub.id, type: "button", className: "wbm-hubrow", onClick: () => setPicked(hub.id) }, h("span", { className: "wbm-hubdeg" }, `[${degreeOf(hub.id)}]`), h("span", null, hub.claim)))),
					h("p", { className: "wbm-note" }, `${t("mem.generated")} ${index.generatedAt ?? ""}`)
				)
			);
		}

		const name = PLUGIN_NAME;
		/** 必需的客户端服务：插槽注册表 + 语言字典（本页不读目录、不读会话）。 */
		const inject = ["slots", "locale"];

		/**
		 * 客户端插件体：注入样式与字典，注册本包自己那几处插槽。
		 * @param ctx - 客户端根上下文。
		 */
		function apply(ctx) {
			const translate = ctx.locale.bind(LOCALE_NS);

			/**
			 * 查文案：字典查不到时回落到内置中文，避免渲染裸 key。
			 * @param key - 字典 key。
			 * @returns 当前语言下的文案。
			 */
			function t(key) {
				try {
					const value = translate(key);
					if (typeof value === "string" && value.length > 0 && value !== key) return value;
				} catch (error) {
					console.error(`[${PLUGIN_NAME}] 文案查询失败：${key}`, error);
				}
				return DICT_ZH[key] ?? key;
			}

			const styleEl = document.createElement("style");
			styleEl.setAttribute("data-dsh-plugin", PLUGIN_NAME);
			styleEl.textContent = PAGE_CSS;
			document.head.appendChild(styleEl);
			ctx.effect(() => () => {
				styleEl.remove();
			}, `${PLUGIN_NAME}: 页面样式`);
			const disposers = [];
			try {
				disposers.push(ctx.locale.register(LOCALE_NS, "zh", DICT_ZH));
				disposers.push(ctx.locale.register(LOCALE_NS, "en", DICT_EN));
			} catch (error) {
				console.error(`[${PLUGIN_NAME}] locale 字典注册失败，改用内置中文兜底：`, error);
			}
			ctx.effect(() => () => {
				for (const dispose of disposers) dispose();
				disposers.length = 0;
			}, `${PLUGIN_NAME}: locale 字典与订阅`);
			// ---- 页面注册（本包只有一页：记忆库）----
			ctx.slots.inject(PANEL_SLOT, function* () {
				yield ctx.slots.register({ name: PANEL_SLOT, id: PANEL_KEY_MEMORY, order: 6, label: () => t("mem.panel") }, (props) =>
					h(GraphIcon, { ...props, label: t("mem.panel") })
				);
			});

			// 中间栏面板：key 必须与上面的 id 一致（点侧边栏入口就渲染它）。
			ctx.slots.inject(MAIN_SLOT, function* () {
				yield ctx.slots.register({ name: MAIN_SLOT, key: PANEL_KEY_MEMORY }, (props) =>
					h(MemoryPage, { ...props, t })
				);
			});
		}

		exports.__mem3d = {
			MEM3D_VIEW0: MEM3D_VIEW0,
			MEM3D_SCALE_MIN: MEM3D_SCALE_MIN,
			MEM3D_SCALE_MAX: MEM3D_SCALE_MAX,
			MEM3D_FOCAL: MEM3D_FOCAL,
			MEM3D_S_MIN: MEM3D_S_MIN,
			MEM3D_S_MAX: MEM3D_S_MAX,
			ball: mem3dBall,
			shades: mem3dShades,
			calm: mem3dCalm,
			radius: mem3dRadius,
			project: mem3dProject,
			order: mem3dOrder,
			depth: mem3dDepth,
			draw: mem3dDraw,
			clear: mem3dClear,
			pick: mem3dPick,
			drag: mem3dDrag,
			zoom: mem3dZoom,
			neighbors: mem3dNeighbors,
			shape: mem3dShape,
			axis: mem3dAxis
		};
		exports.name = name;
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
