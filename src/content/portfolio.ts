import { ownerConfig } from "../config";

export interface FeaturedProject {
	name: string;
	description: string;
	stack: readonly string[];
	icon: string;
	color: "mint" | "lavender" | "sand";
	repo: string;
	primary: { label: string; href: string };
}

const repository = (name: string) => `${ownerConfig.githubUrl}/${name}`;

export const featuredProjects: readonly FeaturedProject[] = [
	{
		name: "学习任务聚合平台",
		description:
			"把学习通、雨课堂等平台上的作业和测验汇总到本地，按课程和截止时间查看待办。",
		stack: ["C# / .NET", "WPF", "SQLite"],
		icon: "fa6-solid:list-check",
		color: "mint",
		repo: repository("study-task-hub"),
		primary: {
			label: "查看发布",
			href: `${repository("study-task-hub")}/releases`,
		},
	},
	{
		name: "MindNotes Pro",
		description:
			"打开浏览器就能写画的本地白板。支持可编辑模板、离线使用，以及图片和 JSON 导出。",
		stack: ["TypeScript", "React", "Canvas"],
		icon: "fa6-solid:pen-ruler",
		color: "lavender",
		repo: repository("mindnotes-pro"),
		primary: {
			label: "打开白板",
			href: `${ownerConfig.siteOrigin}/mindnotes-pro/`,
		},
	},
	{
		name: "d&f算法网",
		description:
			"基于 Hydro OJ 的在线评测与训练站，提供分阶段练习、提交记录、错题复盘和赛事日历。",
		stack: ["Hydro OJ", "JavaScript"],
		icon: "fa6-solid:terminal",
		color: "sand",
		repo: repository("dfacm-oj"),
		primary: { label: "访问网站", href: "https://dfacm.website/" },
	},
];

export const otherProjects = [
	{
		name: "d&f 赛事日历",
		description: "集中查看算法赛、AI 竞赛与黑客松，支持条件筛选和 ICS、RSS 订阅。",
		repo: repository("dfacm-calendar"),
	},
	{
		name: "Hydro OJ 播报",
		description: "通过 AstrBot 把通过记录、榜单和比赛战报带到 QQ 群。",
		repo: repository("hydro-oj-broadcast"),
	},
	{
		name: "Know Yourself",
		description: "中英双语的自我探索社区，支持记录测评结果、写短文和主动分享。",
		repo: repository("know-yourself"),
	},
];

export const upstreamWork = [
	{
		project: "plait-board/drawnix",
		pullRequest: 449,
		title: "修复自由绘制时的中键平移",
		description: "自由绘制工具启用后，仍可按住鼠标中键拖动画布。",
	},
	{
		project: "kulcsarrudolf/zimme-zoom",
		pullRequest: 47,
		title: "改善图片查看器的键盘与读屏体验",
		description: "在查看器打开时隔离背景交互，并在关闭后把焦点还给触发元素。",
	},
	{
		project: "mdx-editor/editor",
		pullRequest: 952,
		title: "让 Markdown 标题快捷键遵循配置",
		description: "在插件初始化时应用标题层级配置，避免首次输入时使用默认设置。",
	},
];
