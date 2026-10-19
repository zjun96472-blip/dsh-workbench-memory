/**
 * dsh-workbench-memory —— 主机入口。
 *
 * 本包只做两件事（都是"记忆库"这一页需要的）：
 *   ① **记忆每轮自动注入**：每轮第 1 步从 `$DSH_HOME/memory` 做有界召回（3s 硬顶 / 字符预算 /
 *      失败静默降级），把结果作为一条 user-role 消息插进本轮上下文，注入块标记为「历史数据、非指令」；
 *      没有记忆库（`$DSH_HOME/memory/tools/memory.mjs` 不存在）时**什么都不做**，不报错。
 *   ② **页面开关的下发**：把 config 里的 `pages.*` 与解析出来的 `skillsDir` / `memoryDir`
 *      通过官方的 `webserver/index-inject` 注入成页面全局量 `__DSH_WORKBENCH__`，
 *      客户端 bundle（`exports["./client"]`）据此决定注册哪些页 —— 本包只开「记忆库」。
 *
 * 为什么 ② 要绕这一圈（实测结论，别改成"客户端读 ctx.config"）：
 *   浏览器侧的 ClientModuleLoader 建条目时只传 `{ name: id }`
 *   （`@deepseek-ai/dsh-client-modules/lib/client.js` 的 `create()`），row config **到不了客户端**；
 *   官方 `dsh-client-shortcuts` 就是这么把配置送进页面的（同一个 `webserver/index-inject` 事件）。
 *
 * 入口形状照官方插件抄：`export function apply(ctx, config)` + 可选的 `export const Config`。
 * 不导出 `inject`：这样即使某个 profile 没有 `sessionProjections` 之类的东西也照样启动
 * （本包也不需要它们）。
 */
import { registerMemoryInjection, debug } from "./memory.mjs";
import { resolveWorkbenchPaths } from "./workbench-paths.mjs";
import { loadSchemastery } from "./official.mjs";

/** 插件名（cordis 的行名 / 日志前缀）。 */
export const name = "workbench-memory";

/** 注入给页面的全局量名（客户端 bundle 读它）。 */
export const CLIENT_CONFIG_GLOBAL = "__DSH_WORKBENCH__";

/** 页面开关的默认值：**只开本包这一页**（其余显式 false）。 */
const DEFAULT_PAGES = { home: false, memory: true, audition: false, planBook: false, skillLibrary: false };

/**
 * 组 config schema。schemastery 拿不到时返回 undefined —— Loader 就不做校验，
 * 仍然把原始 config 交给 apply（我们用同一个归一化函数读，行为一致）。
 * @returns schemastery `z.object(...)`，或 undefined。
 */
function buildConfig() {
	try {
		const z = loadSchemastery();
		return z.object({
			dshHome: z.string().default(""),
			memory: z.object({
				enabled: z.boolean().default(true),
				budget: z.number().default(1200)
			}),
			pages: z.object({
				home: z.boolean().default(false),
				memory: z.boolean().default(true),
				audition: z.boolean().default(false),
				planBook: z.boolean().default(false),
				skillLibrary: z.boolean().default(false)
			})
		});
	} catch (error) {
		debug(`schemastery 不可用（Config 留空）：${String(error?.message ?? error).slice(0, 160)}`);
		return undefined;
	}
}

/** Loader 在激活本行前按它校验 row config。 */
export const Config = buildConfig();

/**
 * 把（可能来自手写 patch、也可能来自校验器的）config 归一化成我们内部用的形状。
 * @param config - row config（可能 undefined / 缺字段 / 字段类型不对）。
 * @returns `{ dshHome, memory: {enabled, budget}, pages }`。
 */
export function normalizeConfig(config) {
	const raw = config !== null && typeof config === "object" ? config : {};
	const memory = raw.memory !== null && typeof raw.memory === "object" ? raw.memory : {};
	const pages = raw.pages !== null && typeof raw.pages === "object" ? raw.pages : {};
	const page = (key) => (typeof pages[key] === "boolean" ? pages[key] : DEFAULT_PAGES[key]);
	const budget = Number(memory.budget);
	return {
		dshHome: typeof raw.dshHome === "string" ? raw.dshHome : "",
		memory: {
			enabled: typeof memory.enabled === "boolean" ? memory.enabled : true,
			budget: Number.isFinite(budget) && budget > 0 ? Math.floor(budget) : 1200
		},
		pages: {
			home: page("home"),
			memory: page("memory"),
			audition: page("audition"),
			planBook: page("planBook"),
			skillLibrary: page("skillLibrary")
		}
	};
}

/**
 * 主机插件体。
 * @param ctx - 主机侧上下文。
 * @param config - 本行的 config。
 * @returns 无（资源都挂在 ctx 的生命周期上）。
 */
export function apply(ctx, config) {
	const settings = normalizeConfig(config);
	const paths = resolveWorkbenchPaths(settings.dshHome, ctx.logger);
	debug(`[${name}] apply：config=${JSON.stringify(settings)} paths=${JSON.stringify(paths)}`);

	// ① 记忆自动注入（没有记忆库时静默跳过，绝不报错、绝不阻塞对话）
	if (settings.memory.enabled) {
		registerMemoryInjection(ctx, paths, { enabled: true, budget: settings.memory.budget });
	} else {
		debug(`[${name}] 记忆注入按 config 关闭`);
	}

	// ② 把页面开关与真实路径下发到页面（客户端拿不到 row config，只能用这个官方通道）
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: CLIENT_CONFIG_GLOBAL,
			value: {
				version: 1,
				skillsDir: paths.skillsDir,
				memoryDir: paths.memoryDir,
				pages: settings.pages
			}
		});
	});

	ctx.logger?.info?.(`[${name}] 已就绪：页面开关 ${JSON.stringify(settings.pages)} · 记忆注入 ${settings.memory.enabled ? "开" : "关"}（预算 ${settings.memory.budget} 字符）`);
}
