import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";

const siteOrigin = "https://11suixing11.github.io";

export const ownerConfig = {
	name: "core",
	handle: "11suixing11",
	bio: "让想法变得伟大",
	githubUrl: "https://github.com/11suixing11",
	siteOrigin,
	siteUrl: `${siteOrigin}/homepage/`,
	avatarUrl: "https://github.com/11suixing11.png",
};

export const siteConfig: SiteConfig = {
	title: `${ownerConfig.name} 的工程笔记`,
	subtitle: "开源项目、实现取舍与开发记录",
	lang: "zh_CN",
	themeColor: { hue: 150, fixed: false },
	banner: {
		enable: false,
		src: "assets/images/banner.png",
		position: "top",
		credit: { enable: false, text: "", url: "" },
	},
	toc: { enable: true, depth: 2 },
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		{ name: "首页", url: "/" },
		{ name: "项目", url: "/projects/" },
		{ name: "文章", url: "/archive/" },
		{ name: "关于", url: "/about/" },
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/github-avatar.png",
	name: ownerConfig.name,
	handle: ownerConfig.handle,
	bio: ownerConfig.bio,
	links: [{ name: "GitHub", icon: "fa6-brands:github", url: ownerConfig.githubUrl }],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = { theme: "github-dark" };
