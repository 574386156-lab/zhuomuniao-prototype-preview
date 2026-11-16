
    (() => {
      "use strict";

      const chatWindowMode = new URLSearchParams(window.location.search).get("view") === "chat-window";

      const brandLogo = "./page-assets/images/cf60fd626d53bffe624204e43f6ce9502ae8450bf516435287000c731be217c9.png";
      const idFront = "./page-assets/images/0a7ff9d969e882a6ef2cd5575b83e66879e4588701f52cb1ab22b197ff34124c.png";
      const idBack = "./page-assets/images/3dd1b6b3d907ec591ed1285cba86eb1b132e29e9ba16f482f4a7d7ef28f0156f.png";
      const licenseImage = "./page-assets/images/a0e316c85bf74fcff2145254da31a2c3cf433a3a995ffe8517b8d39b6a736be0.png";

      const doctorEmptyImage = "./page-assets/images/f67e24a667daa6901cb8dd05cd82d96ed2add5d6253ff694ae77560048054530.png";

      const routeMeta = {
        home: { label: "首页", parent: "我的首页", crumbs: ["首页"] },
        tenant: { label: "租户信息", parent: "租户管理", crumbs: ["首页", "租户管理", "租户信息"] },
        "tenant-detail": { label: "租户详情", parent: "租户管理", crumbs: ["首页", "租户管理", "租户信息", "租户详情"] },
        "tenant-edit": { label: "租户编辑", parent: "租户管理", crumbs: ["首页", "租户管理", "租户信息", "租户编辑"] },
        account: { label: "账号管理", parent: "系统管理", crumbs: ["首页", "系统管理", "账号管理"] },
        role: { label: "角色管理", parent: "系统管理", crumbs: ["首页", "系统管理", "角色管理"] },
        wecom: { label: "企微账号管理", parent: "用户管理", crumbs: ["首页", "用户管理", "企微账号管理"] },
        "wecom-detail": { label: "企微账号详情", parent: "用户管理", crumbs: ["首页", "用户管理", "企微账号管理", "账号详情"] },
        doctor: { label: "医生用户管理", parent: "用户管理", crumbs: ["首页", "用户管理", "医生用户管理"] },
        "doctor-detail": { label: "医生详情", parent: "用户管理", crumbs: ["首页", "用户管理", "医生用户管理", "医生详情"] },
        patient: { label: "患者用户管理", parent: "用户管理", crumbs: ["首页", "用户管理", "患者用户管理"] },
        "bot-config": { label: "Bot 配置", parent: "Bot 管理", crumbs: ["首页", "Bot 管理", "Bot 配置"] },
        "bot-detail": { label: "Bot 详情", parent: "Bot 管理", crumbs: ["首页", "Bot 管理", "Bot 配置", "Bot 详情"] },
        "patient-tag": { label: "标签管理", parent: "患者管理", crumbs: ["首页", "患者管理", "标签管理"] },
        "chat-history": { label: "聊天记录", parent: "会话管理", crumbs: ["首页", "会话管理", "聊天记录"] },
        "sidebar-config": { label:"侧边栏配置",parent:"系统管理",crumbs:["首页","系统管理","侧边栏配置"] },
        menu: { label: "菜单管理", parent: "系统管理", crumbs: ["首页", "系统管理", "菜单管理"] }
      };

      const navGroups = [
        { label: "我的首页", icon: "house", route: "home" },
        { label: "租户管理", icon: "building", route: "tenant", children: [{ label: "租户信息", route: "tenant" }] },
        { label: "用户管理", icon: "users", route: "wecom", children: [{ label: "企微账号管理", route: "wecom" }, { label: "医生用户管理", route: "doctor" }, { label: "患者用户管理", route: "patient" }] },
        { label: "患者管理", icon: "heart", route: "patient-tag", children: [{ label: "标签管理", route: "patient-tag" }] },
        { label: "会话管理", icon: "message", children: [{ label: "聊天记录", route: "chat-history", newWindow: true }] },
        { label: "Bot 管理", icon: "bot", route: "bot-config", children: [{ label: "Bot 配置", route: "bot-config" }] },
        { label: "系统管理", icon: "settings", route: "account", children: [
          { label: "账号管理", route: "account" },
          { label: "角色管理", route: "role" },
          { label: "菜单管理", route: "menu" },
          { label: "侧边栏配置", route: "sidebar-config" },
          { label: "权限组管理" },
          { label: "病种管理" }
        ] }
      ];

      const tenantsSeed = [
        ["华东糖脂健康项目", "合作中", "已启用", "2026-01-15 10:20:35", "2026-08-05 14:32:10"],
        ["仁和肺癌患者关爱项目", "合作中", "已启用", "2026-02-08 09:15:20", "2026-08-03 11:08:45"],
        ["华南患者关爱项目", "未开始", "已禁用", "2026-08-10 09:30:16", "2026-08-10 09:30:16"],
        ["康宁患者服务中心", "已结束", "已禁用", "2026-03-12 16:40:18", "2026-07-28 18:21:09"],
        ["省医慢病管理项目", "合作中", "已启用", "2026-04-20 13:25:44", "2026-07-25 09:50:36"],
        ["卓睦鸟示范租户", "合作中", "已启用", "2026-05-06 08:30:12", "2026-07-20 15:16:28"]
      ];

      const accountsSeed = [
        ["173****3230", "卢医生", "已启用", "-", "173****3230", "医生", "中康科技", "2026-08-05 15:23:16"],
        ["135****3399", "张医生", "已启用", "-", "135****3399", "租户管理员、医助、医生", "华东糖脂健康项目", "2026-08-04 19:47:32"],
        ["185****5070", "邓医生", "已启用", "-", "185****5070", "医生", "-", "2026-07-27 12:09:45"],
        ["153****2304", "同伴医生", "已启用", "-", "153****2304", "医助", "中康科技", "2026-08-06 18:15:08"],
        ["131****3212", "示例客服", "已启用", "-", "131****3212", "内部运营", "华东糖脂健康项目", "2026-08-05 15:38:59"],
        ["134****5061", "谭医生", "已启用", "-", "134****5061", "-", "中康科技", "2026-07-24 11:02:57"],
        ["181****9430", "Jason", "已启用", "-", "181****9430", "-", "华东糖脂健康项目", "2026-08-06 09:27:46"],
        ["138****8562", "钟医生", "已启用", "男", "138****8562", "-", "中康科技", "2026-07-14 19:55:20"],
        ["183****4148", "康医生", "已启用", "-", "183****4148", "-", "-", "2026-07-10 14:08:23"],
        ["135****2428", "-", "已启用", "-", "135****2428", "-", "中康科技", "2026-07-01 11:25:49"],
        ["135****4280", "-", "已启用", "-", "-", "-", "华东糖脂健康项目", "2026-06-25 10:33:56"],
        ["181****5294", "-", "已启用", "-", "181****5294", "-", "中康科技", "2026-07-11 10:58:54"],
        ["151****1378", "示例客服", "已启用", "-", "151****1378", "-", "华东糖脂健康项目", "2026-06-25 16:16:59"]
      ];

      const rolesSeed = [
        { id: "r1", name: "超级管理员", code: "super_admin", description: "拥有系统全部管理权限，可管理全局账号、角色、菜单及系统配置。", createdAt: "2026-01-01 09:00:00", updatedAt: "2026-08-12 16:28:35" },
        { id: "r2", name: "内部运营", code: "internal_operations", description: "负责平台日常运营及跨租户业务管理，按授权范围使用后台功能。", createdAt: "2026-01-05 10:18:26", updatedAt: "2026-08-11 14:36:08" },
        { id: "r3", name: "租户管理员", code: "tenant_admin", description: "负责所属租户内账号、项目、用户及业务配置管理。", createdAt: "2026-01-08 11:26:40", updatedAt: "2026-08-10 09:42:16" },
        { id: "r4", name: "医助", code: "medical_assistant", description: "协助医生开展患者服务、随访管理和项目日常运营工作。", createdAt: "2026-01-12 14:08:32", updatedAt: "2026-08-09 17:20:45" },
        { id: "r5", name: "医生", code: "doctor", description: "负责患者诊疗、病历查看及项目相关医疗业务。", createdAt: "2026-01-12 14:16:09", updatedAt: "2026-08-09 17:18:22" }
      ];

      const permissionTreeSeed = [
        { id: "port-admin", name: "患管后台", children: [
          { id: "admin-home", name: "我的首页", children: [{ id: "admin-home-overview", name: "首页概览" }] },
          { id: "admin-tenant", name: "租户管理", children: [{ id: "admin-tenant-list", name: "租户信息" }] },
          { id: "admin-user", name: "用户管理", children: [
            { id: "admin-wecom", name: "企微账号管理" },
            { id: "admin-doctor", name: "医生用户管理" },
            { id: "admin-patient", name: "患者用户管理" }
          ] },
          { id: "admin-patient-menu", name: "患者管理", children: [
            { id: "admin-patient-profile", name: "患者档案" },
            { id: "admin-patient-tag", name: "患者标签" }
          ] },
          { id: "admin-session", name: "会话管理", children: [
            { id: "admin-session-list", name: "会话列表" },
            { id: "admin-session-detail", name: "会话详情" }
          ] },
          { id: "admin-operation", name: "运营管理", children: [
            { id: "admin-service-project", name: "服务项目" },
            { id: "admin-followup-task", name: "随访任务" }
          ] },
          { id: "admin-bot", name: "Bot 管理", children: [
            { id: "admin-bot-list", name: "Bot 列表" },
            { id: "admin-knowledge", name: "知识库管理" }
          ] },
          { id: "admin-system", name: "系统管理", children: [
            { id: "admin-account", name: "账号管理" },
            { id: "admin-role", name: "角色管理" },
            { id: "admin-menu", name: "菜单管理" },
            { id: "admin-permission", name: "权限组管理" },
            { id: "admin-disease", name: "病种管理" }
          ] },
          { id: "admin-master", name: "主数据管理", children: [
            { id: "admin-form-library", name: "表单库" },
            { id: "admin-quality-score", name: "质控评分管理" }
          ] }
        ] },
        { id: "port-platform", name: "患管平台", children: [
          { id: "platform-patient", name: "患者管理", children: [
            { id: "platform-patient-list", name: "患者列表" },
            { id: "platform-patient-detail", name: "患者详情" }
          ] },
          { id: "platform-session", name: "会话管理", children: [
            { id: "platform-session-list", name: "会话列表" },
            { id: "platform-session-detail", name: "会话详情" }
          ] },
          { id: "platform-operation", name: "运营管理", children: [
            { id: "platform-service-project", name: "服务项目" },
            { id: "platform-followup-task", name: "随访任务" }
          ] },
          { id: "platform-quality", name: "质控管理", children: [
            { id: "platform-quality-board", name: "质控看板" },
            { id: "platform-quality-list", name: "质控列表" }
          ] },
          { id: "platform-bot", name: "Bot 管理", children: [
            { id: "platform-bot-list", name: "Bot 列表" },
            { id: "platform-knowledge", name: "知识库管理" }
          ] }
        ] }
      ];

      function permissionLeafIds(node) {
        return node.children?.length ? node.children.flatMap(permissionLeafIds) : [node.id];
      }

      function permissionNodeById(id, nodes = permissionTreeSeed) {
        for (const node of nodes) {
          if (node.id === id) return node;
          const child = node.children?.length ? permissionNodeById(id, node.children) : null;
          if (child) return child;
        }
        return null;
      }

      const allPermissionLeafIds = permissionTreeSeed.flatMap(permissionLeafIds);

      const doctors = [
        ["135****3399", "张医生", "中康科技", "糖尿病患者管理项目", "广德康民医院", "内科", "主治医师", "医生注册码", "直接注册", "已注册", "已托管", "2026-07-29 09:10:18", "2026-08-04 19:33:10"],
        ["185****5070", "邓医生", "中康科技", "营养干预随访项目", "263医院", "内科", "主治医师", "医生注册码", "直接注册", "未注册", "未托管", "2026-07-27 16:30:08", "2026-07-27 12:01:33"],
        ["153****2304", "同伴医生", "中康科技", "慢病健康教育项目", "263医院", "消化内科", "主任医师", "医生注册码", "直接注册", "已注册", "已托管", "2026-07-24 10:37:38", "2026-08-06 15:28:56"],
        ["131****3212", "示例医生A", "中康科技", "糖尿病患者管理项目", "263医院", "内科", "主任医师", "医生注册码", "直接注册", "已注册", "已托管", "2026-07-20 18:00:04", "2026-08-05 18:07:06"],
        ["134****5061", "示例医生B", "中康科技", "患者康复支持项目", "广州市白云区人民医院", "体重管理科", "副主任医师", "医生注册码", "直接注册", "已注册", "已托管", "2026-07-20 11:49:07", "2026-07-24 11:53:39"],
        ["181****9430", "Jason", "中康科技", "--", "--", "--", "--", "--", "--", "未注册", "未托管", "2026-07-16 18:43:20", "2026-08-06 08:59:54"],
        ["138****8562", "钟医生", "中康科技", "营养干预随访项目", "沧州市中心血站", "内科", "主任医师", "医生注册码", "直接注册", "未注册", "未托管", "2026-07-14 19:20:19", "2026-07-14 19:20:41"],
        ["183****4148", "康医生", "中康科技", "糖尿病患者管理项目", "263医院", "内科", "主治医师", "医生注册码", "直接注册", "已注册", "已托管", "2026-07-02 09:36:25", "2026-07-10 14:45:50"],
        ["135****2428", "--", "中康科技", "--", "--", "--", "--", "psp医生注册", "直接注册", "未注册", "未托管", "2026-07-01 16:53:16", "--"]
      ];

      const patients = [
        ["陈女士", "晨曦", "女", "186****4430", "--", "张医生", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "已建档", "未上传", "2026-08-09 12:22:18", "2026-08-09 18:58:26", true, true, 32],
        ["李先生", "山川", "男", "135****7226", "--", "邓医生", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "已建档", "未上传", "2026-08-08 15:20:43", "2026-08-08 15:20:43", true, false, 41],
        ["王女士", "小满", "女", "159****6689", "--", "同伴医生", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "已建档", "未上传", "2026-08-08 09:36:51", "2026-08-08 18:36:20", false, true, 35],
        ["赵女士", "向阳", "女", "138****8258", "肥胖", "示例医生A", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "已建档", "未上传", "2026-08-07 18:06:27", "2026-08-07 18:06:27", true, true, 29],
        ["周女士", "星河", "女", "156****1473", "脂肪肝", "王敏", "广德康民医院", "仁和医疗科技", "营养干预随访项目", "减脂AI助手—谭海灯版", "已建档", "未上传", "2026-08-06 21:56:33", "2026-08-10 22:19:08", false, true, 38],
        ["吴先生", "清风", "男", "183****6955", "高血压", "陈静", "263医院", "中康科技", "营养干预随访项目", "爱康助手", "已建档", "未上传", "2026-08-06 18:09:41", "2026-08-06 18:08:55", true, false, 46],
        ["孙女士", "一叶", "女", "138****6632", "--", "钟医生", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "已建档", "未上传", "2026-08-05 20:53:16", "2026-08-05 20:53:16", false, false, 33],
        ["郑女士", "晴天", "女", "136****1979", "--", "康医生", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "已建档", "未上传", "2026-08-05 19:38:07", "2026-08-06 07:37:42", true, true, 37],
        ["何先生", "远舟", "男", "188****3274", "--", "谭医生", "263医院", "中康科技", "糖尿病患者管理项目", "糖脂减重工作流（测试）", "未建档", "未上传", "2026-08-05 18:58:42", "2026-08-05 19:00:12", false, false, 52]
      ];

      const botsSeed = [
        { id: "bot-1", name: "患者助手 Bot", type: "Skill智能体", agentIds: ["agent-1", "agent-2"], description: "提供住院服务咨询与随访提醒。", tenant: "仁和肺癌患者关爱项目", project: "住院服务项目", status: "未发布", sessions: "1,286", handoff: "6.3%", updated: "2025-05-20 14:32", channels: ["企业微信"], channelOnline: true, serviceTime: "全天", opening: "您好，我是患者助手，很高兴为您服务！", transfer: "已启用" },
        { id: "bot-2", name: "随访提醒 Bot", type: "编排智能体", agentIds: ["agent-2"], description: "提供随访任务与就诊提醒。", tenant: "康宁患者服务中心", project: "随访管理项目", status: "已发布", sessions: "632", handoff: "5.8%", updated: "2025-05-18 10:21", channels: ["企业微信"], channelOnline: false, serviceTime: "全天", opening: "您好，我是患者助手，很高兴为您服务！", transfer: "已启用" },
        { id: "bot-3", name: "预问诊 Bot", type: "提示词智能体", agentIds: ["agent-3", "agent-1"], description: "提供门诊咨询与初步分诊。", tenant: "省医慢病管理项目", project: "门诊项目", status: "不可用待处理", sessions: "412", handoff: "12.4%", updated: "2025-05-19 16:08", channels: ["企业微信"], channelOnline: true, serviceTime: "全天", opening: "您好，我是患者助手，很高兴为您服务！", transfer: "已启用" },
        { id: "bot-4", name: "费用咨询 Bot", type: "Skill智能体", agentIds: ["agent-1"], description: "解答费用与医保相关咨询。", tenant: "华东糖脂健康项目", project: "费用服务项目", status: "停用", sessions: "278", handoff: "7.2%", updated: "暂无", channels: ["企业微信"], channelOnline: false, serviceTime: "全天", opening: "您好，我是患者助手，很高兴为您服务！", transfer: "已启用" },
        { id: "bot-5", name: "报告解读 Bot", type: "编排智能体", agentIds: ["agent-2", "agent-3"], description: "提供报告解读与就医建议。", tenant: "卓睦鸟示范租户", project: "影像中心项目", status: "归档", sessions: "355", handoff: "9.1%", updated: "2025-05-16 09:17", channels: ["企业微信"], channelOnline: true, serviceTime: "全天", opening: "您好，我是患者助手，很高兴为您服务！", transfer: "已启用" },
        { id: "bot-6", name: "健康宣教 Bot", type: "提示词智能体", agentIds: [], description: "提供健康宣教内容触达与咨询。", tenant: "华南患者关爱项目", project: "--", status: "未发布", sessions: "--", handoff: "--", updated: "--", channels: [], channelOnline: false, serviceTime: "--", opening: "--", transfer: "未启用" }
      ];

      const publishedAgents = [
        { id: "agent-1", name: "健康咨询智能体", type: "Skill智能体", description: "提供住院咨询、费用问答与出院随访能力。" },
        { id: "agent-2", name: "复诊随访智能体", type: "编排智能体", description: "覆盖复诊提醒、随访任务与异常转人工流程。" },
        { id: "agent-3", name: "门诊咨询智能体", type: "提示词智能体", description: "回答门诊常见问题并提供就诊指引。" }
      ];

      const wecomBotIcon = "./page-assets/images/a672d8612c7dbac7a01715e749bcf09736c66c56f2b7e8ee0a30c39b4bebbecc.png";

      function getBotAgents(bot) {
        return (bot.agentIds || []).map(id => publishedAgents.find(agent => agent.id === id)).filter(Boolean);
      }

      const wecomTenantOptions = ["华东糖脂健康项目", "仁和肺癌患者关爱项目", "康宁患者服务中心"];

      const wecomEntitiesSeed = [
        {
          id: "we1",
          name: "苏州康宁健康管理有限公司",
          syncedAt: "2026-08-11 16:30:25",
          tenants: ["康宁患者服务中心", "仁和肺癌患者关爱项目"],
          expanded: true,
          organizations: [
            { id: "we1-hq", name: "总部", level: 1, tenant: "康宁患者服务中心", hasChildren: true, expanded: true },
            { id: "we1-ops", name: "运营一部", level: 2, tenant: "康宁患者服务中心" },
            { id: "we1-med", name: "医学部", level: 2, tenant: "仁和肺癌患者关爱项目" },
            { id: "we1-east", name: "华东大区", level: 1, tenant: "康宁患者服务中心", hasChildren: true, expanded: true },
            { id: "we1-sh", name: "上海办事处", level: 2, tenant: "康宁患者服务中心" },
            { id: "we1-hz", name: "杭州办事处", level: 2, tenant: "仁和肺癌患者关爱项目" }
          ]
        },
        {
          id: "we2",
          name: "华东糖脂健康管理有限公司",
          syncedAt: "2026-08-10 15:12:36",
          tenants: ["华东糖脂健康项目"],
          expanded: false,
          organizations: [
            { id: "we2-hq", name: "健康管理中心", level: 1, tenant: "华东糖脂健康项目" },
            { id: "we2-service", name: "患者服务部", level: 1, tenant: "华东糖脂健康项目" }
          ]
        },
        {
          id: "we3",
          name: "仁和医疗服务有限公司",
          syncedAt: "2026-08-05 11:55:08",
          tenants: [],
          expanded: false,
          organizations: [
            { id: "we3-hq", name: "总部", level: 1, tenant: "" },
            { id: "we3-followup", name: "随访服务部", level: 1, tenant: "" }
          ]
        }
      ];

      const wecomAccounts = [
        { entityId: "we1", userId: "zhangwenbo", name: "张文博", phone: "138****1234", organization: "总部 / 医学部", tenant: "仁和肺癌患者关爱项目", linked: true, managedStatus: "在线", registeredAt: "2026-06-12 09:30:22", lastLoginAt: "2026-08-11 16:20:08" },
        { entityId: "we1", userId: "lixiaoli", name: "李小丽", phone: "139****5678", organization: "总部 / 运营一部", tenant: "康宁患者服务中心", linked: false, managedStatus: "未托管", registeredAt: "2026-06-15 14:08:35", lastLoginAt: "2026-08-10 10:45:12" },
        { entityId: "we1", userId: "chenli", name: "陈立", phone: "186****9012", organization: "华东大区 / 杭州办事处", tenant: "仁和肺癌患者关爱项目", linked: true, managedStatus: "离线", registeredAt: "2026-07-02 11:25:48", lastLoginAt: "2026-08-09 09:18:56" },
        { entityId: "we1", userId: "zhouqing", name: "周晴", phone: "135****2468", organization: "华东大区 / 上海办事处", tenant: "康宁患者服务中心", linked: false, managedStatus: "未托管", registeredAt: "2026-07-06 10:42:16", lastLoginAt: "2026-08-08 14:36:40" },
        { entityId: "we1", userId: "wangmin", name: "王敏", phone: "137****8899", organization: "总部 / 运营一部", tenant: "康宁患者服务中心", linked: true, managedStatus: "在线", registeredAt: "2026-07-14 15:18:09", lastLoginAt: "2026-08-07 11:05:27" },
        { entityId: "we1", userId: "liuyang", name: "刘洋", phone: "136****7812", organization: "总部 / 医学部", tenant: "仁和肺癌患者关爱项目", linked: true, managedStatus: "二次验证", registeredAt: "2026-07-19 08:46:31", lastLoginAt: "2026-08-06 17:28:43" },
        { entityId: "we2", userId: "zhaochen", name: "赵晨", phone: "158****3906", organization: "健康管理中心", tenant: "华东糖脂健康项目", linked: true, managedStatus: "在线", registeredAt: "2026-05-24 10:15:42", lastLoginAt: "2026-08-10 15:06:18" },
        { entityId: "we2", userId: "sunyue", name: "孙悦", phone: "187****6241", organization: "患者服务部", tenant: "华东糖脂健康项目", linked: false, managedStatus: "离线", registeredAt: "2026-06-08 13:22:09", lastLoginAt: "2026-08-09 17:31:25" },
        { entityId: "we3", userId: "heqing", name: "何清", phone: "133****5107", organization: "随访服务部", tenant: "待确认", linked: false, managedStatus: "未托管", registeredAt: "2026-07-11 09:18:36", lastLoginAt: "2026-08-05 11:48:52" }
      ];

      const menuRows = [
        { id: "tenant", name: "租户管理", type: "根目录", sort: 1, path: "-", root: true, shown: true, enabled: true },
        { id: "tenant-list", name: "租户信息", type: "菜单", sort: 1, path: "/tenant/list", parent: "tenant", shown: true, enabled: true },
        { id: "user", name: "用户管理", type: "根目录", sort: 2, path: "-", root: true, shown: true, enabled: true },
        { id: "wecom", name: "企微账号管理", type: "菜单", sort: 1, path: "/user/wecom", parent: "user", shown: true, enabled: true },
        { id: "doctor", name: "医生用户管理", type: "菜单", sort: 2, path: "/user/doctor", parent: "user", shown: true, enabled: true },
        { id: "patient", name: "患者用户管理", type: "菜单", sort: 3, path: "/user/patient", parent: "user", shown: true, enabled: true },
        { id: "patient-root", name: "患者管理", type: "根目录", sort: 3, path: "-", root: true, shown: true, enabled: true },
        { id: "session", name: "会话管理", type: "根目录", sort: 4, path: "-", root: true, shown: true, enabled: true },
        { id: "system", name: "系统管理", type: "根目录", sort: 7, path: "-", root: true, shown: true, enabled: true },
        { id: "account", name: "账号管理", type: "菜单", sort: 1, path: "/system/account", parent: "system", shown: true, enabled: true },
        { id: "role", name: "角色管理", type: "菜单", sort: 2, path: "/system/role", parent: "system", shown: true, enabled: true },
        { id: "menu", name: "菜单管理", type: "菜单", sort: 3, path: "/system/menu", parent: "system", shown: true, enabled: true },
        { id: "permission", name: "权限组管理", type: "菜单", sort: 4, path: "/system/permission-group", parent: "system", shown: true, enabled: true },
        { id: "disease", name: "病种管理", type: "菜单", sort: 5, path: "/system/disease", parent: "system", shown: true, enabled: true }
      ];

      const materialRowsSeed = [
        { id: "mat-1", title: "随访开场白", pinned: true, group: "患者随访", summary: "您好，我是随访助手，很高兴为您服务。", type: "文本", purpose: "会话 / 推送", updatedAt: "2026-08-05 17:04:43" },
        { id: "mat-2", title: "夏季健康提示（推送）", pinned: false, group: "健康宣教", summary: "夏季防暑健康提示，注意补水防中暑。", type: "文本", purpose: "推送", updatedAt: "2026-08-06 08:00:00" },
        { id: "mat-3", title: "慢病宣教网页", pinned: false, group: "慢病管理", summary: "慢病管理宣教页面，包含饮食与运动建议。", type: "网页", purpose: "会话 / 推送", updatedAt: "2026-08-05 12:00:00" },
        { id: "mat-4", title: "血糖解读图", pinned: false, group: "慢病管理", summary: "血糖解读示意图，帮助患者理解指标。", type: "图片", purpose: "会话", updatedAt: "2026-08-04 10:20:00" }
      ];

      const tagRowsSeed = [
        { id: "tag-1", name: "肺癌", type: "一级标签", sort: 100, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: null },
        { id: "tag-2", name: "随访计划", type: "二级标签", sort: 90, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: "tag-1" },
        { id: "tag-3", name: "一期和二期随访计划", type: "标签名称", sort: 100, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: "tag-2" },
        { id: "tag-4", name: "三期和四期随访计划", type: "标签名称", sort: 90, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: "tag-2" },
        { id: "tag-5", name: "治疗方式", type: "二级标签", sort: 90, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: "tag-1" },
        { id: "tag-6", name: "靶向治疗中", type: "标签名称", sort: 100, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: "tag-5" },
        { id: "tag-7", name: "免疫治疗中", type: "标签名称", sort: 90, createdAt: "2026-04-01 10:10:00", updatedAt: "2026-06-18 14:52:31", parent: "tag-5" }
      ];

      const messageTasksSeed = [
        { id: "msg-1", name: "糖尿病饮食宣教", content: "请查阅糖尿病饮食指南", audience: "诊断：2型糖尿病", target: 12, success: 8, failed: 2, sendType: "立即", status: "进行中", sentAt: "2026-08-01 10:30:00", createdAt: "2026-08-01 10:00:00", creator: "张医生" },
        { id: "msg-2", name: "复诊提醒", content: "请按预约时间到院复诊", audience: "所属项目：慢病随访", target: 18, success: 15, failed: 3, sendType: "定时", status: "异常任务", sentAt: "2026-08-03 09:00:00", createdAt: "2026-08-02 16:20:00", creator: "李医生" },
        { id: "msg-3", name: "用药提醒", content: "请按医嘱规律服药", audience: "诊断：高血压", target: 9, success: 0, failed: 0, sendType: "定时", status: "待执行", sentAt: "2026-08-12 08:00:00", createdAt: "2026-08-06 14:18:00", creator: "王医生" },
        { id: "msg-4", name: "活动通知", content: "健康课堂活动时间调整", audience: "所属租户：A医院", target: 24, success: 0, failed: 0, sendType: "立即", status: "已取消", sentAt: "--", createdAt: "2026-08-05 11:40:00", creator: "运营一" },
        { id: "msg-5", name: "夏季防暑提醒", content: "高温天气请及时补水", audience: "标签：健康宣教", target: 36, success: 36, failed: 0, sendType: "立即", status: "已完成", sentAt: "2026-08-04 08:00:00", createdAt: "2026-08-04 07:45:00", creator: "运营二" }
      ];

      const messageDoctors = [
        { id: "doctor-1", name: "李明", tenant: "A医院", project: "慢病随访", hospital: "A医院", department: "心内科", title: "主任医师", phone: "138****5605" },
        { id: "doctor-2", name: "王芳", tenant: "A医院", project: "慢病随访", hospital: "A医院", department: "内分泌科", title: "副主任医师", phone: "138****5607" },
        { id: "doctor-3", name: "张伟", tenant: "A医院", project: "患者服务", hospital: "A医院", department: "呼吸科", title: "主治医师", phone: "138****5609" },
        { id: "doctor-4", name: "陈丽", tenant: "A医院", project: "患者服务", hospital: "A医院", department: "肿瘤科", title: "主治医师", phone: "138****5613" },
        { id: "doctor-5", name: "赵强", tenant: "A医院", project: "慢病随访", hospital: "A医院", department: "全科", title: "住院医师", phone: "138****5617" }
      ];

      const chatDoctors = [
        { id: "chat-doctor-1", name: "张医生", title: "主任医师", gender: "男", hospital: "A医院", department: "心内科", phone: "185****5070", managed: "在线" },
        { id: "chat-doctor-2", name: "王医生", title: "副主任医师", gender: "女", hospital: "A医院", department: "内分泌科", phone: "186****4430", managed: "在线" },
        { id: "chat-doctor-3", name: "赵医生", title: "主治医师", gender: "男", hospital: "A医院", department: "呼吸科", phone: "139****6882", managed: "在线" },
        { id: "chat-doctor-4", name: "李医生", title: "主任医师", gender: "女", hospital: "卓睦医院", department: "全科", phone: "188****9126", managed: "离线" }
      ];

      const chatProjectsByTenant = {
        "A医院": ["慢病随访", "患者服务"],
        "卓睦医疗科技有限公司": ["患者服务"]
      };

      const chatConversations = [
        { id: "chat-1", doctorId: "chat-doctor-1", tenant: "A医院", project: "慢病随访", type: "私聊", name: "李女士", avatar: "李", gender: "女", age: 52, time: "09:32", occurredAt: "2026-09-15 09:32:12", preview: "血压今天早上量了 135/85", tags: ["高血压", "慢病管理", "复诊提醒"], source: "张医生（A医院）", messages: [
          { side: "left", occurredAt: "2026-09-15 09:29:10", text: "张医生，您好！血压今天早上量了 135/85，比昨天高一点，需要调整用药吗？" },
          { side: "right", occurredAt: "2026-09-15 09:30:02", text: "您好，血压略有波动通常无需立即调整用药。请问最近有没有按时服药？有没有头晕、胸闷等不适？" },
          { side: "left", occurredAt: "2026-09-15 09:31:10", text: "按时吃了，偶尔有点头晕，昨天没休息好。" },
          { side: "right", occurredAt: "2026-09-15 09:32:12", text: "建议您继续按目前剂量服用降压药，保证充足睡眠并避免过度劳累。明天早上再测一次血压并记录，如收缩压持续高于 140 或不适加重，请及时就医。" }
        ] },
        { id: "chat-2", doctorId: "chat-doctor-1", tenant: "A医院", project: "慢病随访", type: "私聊", name: "高先生", avatar: "高", gender: "男", age: 46, time: "09:18", occurredAt: "2026-09-15 09:18:40", preview: "好的，谢谢医生", tags: ["术后随访"], source: "张医生（A医院）", messages: [{ side: "left", occurredAt: "2026-09-15 09:17:55", text: "伤口恢复得不错，谢谢医生。" }, { side: "right", occurredAt: "2026-09-15 09:18:40", text: "请继续保持伤口清洁，如有红肿请及时联系。" }] },
        { id: "chat-3", doctorId: "chat-doctor-1", tenant: "A医院", project: "患者服务", type: "群聊", name: "慢病管理群（128）", avatar: "慢", time: "09:02", occurredAt: "2026-09-15 09:02:33", preview: "张医生：@所有人 本周三…", tags: ["慢病管理"], source: "张医生（A医院）", messages: [{ side: "right", occurredAt: "2026-09-15 09:02:33", text: "@所有人 本周三晚七点进行线上健康课堂。" }] },
        { id: "chat-4", doctorId: "chat-doctor-2", tenant: "卓睦医疗科技有限公司", project: "患者服务", type: "私聊", name: "刘女士", avatar: "刘", gender: "女", age: 39, time: "08:45", occurredAt: "2026-09-14 08:45:20", preview: "医生，我的报告出来了", tags: ["报告解读"], source: "王医生（A医院）", messages: [{ side: "left", occurredAt: "2026-09-14 08:45:20", text: "医生，我的报告出来了，请帮我看一下。" }] },
        { id: "chat-5", doctorId: "chat-doctor-3", tenant: "A医院", project: "慢病随访", type: "私聊", name: "周先生", avatar: "周", gender: "男", age: 61, time: "08:30", occurredAt: "2026-09-13 08:30:10", preview: "最近有点咳嗽，可以吃…", tags: ["呼吸科"], source: "赵医生（A医院）", messages: [{ side: "left", occurredAt: "2026-09-13 08:30:10", text: "最近有点咳嗽，可以先吃什么药？" }] }
      ];

      function getChatProjectGroups(tenant) {
        const groups = new Map();
        chatConversations.forEach(conversation => {
          if (tenant && conversation.tenant !== tenant) return;
          const projectName = conversation.project || "未分组";
          if (!groups.has(projectName)) groups.set(projectName, []);
          const doctorIds = groups.get(projectName);
          if (!doctorIds.includes(conversation.doctorId)) doctorIds.push(conversation.doctorId);
        });
        const tenantKey = tenant === "A医院" ? "a" : tenant ? "zhuomu" : "all";
        return [...groups.entries()].map(([projectName, doctorIds], index) => ({
          id: `chat-project-${tenantKey}-${index}`,
          name: projectName.endsWith("项目") ? projectName : `${projectName}项目`,
          doctorIds
        }));
      }

      const homeShortcutOptions = [
        { id: "tenant", label: "租户信息", icon: "building", route: "tenant" },
        { id: "account", label: "账号管理", icon: "user", route: "account" },
        { id: "wecom", label: "企微账号管理", icon: "users", route: "wecom" },
        { id: "doctor", label: "医生用户管理", icon: "stethoscope", route: "doctor" },
        { id: "patient", label: "患者用户管理", icon: "heart", route: "patient" },
        { id: "bot-config", label: "Bot 配置", icon: "bot", route: "bot-config" }
      ];
      const defaultHomeShortcutIds = ["tenant", "account", "wecom", "doctor"];
      const homeShortcutStorageKey = "zhuomu-admin-home-shortcuts";

      function loadHomeShortcutIds() {
        try {
          const stored = JSON.parse(window.localStorage.getItem(homeShortcutStorageKey) || "null");
          const valid = Array.isArray(stored) ? stored.filter(id => homeShortcutOptions.some(option => option.id === id)).slice(0, 4) : [];
          return valid.length ? valid : [...defaultHomeShortcutIds];
        } catch (_) {
          return [...defaultHomeShortcutIds];
        }
      }

      function persistHomeShortcutIds(ids) {
        try { window.localStorage.setItem(homeShortcutStorageKey, JSON.stringify(ids)); } catch (_) { /* Local persistence is optional in file previews. */ }
      }

      function formatDateInputValue(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }

      function defaultChatDateRange() {
        const end = new Date();
        const start = new Date(end);
        start.setFullYear(start.getFullYear() - 1);
        return { start: formatDateInputValue(start), end: formatDateInputValue(end) };
      }

      const initialChatDateRange = defaultChatDateRange();

      const state = {
        route: routeFromHash(),
        collapsed: false,
        openGroups: new Set([routeMeta[routeFromHash()]?.parent || "我的首页"]),
        homeShortcutIds: loadHomeShortcutIds(),
        homeShortcutDraft: new Set(),
        tabs: [{ route: "home", label: "首页" }],
        tenants: tenantsSeed.map((row, index) => ({ id: `t${index + 1}`, row: [...row] })),
        accounts: accountsSeed.map((row, index) => { const maskedPhone = row[4] && row[4] !== "-" ? row[4] : row[0]; return { id: `a${index + 1}`, row: [...row], phone: maskedPhone.replace("****", "1234") }; }),
        accountQuery: "",
        accountSearchOpen: false,
        accountDisableId: null,
        roles: rolesSeed.map(role => ({ ...role })),
        roleQuery: "",
        roleSearchOpen: false,
        rolePermissionRoleId: null,
        rolePermissionQuery: "",
        rolePermissionExpanded: new Set(["port-admin", "admin-user", "port-platform"]),
        rolePermissionDraft: new Set(),
        rolePermissions: Object.fromEntries(rolesSeed.map(role => [role.id, new Set()])),
        tenantQuery: "",
        tenantCooperationQuery: "",
        tenantAdminId: "",
        tenantAdminDraftId: "",
        tenantContactPhoneVisible: false,
        tenantAdminPhoneVisible: false,
        tenantPeriodStart: "2026-01-15",
        tenantPeriodEnd: "2027-01-14",
        doctorQuery: "",
        patientNameQuery: "",
        patientNicknameQuery: "",
        patientDetailIndex: 0,
        botQuery: "",
        botTenant: "",
        botProject: "",
        botChannel: "",
        botStatus: "",
        botSort: "最近更新时间",
        botFiltersOpen: true,
        botCardFields: new Set(["type", "description", "sessions", "handoff", "updated"]),
        botAuditQuery: "",
        botAuditType: "",
        botAuditResult: "",
        botAuditRange: "最近 30 天",
        selectedBotId: "bot-1",
        botDetailTab: "overview",
        wecomEntities: wecomEntitiesSeed.map(entity => ({ ...entity, tenants: [...entity.tenants], organizations: entity.organizations.map(organization => ({ ...organization })) })),
        wecomEntityQuery: "",
        selectedWecomEntityId: "we1",
        wecomAccountNameQuery: "",
        wecomAccountTenantQuery: "",
        wecomAccountManagedStatusQuery: "",
        wecomBindingEntityId: null,
        wecomBindingDraft: [],
        materials: materialRowsSeed.map(item => ({ ...item })),
        materialGroups: ["患者随访", "健康宣教", "慢病管理"],
        materialGroup: "all",
        materialGroupDragIndex: null,
        materialType: "全部",
        materialQuery: "",
        materialFormType: "文本",
        materialEditingId: null,
        materialUseConversation: true,
        materialUsePush: false,
        materialUploadNames: {},
        tags: tagRowsSeed.map(item => ({ ...item })),
        tagQuery: "",
        tagExpanded: new Set(tagRowsSeed.filter(item => tagRowsSeed.some(child => child.parent === item.id)).map(item => item.id)),
        tagParentId: null,
        tagEditingId: null,
        messages: messageTasksSeed.map(item => ({ ...item })),
        messageStatus: "全部",
        messageTaskQuery: "",
        messageCreatorQuery: "",
        messageSendTypeQuery: "",
        messageCreateStart: "",
        messageCreateEnd: "",
        messageSendStart: "",
        messageSendEnd: "",
        messageMoreId: null,
        selectedMessageTaskId: "msg-1",
        selectedMessageDoctors: new Set(),
        messageDoctorQueryApplied: false,
        messageDoctorTenantQuery: "",
        messageDoctorProjectQuery: "",
        messageDoctorNameQuery: "",
        messageDoctorHospitalQuery: "",
        messageDoctorDepartmentQuery: "",
        messageDoctorTitleQuery: "",
        messageDoctorPhoneQuery: "",
        messageMaterial: "",
        messageDraftTaskName: "",
        messageDraftSendType: "立即发送",
        messageScheduledAt: "",
        messageDraftContent: "请查阅糖尿病饮食指南",
        chatTenantQuery: "A医院",
        chatProjectQuery: "",
        chatTypeQuery: "",
        chatManagedDoctorQuery: "",
        chatFriendQuery: "",
        chatContentQuery: "",
        chatDateStart: initialChatDateRange.start,
        chatDateEnd: initialChatDateRange.end,
        chatDoctorId: "chat-doctor-1",
        chatConversationId: "chat-1",
        chatConversationType: "全部",
        chatConversationSearchOpen: false,
        chatConversationSearchQuery: "",
        chatConversationOrderNewest: true,
        chatProjectPanelCollapsed: false,
        chatProjectSearchOpen: false,
        chatProjectSearchQuery: "",
        chatCollapsedProjects: new Set(),
        chatSearchCollapsedDoctors: new Set(),
        chatSelectedHitKey: "",
        menuQuery: "",
        menuParentId: null,
        page: 1,
        modal: null,
        headerMenu: false,
        fontMedium: false,
        menuExpanded: true,
        menuEnabled: Object.fromEntries(menuRows.map(item => [item.id, item.enabled])),
        toasts: []
      };

      ensureTab(state.route);

      function icon(name, className = "") {
        return `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
      }

      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
      }

      function highlightChatMatch(value, query) {
        const source = String(value ?? "");
        const keyword = String(query ?? "").trim();
        if (!keyword) return escapeHtml(source);
        const sourceLower = source.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        let cursor = 0;
        let output = "";
        while (cursor < source.length) {
          const matchIndex = sourceLower.indexOf(keywordLower, cursor);
          if (matchIndex === -1) {
            output += escapeHtml(source.slice(cursor));
            break;
          }
          output += escapeHtml(source.slice(cursor, matchIndex));
          output += `<mark class="chat-match-mark">${escapeHtml(source.slice(matchIndex, matchIndex + keyword.length))}</mark>`;
          cursor = matchIndex + keyword.length;
        }
        return output;
      }

      function formatChatMessageTime(value) {
        const match = String(value || "").match(/^\d{4}-(\d{2})-(\d{2})\s(.+)$/);
        return match ? `${match[1]}/${match[2]} ${match[3]}` : String(value || "");
      }

      function formatCount(value) {
        return Number(value || 0).toLocaleString("zh-CN");
      }

      function currentTimestamp() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      }

      function routeFromHash() {
        const candidate = location.hash.replace(/^#\/?/, "");
        return routeMeta[candidate] ? candidate : "home";
      }

      function ensureTab(route) {
        if (route === "home" && state.tabs.some(tab => tab.route === "home")) return;
        if (!state.tabs.some(tab => tab.route === route)) state.tabs.push({ route, label: routeMeta[route].label });
      }

      function navigate(route) {
        if (!routeMeta[route]) return;
        if (route === "tenant-edit") state.tenantAdminDraftId = state.tenantAdminId;
        if (route === "tenant-detail") { state.tenantContactPhoneVisible = false; state.tenantAdminPhoneVisible = false; }
        ensureTab(route);
        const hash = `#/${route}`;
        if (location.hash === hash) {
          state.route = route;
          state.openGroups.add(routeMeta[route].parent);
          render();
        } else {
          location.hash = hash;
        }
      }

      function notify(message) {
        const id = Date.now() + Math.random();
        state.toasts.push({ id, message });
        renderToasts();
        window.setTimeout(() => {
          state.toasts = state.toasts.filter(toast => toast.id !== id);
          renderToasts();
        }, 2500);
      }

      function renderToasts() {
        const host = document.getElementById("toasts");
        if (!host) return;
        host.innerHTML = state.toasts.map(toast => `<div class="toast" role="status">${escapeHtml(toast.message)}</div>`).join("");
      }

      function renderHeader() {
        return `
          <header class="global-header">
            <div class="brand"><img src="${brandLogo}" alt="卓睦鸟患管后台" /></div>
            <div class="header-actions">
              <button class="header-button" type="button" data-action="font-size">字号：${state.fontMedium ? "中号" : "小号"} ${icon("chevron-down")}</button>
              <button class="icon-button" type="button" data-action="language" aria-label="切换语言">${icon("languages")}</button>
              <button class="icon-button" type="button" data-action="fullscreen" aria-label="切换全屏">${icon("maximize")}</button>
              <button class="account-button" type="button" data-action="account-menu" aria-expanded="${state.headerMenu}">
                <span class="account-avatar">${icon("user")}</span><span class="account-name">管理员</span>${icon("chevron-down")}
              </button>
              ${state.headerMenu ? `<div class="header-menu" role="menu"><button type="button" data-action="not-implemented">个人信息</button><button type="button" data-action="not-implemented">退出登录</button></div>` : ""}
            </div>
          </header>`;
      }

      function renderSidebar() {
        const activeParent = routeMeta[state.route].parent;
        const groups = navGroups.map(group => {
          const open = state.openGroups.has(group.label);
          const active = activeParent === group.label;
          const children = group.children && open ? `<div class="subnav">${group.children.map(child => {
            const childActive = child.route === state.route || (child.route === "tenant" && state.route.startsWith("tenant")) || (child.route === "wecom" && state.route === "wecom-detail") || (child.route === "doctor" && state.route === "doctor-detail") || (child.route === "bot-config" && state.route === "bot-detail");
            if (child.newWindow) return `<a class="subnav-item${childActive ? " is-active" : ""}" href="?view=chat-window#/${child.route}" target="_blank" rel="noopener" title="新窗口打开" aria-label="${escapeHtml(child.label)}（新窗口打开）">${escapeHtml(child.label)}</a>`;
            return `<button class="subnav-item${childActive ? " is-active" : ""}" type="button" data-route="${child.route || ""}" data-label="${escapeHtml(child.label)}">${escapeHtml(child.label)}</button>`;
          }).join("")}</div>` : "";
          return `<div>
            <button class="nav-item${active ? " is-parent-active" : ""}${open ? " is-open" : ""}" type="button" data-nav="${escapeHtml(group.label)}" data-route="${group.route || ""}" title="${state.collapsed ? escapeHtml(group.label) : ""}" aria-expanded="${group.children ? open : ""}">
              ${icon(group.icon)}<span class="nav-label">${escapeHtml(group.label)}</span>${group.children ? icon("chevron-down", "nav-arrow") : "<span></span>"}
            </button>${children}
          </div>`;
        }).join("");
        return `<aside class="sidebar" aria-label="主导航"><div class="sidebar-scroll"><nav class="nav-group">${groups}</nav></div>
          <button class="collapse-button" type="button" data-action="collapse" aria-label="${state.collapsed ? "展开菜单" : "收起菜单"}">${icon(state.collapsed ? "chevrons-right" : "chevrons-left")}<span>${state.collapsed ? "展开菜单" : "收起菜单"}</span></button>
        </aside>`;
      }

      function renderTabs() {
        return `<nav class="tabs" aria-label="已打开页面">${state.tabs.map(tab => { const label = tab.route === "bot-detail" ? (botsSeed.find(bot => bot.id === state.selectedBotId)?.name || tab.label) : tab.label; return `<div class="tab${tab.route === state.route ? " is-active" : ""}">
          <button type="button" class="tab-main" data-route="${tab.route}">${escapeHtml(label)}</button>
          ${tab.route === "home" && state.tabs.length === 1 ? "" : `<button type="button" class="tab-close" data-close-tab="${tab.route}" aria-label="关闭${escapeHtml(label)}">${icon("x")}</button>`}
        </div>`; }).join("")}</nav>`;
      }

      function renderBreadcrumb() {
        const bot = botsSeed.find(item => item.id === state.selectedBotId) || botsSeed[0];
        const crumbs = state.route === "bot-detail" ? ["Bot 管理", "Bot 配置", bot.name] : routeMeta[state.route].crumbs;
        return `<nav class="breadcrumb" aria-label="面包屑">${crumbs.map((crumb, index) => `${index ? "<span>/</span>" : ""}<${index === crumbs.length - 1 ? "strong" : "span"}>${escapeHtml(crumb)}</${index === crumbs.length - 1 ? "strong" : "span"}>`).join("")}</nav>`;
      }

      function status(text) {
        const success = ["合作中", "已启用", "已注册", "已托管", "活跃", "在线", "已发送"].includes(text);
        const warning = ["待确认", "即将到期"].includes(text);
        return `<span class="status${success ? " success" : warning ? " warning" : ""}"><span class="status-dot"></span>${escapeHtml(text)}</span>`;
      }

      function accountRoles(item) {
        return String(item?.row?.[5] || "").split("、").map(role => role.trim()).filter(role => role && role !== "-");
      }

      function tablePagination(total = 29, pageCount = 3) {
        const pageButtons = Array.from({ length: pageCount }, (_, index) => `<button class="page-button${index === 0 ? " is-active" : ""}" type="button" data-page="${index + 1}">${index + 1}</button>`).join("");
        const disabled = pageCount === 1 ? " disabled" : "";
        return `<div class="pagination" aria-label="分页"><span>共 ${total} 条数据</span>
          <button class="page-button" type="button" data-page="prev" aria-label="上一页"${disabled}>${icon("chevron-left")}</button>
          ${pageButtons}
          <button class="page-button" type="button" data-page="next" aria-label="下一页"${disabled}>${icon("chevron-right")}</button>
          <select class="control page-size" aria-label="每页条数"><option>15 条/页</option><option>30 条/页</option></select><span>跳至</span><input class="control jump" inputmode="numeric" aria-label="跳转页码" /><span>页</span>
        </div>`;
      }

      function toolButtons(primary = "") {
        return `<div class="list-toolbar"><button class="btn tool-icon" type="button" data-action="focus-filter" aria-label="搜索">${icon("search")}</button><button class="btn tool-icon" type="button" data-action="focus-filter" aria-label="筛选">${icon("filter")}</button><button class="btn tool-icon" type="button" data-action="density" aria-label="列表设置">${icon("settings")}</button>${primary}</div>`;
      }

      function homePage() {
        const tenantTotal = state.tenants.length;
        const cooperatingTenants = state.tenants.filter(item => item.row[1] === "合作中").length;
        const enabledProjects = new Set(doctors.map(row => row[3]).filter(value => value && value !== "--")).size;
        const doctorTotal = doctors.length;
        const doctorWecomManaged = doctors.filter(row => row[10] === "已托管").length;
        const doctorWecomUnmanaged = doctors.filter(row => row[10] === "未托管").length;
        const patientTotal = patients.length;
        const filedPatients = patients.filter(row => row[10] === "已建档").length;
        const uploadedRecords = patients.filter(row => row[11] === "已上传").length;
        const managedAccounts = wecomAccounts.filter(item => item.managedStatus !== "未托管").length;
        const onlineAccounts = wecomAccounts.filter(item => item.managedStatus === "在线").length;
        const offlineAccounts = wecomAccounts.filter(item => item.managedStatus === "离线").length;
        const updatedAt = currentTimestamp().slice(0, 16);
        const kpis = [
          { route: "tenant", title: "租户总数", value: tenantTotal, meta: [["合作中", cooperatingTenants], ["已启用项目", enabledProjects]] },
          { route: "doctor", title: "医生总数", value: doctorTotal, meta: [["已托管", doctorWecomManaged], ["未托管", doctorWecomUnmanaged]] },
          { route: "patient", title: "患者总数", value: patientTotal, meta: [["已建档", filedPatients], ["已上传病历", uploadedRecords]] },
          { route: "wecom", title: "托管账号总数", value: managedAccounts, meta: [["在线", onlineAccounts], ["离线", offlineAccounts]] }
        ];
        const featureModules = [
          { id: "tenant", route: "tenant", icon: "building", title: "租户信息", description: "集中查看租户合作状态、项目信息与管理员配置。", statLabel: "租户总数", statValue: tenantTotal, actionLabel: "进入" },
          { id: "tag", route: "patient-tag", icon: "heart", title: "标签管理", description: "维护平台患者标签层级，统一支持筛选与运营应用。", statLabel: "标签数量", statValue: state.tags.filter(item => item.type === "标签名称").length, actionLabel: "进入" },
          { id: "account", route: "account", icon: "user", title: "账号管理", description: "集中管理平台账号、启停状态及角色分配。", statLabel: "账号总数", statValue: state.accounts.length, actionLabel: "进入" }
        ];
        return `<section class="home-page" aria-labelledby="home-title">
          <header class="home-intro"><h1 id="home-title">下午好，管理员</h1><div class="home-intro-meta"><p>欢迎回到卓睦鸟患管后台</p><time datetime="${updatedAt.replace(" ", "T")}">数据更新时间：${updatedAt}</time></div></header>
          <section class="home-kpi-grid" aria-label="核心数据概览">${kpis.map(item => `<button class="home-kpi-card" type="button" data-route="${item.route}" aria-label="查看${item.title}"><span class="home-kpi-title">${item.title}</span><strong class="home-kpi-value">${formatCount(item.value)}</strong><span class="home-kpi-meta${item.meta.length === 3 ? " is-three" : ""}">${item.meta.map(meta => `<span class="home-kpi-meta-item"><span>${meta[0]}</span><strong>${formatCount(meta[1])}</strong></span>`).join("")}</span></button>`).join("")}</section>
          <section aria-labelledby="home-features-title"><h2 id="home-features-title" class="sr-only">功能模块</h2><div class="home-feature-grid">${featureModules.map(item => `<article class="home-feature-card" data-home-feature="${item.id}"><div class="home-feature-main"><span class="home-feature-icon" aria-hidden="true">${icon(item.icon)}</span><div class="home-feature-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></div><footer class="home-feature-footer"><span class="home-feature-stat"><span>${escapeHtml(item.statLabel)}：</span><strong>${formatCount(item.statValue)}</strong></span><button class="home-feature-action" type="button" data-route="${item.route}" aria-label="进入${escapeHtml(item.title)}">${escapeHtml(item.actionLabel)}${icon("chevron-right")}</button></footer></article>`).join("")}</div></section>
        </section>`;
      }

      function tenantPage() {
        const query = state.tenantQuery.trim().toLowerCase();
        const rows = state.tenants.filter(item => {
          const matchesName = !query || item.row[0].toLowerCase().includes(query);
          const matchesCooperation = !state.tenantCooperationQuery || item.row[1] === state.tenantCooperationQuery;
          return matchesName && matchesCooperation;
        });
        return `<section class="page">${renderBreadcrumb()}
          <form class="filter-card" data-form="tenant-filter"><div class="filter-grid">
            <div class="field"><label for="tenant-name">租户名称</label><input id="tenant-name" name="name" class="control" value="${escapeHtml(state.tenantQuery)}" placeholder="请输入租户名称" /></div>
            <div class="field"><label for="cooperation">合作状态</label><select id="cooperation" name="cooperation" class="control"><option value="">全部</option><option value="not-started"${state.tenantCooperationQuery === "未开始" ? " selected" : ""}>未开始</option><option value="active"${state.tenantCooperationQuery === "合作中" ? " selected" : ""}>合作中</option><option value="ended"${state.tenantCooperationQuery === "已结束" ? " selected" : ""}>已结束</option></select></div>
            <div class="field"><label for="tenant-enabled">启停状态</label><select id="tenant-enabled" class="control"><option>全部</option><option>已启用</option><option>已禁用</option></select></div>
            <div class="filter-actions"><button class="btn" type="button" data-action="tenant-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div>
          </div></form>
          ${toolButtons(`<button class="btn btn-primary" type="button" data-action="not-implemented">${icon("plus-circle")}新增租户</button>`)}
          <div class="table-card"><div class="table-scroll"><table class="data-table"><thead><tr><th>序号</th><th>租户名称</th><th>合作状态</th><th>启停状态</th><th>创建时间</th><th>更新时间</th><th>操作</th></tr></thead><tbody>
            ${rows.length ? rows.map((item, index) => { const row = item.row; return `<tr><td>${index + 1}</td><td>${escapeHtml(row[0])}</td><td>${status(row[1])}</td><td>${status(row[2])}</td><td>${row[3]}</td><td>${row[4]}</td><td><div class="table-actions"><button class="text-button" type="button" data-route="tenant-detail">查看</button><button class="text-button" type="button" data-route="tenant-edit">编辑</button><button class="text-button" type="button" data-toggle-tenant="${item.id}">${row[2] === "已启用" ? "停用" : "启用"}</button></div></td></tr>`; }).join("") : `<tr><td colspan="7">暂无符合条件的数据</td></tr>`}
          </tbody></table></div></div>${tablePagination(29)}</section>`;
      }

      function tenantDetailPage() {
        const tenantAdmin = state.accounts.find(item => item.id === state.tenantAdminId);
        const tenantAdminName = tenantAdmin ? escapeHtml(tenantAdmin.row[1] === "-" ? tenantAdmin.row[0] : tenantAdmin.row[1]) : "李敏";
        const tenantContactPhone = state.tenantContactPhoneVisible ? "13812346698" : "138****6698";
        const tenantContactPhoneField = `<span class="sensitive-value"><span data-tenant-contact-phone>${tenantContactPhone}</span><button class="text-button" type="button" data-action="toggle-tenant-contact-phone" aria-pressed="${state.tenantContactPhoneVisible}" aria-label="${state.tenantContactPhoneVisible ? "隐藏" : "查看"}联系人电话号码">${state.tenantContactPhoneVisible ? "隐藏" : "查看"}</button></span>`;
        const tenantAdminMaskedPhone = tenantAdmin && tenantAdmin.row[4] !== "-" ? tenantAdmin.row[4] : "138****6698";
        const tenantAdminPlainPhone = tenantAdmin?.phone || "13812346698";
        const tenantAdminPhone = state.tenantAdminPhoneVisible ? tenantAdminPlainPhone : tenantAdminMaskedPhone;
        const tenantAdminPhoneField = `<span class="sensitive-value"><span data-tenant-admin-phone>${escapeHtml(tenantAdminPhone)}</span><button class="text-button" type="button" data-action="toggle-tenant-admin-phone" aria-pressed="${state.tenantAdminPhoneVisible}" aria-label="${state.tenantAdminPhoneVisible ? "隐藏" : "查看"}租户管理员电话号码">${state.tenantAdminPhoneVisible ? "隐藏" : "查看"}</button></span>`;
        const tenantPeriod = `${state.tenantPeriodStart} 至 ${state.tenantPeriodEnd}`;
        return `<section class="page">${renderBreadcrumb()}<button class="back-link" type="button" data-route="tenant">${icon("arrow-left")}返回租户列表</button>
          <div class="section-stack">
            <section class="detail-card metric-card"><h2>业务信息</h2><div class="metrics">${[["项目","4 个"],["医助","6 人"],["医生","28 人"],["患者","1,286 人"],["托管账号","12 个"],["机器人使用","8 个"]].map(item => `<div class="metric"><span>${item[0]}</span><strong>${item[1]}</strong></div>`).join("")}</div></section>
            <section class="detail-card"><h2>基础信息</h2><dl class="info-grid tenant-basic-grid">${[
              ["租户名称","华东糖脂健康项目"],["合作状态",status("合作中")],["启停状态",status("已启用")],["合作周期",tenantPeriod],["联系人","李敏"],["联系人电话号码",tenantContactPhoneField],["租户管理员",tenantAdminName],["租户管理员电话号码",tenantAdminPhoneField],["创建时间","2026-01-15 10:20:35"],["更新时间","2026-08-05 14:32:10"]
            ].map(item => `<div class="info-item"><dt>${item[0]}</dt><dd>${item[1]}</dd></div>`).join("")}</dl></section>
            <section class="detail-card"><h2>法人信息</h2><div class="document-grid tenant-document-grid"><div class="document"><figure><figcaption>身份证人像面</figcaption><img src="${idFront}" alt="已脱敏的身份证人像面示例" /></figure></div><div class="document"><figure><figcaption>身份证国徽面</figcaption><img src="${idBack}" alt="已脱敏的身份证国徽面示例" /></figure></div><dl class="info-grid tenant-field-grid"><div class="info-item"><dt>法人姓名</dt><dd>李敏</dd></div><div class="info-item"><dt>身份证号</dt><dd>440***********1234</dd></div><div class="info-item"><dt>有效期</dt><dd>2025-01-01 至 2045-01-01</dd></div></dl></div></section>
            <section class="detail-card"><h2>营业执照信息</h2><div class="document-grid tenant-document-grid"><div class="document license"><img src="${licenseImage}" alt="已脱敏的营业执照示例" /></div><dl class="info-grid tenant-field-grid"><div class="info-item"><dt>企业名称</dt><dd>XX 有限公司</dd></div><div class="info-item"><dt>统一社会信用代码</dt><dd>91440101MA5XXXXXXX</dd></div><div class="info-item"><dt>营业期限</dt><dd>2026-01-15 至 长期</dd></div><div class="info-item"><dt>住所</dt><dd>广东省广州市天河区示范路88号</dd></div><div class="info-item"><dt>经营范围</dt><dd>健康咨询服务；患者管理服务；医学研究和试验发展。</dd></div></dl></div></section>
            <section class="detail-card"><h2>项目信息</h2><div class="table-card"><div class="table-scroll"><table class="data-table"><thead><tr><th>项目名称</th><th>创建时间</th><th>医助</th><th>医生注册渠道数量</th><th>患者注册场景数量</th></tr></thead><tbody><tr><td>糖尿病患者管理项目</td><td>2026-01-20 09:30:18</td><td>王敏 138****6698、陈静 139****2286</td><td>3</td><td>5</td></tr><tr><td>营养干预随访项目</td><td>2026-03-08 14:16:35</td><td>刘洋 136****7812</td><td>2</td><td>3</td></tr><tr><td>慢病健康教育项目</td><td>2026-05-12 11:05:42</td><td>赵琪 137****5036</td><td>1</td><td>2</td></tr><tr><td>患者康复支持项目</td><td>2026-06-18 16:22:09</td><td>周宁 135****2480</td><td>2</td><td>4</td></tr></tbody></table></div></div></section>
          </div></section>`;
      }

      function tenantEditPage() {
        const upload = (label, name) => `<label class="upload-box">${icon("upload")}<span>${label}</span><input type="file" name="${name}" accept="image/*" data-upload="${name}" /></label>`;
        const adminIdentity = item => {
          const row = item.row;
          const displayName = row[1] && row[1] !== "-" ? row[1] : "未填写姓名";
          const phone = row[4] && row[4] !== "-" ? row[4] : "未填写";
          return `<span class="tenant-admin-value"><strong>${escapeHtml(displayName)}</strong><span class="tenant-admin-meta"><span>账号名称：${escapeHtml(row[0])}</span><span>手机号：${escapeHtml(phone)}</span></span></span>`;
        };
        const selectedAdmin = state.accounts.find(item => item.id === state.tenantAdminDraftId);
        const adminOptions = state.accounts.map(item => `<button class="tenant-admin-option${item.id === state.tenantAdminDraftId ? " is-selected" : ""}" type="button" role="option" aria-selected="${item.id === state.tenantAdminDraftId}" data-tenant-admin-option="${item.id}">${adminIdentity(item)}</button>`).join("");
        return `<section class="page"><div class="page-title-row"><div>${renderBreadcrumb()}</div><div class="actions"><button class="btn" type="button" data-route="tenant">取消</button><button class="btn btn-primary" type="submit" form="tenant-edit-form">保存</button></div></div>
          <form id="tenant-edit-form" class="form-page">
            <section class="form-section"><h2>基础信息</h2><div class="form-grid"><div class="field"><label><span class="required">*</span>租户名称</label><input class="control" name="tenantName" required value="华东糖脂健康项目" /></div><div class="field"><label><span class="required">*</span>联系人</label><input class="control" name="contact" required value="李敏" /></div><div class="field"><label><span class="required">*</span>联系电话</label><input class="control" name="phone" required value="138****6698" /></div><div class="field"><label><span class="required">*</span>租户管理员</label><details class="tenant-admin-picker${selectedAdmin ? " has-value" : ""}" data-tenant-admin-picker><summary aria-label="选择租户管理员" aria-haspopup="listbox">${selectedAdmin ? adminIdentity(selectedAdmin) : `<span class="tenant-admin-placeholder">请选择租户管理员</span>`}${icon("chevron-down")}</summary><input type="hidden" name="tenantAdmin" value="${escapeHtml(state.tenantAdminDraftId)}" /><div class="tenant-admin-menu" role="listbox" aria-label="租户管理员账号">${adminOptions}</div></details></div><div class="field"><label><span class="required">*</span>合作周期</label><div class="date-range-control" role="group" aria-label="合作周期"><input type="date" name="periodStart" required aria-label="合作开始日期" value="${escapeHtml(state.tenantPeriodStart)}" /><span class="date-range-separator">至</span><input type="date" name="periodEnd" required aria-label="合作结束日期" value="${escapeHtml(state.tenantPeriodEnd)}" /></div></div></div></section>
            <section class="form-section"><h2>法人信息</h2><div class="upload-layout"><div><p>上传法人身份证</p><div class="upload-pair">${upload("点击上传人像面", "idFront")}${upload("点击上传国徽面", "idBack")}</div></div><div class="form-grid"><div class="field"><label><span class="required">*</span>法人姓名</label><input class="control" required value="李敏" /></div><div class="field"><label><span class="required">*</span>身份证号</label><input class="control" required value="440***********1234" /></div><div class="field full"><label><span class="required">*</span>有效期</label><input class="control" required value="2025-01-01 至 2045-01-01" /></div></div></div></section>
            <section class="form-section"><h2>营业执照信息</h2><div class="upload-layout"><div><p>上传营业执照</p>${upload("点击上传营业执照", "license")}</div><div class="form-grid"><div class="field full"><label><span class="required">*</span>企业名称</label><input class="control" required value="XX 有限公司" /></div><div class="field full"><label><span class="required">*</span>统一社会信用代码</label><input class="control" required value="91440101MA5XXXXXXX" /></div><div class="field full"><label><span class="required">*</span>营业期限</label><input class="control" required value="2026-01-15 至 长期" /></div><div class="field full"><label><span class="required">*</span>住所</label><input class="control" required value="广东省广州市天河区示范路88号" /></div><div class="field full"><label><span class="required">*</span>经营范围</label><textarea class="control" required>健康咨询服务；患者管理服务；医学研究和试验发展。</textarea></div></div></div></section>
          </form></section>`;
      }

      function accountPage() {
        const query = state.accountQuery.trim().toLowerCase();
        const rows = state.accounts.filter(item => !query || item.row.join(" ").toLowerCase().includes(query));
        return `<section class="page">${renderBreadcrumb()}
          <div class="page-title-row">${state.accountSearchOpen ? `<div class="search-inline"><input id="account-search" class="control" value="${escapeHtml(state.accountQuery)}" placeholder="搜索账号、姓名或租户" /><button class="btn" type="button" data-action="account-search">查询</button></div>` : `<span></span>`}${toolButtons(`<button class="btn btn-primary" type="button" data-action="open-account">${icon("plus-circle")}创建账号</button>`)}</div>
          <div class="table-card"><div class="table-scroll"><table class="data-table is-wide"><thead><tr><th>序号</th><th>账号</th><th>真实姓名</th><th>状态</th><th>性别</th><th>手机号码</th><th>角色</th><th>关联租户</th><th>最后登录时间</th><th>操作</th></tr></thead><tbody>
            ${rows.length ? rows.map((item, index) => { const row = item.row; return `<tr><td>${index + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${status(row[2])}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td>${row[6]}</td><td>${row[7]}</td><td><div class="table-actions"><button class="text-button" type="button" data-toggle-account="${item.id}">${row[2] === "已启用" ? "停用" : "启用"}</button><button class="text-button" type="button" data-action="not-implemented">编辑</button></div></td></tr>`; }).join("") : `<tr><td colspan="10">暂无符合条件的数据</td></tr>`}
          </tbody></table></div></div>${tablePagination(30)}</section>`;
      }

      function rolePage() {
        const query = state.roleQuery.trim().toLowerCase();
        const rows = state.roles.filter(role => !query || `${role.name} ${role.code} ${role.description}`.toLowerCase().includes(query));
        return `<section class="page"><div class="breadcrumb-toolbar-row">${renderBreadcrumb()}${toolButtons(`<button class="btn btn-primary" type="button" data-action="open-role">${icon("plus-circle")}创建角色</button>`)}</div>
          ${state.roleSearchOpen ? `<div class="page-title-row"><div class="search-inline"><input id="role-search" class="control" value="${escapeHtml(state.roleQuery)}" placeholder="搜索角色名称、编码或描述" /><button class="btn" type="button" data-action="role-search">查询</button></div></div>` : ""}
          <div class="table-card"><div class="table-scroll"><table class="data-table role-table"><thead><tr><th>序号</th><th>角色名称</th><th>角色编码</th><th>角色描述</th><th>创建时间</th><th>修改时间</th><th>绑定权限</th><th>操作</th></tr></thead><tbody>
            ${rows.length ? rows.map((role, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(role.name)}</td><td>${escapeHtml(role.code)}</td><td><span class="role-description" title="${escapeHtml(role.description)}">${escapeHtml(role.description)}</span></td><td>${role.createdAt}</td><td>${role.updatedAt}</td><td><button class="btn tool-icon role-permission-button" type="button" data-role-bind="${role.id}" aria-label="绑定${escapeHtml(role.name)}权限" title="绑定权限">${icon("link")}</button></td><td><div class="table-actions"><button class="text-button" type="button" data-role-edit="${role.id}">修改角色</button><button class="text-button danger" type="button" data-role-remove="${role.id}">移除角色</button></div></td></tr>`).join("") : `<tr><td colspan="8">暂无符合条件的数据</td></tr>`}
          </tbody></table></div></div>${tablePagination(state.roles.length, 1)}</section>`;
      }

      function wecomEntityById(id) {
        return state.wecomEntities.find(entity => entity.id === id) || state.wecomEntities[0];
      }

      function wecomTenantTags(tenants, emptyText = "待确认") {
        if (!tenants?.length) return `<span class="tag neutral">${escapeHtml(emptyText)}</span>`;
        return tenants.map(tenant => `<span class="tag">${escapeHtml(tenant)}</span>`).join("");
      }

      function visibleWecomOrganizations(entity) {
        const visible = [];
        let showChildren = true;
        entity.organizations.forEach(organization => {
          if (organization.level === 1) {
            visible.push(organization);
            showChildren = !organization.hasChildren || organization.expanded;
          } else if (showChildren) {
            visible.push(organization);
          }
        });
        return visible;
      }

      function wecomPage() {
        const query = state.wecomEntityQuery.trim().toLowerCase();
        const entities = state.wecomEntities.filter(entity => !query || entity.name.toLowerCase().includes(query));
        const entityRows = entities.map(entity => {
          const accountCount = wecomAccounts.filter(account => account.entityId === entity.id).length;
          return `<tr><td title="${escapeHtml(entity.name)}">${escapeHtml(entity.name)}</td><td>${accountCount}</td><td>${escapeHtml(entity.syncedAt)}</td><td><div class="table-actions"><button class="text-button" type="button" data-wecom-detail="${entity.id}">查看账号详情</button></div></td></tr>`;
        }).join("");
        return `<section class="page"><div class="wecom-breadcrumb-row">${renderBreadcrumb()}${toolButtons()}</div>
          <form class="filter-card" data-form="wecom-filter"><div class="filter-grid wecom-filter-grid">
            <div class="field"><label for="wecom-entity-name">企业主体名称</label><input id="wecom-entity-name" name="name" class="control" value="${escapeHtml(state.wecomEntityQuery)}" placeholder="请输入企业主体名称" /></div>
            <div class="filter-actions"><button class="btn" type="button" data-action="wecom-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div>
          </div></form>
          <div class="table-card"><div class="table-scroll"><table class="data-table wecom-entity-table"><thead><tr><th>企业主体</th><th>企业人数</th><th>最新同步时间</th><th>操作</th></tr></thead><tbody>
            ${entityRows || `<tr><td colspan="4">未找到匹配的企业主体</td></tr>`}
          </tbody></table></div></div>${tablePagination(entities.length)}</section>`;
      }

      function wecomDetailPage() {
        const entity = wecomEntityById(state.selectedWecomEntityId);
        const nameQuery = state.wecomAccountNameQuery.trim().toLowerCase();
        const entityAccounts = wecomAccounts.filter(account => account.entityId === entity.id);
        const rows = entityAccounts.filter(account => {
          const matchesName = !nameQuery || account.name.toLowerCase().includes(nameQuery);
          const matchesTenant = !state.wecomAccountTenantQuery || (account.managedStatus === "在线" && account.tenant === state.wecomAccountTenantQuery);
          const matchesManagedStatus = !state.wecomAccountManagedStatusQuery || account.managedStatus === state.wecomAccountManagedStatusQuery;
          return matchesName && matchesTenant && matchesManagedStatus;
        });
        const accountTenantOptions = [...new Set(entityAccounts.filter(account => account.managedStatus === "在线").map(account => account.tenant))].map(tenant => `<option value="${escapeHtml(tenant)}"${state.wecomAccountTenantQuery === tenant ? " selected" : ""}>${escapeHtml(tenant)}</option>`).join("");
        return `<section class="page wecom-account-page"><div class="wecom-breadcrumb-row">${renderBreadcrumb()}${toolButtons()}</div>
          <button class="back-link wecom-detail-back" type="button" data-route="wecom">${icon("arrow-left")}返回企微账号管理</button>
          <section class="detail-card wecom-scope-card"><div class="wecom-scope-main"><strong>企业主体：${escapeHtml(entity.name)}</strong></div></section>
          <form class="filter-card" data-form="wecom-account-filter"><div class="filter-grid wecom-account-filter-grid">
            <div class="field"><label for="wecom-account-name">账号姓名</label><input id="wecom-account-name" name="name" class="control" value="${escapeHtml(state.wecomAccountNameQuery)}" placeholder="请输入账号姓名" /></div>
            <div class="field"><label for="wecom-account-tenant">租户归属</label><select id="wecom-account-tenant" name="tenant" class="control"><option value="">全部</option>${accountTenantOptions}</select></div>
            <div class="field"><label for="wecom-account-managed-status">托管企微账号状态</label><select id="wecom-account-managed-status" name="managedStatus" class="control"><option value="">全部</option><option value="未托管"${state.wecomAccountManagedStatusQuery === "未托管" ? " selected" : ""}>未托管</option><option value="在线"${state.wecomAccountManagedStatusQuery === "在线" ? " selected" : ""}>在线</option><option value="离线"${state.wecomAccountManagedStatusQuery === "离线" ? " selected" : ""}>离线</option><option value="二次验证"${state.wecomAccountManagedStatusQuery === "二次验证" ? " selected" : ""}>二次验证</option></select></div>
            <div class="filter-actions"><button class="btn btn-primary" type="submit">查询</button><button class="btn" type="button" data-action="wecom-account-reset">重置</button></div>
          </div></form>
          <div class="table-card"><div class="table-scroll"><table class="data-table wecom-account-table"><thead><tr><th>序号</th><th>UserID</th><th>账号姓名</th><th>手机号码</th><th>所属组织</th><th>租户归属</th><th>托管企微账号状态</th><th>注册时间</th><th>最后登录时间</th></tr></thead><tbody>
            ${rows.length ? rows.map((account, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(account.userId)}</td><td>${escapeHtml(account.name)}</td><td>${["在线", "离线"].includes(account.managedStatus) ? escapeHtml(account.phone) : "--"}</td><td>${escapeHtml(account.organization)}</td><td>${account.managedStatus === "在线" ? `<span class="tag${account.tenant === "待确认" ? " neutral" : ""}">${escapeHtml(account.tenant)}</span>` : "--"}</td><td><span class="status${account.managedStatus === "在线" ? " success" : ""}"><span class="status-dot"></span>${escapeHtml(account.managedStatus)}</span></td><td>${account.registeredAt}</td><td>${account.lastLoginAt}</td></tr>`).join("") : `<tr><td colspan="9">暂无符合条件的账号</td></tr>`}
          </tbody></table></div></div>${tablePagination(nameQuery || state.wecomAccountTenantQuery || state.wecomAccountManagedStatusQuery ? rows.length : 1286)}</section>`;
      }

      function doctorPage() {
        const query = state.doctorQuery.trim().toLowerCase();
        const rows = doctors.filter(row => !query || row.join(" ").toLowerCase().includes(query));
        return `<section class="page">${renderBreadcrumb()}${toolButtons(`<button class="btn btn-primary" type="button" data-action="export">导出</button>`)}
          <form class="filter-card" data-form="doctor-filter"><div class="filter-grid doctor-filter-grid">
            <div class="field"><label>医生姓名</label><input id="doctor-filter-first" name="query" class="control" value="${escapeHtml(state.doctorQuery)}" placeholder="请输入医生姓名" /></div><div class="field"><label>手机号</label><input class="control" placeholder="请输入手机号" /></div><div class="field"><label>所属租户</label><select class="control"><option>全部租户</option><option>中康科技</option></select></div><div class="field"><label>所属项目</label><select class="control"><option>全部项目</option><option>糖尿病患者管理项目</option></select></div>
            <div class="field"><label>注册时间范围</label><input class="control" placeholder="开始日期 — 结束日期" /></div><div class="filter-actions"><button class="btn" type="button" data-action="doctor-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div>
          </div></form>
          <div class="table-card"><div class="table-scroll"><table class="data-table is-extra-wide"><thead><tr><th>序号</th><th>手机号</th><th>医生姓名</th><th>所属租户</th><th>所属项目</th><th>所属医院</th><th>科室</th><th>职称</th><th>是否注册企微</th><th>企微托管状态</th><th>注册时间</th><th>最后登录时间</th><th>操作</th></tr></thead><tbody>
            ${rows.length ? rows.map((row, index) => `<tr><td>${index + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td><span class="tag">${row[6]}</span></td><td>${status(row[9])}</td><td>${status(row[10])}</td><td>${row[11]}</td><td>${row[12]}</td><td><button class="text-button" type="button" data-route="doctor-detail">查看详情</button></td></tr>`).join("") : `<tr><td colspan="13">暂无符合条件的数据</td></tr>`}
          </tbody></table></div></div>${tablePagination(29)}</section>`;
      }

      function doctorDetailPage() {
        return `<section class="page doctor-detail-page">${renderBreadcrumb()}<div class="doctor-detail-content"><section class="doctor-hero"><div class="doctor-avatar">${icon("stethoscope")}</div><div><h1>邓医生</h1><p>主治医师 · 内科</p></div></section>
          <div class="doctor-summary-grid"><section class="doctor-summary-card"><span>注册天数</span><strong>${icon("clock")}8 天</strong></section><section class="doctor-summary-card"><span>最后登录</span><strong>${icon("clock")}1 天前</strong></section><section class="doctor-summary-card"><span>账号状态</span><strong class="is-active">${icon("user-check")}活跃</strong></section></div>
          <div class="doctor-information-grid"><section class="doctor-info-card"><h2>${icon("user")}<span>基本信息</span></h2><div class="doctor-card-body doctor-basic-list">
            <div class="doctor-info-line"><span class="doctor-info-label">${icon("phone")}手机号：</span><strong class="doctor-inline-value">185****5070 <button class="text-button" type="button" data-action="view-sensitive">查看</button></strong></div>
            <div class="doctor-info-line"><span class="doctor-info-label">${icon("id-card")}医生姓名：</span><strong>邓医生</strong></div>
            <div class="doctor-info-line"><span class="doctor-info-label">${icon("building")}所属医院：</span><strong>仁和医院</strong></div>
            <div class="doctor-info-line"><span class="doctor-info-label">${icon("house")}科室：</span><strong>内科</strong></div>
            <div class="doctor-info-line"><span class="doctor-info-label">${icon("shield")}职称：</span><strong><span class="tag">主治医师</span></strong></div>
          </div></section>
          <section class="doctor-info-card doctor-status-card"><h2>${icon("user-plus")}<span>注册与状态信息</span></h2><div class="doctor-card-body doctor-status-grid">
            <div class="doctor-info-line"><span class="doctor-info-label">企微账号：</span><strong class="doctor-inline-value doctor-wecom-value"><span>张医生</span><span class="doctor-wecom-id">| UserID: zhang_doctor_01</span></strong></div>
            <div class="doctor-info-line"><span class="doctor-info-label">企微托管状态：</span><strong><span class="status success"><span class="status-dot"></span>在线</span></strong></div>
            <div class="doctor-info-line"><span class="doctor-info-label">注册时间：</span><strong class="doctor-inline-value">2026-07-29 09:10:18 <span class="tag danger doctor-status-tag">8 天前</span></strong></div>
            <div class="doctor-info-line doctor-login-row"><span class="doctor-info-label">最后登录时间：</span><strong class="doctor-inline-value">2026-08-04 19:33:10 <span class="tag success doctor-status-tag">活跃用户</span></strong></div>
          </div></section></div>
          <section class="doctor-info-card doctor-edc-card"><h2>EDC 项目关联 <span>支持一个医生关联多个 EDC 项目，非必填。</span></h2><div class="doctor-empty-panel"><div><img src="${doctorEmptyImage}" alt="暂未关联 EDC 项目" /><p>暂未关联 EDC 项目</p></div></div></section>
          <section class="doctor-info-card doctor-activity-card"><h2>活动时间线</h2><div class="doctor-activity-list" aria-label="医生活动时间线">
            <article class="doctor-activity-item is-login"><span class="doctor-activity-node" aria-hidden="true"></span><div class="doctor-activity-copy"><strong>最后登录</strong><time datetime="2026-08-04T19:33:10">2026-08-04 19:33:10</time><span>5 天前</span></div></article>
            <article class="doctor-activity-item is-register"><span class="doctor-activity-node" aria-hidden="true"></span><div class="doctor-activity-copy"><strong>注册成功</strong><time datetime="2026-07-29T09:10:18">2026-07-29 09:10:18</time><span>注册成功</span></div></article>
          </div></section></div></section>`;
      }

      function patientPage() {
        const nameQuery = state.patientNameQuery.trim().toLowerCase();
        const nicknameQuery = state.patientNicknameQuery.trim().toLowerCase();
        const rows = patients.map((row, index) => ({ row, index })).filter(({ row }) => (!nameQuery || row[0].toLowerCase().includes(nameQuery)) && (!nicknameQuery || row[1].toLowerCase().includes(nicknameQuery)));
        return `<section class="page">${renderBreadcrumb()}${toolButtons(`<button class="btn btn-primary" type="button" data-action="export">导出</button>`)}
          <form class="filter-card" data-form="patient-filter"><div class="filter-grid patient-filter-grid">
            <div class="field"><label>患者姓名</label><input id="patient-filter-first" name="name" class="control" value="${escapeHtml(state.patientNameQuery)}" placeholder="请输入患者姓名" /></div><div class="field"><label>微信昵称</label><input name="nickname" class="control" value="${escapeHtml(state.patientNicknameQuery)}" placeholder="请输入微信昵称" /></div><div class="field"><label>手机号</label><input class="control" placeholder="请输入手机号" /></div><div class="field"><label>诊断</label><input class="control" placeholder="请输入诊断" /></div>
            <div class="field"><label>医生姓名</label><input class="control" placeholder="请输入医生姓名" /></div>
            <div class="field"><label>租户名称</label><select class="control"><option>全部租户</option></select></div><div class="field"><label>项目名称</label><select class="control"><option>全部项目</option></select></div><div class="field"><label>医院名称</label><input class="control" placeholder="请输入医院名称" /></div><div class="field"><label>是否建档</label><select class="control"><option>请选择</option><option>已建档</option><option>未建档</option></select></div>
            <div class="field"><label>是否上传病历</label><select class="control"><option>请选择</option><option>已上传</option><option>未上传</option></select></div><div class="field"><label>注册场景码</label><select class="control"><option>请选择场景码</option></select></div><div class="field"><label>注册时间</label><input class="control" placeholder="开始日期 — 结束日期" /></div><div class="filter-actions"><button class="btn" type="button" data-action="patient-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div>
          </div></form>
          <div class="table-card"><div class="table-scroll"><table class="data-table is-extra-wide patient-table"><thead><tr><th>患者姓名</th><th>微信昵称</th><th>性别</th><th>联系方式</th><th>诊断信息</th><th>添加医生</th><th>医生所属医院</th><th>医生所属租户</th><th>医生所属项目</th><th>注册场景码</th><th>是否建档</th><th>是否上传病历</th><th>是否首次添加医生</th><th>是否当前使用</th><th>注册时间</th><th>最新登录时间</th><th>操作</th></tr></thead><tbody>
            ${rows.length ? rows.map(({ row, index }) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td>${row[6]}</td><td>${row[7]}</td><td>${row[8]}</td><td>${row[9]}</td><td><span class="tag ${row[10] === "已建档" ? "success" : "neutral"}">${row[10]}</span></td><td><span class="tag neutral">${row[11]}</span></td><td>${row[14] ? `<span class="tag">首次医生</span>` : "--"}</td><td>${row[15] ? `<span class="tag warning">当前使用</span>` : "--"}</td><td>${row[12]}</td><td>${row[13]}</td><td><button class="text-button" type="button" data-patient-detail="${index}">查看详情</button></td></tr>`).join("") : `<tr><td colspan="17">暂无符合条件的数据</td></tr>`}
          </tbody></table></div></div>${tablePagination(70)}</section>`;
      }

      function botTypeIcon(type) {
        if (type.includes("编排")) return "link";
        if (type.includes("提示词")) return "message";
        return "star";
      }

      function botTypeClass(type) {
        if (type.includes("编排")) return "bot-type-orchestration";
        if (type.includes("提示词")) return "bot-type-prompt";
        return "bot-type-skill";
      }

      function botStatusTone(value) {
        if (value === "已发布") return "success";
        if (value === "不可用待处理") return "warning";
        if (value === "未发布") return "info";
        return "neutral";
      }

      function botStatusTag(value, extraClass = "") {
        return `<span class="tag ${botStatusTone(value)}${extraClass ? ` ${extraClass}` : ""}">${escapeHtml(value)}</span>`;
      }

      function renderBotChannels(channels, online = true, showOffline = false) {
        const visible = channels.filter(channel => channel === "企业微信");
        const stateClass = online ? "is-online" : "is-offline";
        const accessibleLabel = online ? "企业微信" : "企业微信，离线";
        return `<div class="bot-channel-row${visible.length ? "" : " is-empty"}"${visible.length ? ` aria-label="接入渠道"` : ` aria-hidden="true"`}>${visible.length ? `<span class="bot-channel-item${showOffline ? " is-detail" : ""}"><span class="bot-channel ${stateClass}" title="${accessibleLabel}" aria-label="${accessibleLabel}">${icon("comments")}</span>${showOffline && !online ? `<small class="bot-channel-offline">离线</small>` : ""}</span>` : ""}</div>`;
      }

      function renderBotTypes(bot) {
        return `<span class="bot-card-types"><span class="bot-card-type-entry"><span class="bot-type ${botTypeClass(bot.type)}">${icon(botTypeIcon(bot.type))}${escapeHtml(bot.type)}</span></span></span>`;
      }

      function renderBotAgentSummaries(bot) {
        const agents = getBotAgents(bot).slice(0, 1);
        if (!agents.length) return `<p class="bot-note">暂未关联智能体</p>`;
        return `<div class="bot-agent-summary-list">${agents.map(agent => `<div class="bot-agent-summary"><span class="bot-agent-icon">${icon(botTypeIcon(agent.type))}</span><strong>${escapeHtml(agent.name)}</strong><span>${escapeHtml(agent.type)}</span></div>`).join("")}</div>`;
      }

      function botCardPagination(total) {
        const disabled = total <= 6 ? " disabled" : "";
        return `<div class="pagination bot-card-pagination" aria-label="Bot 列表分页"><span>共 ${total} 条数据</span>
          <button class="page-button" type="button" data-page="prev" aria-label="上一页"${disabled}>${icon("chevron-left")}</button>
          <button class="page-button is-active" type="button" data-page="1" aria-current="page">1</button>
          <button class="page-button" type="button" data-page="next" aria-label="下一页"${disabled}>${icon("chevron-right")}</button>
          <select class="control page-size" aria-label="每页条数"><option>6 条/页</option><option>12 条/页</option></select><span>跳至</span><input class="control jump" inputmode="numeric" aria-label="跳转页码" /><span>页</span>
        </div>`;
      }

      function botConfigPage() {
        const query = state.botQuery.trim().toLowerCase();
        const visibleBots = botsSeed.filter(bot => {
          const agentText = getBotAgents(bot).map(agent => `${agent.name} ${agent.type}`).join(" ");
          const matchesQuery = !query || `${bot.name} ${bot.description} ${agentText}`.toLowerCase().includes(query);
          const matchesStatus = !state.botStatus || bot.status === state.botStatus;
          return matchesQuery && matchesStatus;
        }).sort((first, second) => state.botSort === "Bot 名称" ? first.name.localeCompare(second.name, "zh-CN") : 0);
        const hasField = field => state.botCardFields.has(field);
        return `<section class="page bot-config-page"><div class="breadcrumb-toolbar-row">${renderBreadcrumb()}<div class="bot-hero-tools" aria-label="列表工具">
            <button class="btn tool-icon" type="button" data-action="bot-search" aria-label="搜索 Bot" title="搜索">${icon("search")}</button>
            <button class="btn tool-icon" type="button" data-action="bot-toggle-filter" aria-label="${state.botFiltersOpen ? "隐藏" : "显示"}筛选条件" aria-pressed="${state.botFiltersOpen}" title="筛选">${icon("filter")}</button>
            <button class="btn tool-icon" type="button" data-action="bot-card-settings" aria-label="卡片设置" title="卡片设置">${icon("settings")}</button>
          </div></div>
          <header class="bot-list-heading"><div><h1>Bot 配置</h1><p>配置 Bot、关联已发布智能体，管理渠道接入、服务设置与回退策略。</p></div></header>
          ${state.botFiltersOpen ? `<form class="filter-card" data-form="bot-filter"><div class="filter-grid bot-filter-grid">
            <div class="field"><label>Bot 名称</label><input id="bot-filter-first" name="query" class="control" data-bot-filter-field="query" value="${escapeHtml(state.botQuery)}" placeholder="请输入 Bot 名称" /></div>
            <div class="field"><label>状态</label><select name="status" class="control" data-bot-filter-field="status"><option value="">全部状态</option>${["未发布", "已发布", "不可用待处理", "停用", "归档"].map(value => `<option${state.botStatus === value ? " selected" : ""}>${value}</option>`).join("")}</select></div>
            <div class="field"><label>排序</label><select name="sort" class="control" data-bot-filter-field="sort"><option${state.botSort === "最近更新时间" ? " selected" : ""}>最近更新时间</option><option${state.botSort === "Bot 名称" ? " selected" : ""}>Bot 名称</option></select></div>
            <div class="filter-actions"><button class="btn" type="button" data-action="bot-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div>
          </div></form>` : ""}
          <div class="bot-card-grid" aria-label="Bot 配置列表">${visibleBots.length ? visibleBots.map(bot => `<article class="bot-card" tabindex="0" role="link" data-bot-detail="${bot.id}" aria-label="查看 ${escapeHtml(bot.name)} 详情">
            ${botStatusTag(bot.status, "bot-card-status")}
            <div class="bot-card-head"><span class="bot-avatar">${icon("bot")}</span><div class="bot-card-title"><h2>${escapeHtml(bot.name)}</h2>${hasField("type") ? renderBotTypes(bot) : ""}</div></div>
            ${hasField("description") ? `<p class="bot-card-description">${escapeHtml(bot.description)}</p>` : ""}
            ${hasField("sessions") || hasField("handoff") ? `<dl class="bot-card-metrics">${hasField("sessions") ? `<div><dt>今日会话</dt><dd>${escapeHtml(bot.sessions)}</dd></div>` : ""}${hasField("handoff") ? `<div><dt>转人工率</dt><dd>${escapeHtml(bot.handoff)}</dd></div>` : ""}</dl>` : ""}
            ${hasField("updated") ? `<p class="bot-card-updated"><span>最近更新时间：</span><strong>${escapeHtml(bot.updated)}</strong></p>` : ""}
          </article>`).join("") : `<div class="bot-empty">暂无符合条件的 Bot</div>`}</div>${botCardPagination(visibleBots.length)}
        </section>`;
      }

      function botOverviewContent(bot) {
        const configured = bot.project !== "--";
        return `<div class="bot-detail-content"><section class="bot-metric-panel"><div><span>今日会话</span><strong>${escapeHtml(bot.sessions)}</strong></div><div><span>转人工率</span><strong>${escapeHtml(bot.handoff)}</strong></div><div><span>最近更新时间</span><strong>${escapeHtml(bot.updated)}</strong></div></section>
          <div class="bot-overview-grid bot-overview-without-basic">
            <section><h2>关联智能体</h2>${renderBotAgentSummaries(bot)}</section>
            <section><h2>服务设置</h2><dl class="bot-info-list"><div><dt>服务时段</dt><dd>${configured ? escapeHtml(bot.serviceTime) : "--"}</dd></div><div><dt>欢迎语</dt><dd>${configured ? escapeHtml(bot.opening) : "--"}</dd></div><div><dt>智能转人工</dt><dd>${configured ? `${escapeHtml(bot.transfer)}<br><span>开启后，会话转至医助处理</span>` : "--"}</dd></div></dl></section>
          </div></div>`;
      }

      function botChannelSettingsContent(bot) {
        const connected = bot.channels.includes("企业微信");
        const online = connected && bot.channelOnline;
        const statusText = !connected ? "未接入" : online ? "已接入" : "已接入（离线）";
        return `<div class="bot-detail-content bot-channel-settings"><section><div class="bot-channel-settings-title"><h2>接入渠道</h2><p>查看企业微信接入状态。</p></div><div class="bot-channel-list-head" aria-hidden="true"><span>渠道</span><span>接入状态</span></div><article class="bot-channel-list-row"><div class="bot-channel-identity"><span class="bot-channel-app-icon${online ? "" : " is-offline"}"><img src="${wecomBotIcon}" alt="" /></span><span><strong>企业微信智能机器人</strong><small>企业微信</small></span></div><span class="status${online ? " success" : ""}"><span class="status-dot"></span>${statusText}</span></article></section></div>`;
      }

      function botServiceContent(bot) {
        const enabled = bot.transfer === "已启用";
        return `<div class="bot-service-detail">
          <section><h2>服务设置</h2><dl class="bot-info-list"><div><dt>服务时段</dt><dd>${escapeHtml(bot.serviceTime)}</dd></div><div><dt>欢迎语</dt><dd>${escapeHtml(bot.opening)}</dd></div></dl></section>
          <section><h2>智能转人工</h2><div class="bot-readonly-setting"><div><strong>配置项</strong><strong>状态</strong><strong>说明</strong></div><div><span>转人工设置</span><span class="status${enabled ? " success" : ""}"><span class="status-dot"></span>${enabled ? "已启用" : "未启用"}</span><span>${enabled ? "开启后，会话转至医助处理" : "--"}</span></div></div><div class="bot-info-strip">${icon("message")}转人工会话默认由 Bot 关联项目的医助处理。</div></section>
          <section><h2>转人工配置详情</h2><div class="bot-transfer-detail"><div><h3>触发配置</h3><dl class="bot-info-list"><div><dt>触发时机</dt><dd>${enabled ? "关键词匹配：转人工、人工客服" : "--"}</dd></div></dl></div><div><h3>回复配置</h3><dl class="bot-info-list"><div><dt>默认回复</dt><dd>${enabled ? "已为您转接医助，请稍候。" : "--"}</dd></div><div><dt>回复模式</dt><dd>${enabled ? "转人工后不回复" : "--"}</dd></div></dl></div></div></section>
          <section><h2>智能总结</h2><p>会话摘要：汇总用户诉求与关键信息</p></section>
        </div>`;
      }

      function botAuditContent() {
        const allRows = [
          ["2025-06-02 09:18", "王小明", "归档", "归档 Bot", "成功"],
          ["2025-05-28 16:05", "王小明", "停用", "停用 Bot", "成功"],
          ["2025-05-20 14:32", "王小明", "发布", "提交发布", "成功"],
          ["2025-05-20 14:26", "王小明", "发布", "提交发布", "失败"],
          ["2025-03-08 16:48", "张小雨", "创建", "创建 Bot", "成功"],
          ["2025-03-08 16:42", "张小雨", "创建", "创建 Bot", "失败"]
        ];
        const query = state.botAuditQuery.trim().toLowerCase();
        const rows = allRows.filter(row => (!query || row[1].toLowerCase().includes(query) || row[3].toLowerCase().includes(query)) && (!state.botAuditType || row[2] === state.botAuditType) && (!state.botAuditResult || row[4] === state.botAuditResult));
        return `<div class="bot-detail-content"><section><h2>操作记录 ${botStatusTag(String(allRows.length))}</h2><div class="bot-audit-filters"><label class="bot-audit-search">${icon("search")}<input data-bot-audit-field="query" value="${escapeHtml(state.botAuditQuery)}" placeholder="搜索操作人或内容" /></label><select class="control" data-bot-audit-field="type"><option value="">全部操作</option>${["创建", "发布", "停用", "归档"].map(value => `<option${state.botAuditType === value ? " selected" : ""}>${value}</option>`).join("")}</select><select class="control" data-bot-audit-field="result"><option value="">全部结果</option>${["成功", "失败"].map(value => `<option${state.botAuditResult === value ? " selected" : ""}>${value}</option>`).join("")}</select><select class="control" data-bot-audit-field="range">${["最近 30 天", "最近 90 天", "最近一年", "全部时间"].map(value => `<option${state.botAuditRange === value ? " selected" : ""}>${value}</option>`).join("")}</select></div><div class="table-card"><div class="table-scroll"><table class="bot-readonly-table"><thead><tr><th>操作时间</th><th>操作人</th><th>操作类型</th><th>操作内容</th><th>结果</th></tr></thead><tbody>${rows.length ? rows.map(row => `<tr>${row.map((cell, index) => `<td>${index === 4 ? `<span class="bot-audit-result ${cell === "成功" ? "is-success" : "is-failure"}">${icon(cell === "成功" ? "circle-check" : "circle-x")}${escapeHtml(cell)}</span>` : escapeHtml(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="5">暂无符合条件的操作记录</td></tr>`}</tbody></table></div></div><footer class="bot-audit-footer"><span>共 ${rows.length} 条记录</span><div><button class="page-button" type="button" aria-label="上一页" disabled>${icon("chevron-left")}</button><button class="page-button is-active" type="button" data-page="1" aria-current="page">1</button><button class="page-button" type="button" aria-label="下一页" disabled>${icon("chevron-right")}</button></div></footer></section></div>`;
      }

      function botDetailPage() {
        const bot = botsSeed.find(item => item.id === state.selectedBotId) || botsSeed[0];
        const tabs = [{ id: "overview", label: "概览" }, { id: "service", label: "服务设置" }, { id: "audit", label: "操作记录" }];
        const content = state.botDetailTab === "service" ? botServiceContent(bot) : state.botDetailTab === "audit" ? botAuditContent(bot) : botOverviewContent(bot);
        return `<section class="page bot-detail-page">${renderBreadcrumb()}
          <header class="bot-detail-hero"><span class="bot-detail-avatar">${icon("bot")}</span><div class="bot-detail-copy"><h1>${escapeHtml(bot.name)}</h1><span class="bot-type ${botTypeClass(bot.type)}">${icon(botTypeIcon(bot.type))}${escapeHtml(bot.type)}</span><p>${escapeHtml(bot.description)}</p></div>${botStatusTag(bot.status, "bot-detail-status")}</header>
          <nav class="bot-detail-tabs" aria-label="Bot 详情页签">${tabs.map(tab => `<button class="${state.botDetailTab === tab.id ? "is-active" : ""}" type="button" data-bot-tab="${tab.id}" aria-current="${state.botDetailTab === tab.id ? "page" : "false"}">${tab.label}</button>`).join("")}</nav>
          ${content}
        </section>`;
      }

      function materialTypeIcon(type) {
        return ({ "文本": "menu", "图片": "upload", "网页": "link", "视频": "circle-check", "语音": "message", "文件": "folder", "小程序": "link" })[type] || "folder";
      }

      function materialPage() {
        const types = ["全部", "文本", "图片", "网页", "视频", "语音", "文件", "小程序"];
        const groups = [{ id: "all", name: "全部素材", count: state.materials.length }, ...state.materialGroups.map(name => ({ id: name, name, count: state.materials.filter(item => item.group === name).length }))];
        const scopedMaterials = state.materials.filter(item => state.materialGroup === "all" || item.group === state.materialGroup);
        const typeCounts = Object.fromEntries(types.map(type => [type, type === "全部" ? scopedMaterials.length : scopedMaterials.filter(item => item.type === type).length]));
        const query = state.materialQuery.trim().toLowerCase();
        const rows = scopedMaterials.filter(item => (state.materialType === "全部" || item.type === state.materialType) && (!query || `${item.title} ${item.summary}`.toLowerCase().includes(query))).sort((first, second) => Number(second.pinned) - Number(first.pinned));
        return `<section class="page material-page"><div class="breadcrumb-toolbar-row">${renderBreadcrumb()}${toolButtons(`<button class="btn btn-primary" type="button" data-route="material-new">${icon("plus-circle")}新增素材</button>`)}</div>
          <nav class="section-tab-bar" aria-label="素材范围"><button class="is-active" type="button" aria-current="page">平台素材</button></nav>
          <div class="material-layout"><aside class="material-group-card" aria-label="素材分组"><h2>素材分组</h2><div class="material-group-list">${groups.map((group, groupIndex) => { const materialIndex = groupIndex - 1; const movable = group.id !== "all"; return `<div class="material-group-item${state.materialGroup === group.id ? " is-active" : ""}"${movable ? ` data-material-group-drop-index="${materialIndex}"` : ""}><button class="material-group-select" type="button" data-material-group="${escapeHtml(group.id)}">${escapeHtml(group.name)}（${group.count}）</button>${movable ? `<button class="material-group-move" type="button" draggable="true" data-material-group-drag-index="${materialIndex}" aria-label="拖动${escapeHtml(group.name)}调整位置" title="按住拖动调整位置">${icon("menu")}</button>` : `<span></span>`}</div>`; }).join("")}</div><div class="material-group-footer"><button class="btn" type="button" data-action="material-groups">管理分组</button></div></aside>
          <div class="material-content"><div class="material-type-tabs" role="group" aria-label="素材类型">${types.map(type => `<button class="filter-chip${state.materialType === type ? " is-active" : ""}" type="button" data-material-filter-type="${type}" aria-pressed="${state.materialType === type}"><span>${type}</span><span class="filter-chip-count">${typeCounts[type]}</span></button>`).join("")}</div>
          <form class="material-search-row" data-form="material-filter"><label class="sr-only" for="material-search">素材名称</label><input id="material-search" class="control" name="query" value="${escapeHtml(state.materialQuery)}" placeholder="请输入素材名称" /><div class="material-search-actions"><button class="btn" type="button" data-action="material-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div></form>
          <div class="table-card"><div class="table-scroll"><table class="data-table material-table"><thead><tr><th>素材名称</th><th>分组</th><th>素材摘要</th><th>素材类型</th><th>用途</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows.length ? rows.map(item => `<tr><td><span class="material-title-cell">${escapeHtml(item.title)}${item.pinned ? `<span class="pin-tag">置顶</span>` : ""}</span></td><td>${escapeHtml(item.group)}</td><td>${escapeHtml(item.summary)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.purpose)}</td><td>${escapeHtml(item.updatedAt)}</td><td><div class="table-actions"><button class="text-button" type="button" data-action="material-edit" data-material-id="${item.id}">编辑</button><button class="text-button" type="button" data-material-pin="${item.id}">${item.pinned ? "取消置顶" : "置顶"}</button><button class="text-button danger" type="button" data-material-delete="${item.id}">删除</button></div></td></tr>`).join("") : `<tr><td colspan="7">暂无符合条件的素材</td></tr>`}</tbody></table></div></div>${tablePagination(rows.length, 1)}</div></div>
        </section>`;
      }

      function materialContentPanel(type) {
        const editing = state.materials.find(item => item.id === state.materialEditingId);
        const editingContent = editing?.summary || "";
        const uploadConfig = {
          "图片": { accept: "image/png,image/jpeg", label: "图片", note: "支持 JPG、PNG 格式，最大 10MB" },
          "视频": { accept: "video/*", label: "视频", note: "支持常用视频格式，最大 200MB" },
          "语音": { accept: "audio/*", label: "语音", note: "支持 MP3、WAV 格式，最大 20MB" },
          "文件": { accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx", label: "文件", note: "支持常用文档格式，最大 50MB" }
        };
        if (type === "文本") return `<div class="material-content-panel"><div class="material-textarea-wrap"><textarea id="material-text-content" class="control" name="content" maxlength="200" rows="5" placeholder="请输入文本话术">${escapeHtml(editingContent)}</textarea><span class="character-count" aria-live="polite">${editingContent.length}/200</span></div></div>`;
        if (type === "网页") return `<div class="material-content-panel"><div class="field"><label for="material-web-title">标题</label><input id="material-web-title" class="control" name="webTitle" value="${escapeHtml(editing?.title || "")}" placeholder="请输入网页标题" /></div><div class="field"><label for="material-web-link">链接</label><input id="material-web-link" class="control" name="webLink" type="url" placeholder="请输入网页链接" /></div><div class="field"><label for="material-web-description">描述</label><div class="material-textarea-wrap"><textarea id="material-web-description" class="control" name="webDescription" maxlength="200" rows="3" placeholder="请输入网页描述">${escapeHtml(editingContent)}</textarea><span class="character-count" aria-live="polite">${editingContent.length}/200</span></div></div></div>`;
        if (type === "小程序") return `<div class="material-content-panel"><div class="field"><label for="material-mini-title">标题</label><input id="material-mini-title" class="control" name="miniTitle" placeholder="请输入小程序标题" /></div><div class="field"><label for="material-mini-appid">AppID</label><input id="material-mini-appid" class="control" name="miniAppId" placeholder="请输入 AppID" /></div><div class="field"><label for="material-mini-path">页面路径</label><input id="material-mini-path" class="control" name="miniPath" placeholder="请输入页面路径" /></div></div>`;
        const upload = uploadConfig[type];
        if (upload) {
          const selected = state.materialUploadNames[type];
          return `<label class="material-upload-zone" for="material-upload-input">${icon("upload")}<strong>${selected ? escapeHtml(selected) : `点击或拖拽上传${upload.label}`}</strong><small>${selected ? "文件已选择，确认后保存" : upload.note}</small><input id="material-upload-input" name="upload" type="file" accept="${upload.accept}" data-material-upload="${type}" /></label>`;
        }
        return "";
      }

      function materialNewPage() {
        const types = ["文本", "图片", "网页", "视频", "语音", "文件", "小程序"];
        const editing = state.materials.find(item => item.id === state.materialEditingId);
        const selectedGroup = editing?.group || (state.materialGroup === "all" ? "" : state.materialGroup);
        return `<section class="page material-new-page"><div class="page-title-row"><div>${renderBreadcrumb()}<h1 class="page-title">${editing ? "编辑素材" : "新建素材"}</h1></div></div><form id="material-create-form" class="material-form-card">
          <div class="material-editor"><div class="material-heading-grid"><div class="field"><label for="material-title"><span class="required">*</span>素材标题</label><input id="material-title" class="control" name="title" required maxlength="60" value="${escapeHtml(editing?.title || "")}" placeholder="请输入素材标题" autofocus /></div><div class="field"><label for="material-group">素材分组</label><select id="material-group" class="control" name="group"><option value="">请选择素材分组</option>${state.materialGroups.map(group => `<option value="${escapeHtml(group)}"${selectedGroup === group ? " selected" : ""}>${escapeHtml(group)}</option>`).join("")}</select></div></div>
          <div class="material-scope-grid"><fieldset><legend><span class="required">*</span>素材范围</legend><div class="inline-options"><label><input type="radio" name="scope" value="平台素材" checked />平台素材</label></div></fieldset><fieldset><legend><span class="required">*</span>用途标记</legend><div class="inline-options"><label><input type="radio" name="purpose" value="消息推送" checked />可用于消息推送</label></div></fieldset></div>
          <fieldset class="material-type-fieldset"><legend><span class="required">*</span>素材类型</legend><div class="material-type-picker" role="group" aria-label="素材类型">${types.map(type => `<button class="material-type-option${state.materialFormType === type ? " is-active" : ""}" type="button" data-material-form-type="${type}" aria-pressed="${state.materialFormType === type}">${icon(materialTypeIcon(type))}<span>${type}</span></button>`).join("")}</div><input type="hidden" name="type" value="${state.materialFormType}" /></fieldset>
          <fieldset class="material-content-fieldset"><legend><span class="required">*</span>素材内容</legend>${materialContentPanel(state.materialFormType)}</fieldset></div>
          <footer class="material-form-footer"><button class="btn" type="button" data-route="material">取消</button><button class="btn btn-primary" type="submit">确定</button></footer>
        </form></section>`;
      }

      function tagChildren(parentId) {
        return state.tags.filter(item => item.parent === parentId).sort((a, b) => b.sort - a.sort);
      }

      function tagVisibleRows() {
        const query = state.tagQuery.trim().toLowerCase();
        const visibleIds = new Set();
        if (query) {
          state.tags.filter(item => item.name.toLowerCase().includes(query)).forEach(item => {
            let current = item;
            while (current) {
              visibleIds.add(current.id);
              current = state.tags.find(candidate => candidate.id === current.parent);
            }
          });
        }
        const result = [];
        const visit = (item, level) => {
          if (query && !visibleIds.has(item.id)) return;
          result.push({ item, level });
          if (query || state.tagExpanded.has(item.id)) tagChildren(item.id).forEach(child => visit(child, level + 1));
        };
        tagChildren(null).forEach(item => visit(item, 0));
        return result;
      }

      function tagManagementPage() {
        const rows = tagVisibleRows();
        const expandableTagIds = state.tags.filter(item => state.tags.some(child => child.parent === item.id)).map(item => item.id);
        const allTagsExpanded = expandableTagIds.length > 0 && expandableTagIds.every(id => state.tagExpanded.has(id));
        const allTagsCollapsed = expandableTagIds.every(id => !state.tagExpanded.has(id));
        return `<section class="page tag-page"><div class="breadcrumb-toolbar-row">${renderBreadcrumb()}${toolButtons(`<button class="btn btn-primary" type="button" data-action="tag-add-primary">${icon("plus-circle")}添加一级标签</button>`)}</div>
          <nav class="section-tab-bar" aria-label="标签范围"><button class="is-active" type="button" aria-current="page">平台标签</button></nav>
          <form class="filter-card" data-form="tag-filter"><div class="filter-grid tag-filter-grid"><div class="field"><label for="tag-query">标签名称</label><input id="tag-query" class="control" name="query" value="${escapeHtml(state.tagQuery)}" placeholder="请输入一级／二级／标签名称" /></div><div class="filter-actions"><button class="btn" type="button" data-action="tag-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div></div></form>
          <div class="table-card"><div class="tag-table-toolbar"><div class="tree-master-control"><span class="${allTagsCollapsed ? "is-active" : ""}">全部折叠</span><button class="switch" type="button" role="switch" aria-label="${allTagsExpanded ? "全部折叠" : "全部展开"}" aria-checked="${allTagsExpanded}" data-action="tag-toggle-all"></button><span class="${allTagsExpanded ? "is-active" : ""}">全部展开</span></div></div><div class="table-scroll"><table class="data-table tag-table"><thead><tr><th>标签名称</th><th>类型</th><th>排序</th><th>创建时间</th><th>修改时间</th><th>操作</th></tr></thead><tbody>${rows.length ? rows.map(({ item, level }) => { const children = tagChildren(item.id); const expanded = state.tagExpanded.has(item.id); return `<tr><td><span class="tag-tree-name level-${level}">${children.length ? `<button class="tag-tree-toggle" type="button" data-tag-toggle="${item.id}" aria-label="${expanded ? "折叠" : "展开"}${escapeHtml(item.name)}" aria-expanded="${expanded}">${icon(expanded ? "chevron-down" : "chevron-right")}</button>` : `<span class="tag-tree-spacer"></span>`}${escapeHtml(item.name)}</span></td><td>${escapeHtml(item.type)}</td><td>${item.sort}</td><td>${escapeHtml(item.createdAt)}</td><td>${escapeHtml(item.updatedAt)}</td><td><div class="table-actions"><button class="text-button" type="button" data-tag-edit="${item.id}">编辑</button>${item.type === "一级标签" ? `<button class="text-button" type="button" data-tag-add-secondary="${item.id}">添加二级标签</button>` : ""}${item.type === "二级标签" ? `<button class="text-button" type="button" data-tag-add-name="${item.id}">添加标签名称</button>` : ""}<button class="text-button danger" type="button" data-tag-delete="${item.id}">删除</button></div></td></tr>`; }).join("") : `<tr><td colspan="6">暂无符合条件的标签</td></tr>`}</tbody></table></div></div>
        </section>`;
      }

      function messageShowsResult(status) {
        return ["已完成", "异常任务"].includes(status);
      }

      function messageStatusTag(value) {
        const tone = value === "已完成" ? "success" : value === "异常任务" ? "danger" : value === "待执行" ? "warning" : value === "已取消" ? "neutral" : "info";
        return `<span class="tag ${tone}">${escapeHtml(value)}</span>`;
      }

      function messageTouchPage() {
        const statuses = ["全部", "进行中", "异常任务", "待执行", "已取消", "已完成"];
        const statusCount = status => status === "全部" ? state.messages.length : state.messages.filter(item => item.status === status).length;
        const query = state.messageTaskQuery.trim().toLowerCase();
        const creator = state.messageCreatorQuery.trim().toLowerCase();
        const rows = state.messages.filter(item => {
          const created = item.createdAt.slice(0, 10);
          const sent = item.sentAt === "--" ? "" : item.sentAt.slice(0, 10);
          return (state.messageStatus === "全部" || item.status === state.messageStatus)
            && (!query || `${item.name} ${item.content}`.toLowerCase().includes(query))
            && (!creator || item.creator.toLowerCase().includes(creator))
            && (!state.messageSendTypeQuery || item.sendType === state.messageSendTypeQuery)
            && (!state.messageCreateStart || created >= state.messageCreateStart)
            && (!state.messageCreateEnd || created <= state.messageCreateEnd)
            && (!state.messageSendStart || sent >= state.messageSendStart)
            && (!state.messageSendEnd || sent <= state.messageSendEnd);
        });
        return `<section class="page message-page"><div class="breadcrumb-toolbar-row">${renderBreadcrumb()}${toolButtons(`<button class="btn btn-primary" type="button" data-route="message-new">${icon("plus-circle")}添加任务</button>`)}</div>
          <nav class="section-tab-bar" aria-label="消息触达类型"><button class="is-active" type="button" aria-current="page">单聊群发</button></nav>
          <div class="message-status-tabs" role="tablist" aria-label="任务状态">${statuses.map(item => `<button class="filter-chip message-status-tab${state.messageStatus === item ? " is-active" : ""}" type="button" role="tab" aria-selected="${state.messageStatus === item}" data-message-status="${item}"><span>${item}</span><span class="filter-chip-count">${statusCount(item)}</span></button>`).join("")}</div>
          <form class="filter-card message-filter-card" data-form="message-filter"><div class="filter-grid message-filter-grid">
            <div class="field"><label for="message-task-query">任务名称</label><input id="message-task-query" class="control" name="task" value="${escapeHtml(state.messageTaskQuery)}" placeholder="请输入任务名称" /></div>
            <div class="field"><label for="message-creator-query">创建人</label><input id="message-creator-query" class="control" name="creator" value="${escapeHtml(state.messageCreatorQuery)}" placeholder="请输入创建人" /></div>
            <div class="field"><label for="message-send-type">发送类型</label><select id="message-send-type" class="control" name="sendType"><option value="">全部</option><option${state.messageSendTypeQuery === "立即" ? " selected" : ""}>立即</option><option${state.messageSendTypeQuery === "定时" ? " selected" : ""}>定时</option></select></div>
            <div class="field message-date-field"><label for="message-created-start">创建时间</label><div class="date-range"><input id="message-created-start" class="control" name="createStart" type="date" value="${state.messageCreateStart}" /><span>至</span><input class="control" name="createEnd" type="date" value="${state.messageCreateEnd}" /></div></div>
            <div class="field message-date-field"><label for="message-sent-start">发送时间</label><div class="date-range"><input id="message-sent-start" class="control" name="sendStart" type="date" value="${state.messageSendStart}" /><span>至</span><input class="control" name="sendEnd" type="date" value="${state.messageSendEnd}" /></div></div>
            <div class="filter-actions"><button class="btn" type="button" data-action="message-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div>
          </div></form>
          <div class="table-card message-table-card"><div class="table-scroll"><table class="data-table message-table"><thead><tr><th>任务名称</th><th>发送内容</th><th>群发对象</th><th>目标总数</th><th>触达成功</th><th>触达失败</th><th>发送类型</th><th>发送状态</th><th>发送时间</th><th>创建时间</th><th>创建人</th><th>操作</th></tr></thead><tbody>${rows.length ? rows.map(item => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.content)}</td><td>${escapeHtml(item.audience)}</td><td><span class="number-tag">${item.target}</span></td><td>${messageShowsResult(item.status) ? `<span class="number-tag success">${item.success}</span>` : "--"}</td><td>${messageShowsResult(item.status) ? `<span class="number-tag${item.failed ? " danger" : ""}">${item.failed}</span>` : "--"}</td><td>${escapeHtml(item.sendType)}</td><td>${messageStatusTag(item.status)}</td><td>${escapeHtml(item.sentAt)}</td><td>${escapeHtml(item.createdAt)}</td><td>${escapeHtml(item.creator)}</td><td><div class="table-actions"><button class="text-button" type="button" data-message-detail="${item.id}">查看详情</button><span class="message-more-wrap"><button class="text-button" type="button" data-message-more="${item.id}" aria-haspopup="menu" aria-expanded="${state.messageMoreId === item.id}">更多${icon("chevron-down")}</button>${state.messageMoreId === item.id ? `<span class="message-more-menu" role="menu"><button type="button" data-action="message-copy" data-message-id="${item.id}">复制任务</button>${item.failed ? `<button type="button" data-action="message-resend" data-message-id="${item.id}">失败消息重发</button>` : ""}${["进行中", "待执行"].includes(item.status) ? `<button class="danger" type="button" data-action="message-cancel" data-message-id="${item.id}">取消任务</button>` : ""}</span>` : ""}</span></div></td></tr>`).join("") : `<tr><td colspan="12">暂无符合条件的消息任务</td></tr>`}</tbody></table></div></div>${tablePagination(rows.length, 1)}
        </section>`;
      }

      function messageNewPage() {
        const tenantQuery = state.messageDoctorTenantQuery.trim().toLowerCase();
        const projectQuery = state.messageDoctorProjectQuery.trim().toLowerCase();
        const nameQuery = state.messageDoctorNameQuery.trim().toLowerCase();
        const hospitalQuery = state.messageDoctorHospitalQuery.trim().toLowerCase();
        const departmentQuery = state.messageDoctorDepartmentQuery.trim().toLowerCase();
        const titleQuery = state.messageDoctorTitleQuery.trim().toLowerCase();
        const phoneQuery = state.messageDoctorPhoneQuery.trim().toLowerCase();
        const visibleDoctors = messageDoctors.filter(item => (!tenantQuery || item.tenant.toLowerCase().includes(tenantQuery)) && (!projectQuery || item.project.toLowerCase().includes(projectQuery)) && (!nameQuery || item.name.toLowerCase().includes(nameQuery)) && (!hospitalQuery || item.hospital.toLowerCase().includes(hospitalQuery)) && (!departmentQuery || item.department.toLowerCase().includes(departmentQuery)) && (!titleQuery || item.title.toLowerCase().includes(titleQuery)) && (!phoneQuery || item.phone.toLowerCase().includes(phoneQuery)));
        const allVisibleSelected = visibleDoctors.length > 0 && visibleDoctors.every(item => state.selectedMessageDoctors.has(item.id));
        const visibleDoctorIds = visibleDoctors.map(item => item.id).join(",");
        const queryResultContent = state.messageDoctorQueryApplied ? `<div class="message-compose-layout" data-message-query-results>
            <section class="doctor-selection-card"><p class="message-result-copy">共检索到 ${visibleDoctors.length} 位医生，请勾选推送对象并编辑消息</p><div class="message-selection-heading"><h2>推送对象</h2><div class="message-selection-actions"><span>已选 <strong data-message-selected-count>${state.selectedMessageDoctors.size}</strong> 人</span><button class="text-button message-selection-action" type="button" data-action="message-select-current">全选当前页</button><button class="text-button message-selection-action" type="button" data-action="message-select-all" data-message-ids="${visibleDoctorIds}">全选所有</button><button class="text-button message-selection-action" type="button" data-action="message-clear-selection">取消全选</button></div></div><div class="doctor-select-scroll"><table class="doctor-select-table"><thead><tr><th><input type="checkbox" data-message-doctor-all aria-label="全选当前页"${allVisibleSelected ? " checked" : ""} /></th><th>医生姓名</th><th>所属医院</th><th>科室</th><th>职称</th><th>手机号码</th></tr></thead><tbody>${visibleDoctors.length ? visibleDoctors.map(item => `<tr class="${state.selectedMessageDoctors.has(item.id) ? "is-selected" : ""}"><td><input type="checkbox" data-message-doctor-check="${item.id}" aria-label="选择${escapeHtml(item.name)}"${state.selectedMessageDoctors.has(item.id) ? " checked" : ""} /></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.hospital)}</td><td>${escapeHtml(item.department)}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.phone)}</td></tr>`).join("") : `<tr><td colspan="6">暂无符合条件的医生</td></tr>`}</tbody></table></div></section>
            <div class="message-compose-stack"><section class="message-compose-card"><h2>消息内容</h2><div class="field"><label for="message-material">引用平台素材</label><select id="message-material" class="control" name="material" data-message-material><option value="">不引用素材</option>${state.materials.map(item => `<option value="${item.id}"${state.messageMaterial === item.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></div><div class="field"><label for="message-draft-content"><span class="required">*</span>消息正文</label><textarea id="message-draft-content" class="control" name="content" required maxlength="500" rows="6" data-message-draft-field="content" placeholder="请输入消息正文">${escapeHtml(state.messageDraftContent)}</textarea></div></section><section class="message-compose-card"><h2>发送预览</h2><p>将向已选择的 <span data-message-preview-count>${state.selectedMessageDoctors.size}</span> 位医生发送：</p><div class="message-preview">${escapeHtml(state.messageDraftContent || "消息内容将在此处预览")}</div><p class="muted">发送前请确认接收人范围和消息内容。</p></section></div>
          </div><footer class="message-page-footer"><button class="btn" type="button" data-route="message-touch">关闭</button><button class="btn btn-primary" type="submit">确认发送</button></footer>` : "";
        return `<section class="page message-new-page"><div class="page-title-row"><div>${renderBreadcrumb()}<h1 class="page-title">新建消息任务</h1></div></div><form id="message-create-form">
          <section class="message-create-card"><h2>基础信息</h2><div class="message-basic-grid"><div class="field"><label for="message-draft-name"><span class="required">*</span>任务名称</label><input id="message-draft-name" class="control" name="taskName" required maxlength="50" value="${escapeHtml(state.messageDraftTaskName)}" data-message-draft-field="taskName" placeholder="请输入任务名称" autofocus /></div><div class="field"><label for="message-draft-send"><span class="required">*</span>发送类型</label><select id="message-draft-send" class="control" name="sendMode" data-message-draft-field="sendType"><option${state.messageDraftSendType === "立即发送" ? " selected" : ""}>立即发送</option><option${state.messageDraftSendType === "定时发送" ? " selected" : ""}>定时发送</option></select></div><div class="field message-schedule-field" data-message-schedule-field${state.messageDraftSendType === "定时发送" ? "" : " hidden"}><label for="message-scheduled-at"><span class="required">*</span>发送时间</label><input id="message-scheduled-at" class="control" name="scheduledAt" type="datetime-local" value="${escapeHtml(state.messageScheduledAt)}" data-message-draft-field="scheduledAt"${state.messageDraftSendType === "定时发送" ? " required" : " disabled"} /></div></div></section>
          <section class="message-create-card"><h2>圈选对象</h2><div class="message-target-grid"><div class="field"><label>所属租户</label><select class="control" name="doctorTenant"><option value="">请选择所属租户</option><option${state.messageDoctorTenantQuery === "A医院" ? " selected" : ""}>A医院</option></select></div><div class="field"><label>所属项目</label><select class="control" name="doctorProject"><option value="">请选择所属项目</option><option${state.messageDoctorProjectQuery === "慢病随访" ? " selected" : ""}>慢病随访</option><option${state.messageDoctorProjectQuery === "患者服务" ? " selected" : ""}>患者服务</option></select></div><div class="field"><label>所属医院</label><select class="control" name="doctorHospital"><option value="">请选择所属医院</option><option${state.messageDoctorHospitalQuery === "A医院" ? " selected" : ""}>A医院</option></select></div><div class="field"><label>科室</label><select class="control" name="doctorDepartment"><option value="">请选择科室</option>${["心内科", "内分泌科", "呼吸科", "肿瘤科", "全科"].map(value => `<option${state.messageDoctorDepartmentQuery === value ? " selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label>职称</label><select class="control" name="doctorTitle"><option value="">请选择职称</option>${["主任医师", "副主任医师", "主治医师", "住院医师"].map(value => `<option${state.messageDoctorTitleQuery === value ? " selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label>姓名</label><input class="control" name="doctorName" value="${escapeHtml(state.messageDoctorNameQuery)}" placeholder="请输入姓名" /></div><div class="field"><label>手机号</label><input class="control" name="doctorPhone" value="${escapeHtml(state.messageDoctorPhoneQuery)}" placeholder="请输入手机号" /></div><div class="filter-actions"><button class="btn" type="button" data-action="message-doctor-reset">重置</button><button class="btn btn-primary" type="button" data-action="message-doctor-query">查询</button></div></div>
          </section>
          ${queryResultContent}
        </form></section>`;
      }

      function renderChatDoctorAvatar(doctor) {
        const name = doctor?.name || "未知医生";
        const managed = doctor?.managed || "未托管";
        return `<span class="chat-avatar chat-doctor-avatar${managed === "在线" ? " is-online" : ""}" role="img" aria-label="${escapeHtml(name)}，托管状态：${escapeHtml(managed)}">${escapeHtml(name.slice(0, 1))}<span class="status-dot"></span></span>`;
      }

      function renderChatProjectAccountAvatar(doctor) {
        const managed = doctor?.managed || "未托管";
        return `<span class="chat-project-account-avatar${managed === "在线" ? " is-online" : ""}" aria-hidden="true">医<span class="status-dot"></span></span>`;
      }

      function renderChatProjectPanel() {
        const query = state.chatProjectSearchQuery.trim().toLowerCase();
        const tenantGroups = getChatProjectGroups(state.chatTenantQuery);
        const groups = tenantGroups.map(group => {
          const projectMatches = !query || group.name.toLowerCase().includes(query);
          const doctors = group.doctorIds.map(id => chatDoctors.find(doctor => doctor.id === id)).filter(Boolean);
          const visibleDoctors = projectMatches ? doctors : doctors.filter(doctor => `${doctor.name} ${doctor.hospital} ${doctor.department}`.toLowerCase().includes(query));
          if (query && !projectMatches && !visibleDoctors.length) return "";
          const collapsed = state.chatCollapsedProjects.has(group.id);
          const keywords = `${group.name} ${doctors.map(doctor => `${doctor.name} ${doctor.hospital} ${doctor.department}`).join(" ")}`.toLowerCase();
          return `<section class="chat-project-group${collapsed ? " is-collapsed" : ""}" data-chat-project-group="${escapeHtml(group.id)}" data-chat-project-keywords="${escapeHtml(keywords)}"><button class="chat-project-group-toggle" type="button" data-chat-project-toggle="${escapeHtml(group.id)}" aria-expanded="${!collapsed}">${icon("chevron-down")}<strong title="${escapeHtml(group.name)}">${escapeHtml(group.name)}</strong><span>（${doctors.length}）</span></button>${collapsed ? "" : `<div class="chat-project-account-list">${visibleDoctors.map(doctor => `<button class="chat-project-account${doctor.id === state.chatDoctorId ? " is-active" : ""}" type="button" data-chat-doctor="${doctor.id}" aria-pressed="${doctor.id === state.chatDoctorId}">${renderChatProjectAccountAvatar(doctor)}<strong>${escapeHtml(doctor.name)}</strong></button>`).join("")}</div>`}</section>`;
        }).join("");
        return `<section class="chat-project-panel"><div class="chat-project-title"><h2>项目/托管账号</h2><button class="icon-button" type="button" data-action="chat-project-search" aria-label="搜索项目或托管账号" aria-pressed="${state.chatProjectSearchOpen}" title="搜索项目或托管账号">${icon("search")}</button></div>${state.chatProjectSearchOpen ? `<div class="chat-project-search"><label class="sr-only" for="chat-project-search">搜索项目或托管账号</label><input id="chat-project-search" class="control" value="${escapeHtml(state.chatProjectSearchQuery)}" placeholder="搜索项目或医生" /></div>` : ""}<div class="chat-project-list">${groups || `<div class="bot-empty">暂无匹配的项目或托管账号</div>`}</div></section>`;
      }

      function chatHistoryPage() {
        const contentKeyword = state.chatContentQuery.trim();
        const contentQuery = contentKeyword.toLowerCase();
        const listQuery = state.chatConversationSearchQuery.trim().toLowerCase();
        const hitsByConversation = new Map();
        const matchesConversationScope = item => {
          const occurredDate = (item.occurredAt || "").slice(0, 10);
          return (!state.chatDoctorId || item.doctorId === state.chatDoctorId) &&
            (!state.chatTenantQuery || item.tenant === state.chatTenantQuery) &&
            (!state.chatDateStart || !occurredDate || occurredDate >= state.chatDateStart) &&
            (!state.chatDateEnd || !occurredDate || occurredDate <= state.chatDateEnd);
        };
        const scopedConversations = chatConversations.filter(matchesConversationScope);
        const conversationTypeCounts = {
          "全部": scopedConversations.length,
          "私聊": scopedConversations.filter(item => item.type === "私聊").length,
          "群聊": scopedConversations.filter(item => item.type === "群聊").length
        };
        const conversations = chatConversations.filter(item => {
          const matchesBaseFilters =
            matchesConversationScope(item) &&
            (state.chatConversationType === "全部" || item.type === state.chatConversationType) &&
            (!listQuery || `${item.name} ${item.preview}`.toLowerCase().includes(listQuery));
          if (!matchesBaseFilters) return false;
          if (!contentQuery) return true;
          const hits = item.messages.map((message, messageIndex) => ({
            key: `${item.id}:${messageIndex}`,
            conversation: item,
            message,
            messageIndex,
            occurredAt: message.occurredAt || item.occurredAt || item.time
          })).filter(hit => hit.message.text.toLowerCase().includes(contentQuery));
          if (!hits.length) return false;
          hitsByConversation.set(item.id, hits);
          return true;
        });
        const ordered = [...conversations].sort((a, b) => {
          const newestFirst = (b.occurredAt || b.time).localeCompare(a.occurredAt || a.time);
          return contentQuery || state.chatConversationOrderNewest ? newestFirst : -newestFirst;
        });
        const allHits = contentQuery ? ordered.flatMap(item => hitsByConversation.get(item.id) || []).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) : [];
        const searchGroups = [];
        if (contentQuery) {
          const groupsByDoctor = new Map();
          allHits.forEach(hit => {
            const doctor = chatDoctors.find(candidate => candidate.id === hit.conversation.doctorId) || { id: hit.conversation.doctorId, name: "未知医生", hospital: "--", department: "--" };
            if (!groupsByDoctor.has(doctor.id)) {
              const group = { doctor, items: [] };
              groupsByDoctor.set(doctor.id, group);
              searchGroups.push(group);
            }
            groupsByDoctor.get(doctor.id).items.push(hit);
          });
        }
        const selectedHit = contentQuery ? allHits.find(hit => hit.key === state.chatSelectedHitKey) || allHits[0] : null;
        const conversation = contentQuery ? selectedHit?.conversation : ordered.find(item => item.id === state.chatConversationId) || ordered[0];
        const selectedMessageIndex = selectedHit?.messageIndex ?? -1;
        const threadDemographics = conversation?.gender && conversation?.age ? `<span class="chat-thread-demographics">${escapeHtml(conversation.gender)} · ${escapeHtml(conversation.age)}岁</span>` : "";
        const threadPanel = conversation ? `<section class="chat-thread-panel"><header class="chat-thread-header"><span class="chat-avatar">${escapeHtml(conversation.avatar)}</span><div class="chat-thread-heading"><div class="chat-thread-name-row"><strong>${escapeHtml(conversation.name)}</strong>${threadDemographics}<div class="chat-thread-tags">${conversation.tags.map(tag => `<span class="tag info">${escapeHtml(tag)}</span>`).join("")}</div></div><small>来源医生：${escapeHtml(conversation.source)} · ${escapeHtml(conversation.type)}</small></div></header><div class="chat-thread-more"><span></span><button class="text-button" type="button" data-action="chat-more-info">查看更多信息</button><span></span></div><div class="chat-messages">${conversation.messages.map((message, messageIndex) => {
          const isSelectedHit = Boolean(contentQuery && messageIndex === selectedMessageIndex);
          return `<div class="chat-message-row${message.side === "right" ? " is-own" : ""}${isSelectedHit ? " is-hit" : ""}"${isSelectedHit ? " data-chat-hit" : ""}><div class="chat-bubble${message.side === "right" ? " is-own" : ""}">${escapeHtml(message.text)}</div>${isSelectedHit ? `<time class="chat-message-time">${escapeHtml(formatChatMessageTime(message.occurredAt || conversation.occurredAt || conversation.time))}</time>` : ""}</div>`;
        }).join("")}</div></section>` : `<section class="chat-thread-panel"><div class="bot-empty">暂无符合条件的会话</div></section>`;
        const standardConversationList = `<div class="chat-conversation-list">${ordered.length ? ordered.map(item => {
          const doctor = chatDoctors.find(candidate => candidate.id === item.doctorId);
          return `<button class="chat-conversation-item${item.id === conversation?.id ? " is-active" : ""}" type="button" data-chat-conversation="${item.id}">${renderChatDoctorAvatar(doctor)}<span class="chat-conversation-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.preview)}</small></span><time>${escapeHtml(item.time)}</time></button>`;
        }).join("") : `<div class="bot-empty">暂无符合条件的会话</div>`}</div>`;
        const searchConversationList = `<div class="chat-search-results">${searchGroups.length ? searchGroups.map(group => {
          const collapsed = state.chatSearchCollapsedDoctors.has(group.doctor.id);
          return `<section class="chat-search-doctor-group${collapsed ? " is-collapsed" : ""}"><div class="chat-search-doctor-header">${renderChatDoctorAvatar(group.doctor)}<div class="chat-search-doctor-copy"><strong>${escapeHtml(group.doctor.name)}</strong><small>${group.items.length} 条相关聊天</small></div><button class="chat-search-group-toggle" type="button" data-chat-search-group-toggle="${escapeHtml(group.doctor.id)}" aria-expanded="${!collapsed}" aria-label="${collapsed ? "展开" : "收起"}${escapeHtml(group.doctor.name)}的命中内容">${collapsed ? "展开" : "收起"}${icon("chevron-down")}</button></div>${collapsed ? "" : `<div class="chat-search-hit-list">${group.items.map(hit => {
            return `<button class="chat-search-hit-item${hit.key === selectedHit?.key ? " is-active" : ""}" type="button" data-chat-hit-key="${escapeHtml(hit.key)}" data-chat-conversation="${escapeHtml(hit.conversation.id)}"><span class="chat-search-hit-preview" title="${escapeHtml(hit.message.text)}">${highlightChatMatch(hit.message.text, contentKeyword)}</span><time>${escapeHtml(hit.occurredAt)}</time></button>`;
          }).join("")}</div>`}</section>`;
        }).join("") : `<div class="bot-empty">未找到包含“${escapeHtml(contentKeyword)}”的聊天内容</div>`}</div>`;
        return `<section class="page chat-page">${chatWindowMode ? "" : `<div class="breadcrumb-toolbar-row">${renderBreadcrumb()}${toolButtons()}</div>`}
          <form class="filter-card chat-filter-card" data-form="chat-filter"><div class="filter-grid chat-filter-grid">
            <div class="field chat-tenant-field"><label class="sr-only" for="chat-tenant-filter">所属租户</label><select id="chat-tenant-filter" class="control" name="tenant" data-chat-tenant-filter><option value="">所属租户</option><option${state.chatTenantQuery === "A医院" ? " selected" : ""}>A医院</option><option${state.chatTenantQuery === "卓睦医疗科技有限公司" ? " selected" : ""}>卓睦医疗科技有限公司</option></select></div>
            <div class="field chat-date-field"><div class="date-range-control"><label class="sr-only" for="chat-date-start">开始日期</label><input id="chat-date-start" name="dateStart" type="date" value="${state.chatDateStart}" /><span>至</span><label class="sr-only" for="chat-date-end">结束日期</label><input id="chat-date-end" name="dateEnd" type="date" value="${state.chatDateEnd}" /></div></div>
          </div></form>
          <div class="chat-console${contentQuery ? " is-search-mode" : ""}${state.chatProjectPanelCollapsed ? " is-project-panel-collapsed" : ""}">${state.chatProjectPanelCollapsed ? "" : renderChatProjectPanel()}<section class="chat-list-panel"><div class="chat-conversation-tabs"><button class="chat-panel-collapse" type="button" data-action="chat-project-panel-toggle" aria-label="${state.chatProjectPanelCollapsed ? "展开" : "收起"}项目与托管账号" title="${state.chatProjectPanelCollapsed ? "展开" : "收起"}项目与托管账号">${icon(state.chatProjectPanelCollapsed ? "chevrons-right" : "chevrons-left")}</button>${["全部", "私聊", "群聊"].map(type => `<button class="${state.chatConversationType === type ? "is-active" : ""}" type="button" data-chat-type="${type}" aria-pressed="${state.chatConversationType === type}">${type}<span class="chat-type-count">${conversationTypeCounts[type]}</span></button>`).join("")}</div><div class="chat-panel-title"><h2>会话列表</h2><div class="chat-list-tools"><button class="icon-button" type="button" data-action="chat-list-search" aria-label="搜索会话" aria-pressed="${state.chatConversationSearchOpen}" title="搜索会话">${icon("search")}</button><button class="icon-button" type="button" data-action="chat-sort" aria-label="${state.chatConversationOrderNewest ? "切换为时间正序" : "切换为时间倒序"}" aria-pressed="${state.chatConversationOrderNewest}" title="${state.chatConversationOrderNewest ? "当前时间倒序" : "当前时间正序"}">${icon("arrow-down-up")}</button><button class="icon-button" type="button" data-action="chat-refresh" aria-label="刷新会话" title="刷新会话">${icon("refresh-cw")}</button></div></div>${state.chatConversationSearchOpen ? `<div class="chat-list-search"><label class="sr-only" for="chat-list-search">搜索会话</label><input id="chat-list-search" class="control" value="${escapeHtml(state.chatConversationSearchQuery)}" placeholder="搜索好友或群名称" /></div>` : ""}${contentQuery ? searchConversationList : standardConversationList}</section>
            ${threadPanel}
          </div>
        </section>`;
      }

      function menuPage() {
        const query = state.menuQuery.trim().toLowerCase();
        const orderedRows = menuRows.filter(row => !row.parent).sort((a, b) => a.sort - b.sort).flatMap(root => [root, ...menuRows.filter(row => row.parent === root.id).sort((a, b) => a.sort - b.sort)]);
        const visibleRows = orderedRows.filter(row => {
          if (!state.menuExpanded && row.parent) return false;
          return !query || `${row.name} ${row.path}`.toLowerCase().includes(query);
        });
        return `<section class="page">${renderBreadcrumb()}<form class="filter-card" data-form="menu-filter"><div class="filter-grid menu-filter-grid"><div class="field"><label>选择应用名称</label><select class="control"><option>卓睦鸟患管后台</option></select></div><div class="field"><label>应用菜单</label><input id="menu-filter-first" name="query" class="control" value="${escapeHtml(state.menuQuery)}" placeholder="请输入菜单名称" /></div><div class="filter-actions"><button class="btn" type="button" data-action="menu-reset">重置</button><button class="btn btn-primary" type="submit">查询</button></div></div></form>
          <section class="detail-card"><div class="section-title-row" style="justify-content:space-between"><h2 style="margin:0">菜单列表</h2><div class="actions"><div class="tree-master-control"><span class="${state.menuExpanded ? "" : "is-active"}">全部折叠</span><button class="switch" type="button" role="switch" aria-label="全部展开或全部折叠" aria-checked="${state.menuExpanded}" data-action="menu-toggle-all"></button><span class="${state.menuExpanded ? "is-active" : ""}">全部展开</span></div><button class="btn btn-primary" type="button" data-action="open-menu-root">${icon("plus-circle")}新增根目录</button></div></div>
          <div class="table-card" style="margin-top:14px"><div class="table-scroll"><table class="data-table"><thead><tr><th>菜单名称</th><th>类型</th><th>排序</th><th>关联页面地址</th><th>是否显示</th><th>状态</th><th>操作</th></tr></thead><tbody>
            ${visibleRows.length ? visibleRows.map(row => `<tr><td class="${row.parent ? "tree-child" : ""}"><span class="tree-name">${row.root ? `<button class="tree-toggle" type="button" data-action="toggle-tree" aria-label="切换${row.name}">+</button>` : ""}${escapeHtml(row.name)}</span></td><td>${row.type}</td><td>${row.sort}</td><td>${row.path}</td><td>${row.shown ? "是" : "否"}</td><td>${status(state.menuEnabled[row.id] ? "已启用" : "已禁用")} <button class="switch" type="button" role="switch" aria-label="切换${row.name}状态" aria-checked="${state.menuEnabled[row.id]}" data-menu-switch="${row.id}"></button></td><td><div class="table-actions">${row.root ? `<button class="text-button" type="button" data-menu-add="${row.id}">添加</button>` : ""}<button class="text-button" type="button" data-action="not-implemented">编辑</button><button class="text-button danger" type="button" data-action="not-implemented">删除</button></div></td></tr>`).join("") : `<tr><td colspan="7">暂无符合条件的数据</td></tr>`}
          </tbody></table></div></div></section></section>`;
      }

      function renderPage() {
        switch (state.route) {
          case "tenant": return tenantPage();
          case "tenant-detail": return tenantDetailPage();
          case "tenant-edit": return tenantEditPage();
          case "account": return accountPage();
          case "role": return rolePage();
          case "wecom": return wecomPage();
          case "wecom-detail": return wecomDetailPage();
          case "doctor": return doctorPage();
          case "doctor-detail": return doctorDetailPage();
          case "patient": return patientPage();
          case "bot-config": return botConfigPage();
          case "bot-detail": return botDetailPage();
          case "patient-tag": return tagManagementPage();
          case "chat-history": return chatHistoryPage();
          case "menu": return menuPage();
          case "sidebar-config": return window.SidebarSettings.render();
          default: return homePage();
        }
      }

      function homeShortcutsModal() {
        const selectionFull = state.homeShortcutDraft.size >= 4;
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-home-shortcuts" role="dialog" aria-modal="true" aria-labelledby="home-shortcuts-dialog-title" aria-describedby="home-shortcuts-dialog-copy" data-dialog>
          <header class="dialog-header"><h2 id="home-shortcuts-dialog-title">自定义常用功能</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="home-shortcuts-form" class="dialog-body"><p id="home-shortcuts-dialog-copy" class="home-shortcut-modal-copy">请选择 1–4 个常用功能，保存后将在首页展示。</p><div class="home-shortcut-options">${homeShortcutOptions.map((item, index) => { const checked = state.homeShortcutDraft.has(item.id); return `<label class="home-shortcut-option"><input type="checkbox" name="shortcut" value="${item.id}" data-home-shortcut-option${checked ? " checked" : ""}${selectionFull && !checked ? " disabled" : ""}${index === 0 ? " autofocus" : ""} />${icon(item.icon)}<span>${escapeHtml(item.label)}</span></label>`; }).join("")}</div><p class="home-shortcut-selection-count">已选择 <strong data-home-shortcut-count>${state.homeShortcutDraft.size}</strong> / 4 项</p></form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="home-shortcuts-form">保存</button></footer>
        </section></div>`;
      }

      function tagEditorModal(kind) {
        const editing = state.tags.find(item => item.id === state.tagEditingId);
        const parent = state.tags.find(item => item.id === (editing?.parent || state.tagParentId));
        const modalKind = editing ? ({ "一级标签": "primary", "二级标签": "secondary", "标签名称": "name" })[editing.type] : kind;
        const typeLabel = modalKind === "primary" ? "一级标签" : modalKind === "secondary" ? "二级标签" : "标签名称";
        const title = `${editing ? "编辑" : "添加"}${typeLabel}`;
        const parentLabel = modalKind === "secondary" ? "所属一级标签" : modalKind === "name" ? "所属二级标签" : "";
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-tag" role="dialog" aria-modal="true" aria-labelledby="tag-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="tag-dialog-title">${title}</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="tag-editor-form" class="dialog-body"><input type="hidden" name="kind" value="${modalKind}" />${parentLabel ? `<p class="tag-parent-summary">${parentLabel}：${escapeHtml(parent?.name || "--")}</p>` : ""}<div class="field"><label for="tag-editor-name"><span class="required">*</span>名称</label><input id="tag-editor-name" class="control" name="name" required maxlength="30" value="${escapeHtml(editing?.name || "")}" placeholder="请输入名称" autofocus /></div><div class="field" style="margin-top:16px"><label for="tag-editor-sort"><span class="required">*</span>排序</label><input id="tag-editor-sort" class="control" name="sort" type="number" required min="0" step="1" value="${editing?.sort ?? 100}" /></div></form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="tag-editor-form">确定</button></footer>
        </section></div>`;
      }

      function materialGroupsModal() {
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-material-groups" role="dialog" aria-modal="true" aria-labelledby="material-groups-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="material-groups-dialog-title">管理平台素材分组</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <div class="dialog-body"><div class="material-group-create"><label class="sr-only" for="material-group-new">新分组名称</label><input id="material-group-new" class="control" maxlength="20" placeholder="新分组名称" autofocus /><button class="btn btn-primary" type="button" data-action="material-group-create">新建分组</button></div><div class="material-group-table"><div class="material-group-table-head"><span>分组名称</span><span>操作</span></div>${state.materialGroups.map((name, index) => `<div class="material-group-edit-row" data-material-group-row="${index}"><input class="control" value="${escapeHtml(name)}" maxlength="20" aria-label="分组名称" data-material-group-name-index="${index}" /><div class="material-group-row-actions"><button class="text-button danger" type="button" data-action="material-group-delete" data-material-group-index="${index}">删除</button></div></div>`).join("")}</div></div>
          <footer class="dialog-footer"><button class="btn btn-primary" type="button" data-action="close-modal">完成</button></footer>
        </section></div>`;
      }

      function messageTaskDetailModal() {
        const task = state.messages.find(item => item.id === state.selectedMessageTaskId) || state.messages[0];
        const showResult = messageShowsResult(task.status);
        const recipients = [
          { name: "罗先生", phone: "158****7842", status: "已发送", reason: "--" },
          { name: "林治", phone: "131****5001", status: "已发送", reason: "--" },
          { name: "王丽", phone: "138****2196", status: task.failed ? "发送失败" : "已发送", reason: task.failed ? "对方已删除" : "--" }
        ];
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-message-detail" role="dialog" aria-modal="true" aria-labelledby="message-detail-title" data-dialog>
          <header class="dialog-header"><h2 id="message-detail-title">任务详情</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <div class="dialog-body"><dl class="task-detail-list"><div><dt>模块</dt><dd>单聊群发</dd></div><div><dt>发送状态</dt><dd>${messageStatusTag(task.status)}</dd></div><div><dt>发送类型</dt><dd>${escapeHtml(task.sendType)}</dd></div><div><dt>发送时间</dt><dd>${escapeHtml(task.sentAt)}</dd></div><div><dt>创建者</dt><dd>${escapeHtml(task.creator)}</dd></div><div><dt>目标总数</dt><dd>${task.target}${showResult ? `（<span class="task-result-count success">成功：${task.success}</span>，<span class="task-result-count danger">失败：${task.failed}</span>）` : ""}</dd></div><div><dt>群发对象</dt><dd>${escapeHtml(task.audience)}</dd></div></dl><h3 class="task-detail-heading">发送内容</h3><div class="task-content-preview">${escapeHtml(task.content)}</div><h3 class="task-detail-heading">发送对象明细</h3><div class="table-card"><div class="table-scroll"><table class="data-table"><thead><tr><th>患者姓名</th><th>手机号</th><th>推送渠道</th><th>推送状态</th><th>失败原因</th></tr></thead><tbody>${recipients.map(item => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.phone)}</td><td>企业微信</td><td><span class="tag ${item.status === "已发送" ? "success" : "danger"}">${escapeHtml(item.status)}</span></td><td>${escapeHtml(item.reason)}</td></tr>`).join("")}</tbody></table></div></div></div>
          <footer class="dialog-footer">${task.failed ? `<button class="btn btn-primary" type="button" data-action="message-resend" data-message-id="${task.id}">失败消息重发</button>` : ""}<button class="btn" type="button" data-action="close-modal">关闭</button></footer>
        </section></div>`;
      }

      function accountModal() {
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="account-dialog-title">创建账号</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="account-create-form" class="dialog-body"><div class="field"><label><span class="required">*</span>手机号码</label><input class="control" name="phone" required pattern="1[0-9]{10}" placeholder="请输入手机号码" autofocus /></div><div class="field" style="margin-top:14px"><label><span class="required">*</span>账号</label><input class="control" name="account" required minlength="4" maxlength="20" placeholder="4-20位数字或字母组合" /></div><div class="field" style="margin-top:14px"><label><span class="required">*</span>真实姓名</label><input class="control" name="name" required placeholder="请输入真实姓名" /></div><div class="field" style="margin-top:14px"><label><span class="required">*</span>密码</label><div class="password-field"><input class="control" name="password" type="password" required minlength="8" placeholder="8-16位数字+字母+特殊字符" /><button class="password-toggle" type="button" data-action="toggle-password" aria-label="显示或隐藏密码">${icon("eye")}</button></div></div><div class="field" style="margin-top:14px"><label><span class="required">*</span>角色</label><details class="account-role-picker" data-account-role-picker><summary><span class="account-role-placeholder" data-account-role-value>请选择角色（可多选）</span>${icon("chevron-down")}</summary><div class="account-role-menu"><label class="account-role-option"><input type="checkbox" name="role" value="超级管理员" data-account-role-option />超级管理员</label><label class="account-role-option"><input type="checkbox" name="role" value="内部运营" data-account-role-option />内部运营</label><label class="account-role-option"><input type="checkbox" name="role" value="租户管理员" data-account-role-option />租户管理员</label></div></details></div><div class="field" style="margin-top:14px"><label>邮箱</label><input class="control" name="email" type="email" placeholder="请输入邮箱" /></div><div class="field" style="margin-top:14px"><label>性别</label><select class="control" name="gender"><option value="-">请选择性别</option><option>男</option><option>女</option></select></div></form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="account-create-form">确定</button></footer>
        </section></div>`;
      }

      function accountDisableModal() {
        const account = state.accounts.find(item => item.id === state.accountDisableId);
        if (!account) return "";
        const roles = accountRoles(account);
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="account-disable-title" aria-describedby="account-disable-description" data-dialog>
          <header class="dialog-header"><h2 id="account-disable-title">停用账号</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <div class="dialog-body"><div class="account-disable-summary"><div class="account-disable-identity"><strong>${escapeHtml(account.row[1] === "-" ? account.row[0] : account.row[1])}</strong><span>账号：${escapeHtml(account.row[0])}</span></div><p id="account-disable-description">检测到该用户已分配${roles.map(role => escapeHtml(role)).join("、")}角色。停用账号时，需要同时回收该用户的全部角色权限。</p><h3 class="account-disable-role-title">当前分配角色</h3><div class="account-disable-roles">${roles.map(role => `<span class="tag warning">${escapeHtml(role)}</span>`).join("")}</div><p class="account-disable-note">确认后，账号将被停用，以上全部角色权限将被清空。是否继续？</p></div></div>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-danger" type="button" data-action="confirm-account-disable" autofocus>确认停用并回收</button></footer>
        </section></div>`;
      }

      function roleModal() {
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-role" role="dialog" aria-modal="true" aria-labelledby="role-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="role-dialog-title">创建角色</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="role-create-form" class="dialog-body role-create-form">
            <div class="field"><label for="role-name"><span class="required">*</span>角色名称</label><input id="role-name" class="control" name="name" required maxlength="30" placeholder="请输入角色名称" autofocus /></div>
            <div class="field"><label for="role-code"><span class="required">*</span>角色编码</label><input id="role-code" class="control" name="code" required maxlength="40" pattern="[A-Za-z][A-Za-z0-9_]*" title="请输入以字母开头的字母、数字或下划线组合" placeholder="请输入角色编码" /></div>
            <div class="field"><label for="role-data-scope"><span class="required">*</span>数据权限范围</label><select id="role-data-scope" class="control" name="dataScope" required><option value="">请选择数据权限范围</option><option value="platform">全平台</option><option value="tenant">租户</option></select></div>
            <div class="field"><label for="role-description">角色描述</label><textarea id="role-description" class="control" name="description" maxlength="200" placeholder="请输入角色描述"></textarea></div>
          </form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="role-create-form">确定</button></footer>
        </section></div>`;
      }

      function permissionNodeMatches(node, query) {
        if (!query) return true;
        return node.name.toLowerCase().includes(query) || node.children?.some(child => permissionNodeMatches(child, query));
      }

      function renderPermissionNode(node, level, query) {
        if (!permissionNodeMatches(node, query)) return "";
        const hasChildren = Boolean(node.children?.length);
        const expanded = hasChildren && (Boolean(query) || state.rolePermissionExpanded.has(node.id));
        const leaves = permissionLeafIds(node);
        const selectedCount = leaves.filter(id => state.rolePermissionDraft.has(id)).length;
        const checked = selectedCount === leaves.length && leaves.length > 0;
        const partial = selectedCount > 0 && !checked;
        const children = hasChildren && expanded ? node.children.map(child => renderPermissionNode(child, level + 1, query)).join("") : "";
        return `<div class="permission-tree-node" data-permission-node="${node.id}" data-permission-level="${level}"><div class="permission-tree-row permission-level-${level}">
          ${hasChildren ? `<button class="permission-tree-toggle" type="button" data-action="permission-toggle" data-permission-id="${node.id}" aria-label="${expanded ? "折叠" : "展开"}${escapeHtml(node.name)}" aria-expanded="${expanded}">${icon(expanded ? "chevron-down" : "chevron-right")}</button>` : `<span class="permission-tree-spacer" aria-hidden="true"></span>`}
          <label class="permission-tree-label"><input type="checkbox" data-permission-check="${node.id}" data-permission-leaves="${leaves.join(",")}"${checked ? " checked" : ""}${partial ? ` data-permission-partial="true" aria-checked="mixed"` : ` aria-checked="${checked}"`} /><span>${escapeHtml(node.name)}</span></label>
        </div>${hasChildren ? `<div class="permission-tree-children" data-permission-children="${node.id}"${expanded ? "" : " hidden"}>${children}</div>` : ""}</div>`;
      }

      function rolePermissionModal() {
        const role = state.roles.find(item => item.id === state.rolePermissionRoleId);
        const query = state.rolePermissionQuery.trim().toLowerCase();
        const tree = permissionTreeSeed.map(node => renderPermissionNode(node, 0, query)).join("");
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-role-permission" role="dialog" aria-modal="true" aria-labelledby="role-permission-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="role-permission-dialog-title">绑定权限</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <div class="dialog-body role-permission-body">
            <form id="role-permission-search-form" class="role-permission-search" role="search"><label class="sr-only" for="role-permission-search">筛选权限</label><input id="role-permission-search" class="control" name="query" value="${escapeHtml(state.rolePermissionQuery)}" placeholder="请输入关键字进行过滤" /><button class="role-permission-search-button" type="submit" aria-label="搜索权限">${icon("search")}</button></form>
            <h3 class="role-permission-heading">选择权限${role ? `<span class="sr-only">，当前角色：${escapeHtml(role.name)}</span>` : ""}</h3>
            <div class="role-permission-tree" role="tree" aria-label="权限选择树" data-permission-tree>${tree || `<div class="role-permission-empty">未找到匹配的权限</div>`}</div>
          </div>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="save-role-permission">确定</button></footer>
        </section></div>`;
      }

      function syncPermissionCheckboxes() {
        document.querySelectorAll("[data-permission-check]").forEach(input => {
          const leaves = input.dataset.permissionLeaves.split(",").filter(Boolean);
          const selectedCount = leaves.filter(id => state.rolePermissionDraft.has(id)).length;
          input.checked = selectedCount === leaves.length && leaves.length > 0;
          input.indeterminate = selectedCount > 0 && !input.checked;
          input.setAttribute("aria-checked", input.indeterminate ? "mixed" : String(input.checked));
        });
      }

      function wecomBindingModal() {
        const entity = wecomEntityById(state.wecomBindingEntityId);
        const availableTenants = wecomTenantOptions.filter(tenant => !state.wecomBindingDraft.includes(tenant));
        const added = state.wecomBindingDraft.filter(tenant => !entity.tenants.includes(tenant));
        const removed = entity.tenants.filter(tenant => !state.wecomBindingDraft.includes(tenant));
        const affectedOrganizations = entity.organizations.filter(organization => removed.includes(organization.tenant)).length;
        const changeSummary = added.length || removed.length
          ? `${added.length ? `新增：${added.map(escapeHtml).join("、")}` : ""}${added.length && removed.length ? "；" : ""}${removed.length ? `解除：${removed.map(escapeHtml).join("、")}` : ""}`
          : "暂未变更";
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="wecom-binding-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="wecom-binding-dialog-title">绑定系统租户</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="wecom-binding-form" class="dialog-body">
            <dl class="wecom-binding-summary"><dt>企业主体</dt><dd>${escapeHtml(entity.name)}</dd></dl>
            <section class="wecom-binding-section"><strong>已选择租户</strong><div class="wecom-binding-draft">${state.wecomBindingDraft.length ? state.wecomBindingDraft.map(tenant => `<span class="wecom-binding-pill">${escapeHtml(tenant)}<button type="button" data-action="wecom-remove-tenant" data-tenant="${escapeHtml(tenant)}" aria-label="移除${escapeHtml(tenant)}">${icon("x")}</button></span>`).join("") : `<span class="tag neutral">暂未选择租户</span>`}</div></section>
            <section class="wecom-binding-section"><label for="wecom-tenant-select"><strong>添加租户</strong></label><div class="wecom-binding-picker"><select id="wecom-tenant-select" class="control"${availableTenants.length ? " autofocus" : " disabled"}><option value="">${availableTenants.length ? "请选择系统租户" : "无其他可选租户"}</option>${availableTenants.map(tenant => `<option value="${escapeHtml(tenant)}">${escapeHtml(tenant)}</option>`).join("")}</select><button class="btn" type="button" data-action="wecom-add-tenant"${availableTenants.length ? "" : " disabled"}>添加</button></div></section>
            <p class="wecom-binding-tip">本次变更：${changeSummary}${affectedOrganizations ? `<br>解除后，${affectedOrganizations} 个组织节点仍保留同步租户归属，并标记“主体未关联”。` : ""}<br>租户关联仅作用于企业主体；组织归属仍以企微同步数据为准。</p>
          </form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="wecom-binding-form">确认绑定</button></footer>
        </section></div>`;
      }

      function menuRootModal() {
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-lg dialog-menu-root" role="dialog" aria-modal="true" aria-labelledby="menu-root-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="menu-root-dialog-title">添加根目录</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="menu-root-form" class="dialog-body menu-root-form">
            <div class="menu-root-row"><span class="menu-root-label">资源类型：</span><span class="menu-root-static">根目录</span></div>
            <div class="menu-root-row"><label for="menu-root-name"><span class="required">*</span>菜单名称：</label><input id="menu-root-name" class="control" name="name" required maxlength="30" placeholder="请输入菜单名称（必填）" autofocus /></div>
            <div class="menu-root-row"><label for="menu-root-sort"><span class="required">*</span>排序：</label><input id="menu-root-sort" class="control" name="sort" type="number" required min="0" step="1" value="0" /></div>
            <div class="menu-root-row"><label for="menu-root-shown"><span class="required">*</span>是否展示：</label><select id="menu-root-shown" class="control" name="shown" required><option value="true">是</option><option value="false">否</option></select></div>
          </form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="menu-root-form">确定</button></footer>
        </section></div>`;
      }

      function menuChildModal() {
        const resourceOptions = menuRows.filter(row => row.type === "菜单" && row.path !== "-").map(row => `<option value="${escapeHtml(row.path)}">${escapeHtml(row.name)}（${escapeHtml(row.path)}）</option>`).join("");
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-lg dialog-menu-child" role="dialog" aria-modal="true" aria-labelledby="menu-child-dialog-title" data-dialog>
          <header class="dialog-header"><h2 id="menu-child-dialog-title">添加目录/菜单</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <form id="menu-child-form" class="dialog-body menu-root-form">
            <div class="menu-root-row"><span class="menu-root-label">资源类型：</span><div class="menu-type-switch" role="group" aria-label="资源类型"><button class="menu-type-option" type="button" data-action="menu-child-type" data-type="directory" aria-pressed="true">目录</button><button class="menu-type-option" type="button" data-action="menu-child-type" data-type="menu" aria-pressed="false">菜单</button></div><input type="hidden" name="type" value="directory" /></div>
            <div class="menu-root-row"><label for="menu-child-name"><span class="required">*</span>菜单名称：</label><input id="menu-child-name" class="control" name="name" required maxlength="30" placeholder="请输入菜单名称（必填）" autofocus /></div>
            <div class="menu-root-row menu-child-resource" hidden><label for="menu-child-path"><span class="required">*</span>关联资源页面：</label><select id="menu-child-path" class="control" name="path" disabled><option value="">请选择关联资源（必选）</option>${resourceOptions}</select></div>
            <div class="menu-root-row"><label for="menu-child-sort"><span class="required">*</span>排序：</label><input id="menu-child-sort" class="control" name="sort" type="number" required min="0" step="1" value="0" /></div>
            <div class="menu-root-row"><label for="menu-child-shown"><span class="required">*</span>是否展示：</label><select id="menu-child-shown" class="control" name="shown" required><option value="true">是</option><option value="false">否</option></select></div>
          </form>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="menu-child-form">确定</button></footer>
        </section></div>`;
      }

      function patientModal() {
        const row = patients[state.patientDetailIndex] || patients[0];
        const avatarText = row[1].slice(0, 1) || "微";
        return `<div class="modal-backdrop" data-action="close-modal"><section class="dialog dialog-patient" role="dialog" aria-modal="true" aria-labelledby="patient-dialog-title" data-dialog><header class="dialog-header"><h2 id="patient-dialog-title">用户详情</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header>
          <div class="dialog-body"><section class="dialog-section"><div class="patient-profile"><div class="patient-profile-main"><div class="patient-wechat-avatar" role="img" aria-label="${escapeHtml(row[0])}的微信头像">${escapeHtml(avatarText)}</div><div class="patient-profile-copy"><h3>${escapeHtml(row[0])}</h3><p>微信昵称：${escapeHtml(row[1])}</p></div></div><button class="btn patient-sync-button" type="button" data-action="sync-wechat-profile">${icon("refresh-cw")}刷新头像昵称</button></div><h3>基本信息</h3><dl class="dialog-info patient-info-grid"><div class="info-item"><dt>性别</dt><dd>${row[2]}</dd></div><div class="info-item"><dt>年龄</dt><dd>${row[16]}</dd></div><div class="info-item"><dt>联系电话</dt><dd>${row[3]} <button class="text-button" type="button" data-action="view-sensitive">查看</button></dd></div><div class="info-item"><dt>诊断信息</dt><dd>${row[4]}</dd></div><div class="info-item"><dt>是否建档</dt><dd><span class="tag ${row[10] === "已建档" ? "success" : "neutral"}">${row[10]}</span></dd></div><div class="info-item"><dt>是否上传病历</dt><dd><span class="tag neutral">${row[11]}</span></dd></div><div class="info-item"><dt>注册时间</dt><dd>${row[12]}</dd></div><div class="info-item"><dt>最新登录时间</dt><dd>${row[13]}</dd></div></dl></section></div>
          <footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">关闭</button></footer></section></div>`;
      }

      function botCardSettingsModal() {
        const fields = [["type", "智能体类型"], ["description", "Bot 简介"], ["sessions", "今日会话"], ["handoff", "转人工率"], ["updated", "最近更新时间"]];
        return `<div class="modal-backdrop"><section class="dialog bot-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="bot-settings-title" data-dialog><header class="dialog-header"><h2 id="bot-settings-title">卡片设置</h2><button class="dialog-close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button></header><div class="dialog-body"><form id="bot-card-settings-form" class="bot-settings"><p>选择 Bot 卡片中展示的信息。</p>${fields.map(([value, label], index) => `<label><input type="checkbox" name="field" value="${value}"${state.botCardFields.has(value) ? " checked" : ""}${index === 0 ? " autofocus" : ""} />${label}</label>`).join("")}</form></div><footer class="dialog-footer"><button class="btn" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit" form="bot-card-settings-form">保存</button></footer></section></div>`;
      }

      function renderModal() {
        if (state.modal === "home-shortcuts") return homeShortcutsModal();
        if (state.modal === "tag-primary") return tagEditorModal("primary");
        if (state.modal === "tag-secondary") return tagEditorModal("secondary");
        if (state.modal === "tag-name") return tagEditorModal("name");
        if (state.modal === "material-groups") return materialGroupsModal();
        if (state.modal === "message-detail") return messageTaskDetailModal();
        if (state.modal === "account") return accountModal();
        if (state.modal === "account-disable") return accountDisableModal();
        if (state.modal === "role") return roleModal();
        if (state.modal === "role-permission") return rolePermissionModal();
        if (state.modal === "wecom-binding") return wecomBindingModal();
        if (state.modal === "menu-root") return menuRootModal();
        if (state.modal === "menu-child") return menuChildModal();
        if (state.modal === "patient") return patientModal();
        if (state.modal === "bot-card-settings") return botCardSettingsModal();
        return "";
      }

      function render() {
        document.body.classList.toggle("font-medium", state.fontMedium);
        const standaloneChat = chatWindowMode && state.route === "chat-history";
        document.body.classList.toggle("chat-window-mode", standaloneChat);
        document.title = standaloneChat ? "会话列表 · 卓睦鸟患管后台" : "卓睦鸟患管后台 · 交互原型";
        const pageShell = standaloneChat
          ? `<main class="chat-window-workspace"><div class="page-scroll">${chatHistoryPage()}</div></main>`
          : `<div class="app-shell${state.collapsed ? " is-collapsed" : ""}">${renderHeader()}${renderSidebar()}<main class="workspace">${renderTabs()}<div class="page-scroll">${renderPage()}</div></main></div>`;
        document.getElementById("app").innerHTML = `${pageShell}${renderModal()}<div id="toasts" class="toast-stack" aria-live="polite"></div>`;
        renderToasts();
        syncPermissionCheckboxes();
        if (state.route === "chat-history" && state.chatContentQuery.trim()) {
          window.setTimeout(() => {
            const hit = document.querySelector("[data-chat-hit]");
            const messagePanel = hit?.closest(".chat-messages");
            if (hit && messagePanel) messagePanel.scrollTop = Math.max(0, hit.offsetTop - messagePanel.clientHeight / 2);
          }, 0);
        }
        if (state.modal) window.setTimeout(() => (document.querySelector("[data-dialog] [autofocus]") || document.querySelector("[data-dialog] input, [data-dialog] button"))?.focus(), 0);
      }

      function closeModal() {
        if (state.modal === "account-disable") state.accountDisableId = null;
        state.modal = null;
        render();
      }

      document.addEventListener("click", event => {
        if (event.target.matches(".modal-backdrop[data-action='close-modal']")) { closeModal(); return; }
        const openTenantAdminPicker = document.querySelector("[data-tenant-admin-picker][open]");
        if (openTenantAdminPicker && !event.target.closest("[data-tenant-admin-picker]")) openTenantAdminPicker.removeAttribute("open");
        const openAccountRolePicker = document.querySelector("[data-account-role-picker][open]");
        if (openAccountRolePicker && !event.target.closest("[data-account-role-picker]")) openAccountRolePicker.removeAttribute("open");
        const openChatDoctorPicker = document.querySelector("[data-chat-doctor-picker][open]");
        if (openChatDoctorPicker && !event.target.closest("[data-chat-doctor-picker]")) openChatDoctorPicker.removeAttribute("open");
        const closedMessageMenu = state.messageMoreId && !event.target.closest(".message-more-wrap");
        if (closedMessageMenu) state.messageMoreId = null;
        const target = event.target.closest("button, [data-route], [data-bot-detail]");
        if (!target) { if (closedMessageMenu) render(); return; }
        if (target.closest("[data-dialog]") && target.dataset.action === undefined && !target.dataset.route && !target.dataset.menuSwitch && !target.dataset.toggleAccount) return;
        if (target.dataset.botDetail !== undefined) {
          state.selectedBotId = target.dataset.botDetail;
          state.botDetailTab = "overview";
          navigate("bot-detail");
          return;
        }
        if (target.dataset.botTab !== undefined) {
          state.botDetailTab = target.dataset.botTab;
          render();
          return;
        }
        if (target.dataset.materialGroup !== undefined) { state.materialGroup = target.dataset.materialGroup; render(); return; }
        if (target.dataset.materialFilterType !== undefined) { state.materialType = target.dataset.materialFilterType; render(); return; }
        if (target.dataset.materialFormType !== undefined) {
          state.materialFormType = target.dataset.materialFormType;
          document.querySelectorAll("[data-material-form-type]").forEach(button => { const active = button.dataset.materialFormType === state.materialFormType; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
          const typeInput = document.querySelector("#material-create-form input[name='type']");
          if (typeInput) typeInput.value = state.materialFormType;
          const fieldset = document.querySelector(".material-content-fieldset");
          if (fieldset) fieldset.innerHTML = `<legend><span class="required">*</span>素材内容</legend>${materialContentPanel(state.materialFormType)}`;
          return;
        }
        if (target.dataset.materialPin !== undefined) {
          const item = state.materials.find(material => material.id === target.dataset.materialPin);
          if (item) { item.pinned = !item.pinned; notify(item.pinned ? "素材已置顶" : "已取消置顶"); render(); }
          return;
        }
        if (target.dataset.materialDelete !== undefined) {
          const item = state.materials.find(material => material.id === target.dataset.materialDelete);
          if (item && window.confirm(`确认删除素材“${item.title}”？`)) { state.materials = state.materials.filter(material => material.id !== item.id); notify("素材已删除"); render(); }
          return;
        }
        if (target.dataset.tagToggle !== undefined) {
          const id = target.dataset.tagToggle;
          if (state.tagExpanded.has(id)) state.tagExpanded.delete(id); else state.tagExpanded.add(id);
          render();
          return;
        }
        if (target.dataset.tagAddSecondary !== undefined) { state.tagParentId = target.dataset.tagAddSecondary; state.tagEditingId = null; state.modal = "tag-secondary"; render(); return; }
        if (target.dataset.tagAddName !== undefined) { state.tagParentId = target.dataset.tagAddName; state.tagEditingId = null; state.modal = "tag-name"; render(); return; }
        if (target.dataset.tagEdit !== undefined) {
          const item = state.tags.find(tag => tag.id === target.dataset.tagEdit);
          if (item) { state.tagEditingId = item.id; state.tagParentId = item.parent; state.modal = item.type === "一级标签" ? "tag-primary" : item.type === "二级标签" ? "tag-secondary" : "tag-name"; render(); }
          return;
        }
        if (target.dataset.tagDelete !== undefined) {
          const item = state.tags.find(tag => tag.id === target.dataset.tagDelete);
          if (item && window.confirm(`确认删除“${item.name}”及其下级标签？`)) {
            const removeIds = new Set([item.id]);
            let changed = true;
            while (changed) { changed = false; state.tags.forEach(tag => { if (tag.parent && removeIds.has(tag.parent) && !removeIds.has(tag.id)) { removeIds.add(tag.id); changed = true; } }); }
            state.tags = state.tags.filter(tag => !removeIds.has(tag.id));
            notify("标签已删除");
            render();
          }
          return;
        }
        if (target.dataset.messageStatus !== undefined) { state.messageStatus = target.dataset.messageStatus; state.messageMoreId = null; render(); return; }
        if (target.dataset.messageMore !== undefined) { state.messageMoreId = state.messageMoreId === target.dataset.messageMore ? null : target.dataset.messageMore; render(); return; }
        if (target.dataset.messageDetail !== undefined) { state.selectedMessageTaskId = target.dataset.messageDetail; state.modal = "message-detail"; state.messageMoreId = null; render(); return; }
        if (target.dataset.chatManagedDoctor !== undefined) {
          const picker = target.closest("[data-chat-doctor-picker]");
          const doctor = chatDoctors.find(item => item.id === target.dataset.chatManagedDoctor);
          const input = picker?.querySelector("input[name='doctor']");
          const value = picker?.querySelector("[data-chat-doctor-picker-value]");
          if (picker && doctor && input && value) {
            input.value = doctor.id;
            value.textContent = doctor.name;
            value.classList.remove("is-placeholder");
            picker.querySelectorAll("[data-chat-managed-doctor]").forEach(option => option.setAttribute("aria-selected", String(option.dataset.chatManagedDoctor === doctor.id)));
            const search = picker.querySelector("[data-chat-managed-doctor-search]");
            if (search) search.value = "";
            picker.querySelectorAll("[data-chat-managed-doctor]").forEach(option => { option.hidden = false; });
            const empty = picker.querySelector("[data-chat-doctor-empty]");
            if (empty) empty.hidden = true;
            picker.removeAttribute("open");
          }
          return;
        }
        if (target.dataset.chatProjectToggle !== undefined) {
          const projectId = target.dataset.chatProjectToggle;
          if (state.chatCollapsedProjects.has(projectId)) state.chatCollapsedProjects.delete(projectId);
          else state.chatCollapsedProjects.add(projectId);
          render();
          return;
        }
        if (target.dataset.chatDoctor !== undefined) {
          state.chatDoctorId = target.dataset.chatDoctor;
          state.chatManagedDoctorQuery = "";
          state.chatConversationType = "全部";
          state.chatTypeQuery = "";
          const firstConversation = chatConversations.find(item => item.doctorId === state.chatDoctorId);
          state.chatConversationId = firstConversation?.id || "";
          state.chatSelectedHitKey = "";
          render();
          return;
        }
        if (target.dataset.chatType !== undefined) {
          state.chatConversationType = target.dataset.chatType;
          state.chatTypeQuery = state.chatConversationType === "全部" ? "" : state.chatConversationType;
          const firstConversation = chatConversations.find(item => item.doctorId === state.chatDoctorId && (state.chatConversationType === "全部" || item.type === state.chatConversationType));
          state.chatConversationId = firstConversation?.id || "";
          state.chatSelectedHitKey = "";
          render();
          return;
        }
        if (target.dataset.chatSearchGroupToggle !== undefined) {
          const doctorId = target.dataset.chatSearchGroupToggle;
          if (state.chatSearchCollapsedDoctors.has(doctorId)) state.chatSearchCollapsedDoctors.delete(doctorId);
          else state.chatSearchCollapsedDoctors.add(doctorId);
          render();
          return;
        }
        if (target.dataset.chatHitKey !== undefined) {
          state.chatSelectedHitKey = target.dataset.chatHitKey;
          state.chatConversationId = target.dataset.chatConversation || "";
          render();
          return;
        }
        if (target.dataset.chatConversation !== undefined) { state.chatSelectedHitKey = ""; state.chatConversationId = target.dataset.chatConversation; render(); return; }
        if (target.dataset.route !== undefined && target.dataset.route) { navigate(target.dataset.route); return; }
        if (target.dataset.nav !== undefined) {
          const group = navGroups.find(item => item.label === target.dataset.nav);
          if (group?.children) {
            if (state.openGroups.has(group.label)) state.openGroups.delete(group.label); else state.openGroups.add(group.label);
          }
          if (group?.route) navigate(group.route);
          else if (group?.children) render();
          else { notify("当前原型未包含此模块页面"); render(); }
          return;
        }
        if (target.dataset.closeTab) {
          const route = target.dataset.closeTab;
          const index = state.tabs.findIndex(tab => tab.route === route);
          state.tabs = state.tabs.filter(tab => tab.route !== route);
          if (!state.tabs.length) state.tabs.push({ route: "home", label: "首页" });
          if (route === state.route) navigate(state.tabs[Math.max(0, index - 1)]?.route || "home"); else render();
          return;
        }
        if (target.dataset.page) { notify(`已切换到第 ${target.dataset.page === "next" ? 2 : target.dataset.page === "prev" ? 1 : target.dataset.page} 页`); return; }
        if (target.dataset.toggleTenant) {
          const item = state.tenants.find(tenant => tenant.id === target.dataset.toggleTenant);
          if (item) { item.row[2] = item.row[2] === "已启用" ? "已禁用" : "已启用"; notify(`租户已${item.row[2] === "已启用" ? "启用" : "停用"}`); render(); }
          return;
        }
        if (target.dataset.toggleAccount) {
          const item = state.accounts.find(account => account.id === target.dataset.toggleAccount);
          if (!item) return;
          if (item.row[2] !== "已启用") {
            item.row[2] = "已启用";
            notify("账号已启用");
            render();
            return;
          }
          const roles = accountRoles(item);
          if (roles.some(role => role === "医助" || role === "医生")) {
            state.accountDisableId = item.id;
            state.modal = "account-disable";
            render();
            return;
          }
          item.row[2] = "已禁用";
          notify("账号已停用");
          render();
          return;
        }
        if (target.dataset.roleBind) {
          const role = state.roles.find(item => item.id === target.dataset.roleBind);
          if (role) {
            state.rolePermissionRoleId = role.id;
            state.rolePermissionQuery = "";
            state.rolePermissionDraft = new Set(state.rolePermissions[role.id] || []);
            state.modal = "role-permission";
            render();
          }
          return;
        }
        if (target.dataset.roleEdit) {
          const role = state.roles.find(item => item.id === target.dataset.roleEdit);
          if (role) notify(`已选择修改角色“${role.name}”`);
          return;
        }
        if (target.dataset.roleRemove) {
          const role = state.roles.find(item => item.id === target.dataset.roleRemove);
          if (role) notify(`“${role.name}”为预置角色，当前原型不执行移除`);
          return;
        }
        if (target.dataset.tenantAdminOption !== undefined) {
          const item = state.accounts.find(account => account.id === target.dataset.tenantAdminOption);
          if (item) {
            state.tenantAdminDraftId = item.id;
            render();
            window.setTimeout(() => document.querySelector("[data-tenant-admin-picker] > summary")?.focus(), 0);
          }
          return;
        }
        if (target.dataset.wecomEntityToggle !== undefined) {
          const entity = wecomEntityById(target.dataset.wecomEntityToggle);
          if (entity) { entity.expanded = !entity.expanded; render(); }
          return;
        }
        if (target.dataset.wecomOrgToggle !== undefined) {
          const [entityId, organizationId] = target.dataset.wecomOrgToggle.split(":");
          const entity = wecomEntityById(entityId);
          const organization = entity?.organizations.find(item => item.id === organizationId);
          if (organization) { organization.expanded = !organization.expanded; render(); }
          return;
        }
        if (target.dataset.wecomBind !== undefined) {
          const entity = wecomEntityById(target.dataset.wecomBind);
          if (entity) {
            state.wecomBindingEntityId = entity.id;
            state.wecomBindingDraft = [...entity.tenants];
            state.modal = "wecom-binding";
            render();
          }
          return;
        }
        if (target.dataset.wecomDetail !== undefined) {
          const entity = wecomEntityById(target.dataset.wecomDetail);
          if (entity) {
            state.selectedWecomEntityId = entity.id;
            state.wecomAccountNameQuery = "";
            state.wecomAccountTenantQuery = "";
            state.wecomAccountManagedStatusQuery = "";
            navigate("wecom-detail");
          }
          return;
        }
        if (target.dataset.patientDetail !== undefined) { state.patientDetailIndex = Number(target.dataset.patientDetail) || 0; state.modal = "patient"; render(); return; }
        if (target.dataset.menuAdd) { state.menuParentId = target.dataset.menuAdd; state.modal = "menu-child"; render(); return; }
        if (target.dataset.menuSwitch) { const id = target.dataset.menuSwitch; state.menuEnabled[id] = !state.menuEnabled[id]; notify(`菜单已${state.menuEnabled[id] ? "启用" : "停用"}`); render(); return; }
        switch (target.dataset.action) {
          case "collapse": state.collapsed = !state.collapsed; render(); break;
          case "font-size": state.fontMedium = !state.fontMedium; notify(`已切换为${state.fontMedium ? "中号" : "小号"}字体`); render(); break;
          case "language": notify("当前原型保留中文界面"); break;
          case "fullscreen": document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.(); break;
          case "account-menu": state.headerMenu = !state.headerMenu; render(); break;
          case "home-shortcuts":
            state.homeShortcutDraft = new Set(state.homeShortcutIds);
            state.modal = "home-shortcuts";
            render();
            break;
          case "home-message-abnormal":
            state.messageStatus = "异常任务";
            navigate("message-touch");
            break;
          case "home-message-pending":
            state.messageStatus = "待执行";
            navigate("message-touch");
            break;
          case "home-wecom-offline": {
            const offlineAccount = wecomAccounts.find(item => item.managedStatus === "离线");
            if (offlineAccount) state.selectedWecomEntityId = offlineAccount.entityId;
            state.wecomAccountNameQuery = "";
            state.wecomAccountTenantQuery = "";
            state.wecomAccountManagedStatusQuery = "离线";
            navigate("wecom-detail");
            break;
          }
          case "open-account": state.modal = "account"; render(); break;
          case "confirm-account-disable": {
            const item = state.accounts.find(account => account.id === state.accountDisableId);
            if (item) {
              item.row[2] = "已禁用";
              item.row[5] = "-";
              notify("账号已停用，全部角色权限已回收");
            }
            state.accountDisableId = null;
            state.modal = null;
            render();
            break;
          }
          case "open-role": state.modal = "role"; render(); break;
          case "open-menu-root": state.modal = "menu-root"; render(); break;
          case "permission-toggle": {
            const id = target.dataset.permissionId;
            const node = permissionNodeById(id);
            if (!node?.children?.length) break;
            if (state.rolePermissionExpanded.has(id)) state.rolePermissionExpanded.delete(id); else state.rolePermissionExpanded.add(id);
            const query = state.rolePermissionQuery.trim().toLowerCase();
            const expanded = Boolean(query) || state.rolePermissionExpanded.has(id);
            const nodeElement = target.closest("[data-permission-node]");
            const childrenHost = [...(nodeElement?.children || [])].find(child => child.dataset.permissionChildren === id);
            target.setAttribute("aria-expanded", String(expanded));
            target.setAttribute("aria-label", `${expanded ? "折叠" : "展开"}${node.name}`);
            target.innerHTML = icon(expanded ? "chevron-down" : "chevron-right");
            if (childrenHost) {
              if (expanded && !childrenHost.childElementCount) childrenHost.innerHTML = node.children.map(child => renderPermissionNode(child, Number(nodeElement.dataset.permissionLevel) + 1, query)).join("");
              childrenHost.hidden = !expanded;
            }
            syncPermissionCheckboxes();
            break;
          }
          case "save-role-permission": {
            const role = state.roles.find(item => item.id === state.rolePermissionRoleId);
            if (!role) { closeModal(); break; }
            state.rolePermissions[role.id] = new Set(state.rolePermissionDraft);
            state.modal = null;
            notify(`“${role.name}”已绑定 ${state.rolePermissionDraft.size} 项菜单权限`);
            render();
            break;
          }
          case "wecom-add-tenant": {
            const select = document.getElementById("wecom-tenant-select");
            const tenant = select?.value || "";
            if (!tenant) { notify("请选择需要添加的系统租户"); break; }
            if (!state.wecomBindingDraft.includes(tenant)) state.wecomBindingDraft.push(tenant);
            render();
            window.setTimeout(() => document.getElementById("wecom-tenant-select")?.focus(), 0);
            break;
          }
          case "wecom-remove-tenant":
            state.wecomBindingDraft = state.wecomBindingDraft.filter(tenant => tenant !== target.dataset.tenant);
            render();
            break;
          case "menu-child-type": {
            const form = document.getElementById("menu-child-form");
            const type = target.dataset.type === "menu" ? "menu" : "directory";
            if (!form) break;
            form.elements.type.value = type;
            form.querySelectorAll("[data-action='menu-child-type']").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.type === type)));
            const resourceRow = form.querySelector(".menu-child-resource");
            const resourceSelect = form.elements.path;
            resourceRow.hidden = type !== "menu";
            resourceSelect.disabled = type !== "menu";
            resourceSelect.required = type === "menu";
            break;
          }
          case "close-modal": if (event.target === target || target.closest("[data-action='close-modal']")) closeModal(); break;
          case "focus-filter":
            if (state.route === "account" && !state.accountSearchOpen) { state.accountSearchOpen = true; render(); window.setTimeout(() => document.getElementById("account-search")?.focus(), 0); }
            else if (state.route === "role" && !state.roleSearchOpen) { state.roleSearchOpen = true; render(); window.setTimeout(() => document.getElementById("role-search")?.focus(), 0); }
            else document.querySelector(".filter-card input, #account-search, #role-search")?.focus();
            break;
          case "density": document.body.classList.toggle("compact-table"); notify("已切换列表显示密度"); break;
          case "tenant-reset": state.tenantQuery = ""; state.tenantCooperationQuery = ""; render(); break;
          case "wecom-reset": state.wecomEntityQuery = ""; render(); break;
          case "wecom-account-reset": state.wecomAccountNameQuery = ""; state.wecomAccountTenantQuery = ""; state.wecomAccountManagedStatusQuery = ""; render(); break;
          case "wecom-toggle-all": {
            const shouldExpand = !state.wecomEntities.every(entity => entity.expanded && entity.organizations.filter(organization => organization.hasChildren).every(organization => organization.expanded));
            state.wecomEntities.forEach(entity => {
              entity.expanded = shouldExpand;
              entity.organizations.forEach(organization => { if (organization.hasChildren) organization.expanded = shouldExpand; });
            });
            render();
            break;
          }
          case "doctor-reset": state.doctorQuery = ""; render(); break;
          case "patient-reset": state.patientNameQuery = ""; state.patientNicknameQuery = ""; render(); break;
          case "bot-search": state.botFiltersOpen = true; render(); window.setTimeout(() => document.getElementById("bot-filter-first")?.focus(), 0); break;
          case "bot-toggle-filter": state.botFiltersOpen = !state.botFiltersOpen; render(); break;
          case "bot-card-settings": state.modal = "bot-card-settings"; render(); break;
          case "bot-reset": state.botQuery = ""; state.botTenant = ""; state.botProject = ""; state.botChannel = ""; state.botStatus = ""; state.botSort = "最近更新时间"; render(); break;
          case "bot-audit-reset": state.botAuditQuery = ""; state.botAuditType = ""; state.botAuditResult = ""; state.botAuditRange = "最近 30 天"; render(); break;
          case "material-reset": state.materialQuery = ""; state.materialType = "全部"; render(); break;
          case "material-groups": state.modal = "material-groups"; render(); break;
          case "material-group-create": {
            const input = document.getElementById("material-group-new");
            const name = input?.value.trim() || "";
            if (!name) { notify("请输入新分组名称"); input?.focus(); break; }
            if (state.materialGroups.includes(name)) { notify("分组名称已存在"); input?.focus(); break; }
            state.materialGroups.push(name);
            render();
            notify("分组已创建");
            break;
          }
          case "material-group-delete": {
            const index = Number(target.dataset.materialGroupIndex);
            const name = state.materialGroups[index];
            if (name && window.confirm(`确认删除分组“${name}”？组内素材将保留在全部素材中。`)) {
              state.materialGroups.splice(index, 1);
              state.materials.forEach(item => { if (item.group === name) item.group = "未分组"; });
              if (state.materialGroup === name) state.materialGroup = "all";
              notify("分组已删除");
              render();
            }
            break;
          }
          case "material-edit": {
            const item = state.materials.find(material => material.id === target.dataset.materialId);
            if (item) {
              state.materialEditingId = item.id;
              state.materialFormType = item.type;
              state.materialUseConversation = item.purpose.includes("会话");
              state.materialUsePush = item.purpose.includes("推送");
              navigate("material-new");
            }
            break;
          }
          case "tag-add-primary": state.tagEditingId = null; state.tagParentId = null; state.modal = "tag-primary"; render(); break;
          case "tag-reset": state.tagQuery = ""; render(); break;
          case "tag-toggle-all": {
            const expandableIds = state.tags.filter(item => state.tags.some(child => child.parent === item.id)).map(item => item.id);
            const shouldExpand = !expandableIds.every(id => state.tagExpanded.has(id));
            expandableIds.forEach(id => { if (shouldExpand) state.tagExpanded.add(id); else state.tagExpanded.delete(id); });
            render();
            break;
          }
          case "message-reset": state.messageTaskQuery = ""; state.messageCreatorQuery = ""; state.messageSendTypeQuery = ""; state.messageCreateStart = ""; state.messageCreateEnd = ""; state.messageSendStart = ""; state.messageSendEnd = ""; render(); break;
          case "message-copy": {
            const item = state.messages.find(message => message.id === target.dataset.messageId);
            if (item) { state.messageDraftTaskName = `${item.name}（副本）`; state.messageDraftContent = item.content; state.messageDraftSendType = item.sendType === "定时" ? "定时发送" : "立即发送"; state.messageScheduledAt = ""; state.messageDoctorQueryApplied = false; state.selectedMessageDoctors.clear(); state.messageMoreId = null; navigate("message-new"); }
            break;
          }
          case "message-resend": {
            const item = state.messages.find(message => message.id === target.dataset.messageId);
            if (item) { item.success += item.failed; item.failed = 0; item.status = "已完成"; state.modal = null; state.messageMoreId = null; notify("失败消息已重新发送"); render(); }
            break;
          }
          case "message-cancel": {
            const item = state.messages.find(message => message.id === target.dataset.messageId);
            if (item && window.confirm(`确认取消任务“${item.name}”？`)) { item.status = "已取消"; state.messageMoreId = null; state.messageStatus = "已取消"; notify("任务已取消"); render(); }
            break;
          }
          case "message-doctor-reset":
            state.messageDoctorTenantQuery = "";
            state.messageDoctorProjectQuery = "";
            state.messageDoctorNameQuery = "";
            state.messageDoctorHospitalQuery = "";
            state.messageDoctorDepartmentQuery = "";
            state.messageDoctorTitleQuery = "";
            state.messageDoctorPhoneQuery = "";
            state.messageDoctorQueryApplied = false;
            state.selectedMessageDoctors.clear();
            render();
            break;
          case "message-select-current":
            document.querySelectorAll("[data-message-doctor-check]").forEach(input => { state.selectedMessageDoctors.add(input.dataset.messageDoctorCheck); });
            render();
            notify("已全选当前页推送对象");
            break;
          case "message-select-all":
            String(target.dataset.messageIds || "").split(",").filter(Boolean).forEach(id => { state.selectedMessageDoctors.add(id); });
            render();
            notify("已全选所有推送对象");
            break;
          case "message-clear-selection":
            state.selectedMessageDoctors.clear();
            render();
            notify("已取消全选");
            break;
          case "message-doctor-query": {
            const form = document.getElementById("message-create-form");
            if (form) {
              const data = new FormData(form);
              const values = {
                tenant: String(data.get("doctorTenant") || "").trim(),
                project: String(data.get("doctorProject") || "").trim(),
                hospital: String(data.get("doctorHospital") || "").trim(),
                department: String(data.get("doctorDepartment") || "").trim(),
                title: String(data.get("doctorTitle") || "").trim(),
                name: String(data.get("doctorName") || "").trim(),
                phone: String(data.get("doctorPhone") || "").trim()
              };
              if (!Object.values(values).some(Boolean)) {
                notify("请至少选择一个查询条件");
                form.querySelector("[name='doctorTenant']")?.focus();
                break;
              }
              state.messageDoctorTenantQuery = values.tenant;
              state.messageDoctorProjectQuery = values.project;
              state.messageDoctorHospitalQuery = values.hospital;
              state.messageDoctorDepartmentQuery = values.department;
              state.messageDoctorTitleQuery = values.title;
              state.messageDoctorNameQuery = values.name;
              state.messageDoctorPhoneQuery = values.phone;
              state.messageDraftTaskName = String(data.get("taskName") || "");
              state.messageDraftSendType = String(data.get("sendMode") || "立即发送");
              state.messageScheduledAt = String(data.get("scheduledAt") || "");
              if (form.elements.content) state.messageDraftContent = String(data.get("content") || "");
              state.messageDoctorQueryApplied = true;
              state.selectedMessageDoctors.clear();
            }
            render();
            break;
          }
          case "chat-reset": {
            const defaultRange = defaultChatDateRange();
            state.chatTenantQuery = "";
            state.chatProjectQuery = "";
            state.chatTypeQuery = "";
            state.chatManagedDoctorQuery = "";
            state.chatFriendQuery = "";
            state.chatContentQuery = "";
            state.chatDateStart = defaultRange.start;
            state.chatDateEnd = defaultRange.end;
            state.chatConversationType = "全部";
            state.chatConversationSearchQuery = "";
            state.chatSearchCollapsedDoctors.clear();
            state.chatSelectedHitKey = "";
            render();
            break;
          }
          case "chat-export": notify("聊天记录导出任务已创建"); break;
          case "chat-project-panel-toggle": state.chatProjectPanelCollapsed = !state.chatProjectPanelCollapsed; render(); break;
          case "chat-project-search": state.chatProjectSearchOpen = !state.chatProjectSearchOpen; if (!state.chatProjectSearchOpen) state.chatProjectSearchQuery = ""; render(); window.setTimeout(() => document.getElementById("chat-project-search")?.focus(), 0); break;
          case "chat-list-search": state.chatConversationSearchOpen = !state.chatConversationSearchOpen; if (!state.chatConversationSearchOpen) state.chatConversationSearchQuery = ""; render(); window.setTimeout(() => document.getElementById("chat-list-search")?.focus(), 0); break;
          case "chat-sort": state.chatConversationOrderNewest = !state.chatConversationOrderNewest; render(); break;
          case "chat-refresh": notify("会话列表已刷新"); break;
          case "chat-more-info": notify("已加载更多会话信息"); break;
          case "menu-reset": state.menuQuery = ""; render(); break;
          case "account-search": state.accountQuery = document.getElementById("account-search")?.value || ""; render(); break;
          case "role-search": state.roleQuery = document.getElementById("role-search")?.value || ""; render(); break;
          case "toggle-password": { const input = document.querySelector("input[name=password]"); if (input) input.type = input.type === "password" ? "text" : "password"; break; }
          case "toggle-tenant-contact-phone": state.tenantContactPhoneVisible = !state.tenantContactPhoneVisible; render(); window.setTimeout(() => document.querySelector("[data-action='toggle-tenant-contact-phone']")?.focus(), 0); break;
          case "toggle-tenant-admin-phone": state.tenantAdminPhoneVisible = !state.tenantAdminPhoneVisible; render(); window.setTimeout(() => document.querySelector("[data-action='toggle-tenant-admin-phone']")?.focus(), 0); break;
          case "export": notify("导出任务已创建，文件准备完成后将自动下载"); break;
          case "view-sensitive": notify("原型环境仅展示脱敏信息"); break;
          case "sync-wechat-profile": notify("已同步最新微信头像和昵称"); break;
          case "menu-toggle-all": state.menuExpanded = !state.menuExpanded; render(); break;
          case "toggle-tree": state.menuExpanded = !state.menuExpanded; render(); break;
          case "not-implemented": notify("该操作不属于本次 UI 图覆盖范围"); break;
        }
      });

      document.addEventListener("keydown", event => {
        if (!['Enter', ' '].includes(event.key)) return;
        const card = event.target.closest("[data-bot-detail]");
        if (!card) return;
        event.preventDefault();
        card.click();
      });

      document.addEventListener("dragstart", event => {
        const handle = event.target.closest?.("[data-material-group-drag-index]");
        if (!handle) return;
        const index = Number(handle.dataset.materialGroupDragIndex);
        if (!Number.isInteger(index) || index < 0 || index >= state.materialGroups.length) return;
        state.materialGroupDragIndex = index;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        window.requestAnimationFrame(() => handle.closest(".material-group-item")?.classList.add("is-dragging"));
      });

      document.addEventListener("dragover", event => {
        if (state.materialGroupDragIndex === null) return;
        const row = event.target.closest?.("[data-material-group-drop-index]");
        if (!row) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        document.querySelectorAll(".material-group-item.is-drag-over").forEach(item => item.classList.remove("is-drag-over"));
        row.classList.add("is-drag-over");
      });

      document.addEventListener("drop", event => {
        const row = event.target.closest?.("[data-material-group-drop-index]");
        const fromIndex = state.materialGroupDragIndex;
        document.querySelectorAll(".material-group-item.is-dragging, .material-group-item.is-drag-over").forEach(item => item.classList.remove("is-dragging", "is-drag-over"));
        state.materialGroupDragIndex = null;
        if (!row || fromIndex === null) return;
        event.preventDefault();
        const toIndex = Number(row.dataset.materialGroupDropIndex);
        if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= state.materialGroups.length || toIndex === fromIndex) return;
        const [name] = state.materialGroups.splice(fromIndex, 1);
        state.materialGroups.splice(toIndex, 0, name);
        render();
        notify(`“${name}”位置已调整`);
      });

      document.addEventListener("dragend", () => {
        state.materialGroupDragIndex = null;
        document.querySelectorAll(".material-group-item.is-dragging, .material-group-item.is-drag-over").forEach(item => item.classList.remove("is-dragging", "is-drag-over"));
      });

      document.addEventListener("focusout", event => {
        if (event.target.matches("[data-material-group-name-index]")) {
          const index = Number(event.target.dataset.materialGroupNameIndex);
          const oldName = state.materialGroups[index];
          const name = event.target.value.trim();
          if (!oldName) return;
          if (!name) { event.target.value = oldName; notify("分组名称不能为空"); return; }
          if (state.materialGroups.some((item, itemIndex) => item === name && itemIndex !== index)) { event.target.value = oldName; notify("分组名称已存在"); return; }
          if (name === oldName) return;
          state.materialGroups[index] = name;
          state.materials.forEach(item => { if (item.group === oldName) item.group = name; });
          if (state.materialGroup === oldName) state.materialGroup = name;
          notify("分组已自动保存");
        }
      });

      document.addEventListener("change", event => {
        if (event.target.matches("[data-chat-tenant-filter]")) {
          const tenant = event.target.value;
          const firstConversation = chatConversations.find(item => {
            const occurredDate = (item.occurredAt || "").slice(0, 10);
            return (!tenant || item.tenant === tenant) &&
              (!state.chatDateStart || !occurredDate || occurredDate >= state.chatDateStart) &&
              (!state.chatDateEnd || !occurredDate || occurredDate <= state.chatDateEnd);
          });
          state.chatTenantQuery = tenant;
          state.chatProjectQuery = "";
          state.chatDoctorId = firstConversation?.doctorId || "";
          state.chatConversationId = firstConversation?.id || "";
          state.chatConversationType = "全部";
          state.chatTypeQuery = "";
          state.chatConversationSearchQuery = "";
          state.chatProjectSearchQuery = "";
          state.chatSelectedHitKey = "";
          render();
          return;
        }
        if (event.target.matches("#chat-date-start, #chat-date-end")) {
          const form = event.target.closest("[data-form='chat-filter']");
          state.chatDateStart = form?.querySelector("#chat-date-start")?.value || "";
          state.chatDateEnd = form?.querySelector("#chat-date-end")?.value || "";
          state.chatConversationId = "";
          state.chatSelectedHitKey = "";
          render();
          return;
        }
        if (event.target.matches("[data-home-shortcut-option]")) {
          const id = event.target.value;
          if (event.target.checked) {
            if (state.homeShortcutDraft.size >= 4) {
              event.target.checked = false;
              notify("常用功能最多选择 4 项");
            } else {
              state.homeShortcutDraft.add(id);
            }
          } else {
            state.homeShortcutDraft.delete(id);
          }
          const selectionFull = state.homeShortcutDraft.size >= 4;
          document.querySelectorAll("[data-home-shortcut-option]").forEach(input => { input.disabled = selectionFull && !input.checked; });
          const count = document.querySelector("[data-home-shortcut-count]");
          if (count) count.textContent = String(state.homeShortcutDraft.size);
          return;
        }
        const botFilterField = event.target.dataset.botFilterField;
        if (botFilterField) {
          if (botFilterField === "query") state.botQuery = event.target.value;
          if (botFilterField === "tenant") state.botTenant = event.target.value;
          if (botFilterField === "project") state.botProject = event.target.value;
          if (botFilterField === "channel") state.botChannel = event.target.value;
          if (botFilterField === "status") state.botStatus = event.target.value;
          if (botFilterField === "sort") state.botSort = event.target.value;
          render();
          return;
        }
        const auditField = event.target.dataset.botAuditField;
        if (!auditField) return;
        if (auditField === "query") state.botAuditQuery = event.target.value;
        if (auditField === "type") state.botAuditType = event.target.value;
        if (auditField === "result") state.botAuditResult = event.target.value;
        if (auditField === "range") state.botAuditRange = event.target.value;
        render();
      });

      document.addEventListener("submit", event => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        if (form.id === "home-shortcuts-form") {
          if (!state.homeShortcutDraft.size) {
            notify("请至少选择 1 个常用功能");
            form.querySelector("[data-home-shortcut-option]")?.focus();
            return;
          }
          state.homeShortcutIds = homeShortcutOptions.filter(option => state.homeShortcutDraft.has(option.id)).map(option => option.id).slice(0, 4);
          persistHomeShortcutIds(state.homeShortcutIds);
          state.modal = null;
          notify("常用功能已更新");
          render();
          return;
        }
        if (form.dataset.form === "tenant-filter") {
          const cooperation = String(data.get("cooperation") || "");
          state.tenantQuery = String(data.get("name") || "");
          state.tenantCooperationQuery = cooperation === "not-started" ? "未开始" : cooperation === "active" ? "合作中" : cooperation === "ended" ? "已结束" : "";
          render();
        }
        if (form.dataset.form === "wecom-filter") { state.wecomEntityQuery = String(data.get("name") || ""); render(); }
        if (form.dataset.form === "wecom-account-filter") { state.wecomAccountNameQuery = String(data.get("name") || ""); state.wecomAccountTenantQuery = String(data.get("tenant") || ""); state.wecomAccountManagedStatusQuery = String(data.get("managedStatus") || ""); render(); }
        if (form.dataset.form === "doctor-filter") { state.doctorQuery = String(data.get("query") || ""); render(); }
        if (form.dataset.form === "patient-filter") { state.patientNameQuery = String(data.get("name") || ""); state.patientNicknameQuery = String(data.get("nickname") || ""); render(); }
        if (form.dataset.form === "bot-filter") { state.botQuery = String(data.get("query") || ""); state.botStatus = String(data.get("status") || ""); state.botSort = String(data.get("sort") || "最近更新时间"); render(); }
        if (form.dataset.form === "material-filter") { state.materialQuery = String(data.get("query") || ""); render(); }
        if (form.id === "material-create-form") {
          if (!form.reportValidity()) return;
          const purposes = data.getAll("purpose").map(String);
          if (!purposes.length) { notify("请至少选择一种用途标记"); form.querySelector("input[name='purpose']")?.focus(); return; }
          const type = String(data.get("type") || state.materialFormType);
          let summary = String(data.get("content") || data.get("webDescription") || data.get("miniTitle") || state.materialUploadNames[type] || "").trim();
          if (!summary && ["图片", "视频", "语音", "文件"].includes(type)) { notify(`请上传${type}`); form.querySelector("[data-material-upload]")?.focus(); return; }
          if (!summary) { notify("请填写素材内容"); form.querySelector("textarea, input[name='webTitle'], input[name='miniTitle']")?.focus(); return; }
          const title = String(data.get("title") || "").trim();
          const editing = state.materials.find(item => item.id === state.materialEditingId);
          const payload = { title, pinned: editing?.pinned || false, group: String(data.get("group") || "").trim() || "未分组", summary, type, purpose: purposes.join(" / "), updatedAt: currentTimestamp() };
          if (editing) Object.assign(editing, payload); else state.materials.unshift({ id: `mat-${Date.now()}`, ...payload });
          state.materialEditingId = null;
          state.materialUploadNames = {};
          state.materialFormType = "文本";
          state.materialUseConversation = true;
          state.materialUsePush = false;
          notify(editing ? "素材已保存" : "素材创建成功");
          navigate("material");
        }
        if (form.dataset.form === "tag-filter") { state.tagQuery = String(data.get("query") || ""); render(); }
        if (form.id === "tag-editor-form") {
          if (!form.reportValidity()) return;
          const name = String(data.get("name") || "").trim();
          const kind = String(data.get("kind") || "primary");
          const type = kind === "primary" ? "一级标签" : kind === "secondary" ? "二级标签" : "标签名称";
          const editing = state.tags.find(item => item.id === state.tagEditingId);
          const duplicate = state.tags.some(item => item.id !== editing?.id && item.parent === (editing?.parent ?? state.tagParentId) && item.name === name);
          if (duplicate) { notify("同级标签名称已存在"); form.querySelector("[name='name']")?.focus(); return; }
          if (editing) { editing.name = name; editing.sort = Number(data.get("sort")); editing.updatedAt = currentTimestamp(); }
          else {
            const item = { id: `tag-${Date.now()}`, name, type, sort: Number(data.get("sort")), createdAt: currentTimestamp(), updatedAt: currentTimestamp(), parent: kind === "primary" ? null : state.tagParentId };
            state.tags.push(item);
            if (item.parent) state.tagExpanded.add(item.parent);
          }
          state.modal = null;
          state.tagEditingId = null;
          notify(editing ? "标签已保存" : `${type}添加成功`);
          render();
        }
        if (form.dataset.form === "message-filter") {
          state.messageTaskQuery = String(data.get("task") || "");
          state.messageCreatorQuery = String(data.get("creator") || "");
          state.messageSendTypeQuery = String(data.get("sendType") || "");
          state.messageCreateStart = String(data.get("createStart") || "");
          state.messageCreateEnd = String(data.get("createEnd") || "");
          state.messageSendStart = String(data.get("sendStart") || "");
          state.messageSendEnd = String(data.get("sendEnd") || "");
          render();
        }
        if (form.id === "message-create-form") {
          if (!form.reportValidity()) return;
          if (!state.selectedMessageDoctors.size) { notify("请至少选择一位医生"); return; }
          const sendMode = String(data.get("sendMode") || "立即发送");
          const scheduledAtValue = String(data.get("scheduledAt") || "");
          const scheduledAt = scheduledAtValue ? `${scheduledAtValue.replace("T", " ")}${scheduledAtValue.length === 16 ? ":00" : ""}` : "待执行";
          const now = currentTimestamp();
          const item = { id: `msg-${Date.now()}`, name: String(data.get("taskName") || "").trim(), content: String(data.get("content") || "").trim(), audience: `已选医生 ${state.selectedMessageDoctors.size} 人`, target: state.selectedMessageDoctors.size, success: 0, failed: 0, sendType: sendMode === "定时发送" ? "定时" : "立即", status: sendMode === "定时发送" ? "待执行" : "进行中", sentAt: sendMode === "定时发送" ? scheduledAt : now, createdAt: now, creator: "管理员" };
          state.messages.unshift(item);
          state.messageStatus = item.status;
          state.messageDraftTaskName = "";
          state.messageDraftContent = "请查阅糖尿病饮食指南";
          state.messageDraftSendType = "立即发送";
          state.messageScheduledAt = "";
          state.messageMaterial = "";
          state.messageDoctorQueryApplied = false;
          state.selectedMessageDoctors.clear();
          state.messageDoctorTenantQuery = "";
          state.messageDoctorProjectQuery = "";
          state.messageDoctorNameQuery = "";
          state.messageDoctorHospitalQuery = "";
          state.messageDoctorDepartmentQuery = "";
          state.messageDoctorTitleQuery = "";
          state.messageDoctorPhoneQuery = "";
          notify("消息任务创建成功");
          navigate("message-touch");
        }
        if (form.dataset.form === "chat-filter") {
          state.chatTenantQuery = String(data.get("tenant") || "");
          state.chatDateStart = String(data.get("dateStart") || "");
          state.chatDateEnd = String(data.get("dateEnd") || "");
          state.chatConversationId = "";
          state.chatSelectedHitKey = "";
          render();
        }
        if (form.id === "bot-card-settings-form") { state.botCardFields = new Set(data.getAll("field").map(String)); state.modal = null; render(); notify("卡片设置已保存"); }
        if (form.dataset.form === "menu-filter") { state.menuQuery = String(data.get("query") || ""); render(); }
        if (form.id === "role-permission-search-form") {
          state.rolePermissionQuery = String(data.get("query") || "");
          render();
          window.setTimeout(() => document.getElementById("role-permission-search")?.focus(), 0);
        }
        if (form.id === "tenant-edit-form") {
          if (!state.tenantAdminDraftId) {
            const picker = form.querySelector("[data-tenant-admin-picker]");
            picker?.classList.add("is-invalid");
            picker?.querySelector("summary")?.focus();
            notify("请选择租户管理员");
            return;
          }
          const periodStart = String(data.get("periodStart") || "");
          const periodEnd = String(data.get("periodEnd") || "");
          if (periodStart > periodEnd) {
            form.querySelector("[name='periodEnd']")?.focus();
            notify("合作结束日期不能早于开始日期");
            return;
          }
          state.tenantAdminId = state.tenantAdminDraftId;
          state.tenantPeriodStart = periodStart;
          state.tenantPeriodEnd = periodEnd;
          notify("租户信息已保存");
          navigate("tenant-detail");
        }
        if (form.id === "account-create-form") {
          if (!form.reportValidity()) return;
          const roles = data.getAll("role").map(String).filter(Boolean);
          if (!roles.length) {
            const picker = form.querySelector("[data-account-role-picker]");
            picker?.classList.add("is-invalid");
            picker?.setAttribute("open", "");
            picker?.querySelector("summary")?.focus();
            notify("请至少选择一个角色");
            return;
          }
          const phone = String(data.get("phone"));
          const maskedPhone = `${phone.slice(0, 3)}****${phone.slice(-4)}`;
          state.accounts.unshift({ id: `a${Date.now()}`, row: [escapeHtml(data.get("account")), escapeHtml(data.get("name")), "已启用", data.get("gender") || "-", maskedPhone, roles.join("、"), "-", "--"], phone });
          state.modal = null;
          notify("账号创建成功");
          render();
        }
        if (form.id === "role-create-form") {
          if (!form.reportValidity()) return;
          const name = String(data.get("name") || "").trim();
          const code = String(data.get("code") || "").trim();
          const dataScope = String(data.get("dataScope") || "");
          const description = String(data.get("description") || "").trim();
          if (state.roles.some(role => role.code.toLowerCase() === code.toLowerCase())) {
            const input = form.querySelector("[name='code']");
            input?.setCustomValidity("角色编码已存在");
            input?.reportValidity();
            input?.setCustomValidity("");
            input?.focus();
            return;
          }
          const now = new Date();
          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
          const roleId = `r${Date.now()}`;
          state.roles.unshift({ id: roleId, name, code, dataScope, description: description || "--", createdAt: timestamp, updatedAt: timestamp });
          state.rolePermissions[roleId] = new Set();
          state.modal = null;
          notify(`角色“${name}”创建成功`);
          render();
        }
        if (form.id === "wecom-binding-form") {
          const entity = wecomEntityById(state.wecomBindingEntityId);
          if (entity) entity.tenants = [...state.wecomBindingDraft];
          state.modal = null;
          notify("企业主体租户绑定已更新");
          render();
        }
        if (form.id === "menu-root-form") {
          if (!form.reportValidity()) return;
          const name = String(data.get("name") || "").trim();
          if (!name) {
            const input = form.querySelector("[name='name']");
            input?.setCustomValidity("请输入菜单名称");
            input?.reportValidity();
            input?.setCustomValidity("");
            input?.focus();
            return;
          }
          const id = `menu-root-${Date.now()}`;
          menuRows.push({ id, name, type: "根目录", sort: Number(data.get("sort")), path: "-", root: true, shown: data.get("shown") === "true", enabled: true });
          state.menuEnabled[id] = true;
          state.modal = null;
          notify("根目录添加成功");
          render();
        }
        if (form.id === "menu-child-form") {
          if (!form.reportValidity()) return;
          const parent = menuRows.find(row => row.id === state.menuParentId && row.root);
          if (!parent) { state.modal = null; notify("未找到所属根目录"); render(); return; }
          const name = String(data.get("name") || "").trim();
          if (!name) {
            const input = form.querySelector("[name='name']");
            input?.setCustomValidity("请输入菜单名称");
            input?.reportValidity();
            input?.setCustomValidity("");
            input?.focus();
            return;
          }
          const isMenu = data.get("type") === "menu";
          const id = `menu-child-${Date.now()}`;
          menuRows.push({ id, name, type: isMenu ? "菜单" : "目录", sort: Number(data.get("sort")), path: isMenu ? String(data.get("path")) : "-", parent: parent.id, shown: data.get("shown") === "true", enabled: true });
          state.menuEnabled[id] = true;
          state.menuExpanded = true;
          state.modal = null;
          notify(`${isMenu ? "菜单" : "目录"}添加成功`);
          render();
        }
      });

      document.addEventListener("change", event => {
        if (event.target.matches("[data-material-upload]")) {
          const file = event.target.files?.[0];
          const type = event.target.dataset.materialUpload;
          if (file) {
            state.materialUploadNames[type] = file.name;
            const zone = event.target.closest(".material-upload-zone");
            const title = zone?.querySelector("strong");
            const note = zone?.querySelector("small");
            if (title) title.textContent = file.name;
            if (note) note.textContent = "文件已选择，确认后保存";
            notify("文件已选择");
          }
        }
        if (event.target.matches("input[name='purpose']")) {
          state.materialUseConversation = Boolean(document.querySelector("input[name='purpose'][value='会话']")?.checked);
          state.materialUsePush = Boolean(document.querySelector("input[name='purpose'][value='消息推送']")?.checked);
        }
        if (event.target.matches("[data-message-doctor-check]")) {
          const id = event.target.dataset.messageDoctorCheck;
          if (event.target.checked) state.selectedMessageDoctors.add(id); else state.selectedMessageDoctors.delete(id);
          event.target.closest("tr")?.classList.toggle("is-selected", event.target.checked);
          const count = document.querySelector("[data-message-selected-count]");
          if (count) count.textContent = String(state.selectedMessageDoctors.size);
          document.querySelectorAll("[data-message-preview-count]").forEach(node => { node.textContent = String(state.selectedMessageDoctors.size); });
          const visibleChecks = [...document.querySelectorAll("[data-message-doctor-check]")];
          const all = document.querySelector("[data-message-doctor-all]");
          if (all) { all.checked = visibleChecks.length > 0 && visibleChecks.every(input => input.checked); all.indeterminate = visibleChecks.some(input => input.checked) && !all.checked; }
        }
        if (event.target.matches("[data-message-doctor-all]")) {
          document.querySelectorAll("[data-message-doctor-check]").forEach(input => {
            input.checked = event.target.checked;
            input.closest("tr")?.classList.toggle("is-selected", event.target.checked);
            if (event.target.checked) state.selectedMessageDoctors.add(input.dataset.messageDoctorCheck); else state.selectedMessageDoctors.delete(input.dataset.messageDoctorCheck);
          });
          const count = document.querySelector("[data-message-selected-count]");
          if (count) count.textContent = String(state.selectedMessageDoctors.size);
          document.querySelectorAll("[data-message-preview-count]").forEach(node => { node.textContent = String(state.selectedMessageDoctors.size); });
        }
        if (event.target.matches("[data-message-draft-field='sendType']")) {
          state.messageDraftSendType = event.target.value;
          const scheduleField = document.querySelector("[data-message-schedule-field]");
          const scheduleInput = document.getElementById("message-scheduled-at");
          const isScheduled = state.messageDraftSendType === "定时发送";
          if (scheduleField) scheduleField.hidden = !isScheduled;
          if (scheduleInput) {
            scheduleInput.disabled = !isScheduled;
            scheduleInput.required = isScheduled;
            if (!isScheduled) { scheduleInput.value = ""; state.messageScheduledAt = ""; }
            else window.setTimeout(() => scheduleInput.focus(), 0);
          }
        }
        if (event.target.matches("[data-message-material]")) {
          state.messageMaterial = event.target.value;
          const material = state.materials.find(item => item.id === state.messageMaterial);
          if (material) {
            state.messageDraftTaskName = document.querySelector("[data-message-draft-field='taskName']")?.value || state.messageDraftTaskName;
            state.messageDraftContent = material.summary;
            render();
          }
        }
        if (event.target.matches("[data-account-role-option]")) {
          const picker = event.target.closest("[data-account-role-picker]");
          const selectedRoles = [...picker.querySelectorAll("[data-account-role-option]:checked")].map(input => input.value);
          picker.querySelector("[data-account-role-value]").textContent = selectedRoles.length ? selectedRoles.join("、") : "请选择角色（可多选）";
          picker.classList.toggle("has-value", selectedRoles.length > 0);
          picker.classList.remove("is-invalid");
        }
        if (event.target.matches("[data-permission-check]")) {
          const leaves = event.target.dataset.permissionLeaves.split(",").filter(Boolean);
          leaves.forEach(id => event.target.checked ? state.rolePermissionDraft.add(id) : state.rolePermissionDraft.delete(id));
          syncPermissionCheckboxes();
        }
        if (event.target.matches("[data-upload]")) {
          const label = event.target.closest(".upload-box")?.querySelector("span");
          if (label && event.target.files?.[0]) { label.textContent = event.target.files[0].name; notify("图片已选择，保存后生效"); }
        }
      });

      document.addEventListener("input", event => {
        if (event.target.id === "chat-project-search") {
          const query = event.target.value.trim().toLowerCase();
          state.chatProjectSearchQuery = event.target.value;
          document.querySelectorAll("[data-chat-project-group]").forEach(group => {
            const projectName = group.querySelector(".chat-project-group-toggle strong")?.textContent.toLowerCase() || "";
            const projectMatches = !query || projectName.includes(query);
            let visibleAccounts = 0;
            group.querySelectorAll("[data-chat-doctor]").forEach(button => {
              const matches = projectMatches || button.textContent.toLowerCase().includes(query);
              button.hidden = !matches;
              if (matches) visibleAccounts += 1;
            });
            const groupMatches = !query || projectMatches || (group.dataset.chatProjectKeywords || "").includes(query);
            group.hidden = !groupMatches || (!group.classList.contains("is-collapsed") && !projectMatches && visibleAccounts === 0);
          });
          return;
        }
        if (event.target.matches("[data-chat-managed-doctor-search]")) {
          const picker = event.target.closest("[data-chat-doctor-picker]");
          const query = event.target.value.trim().toLowerCase();
          const options = [...(picker?.querySelectorAll("[data-chat-managed-doctor]") || [])];
          let visibleCount = 0;
          options.forEach(option => {
            const matches = !query || (option.dataset.chatDoctorKeywords || "").toLowerCase().includes(query);
            option.hidden = !matches;
            if (matches) visibleCount += 1;
          });
          const empty = picker?.querySelector("[data-chat-doctor-empty]");
          if (empty) empty.hidden = visibleCount > 0;
          return;
        }
        if (event.target.matches("#material-text-content, #material-web-description")) {
          const limit = event.target.maxLength > 0 ? event.target.maxLength : 200;
          if (event.target.value.length > limit) event.target.value = event.target.value.slice(0, limit);
          const counter = event.target.closest(".material-textarea-wrap")?.querySelector(".character-count");
          if (counter) counter.textContent = `${event.target.value.length}/${limit}`;
        }
        const draftField = event.target.dataset.messageDraftField;
        if (draftField === "taskName") state.messageDraftTaskName = event.target.value;
        if (draftField === "scheduledAt") state.messageScheduledAt = event.target.value;
        if (draftField === "content") {
          state.messageDraftContent = event.target.value;
          const preview = document.querySelector(".message-preview");
          if (preview) preview.textContent = event.target.value || "消息内容将在此处预览";
        }
        if (event.target.id === "chat-doctor-search") {
          const query = event.target.value.trim().toLowerCase();
          document.querySelectorAll("[data-chat-doctor]").forEach(button => { button.hidden = query && !button.textContent.toLowerCase().includes(query); });
        }
        if (event.target.id === "chat-list-search") {
          state.chatConversationSearchQuery = event.target.value;
          const query = event.target.value.trim().toLowerCase();
          document.querySelectorAll("[data-chat-conversation]").forEach(button => { button.hidden = query && !button.textContent.toLowerCase().includes(query); });
        }
      });

      document.addEventListener("keydown", event => {
        if (!state.modal) return;
        if (event.key === "Escape") { event.preventDefault(); closeModal(); return; }
        if (event.key !== "Tab") return;
        const dialog = document.querySelector("[data-dialog]");
        const focusable = [...dialog.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });

      window.addEventListener("hashchange", () => {
        state.route = routeFromHash();
        if (state.route === "tenant-edit") state.tenantAdminDraftId = state.tenantAdminId;
        if (state.route === "tenant-detail") { state.tenantContactPhoneVisible = false; state.tenantAdminPhoneVisible = false; }
        ensureTab(state.route);
        state.openGroups.add(routeMeta[state.route].parent);
        state.modal = null;
        render();
      });

      render();
    })();
  