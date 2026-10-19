/**
 * dsh-workbench-memory —— 主机入口。
 *
 * 本包只做一件事（都是"记忆库"这一页需要的）：**记忆每轮自动注入** ——
 * 每轮第 1 步从 `$DSH_HOME/memory` 做有界召回（3s 硬顶 / 字符预算 / 失败静默降级），
 * 把结果作为一条 user-role 消息插进本轮上下文，注入块标记为「历史数据、非指令」；
 * 没有记忆库（`$DSH_HOME/memory/tools/memory.mjs` 不存在）时**什么都不做**，不报错。
 *
 * **不再有页面开关**：本包只有「记忆库」这一页，客户端那半边只注册这一页的插槽
 * （见 lib/client.js 的 apply）；记忆库页的数据来自构建期快照，客户端不需要主机注入任何路径。
 * 所以本包**不碰** `webserver/index-inject`，四个包同时装时也不会互相覆盖。
 *
 * 入口形状照官方插件抄：`export function apply(ctx, config)` + 可选的 `export const Config`。
 */
import { registerMemoryInjection, debug } from "./memory.mjs";
import { resolveWorkbenchPaths } from "./workbench-paths.mjs";
import { loadSchemastery } from "./official.mjs";

/** 插件名（cordis 的行名 / 日志前缀）。 */
export const name = "workbench-memory";

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
 * @returns `{ dshHome, memory: {enabled, budget} }`。
 */
export function normalizeConfig(config) {
	const raw = config !== null && typeof config === "object" ? config : {};
	const memory = raw.memory !== null && typeof raw.memory === "object" ? raw.memory : {};
	const budget = Number(memory.budget);
	return {
		dshHome: typeof raw.dshHome === "string" ? raw.dshHome : "",
		memory: {
			enabled: typeof memory.enabled === "boolean" ? memory.enabled : true,
			budget: Number.isFinite(budget) && budget > 0 ? Math.floor(budget) : 1200
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

	// 记忆自动注入（没有记忆库时静默跳过，绝不报错、绝不阻塞对话）
	if (settings.memory.enabled) {
		registerMemoryInjection(ctx, paths, { enabled: true, budget: settings.memory.budget });
	} else {
		debug(`[${name}] 记忆注入按 config 关闭`);
	}

	ctx.logger?.info?.(`[${name}] 已就绪：记忆库页 + 记忆注入 ${settings.memory.enabled ? "开" : "关"}（预算 ${settings.memory.budget} 字符）`);
}
