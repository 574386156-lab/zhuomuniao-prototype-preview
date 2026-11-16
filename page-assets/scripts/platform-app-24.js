
      (function () {
        var statusByDoctor = {
          "张医生": "在线",
          "邓医生": "未托管",
          "同伴医生": "离线",
          "崔医生": "二次验证",
          "谭医生": "在线",
          "Jason": "未托管",
          "钟医生": "离线",
          "康医生": "二次验证"
        };
        var wecomAccountByDoctor = {
          "张医生": "张医生｜zhang_doctor_01",
          "邓医生": "邓医生｜deng_doctor_02",
          "同伴医生": "同伴医生｜companion_doctor_03",
          "崔医生": "崔医生｜cui_doctor_04",
          "谭医生": "谭医生｜tan_doctor_05",
          "Jason": "Jason｜jason_doctor_06",
          "钟医生": "钟医生｜zhong_doctor_07",
          "康医生": "康医生｜kang_doctor_08"
        };
        var assistantProjectsByName = {
          "张医生": ["糖尿病患者管理项目"],
          "邓医生": ["营养干预随访项目"],
          "同伴医生": ["慢病健康教育项目"],
          "崔医生": ["患者康复支持项目"],
          "谭医生": ["慢病健康教育项目"],
          "Jason": [],
          "钟医生": ["慢病健康教育项目"],
          "康医生": ["营养干预随访项目"]
        };
        var root = document.getElementById("root");
        var qrTimer = null;
        var enhancementQueued = false;
        var doctorChannelFilterState = {
          tenant: "",
          project: "",
          name: ""
        };
        var doctorUserFilterState = {
          name: "",
          phone: "",
          project: "",
          status: "",
          startDate: "",
          endDate: ""
        };
        var assistantAccountFilterState = {
          projects: [],
          name: "",
          account: "",
          phone: "",
          status: ""
        };

        var style = document.createElement("style");
        style.textContent =
          ".wecom-managed-status-wrap{display:inline-flex;align-items:center;gap:16px;}" +
          ".wecom-account-userid{color:var(--text-secondary);}" +
          ".doctor-registration-single-column{grid-template-columns:minmax(0,1fr)!important;}" +
          ".doctor-edc-card .edc-empty{place-content:center;justify-items:center;gap:12px;min-height:280px;}" +
          ".doctor-edc-card .edc-empty img{width:240px;height:auto;object-fit:contain;}" +
          ".doctor-edc-card .edc-empty>span{color:var(--text-secondary);font-weight:var(--semibold);}" +
          ".doctor-edc-associate-button{display:inline-flex;align-items:center;gap:10px;min-width:112px;justify-content:center;margin-top:2px;}" +
          ".doctor-activity-timeline{overflow:hidden;margin-top:var(--space-5);border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface);box-shadow:var(--shadow-card);}" +
          ".doctor-activity-timeline>header{display:flex;align-items:center;min-height:60px;padding:0 var(--space-5);border-bottom:1px solid var(--border);}" +
          ".doctor-activity-timeline>header strong{color:var(--text-selected);font-size:var(--font-md);}" +
          ".doctor-activity-timeline-body{min-height:220px;padding:22px var(--space-6) 30px;}" +
          ".doctor-activity-timeline-list{display:grid;gap:0;margin:0;padding:0;list-style:none;}" +
          ".doctor-activity-timeline-item{display:grid;grid-template-columns:20px minmax(0,1fr);gap:14px;min-height:84px;}" +
          ".doctor-activity-timeline-marker{position:relative;padding-top:3px;color:var(--primary);}" +
          ".doctor-activity-timeline-marker.is-success{color:var(--success);}" +
          ".doctor-activity-timeline-item:not(:last-child) .doctor-activity-timeline-marker:after{position:absolute;top:17px;bottom:-2px;left:7px;width:1px;background:var(--border);content:'';}" +
          ".doctor-activity-timeline-marker .app-icon{position:relative;z-index:1;font-size:14px;background:var(--surface);}" +
          ".doctor-activity-timeline-content{display:grid;align-content:start;gap:7px;}" +
          ".doctor-activity-timeline-content strong{color:var(--text-selected);font-size:var(--font-sm);}" +
          ".doctor-activity-timeline-content time,.doctor-activity-timeline-content span{color:var(--text-secondary);font-size:var(--font-sm);}" +
          "@media(max-width:720px){.doctor-edc-card header{align-items:flex-start;flex-wrap:wrap;padding-block:var(--space-4);}.doctor-edc-card header>div{align-items:flex-start;flex-direction:column;gap:var(--space-2);}.doctor-edc-card .edc-empty{min-height:240px;}.doctor-activity-timeline-body{padding-inline:var(--space-5);}}" +
          ".scene-doctor-native-select{position:absolute!important;width:1px!important;height:1px!important;margin:0!important;padding:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;}" +
          ".scene-create-robot-reference>.scene-robot-info{box-sizing:border-box;display:flex;align-items:center;gap:12px;min-height:44px;margin:16px 16px 0;padding:10px 14px;border:1px solid #91caff;border-radius:7px;background:var(--surface-info);color:var(--text-selected);}" +
          ".scene-create-robot-reference>.scene-robot-info .app-icon{flex:0 0 auto;color:var(--primary);font-size:16px;}" +
          ".scene-create-robot-reference>.scene-robot-info span{line-height:22px;}" +
          ".scene-create-robot-reference .scene-association-grid{grid-template-columns:minmax(0,1fr)!important;gap:0;margin-top:16px;}" +
          ".scene-create-robot-reference .scene-association-field>.field-label{display:inline-flex;width:max-content;align-items:center;gap:6px;}" +
          ".scene-create-robot-reference .scene-association-trigger{height:52px;padding:0 16px;border-radius:7px;}" +
          ".scene-create-robot-reference .scene-association-menu.scene-robot-option-menu{max-height:320px;padding:0;overflow-y:auto;border-radius:7px;}" +
          ".scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option{display:grid;grid-template-columns:minmax(0,1fr);min-height:78px;gap:0;padding:12px 16px;border-radius:0;border-bottom:1px solid var(--border);}" +
          ".scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option:last-child{border-bottom:0;}" +
          ".scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option>.app-icon{display:none;}" +
          ".scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option>span{display:grid;gap:6px;min-width:0;}" +
          ".scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option>span>strong,.scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option>span>small:not(.scene-robot-option-description){display:none;}" +
          ".scene-create-robot-reference .scene-robot-option-menu>button.scene-robot-option-hidden{display:none!important;}" +
          ".scene-robot-option-heading{display:flex;min-width:0;align-items:center;gap:10px;}" +
          ".scene-robot-option-heading>strong{overflow:hidden;color:var(--text-selected);font-size:var(--font-sm);font-weight:var(--semibold);text-overflow:ellipsis;white-space:nowrap;}" +
          ".scene-robot-option-types{display:inline-flex;flex:0 0 auto;align-items:center;gap:6px;}" +
          ".scene-robot-option-type{display:inline-flex;align-items:center;min-height:22px;padding:0 8px;border:1px solid #91caff;border-radius:5px;background:#eaf4ff;color:#1268b3;font-size:var(--font-xs);line-height:20px;white-space:nowrap;}" +
          ".scene-robot-option-type.is-orchestration{border-color:#d3adf7;background:#f9f0ff;color:#722ed1;}" +
          ".scene-robot-option-type.is-prompt{border-color:#87e8de;background:#e6fffb;color:#137d70;}" +
          ".scene-robot-option-description{display:-webkit-box;overflow:hidden;color:#6f8fb1;font-size:var(--font-xs);line-height:20px;-webkit-box-orient:vertical;-webkit-line-clamp:2;}" +
          ".scene-form-page .scene-form-scroll>.form-section>h2{font-size:var(--font-md)!important;}" +
          ".scene-doctor-project-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;}" +
          ".scene-doctor-project-grid .scene-doctor-picker-trigger,.scene-doctor-project-grid #scene-doctor-project{box-sizing:border-box;width:100%;height:var(--control-height,40px);min-height:var(--control-height,40px);}" +
          ".scene-doctor-project-grid #scene-doctor-project:disabled{background:var(--surface-raised);color:var(--text-secondary);cursor:not-allowed;opacity:.55;}" +
          "@media(max-width:720px){.scene-doctor-project-grid{grid-template-columns:1fr;}}" +
          ".scene-form-page .scene-basic-grid-with-archive{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:32px!important;}" +
          ".scene-basic-grid-with-archive>.field:first-child .input-shell{width:min(1040px,100%)!important;max-width:none!important;}" +
          ".scene-basic-switch-stacked{grid-template-columns:minmax(0,1fr)!important;align-content:start;align-items:start;justify-items:start;gap:var(--space-2)!important;}" +
          ".scene-basic-switch-stacked>span:first-child{color:var(--text-selected);font-size:var(--font-sm);font-weight:var(--semibold);line-height:1.5;}" +
          ".scene-basic-switch-stacked>.toggle,.scene-basic-switch-stacked>small{grid-column:1!important;}" +
          ".scene-basic-switch-stacked>.toggle{margin-top:7px;}" +
          ".scene-basic-switch-stacked>small{font-size:var(--font-xs);line-height:20px;white-space:nowrap;}" +
          ".scene-basic-status-field{display:grid!important;width:auto;max-width:none;grid-template-columns:minmax(0,1fr)!important;align-content:start!important;align-items:start!important;justify-content:stretch!important;justify-items:start!important;justify-self:stretch!important;gap:var(--space-2)!important;text-align:left;}" +
          ".scene-basic-status-field>.toggle{grid-column:1!important;margin-top:7px;}" +
          ".scene-basic-status-field>small{grid-column:1!important;text-align:left;}" +
          ".scene-patient-archive-field{grid-column:1 / -1!important;grid-template-columns:max-content 48px minmax(0,1fr)!important;align-items:center!important;column-gap:12px!important;row-gap:var(--space-2)!important;}" +
          ".scene-patient-archive-field>span:first-child{grid-column:1;grid-row:1;}" +
          ".scene-patient-archive-field>.toggle{grid-column:2!important;grid-row:1;margin-top:0;}" +
          ".scene-patient-archive-field>small{grid-column:1 / -1!important;grid-row:2;}" +
          ".scene-context-help{position:relative;display:inline-grid;width:18px;height:18px;padding:0;place-items:center;border:0;background:transparent;color:#8fa3b7;font-size:15px;line-height:1;cursor:help;}" +
          ".scene-context-help:hover,.scene-context-help:focus{color:var(--primary);outline:0;}" +
          ".scene-context-help-tooltip{position:absolute;bottom:calc(100% + 8px);left:0;z-index:5000;box-sizing:border-box;width:max-content;max-width:min(360px,calc(100vw - 32px));padding:8px 10px;border-radius:5px;background:#173e69;color:#fff;font-size:12px;font-weight:400;line-height:18px;text-align:left;white-space:normal;box-shadow:0 8px 20px rgba(23,62,105,.22);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(3px);transition:opacity .16s ease,transform .16s ease,visibility .16s ease;}" +
          ".scene-context-help:hover .scene-context-help-tooltip,.scene-context-help:focus .scene-context-help-tooltip{opacity:1;visibility:visible;transform:translateY(0);}" +
          ".scene-create-agent-field-hidden{display:none!important;}" +
          "@media(max-width:1260px){.scene-form-page .scene-basic-grid-with-archive{grid-template-columns:1fr!important;}}" +
          "@media(max-width:720px){.scene-basic-switch-stacked>small{white-space:normal;}.scene-create-robot-reference>.scene-robot-info{align-items:flex-start;}.scene-create-robot-reference>.scene-robot-info .app-icon{margin-top:3px;}}" +
          ".bm-two-fields.bot-basic-single-field{grid-template-columns:minmax(0,1fr);}" +
          ".bm-agent-step .bm-agent-summary-list>.bm-agent-summary-action{box-sizing:border-box;display:inline-flex;width:104px;height:36px;min-height:36px;align-items:center;justify-content:center;justify-self:end;padding:0 var(--space-4);border:1px solid var(--primary);border-radius:var(--radius-sm);background:var(--primary);color:var(--surface);font-weight:var(--semibold);line-height:1;cursor:pointer;}" +
          ".bm-agent-step .bm-agent-summary-list>.bm-agent-summary-action:hover{border-color:var(--primary-hover);background:var(--primary-hover);color:var(--surface);text-decoration:none;}" +
          ".bm-agent-step .bm-agent-summary{grid-template-columns:42px minmax(190px,1fr) auto;}" +
          ".bm-agent-step .bm-agent-summary>span:not(.bm-agent-icon){justify-self:end;text-align:right;}" +
          "@media(max-width:980px){.bm-agent-step .bm-agent-summary{grid-template-columns:38px minmax(0,1fr);}.bm-agent-step .bm-agent-summary>span:not(.bm-agent-icon){grid-column:2;justify-self:end;}}" +
          ".bot-doctor-field-removed{display:none!important;}" +
          "body:has(.bm-create-page)>.prototype-index-fab{bottom:160px!important;}" +
          ".scene-doctor-picker{position:relative;width:100%;}" +
          ".scene-doctor-picker-trigger{box-sizing:border-box;width:100%;min-height:42px;padding:0 14px;border:1px solid #d8e0eb;border-radius:6px;background:#fff;color:#183b63;display:flex;align-items:center;justify-content:space-between;gap:12px;font:400 14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;text-align:left;cursor:pointer;}" +
          ".scene-doctor-picker-trigger:hover,.scene-doctor-picker.is-open .scene-doctor-picker-trigger{border-color:#5b9df9;}" +
          ".scene-doctor-picker-trigger:focus-visible{outline:2px solid rgba(37,99,235,.25);outline-offset:2px;}" +
          ".scene-doctor-picker-arrow{color:#7c8da5;font-size:16px;transition:transform .16s ease;}" +
          ".scene-doctor-picker.is-open .scene-doctor-picker-arrow{transform:rotate(180deg);}" +
          ".scene-doctor-picker-menu{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:4000;box-sizing:border-box;max-height:292px;overflow-y:auto;padding:6px;border:1px solid #d8e0eb;border-radius:8px;background:#fff;box-shadow:0 12px 30px rgba(23,59,99,.16);}" +
          ".scene-doctor-picker-menu[hidden]{display:none;}" +
          ".scene-doctor-picker-option{box-sizing:border-box;width:100%;min-height:82px;padding:12px 14px;border:0;border-radius:6px;background:#fff;color:#173e69;display:grid;grid-template-columns:54px minmax(0,1fr);align-items:center;gap:14px;text-align:left;cursor:pointer;}" +
          ".scene-doctor-picker-option:hover,.scene-doctor-picker-option.is-selected{background:#f0f3f7;}" +
          ".scene-doctor-picker-avatar{width:54px;height:54px;border-radius:50%;background:#a9bfd2;color:#fff;display:grid;place-items:center;font-size:22px;font-weight:600;}" +
          ".scene-doctor-picker-copy{min-width:0;display:grid;gap:8px;}" +
          ".scene-doctor-picker-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}" +
          ".scene-doctor-picker-name{color:#12375f;font-size:16px;font-weight:600;}" +
          ".scene-doctor-picker-title{padding:3px 8px;border:1px solid #69aefa;border-radius:5px;background:#edf6ff;color:#2573c8;font-size:13px;line-height:1.2;}" +
          ".scene-doctor-picker-meta{overflow:hidden;color:#365b80;font-size:13px;line-height:1.5;text-overflow:ellipsis;white-space:nowrap;}" +
          ".wecom-host-qr-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(15,23,42,.32);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;}" +
          ".wecom-host-qr-content{width:min(480px,calc(100vw - 40px));display:grid;justify-items:center;}" +
          ".wecom-host-qr-card{position:relative;width:min(400px,calc(100vw - 64px));box-sizing:border-box;padding:28px 32px 32px;border-radius:16px;background:#fff;box-shadow:0 16px 48px rgba(15,23,42,.24);display:grid;justify-items:center;gap:16px;}" +
          ".wecom-host-qr-header{width:100%;display:flex;align-items:center;justify-content:flex-end;}" +
          ".wecom-host-qr-close{display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:0;background:transparent;color:#8a9199;font-size:30px;font-weight:300;line-height:1;cursor:pointer;}" +
          ".wecom-host-qr-frame{width:min(220px,58vw);aspect-ratio:1;padding:12px;box-sizing:border-box;border:1px solid #e6e9ee;border-radius:8px;background:#fff;}" +
          ".wecom-host-qr-frame svg{width:100%;height:100%;display:block;}" +
          ".wecom-host-qr-countdown{color:#70798a;font-size:14px;line-height:1.4;}" +
          ".wecom-host-qr-tip{margin:0;color:#334155;font-size:15px;text-align:center;line-height:1.6;}" +
          ".bm-opening-native-field{display:none!important;}" +
          ".bm-welcome-config{display:grid;gap:16px;padding:20px;border:1px solid #dfe6ef;border-radius:8px;background:#fff;}" +
          ".bm-welcome-config>h3{margin:0;color:#183b63;font-size:16px;}" +
          ".bm-welcome-notice{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border:1px solid #9ed8f8;border-radius:7px;background:#eef9ff;color:#234d72;font-size:14px;line-height:1.6;}" +
          ".bm-welcome-notice-icon{display:grid;place-items:center;flex:0 0 auto;width:18px;height:18px;margin-top:2px;border:1px solid #2f91d5;border-radius:50%;color:#2f91d5;font-size:12px;font-weight:700;}" +
          ".bm-welcome-list{display:grid;gap:14px;}" +
          ".bm-welcome-card{display:grid;gap:14px;padding:18px;border-radius:8px;background:#f8fafc;}" +
          ".bm-welcome-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;}" +
          ".bm-welcome-card-head strong{color:#183b63;font-size:15px;}" +
          ".bm-welcome-remove{padding:0;border:0;background:transparent;color:#64748b;font:inherit;cursor:pointer;}" +
          ".bm-welcome-remove:hover{color:#dc2626;}" +
          ".bm-welcome-tabs{display:inline-flex;width:fit-content;overflow:hidden;border:1px solid #d7e1ed;border-radius:6px;background:#fff;}" +
          ".bm-welcome-tabs button{min-width:104px;height:38px;padding:0 16px;border:0;border-right:1px solid #d7e1ed;background:#fff;color:#244766;font:500 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;cursor:pointer;}" +
          ".bm-welcome-tabs button:last-child{border-right:0;}" +
          ".bm-welcome-tabs button.is-active{background:#1677c8;color:#fff;}" +
          ".bm-welcome-tabs button:disabled{background:#f5f7fa;color:#a3afbd;cursor:not-allowed;}" +
          ".bm-welcome-editor{display:grid;gap:8px;max-width:760px;}" +
          ".bm-welcome-editor-label{color:#183b63;font-size:14px;font-weight:500;}" +
          ".bm-welcome-editor-label b{margin-right:5px;color:#ef4444;}" +
          ".bm-welcome-editor textarea{box-sizing:border-box;width:100%;min-height:104px;padding:12px 14px;border:1px solid #cbd8e8;border-radius:6px;background:#fff;color:#183b63;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;resize:vertical;}" +
          ".bm-welcome-editor input{box-sizing:border-box;width:100%;height:42px;padding:0 14px;border:1px solid #cbd8e8;border-radius:6px;background:#fff;color:#183b63;font:400 14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;}" +
          ".bm-welcome-card-select-wrap{position:relative;width:100%;}" +
          ".bm-welcome-card-select-wrap:after{position:absolute;top:50%;right:16px;color:#7890aa;font-size:20px;line-height:1;content:'⌄';pointer-events:none;transform:translateY(-58%);}" +
          ".bm-welcome-card-select{box-sizing:border-box;width:100%;height:52px;padding:0 48px 0 14px;border:1px solid #cbd8e8;border-radius:6px;background:#fff;color:#183b63;appearance:none;-webkit-appearance:none;font:400 14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;cursor:pointer;}" +
          ".bm-welcome-card-select:required:invalid{color:#7890aa;}" +
          ".bm-welcome-editor textarea:focus,.bm-welcome-editor input:focus,.bm-welcome-card-select:focus{border-color:#5b9df9;outline:2px solid rgba(37,99,235,.12);}" +
          ".bm-welcome-card-picker{position:relative;width:100%;}" +
          ".bm-welcome-card-picker-trigger{box-sizing:border-box;width:100%;min-height:56px;padding:8px 48px 8px 14px;border:1px solid #cbd8e8;border-radius:7px;background:#fff;color:#183b63;display:flex;align-items:center;text-align:left;cursor:pointer;}" +
          ".bm-welcome-card-picker.is-open .bm-welcome-card-picker-trigger,.bm-welcome-card-picker-trigger:focus-visible{border-color:#1684d6;outline:2px solid rgba(22,132,214,.13);}" +
          ".bm-welcome-card-picker-copy{min-width:0;display:grid;gap:3px;}" +
          ".bm-welcome-card-picker-copy>span{overflow:hidden;color:#7890aa;text-overflow:ellipsis;white-space:nowrap;}" +
          ".bm-welcome-card-picker-copy>strong{overflow:hidden;color:#183b63;font-size:14px;text-overflow:ellipsis;white-space:nowrap;}" +
          ".bm-welcome-card-picker-copy>small{overflow:hidden;color:#7890aa;font-size:12px;text-overflow:ellipsis;white-space:nowrap;}" +
          ".bm-welcome-search-icon{position:absolute;top:50%;right:17px;width:16px;height:16px;border:2px solid #7890aa;border-radius:50%;pointer-events:none;transform:translateY(-58%);}" +
          ".bm-welcome-search-icon:after{position:absolute;right:-5px;bottom:-3px;width:7px;height:2px;border-radius:2px;background:#7890aa;content:'';transform:rotate(45deg);transform-origin:left center;}" +
          ".bm-welcome-card-picker-menu{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:120;box-sizing:border-box;display:grid;gap:6px;max-height:250px;overflow-y:auto;padding:8px;border:1px solid #dbe3ec;border-radius:8px;background:#fff;box-shadow:0 12px 30px rgba(23,59,99,.18);}" +
          ".bm-welcome-card-picker-menu[hidden]{display:none;}" +
          ".bm-welcome-card-picker-option{box-sizing:border-box;width:100%;min-height:66px;padding:11px 14px;border:0;border-radius:6px;background:#fff;display:grid;gap:5px;text-align:left;cursor:pointer;}" +
          ".bm-welcome-card-picker-option:hover,.bm-welcome-card-picker-option.is-selected{background:#f0f3f7;}" +
          ".bm-welcome-card-picker-option strong{color:#173e69;font-size:15px;}" +
          ".bm-welcome-card-picker-option small{color:#7790aa;font-size:13px;}" +
          ".bm-welcome-count{justify-self:end;color:#607895;font-size:13px;}" +
          ".bm-welcome-image-upload{display:grid;gap:9px;}" +
          ".bm-welcome-image-frame{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(210px,.85fr);gap:20px;padding:14px;border:1px solid #d7e1ed;border-radius:8px;background:#fff;}" +
          ".bm-welcome-image-preview{display:block;width:100%;aspect-ratio:25/14;border-radius:6px;background:#eef4fa;object-fit:cover;}" +
          ".bm-welcome-image-meta{display:grid;align-content:center;gap:14px;min-width:0;}" +
          ".bm-welcome-image-filename{overflow-wrap:anywhere;color:#183b63;font-size:15px;font-weight:600;}" +
          ".bm-welcome-image-note{margin:0;color:#6f86a0;font-size:13px;line-height:1.75;}" +
          ".bm-welcome-image-actions{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}" +
          ".bm-welcome-image-action{padding:0;border:0;background:transparent;color:#1677c8;font:500 14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;cursor:pointer;}" +
          ".bm-welcome-image-action:hover{text-decoration:underline;}" +
          ".bm-welcome-image-action.is-danger{color:#ef4444;}" +
          ".bm-welcome-image-empty{display:grid;justify-items:center;gap:12px;min-height:180px;padding:28px;border:1px dashed #adc3da;border-radius:8px;background:#f8fbfe;color:#6f86a0;text-align:center;}" +
          ".bm-welcome-image-empty .app-icon{color:#7da7cb;font-size:28px;}" +
          ".bm-welcome-image-empty span{font-size:13px;}" +
          ".bm-welcome-image-error{color:#dc2626;font-size:13px;}" +
          "@media(max-width:760px){.bm-welcome-image-frame{grid-template-columns:minmax(0,1fr);}.bm-welcome-image-meta{align-content:start;}.bm-welcome-tabs{max-width:100%;overflow-x:auto;}.bm-welcome-tabs button{min-width:96px;}}" +
          ".bm-welcome-add{display:inline-flex;width:fit-content;min-height:38px;align-items:center;gap:8px;padding:0 16px;border:1px solid #1677c8;border-radius:6px;background:#1677c8;color:#fff;font:500 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;cursor:pointer;}" +
          ".bm-welcome-add:hover:not(:disabled){background:#1169b4;}" +
          ".bm-welcome-add:disabled{border-color:#c9d3df;background:#e7ebf0;color:#8a99aa;cursor:not-allowed;}" +
          ".bm-bot-card .bm-channel-row{display:none;}" +
          ".bm-list-page .bm-bot-card .bm-project{display:none!important;}" +
          ".bm-list-page .bm-bot-card>.bm-card-description{min-height:44px;margin:0 0 var(--space-2);padding-top:24px;}" +
          ".bm-list-page .bm-card-types .bm-card-type-entry:nth-child(n+2),.bm-list-page .bm-card-types .bm-card-type-entry>i{display:none!important;}" +
          ".bm-bot-card.has-card-chat .bm-card-actions{grid-template-columns:repeat(4,minmax(0,1fr));}" +
          ".bm-detail-page .bm-agent-summary-list .bm-agent-summary:nth-of-type(n+2){display:none;}" +
          ".bm-detail-page .bm-overview-grid .bm-agent-summary>span:not(.bm-agent-icon){justify-self:end;text-align:right;white-space:nowrap;}" +
          ".bm-detail-page .bm-overview-grid-three.bm-overview-without-basic>section{grid-column:1 / -1;}" +
          ".bm-channel-text-action{min-height:auto!important;padding:0!important;border:0!important;background:transparent!important;color:var(--primary)!important;box-shadow:none!important;font-weight:500!important;}" +
          ".bm-channel-actions .bm-channel-text-action{flex:0 0 auto!important;}" +
          ".bm-channel-text-action:hover:not(:disabled){color:var(--primary-hover)!important;text-decoration:underline;}" +
          ".bm-channel-text-action:disabled{color:var(--text-disabled)!important;background:transparent!important;}" +
          ".bm-wecom-qr-frame svg{display:block;width:100%;height:100%;box-sizing:border-box;padding:12px;background:#fff;}" +
          ".bm-channel-chat{grid-template-rows:72px minmax(0,1fr) auto!important;}" +
          ".bm-chat-composer{grid-template-rows:minmax(48px,auto) auto!important;row-gap:var(--space-1)!important;padding-bottom:var(--space-3)!important;}" +
          ".bm-chat-composer>button,.bm-chat-composer>textarea{grid-row:1;}" +
          ".bm-chat-composer>small{position:static!important;grid-column:2;grid-row:2;align-self:center;justify-self:center;line-height:20px;white-space:normal;}" +
          ".bm-list-page .bm-filter-bar{grid-template-columns:repeat(3,minmax(150px,1fr)) auto auto;}" +
          ".bm-list-page .bm-filter-bar>label:not(.bm-search){grid-template-columns:28px minmax(0,1fr);}" +
          ".bm-list-page .bm-filter-bar>.bm-search{width:calc(100% - 36px);margin-left:6px;justify-self:start;}" +
          ".bm-filter-button-group{display:flex;grid-column:span 2;align-items:center;justify-content:flex-end;gap:var(--space-3);justify-self:stretch;}" +
          ".bm-filter-query-button,.bm-filter-reset-button{width:60px!important;min-width:60px!important;height:40px!important;min-height:40px!important;padding:0 12px!important;}" +
          ".doctor-user-filter-panel{grid-template-columns:repeat(4,minmax(160px,1fr))!important;}" +
          ".doctor-user-filter-panel .filter-actions{grid-column:4;justify-content:flex-end;}" +
          ".doctor-user-date-range{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;width:100%;min-height:40px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);}" +
          ".doctor-user-date-range:focus-within{border-color:var(--primary);box-shadow:0 0 0 2px rgba(37,99,235,.12);}" +
          ".doctor-user-date-range input{box-sizing:border-box;min-width:0;width:100%;height:38px;padding:0;border:0;background:transparent;color:var(--text-selected);font:inherit;outline:0;}" +
          ".doctor-user-date-range>span{color:var(--text-secondary);}" +
          ".doctor-account-create-form .field-error:empty{display:none;}" +
          ".doctor-account-create-form .input-shell.has-error,.doctor-account-create-form select.has-error{border-color:var(--danger);}" +
          ".doctor-account-sms-notice{margin-bottom:var(--space-5);line-height:1.6;}" +
          ".doctor-account-project-multiselect .user-multiselect-menu{inset:auto 0 calc(100% + var(--space-2));}" +
          ".doctor-account-project-multiselect .user-option{padding:var(--space-2);}" +
          ".doctor-account-project-multiselect .user-option-copy strong{margin:0;font-weight:var(--weight);}" +
          ".assistant-account-filter-panel{grid-template-columns:repeat(4,minmax(160px,1fr))!important;}" +
          ".assistant-account-filter-panel .filter-actions{grid-column:4;justify-content:flex-end;}" +
          ".assistant-project-multiselect .user-multiselect-trigger{height:var(--control-height);min-height:var(--control-height);}" +
          ".assistant-project-multiselect .user-multiselect-value{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}" +
          ".assistant-project-multiselect .user-option{padding:var(--space-3);}" +
          ".assistant-project-multiselect .user-option-copy strong{font-weight:var(--weight);}" +
          ".project-edit-single-column{grid-template-columns:minmax(0,1fr)!important;}" +
          "[data-original-assistant-field='true']{display:none!important;}" +
          ".project-edit-single-column>.field{grid-column:1!important;}" +
          ".project-members-field{display:grid;grid-column:1!important;gap:var(--space-3);min-width:0;}" +
          ".project-members-heading{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);}" +
          ".project-members-heading .field-label{margin:0;}" +
          ".project-members-search{display:block;justify-self:start;width:min(280px,100%);}" +
          ".project-members-search .input-shell{width:100%;}" +
          ".project-members-search .app-icon{color:var(--text-secondary);}" +
          ".project-members-actions{display:flex;align-items:center;gap:var(--space-3);}" +
          ".project-members-actions .button{min-height:32px;padding:0 var(--space-4);}" +
          ".project-members-actions .project-member-delete{border-color:var(--tag-danger-border);color:var(--danger);}" +
          ".project-members-table{position:relative;overflow:visible;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);}" +
          ".project-members-table table{width:100%;min-width:760px;border-collapse:collapse;table-layout:fixed;}" +
          ".project-members-table th,.project-members-table td{padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border);text-align:left;vertical-align:middle;}" +
          ".project-members-table th{height:42px;background:var(--surface-raised);color:var(--text-secondary);font-weight:var(--semibold);}" +
          ".project-members-table tr:last-child td{border-bottom:0;}" +
          ".project-members-table th:first-child,.project-members-table td:first-child{width:52px;text-align:center;}" +
          ".project-members-table th:nth-child(2){width:34%;}" +
          ".project-members-table th:nth-child(3){width:22%;}" +
          ".project-members-table th:nth-child(4){width:18%;}" +
          ".project-members-table input[type='checkbox']{width:16px;height:16px;accent-color:var(--primary);cursor:pointer;}" +
          ".project-member-combobox{position:relative;min-width:220px;}" +
          ".project-member-name-control{width:100%;}" +
          ".project-member-name-control input{min-width:0;}" +
          ".project-member-name-control .app-icon{color:var(--text-secondary);}" +
          ".project-member-combobox.is-open .project-member-name-control{border-color:var(--primary);box-shadow:0 0 0 2px rgba(37,99,235,.12);}" +
          ".project-member-combobox.has-error .project-member-name-control{border-color:var(--danger);}" +
          ".project-member-combobox .user-multiselect-menu{top:calc(100% + var(--space-2));right:0;bottom:auto;left:0;min-width:360px;}" +
          ".project-member-combobox .user-option{grid-template-columns:minmax(0,1fr);padding:var(--space-2);}" +
          ".project-member-combobox .user-option-copy{padding:var(--space-3) var(--space-4);}" +
          ".project-member-combobox .user-option-copy strong{font-weight:var(--weight);}" +
          ".project-member-option-heading{display:flex;align-items:center;gap:var(--space-2);}" +
          ".project-member-option-role{min-height:20px;padding:0 var(--space-2);}" +
          ".project-member-list-popover{right:0;left:auto;width:400px;}" +
          ".project-member-list-popover .popover-column-head,.project-member-list-popover .popover-row{display:grid;grid-template-columns:max-content minmax(0,1fr) max-content;align-items:center;column-gap:0;}" +
          ".project-member-list-popover .popover-column-head>:nth-child(2),.project-member-list-popover .popover-row>:nth-child(2){text-align:center;}" +
          ".project-member-list-popover .popover-column-head{min-height:34px;padding:0 var(--space-3);border-top:1px solid var(--border);color:var(--text-secondary);font-size:var(--font-xs);font-weight:var(--semibold);}" +
          ".project-member-combobox .field-error{display:block;margin-top:var(--space-2);}" +
          ".project-member-empty{height:80px;color:var(--text-secondary);text-align:center!important;}" +
          ".project-member-muted{color:var(--text-secondary);}" +
          ".project-member-toast.is-warning .app-icon{color:var(--warning);}" +
          ".filter-panel.project-filter-no-tenant{grid-template-columns:repeat(4,minmax(160px,1fr));}" +
          ".filter-panel.project-filter-no-tenant .filter-actions{grid-column:4;justify-content:flex-end;}" +
          "@media(max-width:900px){.project-members-table{overflow-x:auto;}.project-members-heading{align-items:flex-start;flex-direction:column;}.project-members-actions{align-self:flex-end;}}" +
          "@media(max-width:1360px){.bm-list-page .bm-filter-bar{grid-template-columns:repeat(3,minmax(160px,1fr));}}" +
          "@media(max-width:1180px){.doctor-user-filter-panel,.assistant-account-filter-panel{grid-template-columns:repeat(2,minmax(0,1fr))!important;}.doctor-user-filter-panel .filter-actions,.assistant-account-filter-panel .filter-actions{grid-column:auto;}}" +
          "@media(max-width:1180px){.filter-panel.project-filter-no-tenant{grid-template-columns:repeat(2,minmax(0,1fr));}.filter-panel.project-filter-no-tenant .filter-actions{grid-column:2;}}" +
          "@media(max-width:720px){.bm-list-page .bm-filter-bar{grid-template-columns:1fr;}.bm-list-page .bm-filter-bar>.bm-search{width:100%;margin-left:0;}.bm-list-page .bm-filter-bar>label:not(.bm-search){grid-template-columns:1fr;gap:var(--space-2);}.bm-filter-button-group{grid-column:1;justify-content:flex-end;}}" +
          "@media(max-width:720px){.doctor-user-filter-panel{grid-template-columns:1fr!important;}.doctor-user-filter-panel .filter-actions{grid-column:auto;justify-content:stretch;}.doctor-user-filter-panel .filter-actions .button{flex:1;}}" +
          "@media(max-width:720px){.assistant-account-filter-panel{grid-template-columns:1fr!important;}.assistant-account-filter-panel .filter-actions{grid-column:auto;justify-content:stretch;}.assistant-account-filter-panel .filter-actions .button{flex:1;}}" +
          "@media(max-width:720px){.filter-panel.project-filter-no-tenant{grid-template-columns:1fr;}.filter-panel.project-filter-no-tenant .filter-actions{grid-column:1;justify-content:stretch;}.filter-panel.project-filter-no-tenant .filter-actions .button{flex:1;}}" +
          "@media(max-width:640px){.wecom-host-qr-card{padding:42px 24px 30px}.wecom-host-qr-countdown{font-size:13px}.wecom-host-qr-tip{font-size:14px}}";
        document.head.appendChild(style);

        function createStatus(status) {
          var node = document.createElement("span");
          node.className = "status " + (status === "在线" ? "is-active" : "is-inactive");
          node.setAttribute("data-wecom-managed-status", status);
          var dot = document.createElement("span");
          dot.className = "status-dot";
          dot.setAttribute("aria-hidden", "true");
          node.appendChild(dot);
          node.appendChild(document.createTextNode(status));
          return node;
        }

        function updateDoctorList() {
          document.querySelectorAll(".table-panel table").forEach(function (table) {
            var headers = Array.from(table.querySelectorAll("thead th")).map(function (header) {
              return header.textContent.trim();
            });
            var nameIndex = headers.indexOf("医生姓名");
            var statusIndex = headers.indexOf("企微托管状态");
            if (nameIndex < 0 || statusIndex < 0) return;

            table.querySelectorAll("tbody tr").forEach(function (row) {
              var cells = row.querySelectorAll("td");
              if (!cells[nameIndex] || !cells[statusIndex]) return;
              var doctorName = cells[nameIndex].textContent.trim();
              var status = statusByDoctor[doctorName] || "未托管";
              var statusCell = cells[statusIndex];
              if (statusCell.getAttribute("data-wecom-managed-status") === status) return;
              statusCell.replaceChildren(createStatus(status));
              statusCell.setAttribute("data-wecom-managed-status", status);
            });
          });
        }

        function getDoctorUserHeaders(table) {
          return Array.from(table.querySelectorAll("thead th")).map(function (header) {
            return header.textContent.trim();
          });
        }

        function getDoctorUserTable() {
          return Array.from(document.querySelectorAll(".table-panel table")).find(
            function (table) {
              var headers = getDoctorUserHeaders(table);
              return (
                table.getAttribute("data-doctor-user-table") === "true" ||
                (headers.indexOf("医生姓名") >= 0 &&
                  headers.indexOf("手机号") >= 0 &&
                  headers.indexOf("企微托管状态") >= 0 &&
                  headers.indexOf("最后登录时间") >= 0)
              );
            }
          );
        }

        function createDoctorUserField(labelText, control) {
          var label = document.createElement("label");
          label.className = "field";
          var name = document.createElement("span");
          name.className = "field-label";
          name.textContent = labelText;
          label.appendChild(name);
          label.appendChild(control);
          return label;
        }

        function syncDoctorUserSelect(select, values, allLabel, value) {
          var signature = values.join("\u0001");
          if (select.getAttribute("data-option-signature") !== signature) {
            select.textContent = "";
            var allOption = document.createElement("option");
            allOption.value = "";
            allOption.textContent = allLabel;
            select.appendChild(allOption);
            values.forEach(function (item) {
              var option = document.createElement("option");
              option.value = item;
              option.textContent = item;
              select.appendChild(option);
            });
            select.setAttribute("data-option-signature", signature);
          }
          select.value = value;
        }

        function collectDoctorUserValues(table, key) {
          var values = Array.from(table.querySelectorAll("tbody tr"))
            .map(function (row) {
              return row.dataset[key] || "";
            })
            .filter(function (value) {
              return value && value !== "--";
            });
          return Array.from(new Set(values));
        }

        function applyDoctorUserFilters(table) {
          var name = doctorUserFilterState.name.trim().toLowerCase();
          var phone = doctorUserFilterState.phone.trim().toLowerCase();
          var visibleCount = 0;
          table.querySelectorAll("tbody tr").forEach(function (row) {
            var registeredDate = (row.dataset.doctorRegisteredAt || "").slice(0, 10);
            var matched =
              (!name || (row.dataset.doctorName || "").toLowerCase().indexOf(name) >= 0) &&
              (!phone || (row.dataset.doctorPhone || "").toLowerCase().indexOf(phone) >= 0) &&
              (!doctorUserFilterState.project ||
                row.dataset.doctorProject === doctorUserFilterState.project) &&
              (!doctorUserFilterState.status ||
                row.dataset.doctorStatus === doctorUserFilterState.status) &&
              (!doctorUserFilterState.startDate ||
                registeredDate >= doctorUserFilterState.startDate) &&
              (!doctorUserFilterState.endDate ||
                registeredDate <= doctorUserFilterState.endDate);
            row.hidden = !matched;
            if (matched) visibleCount += 1;
          });

          var page = table.closest(".page");
          var total = page && page.querySelector('.pagination[aria-label="分页"] > span');
          if (!total) return;
          var hasFilter = Object.keys(doctorUserFilterState).some(function (key) {
            return Boolean(doctorUserFilterState[key]);
          });
          var totalText = hasFilter
            ? "共 " + visibleCount + " 条数据"
            : table.getAttribute("data-doctor-original-total") || "共 29 条数据";
          if (total.textContent !== totalText) total.textContent = totalText;
        }

        function openDoctorUserRemoveDialog(row, trigger) {
          if (document.querySelector("[data-doctor-user-remove-dialog]")) return;
          var doctorName = row.dataset.doctorName || "该医生用户";
          var table = row.closest("table");
          var previousFocus = trigger || document.activeElement;
          var backdrop = document.createElement("div");
          backdrop.className = "modal-backdrop";
          backdrop.setAttribute("role", "presentation");
          backdrop.setAttribute("data-doctor-user-remove-dialog", "true");

          var modal = document.createElement("section");
          modal.className = "modal modal-sm";
          modal.setAttribute("role", "dialog");
          modal.setAttribute("aria-modal", "true");
          modal.setAttribute("aria-labelledby", "doctor-user-remove-title");

          var header = document.createElement("header");
          header.className = "modal-header";
          var title = document.createElement("h2");
          title.id = "doctor-user-remove-title";
          title.textContent = "移除医生用户";
          var closeButton = document.createElement("button");
          closeButton.className = "icon-button";
          closeButton.type = "button";
          closeButton.setAttribute("aria-label", "关闭弹窗");
          closeButton.textContent = "×";
          header.appendChild(title);
          header.appendChild(closeButton);

          var body = document.createElement("div");
          body.className = "modal-body";
          var message = document.createElement("div");
          message.className = "confirm-message";
          var warning = document.createElement("i");
          warning.className = "fa-solid fa-triangle-exclamation app-icon";
          warning.setAttribute("aria-hidden", "true");
          var copy = document.createElement("p");
          copy.textContent = "确认移除医生用户“" + doctorName + "”吗？移除后该用户将无法继续访问患管平台。";
          message.appendChild(warning);
          message.appendChild(copy);
          body.appendChild(message);

          var footer = document.createElement("footer");
          footer.className = "modal-footer";
          var cancelButton = document.createElement("button");
          cancelButton.className = "button button-secondary";
          cancelButton.type = "button";
          cancelButton.textContent = "取消";
          var confirmButton = document.createElement("button");
          confirmButton.className = "button button-danger";
          confirmButton.type = "button";
          confirmButton.textContent = "确认移除";
          footer.appendChild(cancelButton);
          footer.appendChild(confirmButton);
          modal.appendChild(header);
          modal.appendChild(body);
          modal.appendChild(footer);
          backdrop.appendChild(modal);

          function closeDialog() {
            document.removeEventListener("keydown", handleKeydown);
            backdrop.remove();
            if (previousFocus && previousFocus.isConnected) previousFocus.focus();
          }
          function handleKeydown(event) {
            if (event.key === "Escape") closeDialog();
          }
          closeButton.addEventListener("click", closeDialog);
          cancelButton.addEventListener("click", closeDialog);
          backdrop.addEventListener("mousedown", function (event) {
            if (event.target === backdrop) closeDialog();
          });
          confirmButton.addEventListener("click", function () {
            row.remove();
            if (table) {
              Array.from(table.querySelectorAll("tbody tr")).forEach(function (item, index) {
                if (item.children[0]) item.children[0].textContent = String(index + 1);
              });
              var totalText = table.getAttribute("data-doctor-original-total") || "";
              var totalMatch = totalText.match(/\d+/);
              if (totalMatch) {
                var nextTotal = Math.max(0, Number(totalMatch[0]) - 1);
                totalText = totalText.replace(totalMatch[0], String(nextTotal));
                table.setAttribute("data-doctor-original-total", totalText);
                var page = table.closest(".page");
                var total = page && page.querySelector('.pagination[aria-label="分页"] > span');
                if (total) total.textContent = totalText;
              }
            }
            closeDialog();
            showDoctorAccountCreatedToast("医生用户“" + doctorName + "”已移除");
          });
          document.addEventListener("keydown", handleKeydown);
          document.body.appendChild(backdrop);
          window.requestAnimationFrame(function () {
            cancelButton.focus();
          });
        }

        function updateDoctorUserHostActions(table) {
          var headers = getDoctorUserHeaders(table);
          var operationIndex = headers.indexOf("操作");
          if (operationIndex < 0) return;
          var hostStatuses = ["未托管", "离线", "二次验证"];

          table.querySelectorAll("tbody tr").forEach(function (row) {
            var operationCell = row.children[operationIndex];
            if (!operationCell) return;
            var actions = operationCell.querySelector(".doctor-user-actions");
            if (!actions) {
              actions = document.createElement("div");
              actions.className = "row-actions doctor-user-actions";
              while (operationCell.firstChild) {
                actions.appendChild(operationCell.firstChild);
              }
              operationCell.appendChild(actions);
            }

            var viewButton = Array.from(actions.querySelectorAll(":scope > button")).find(
              function (button) {
                return button.textContent.trim() === "查看详情" ||
                  button.getAttribute("data-doctor-list-view") === "true";
              }
            );
            if (viewButton) {
              viewButton.textContent = "查看";
              viewButton.setAttribute("data-doctor-list-view", "true");
            }

            var hostButton = actions.querySelector("[data-doctor-list-host-account]");
            var disableButton = actions.querySelector("[data-doctor-list-disable]");
            if (!disableButton) {
              disableButton = document.createElement("button");
              disableButton.className = "link-button";
              disableButton.type = "button";
              disableButton.setAttribute("data-doctor-list-disable", "true");
              disableButton.addEventListener("click", function () {
                var disabled = row.dataset.doctorDisabled === "true";
                row.dataset.doctorDisabled = disabled ? "false" : "true";
                disableButton.textContent = disabled ? "禁用" : "启用";
                disableButton.setAttribute(
                  "aria-label",
                  (disabled ? "禁用" : "启用") + (row.dataset.doctorName || "医生用户")
                );
                showDoctorAccountCreatedToast(
                  "医生用户“" + (row.dataset.doctorName || "--") + "”已" +
                    (disabled ? "启用" : "禁用")
                );
              });
              actions.insertBefore(disableButton, hostButton);
            }
            var isDisabled = row.dataset.doctorDisabled === "true";
            disableButton.textContent = isDisabled ? "启用" : "禁用";
            disableButton.setAttribute(
              "aria-label",
              (isDisabled ? "启用" : "禁用") + (row.dataset.doctorName || "医生用户")
            );

            var removeButton = actions.querySelector("[data-doctor-list-remove]");
            if (!removeButton) {
              removeButton = document.createElement("button");
              removeButton.className = "link-button danger-link";
              removeButton.type = "button";
              removeButton.textContent = "移除";
              removeButton.setAttribute("data-doctor-list-remove", "true");
              removeButton.setAttribute(
                "aria-label",
                "移除" + (row.dataset.doctorName || "医生用户")
              );
              removeButton.addEventListener("click", function () {
                openDoctorUserRemoveDialog(row, removeButton);
              });
              actions.insertBefore(removeButton, hostButton);
            }

            var existing = actions.querySelector("[data-doctor-list-host-account]");
            var shouldShow = hostStatuses.indexOf(row.dataset.doctorStatus) >= 0;
            if (!shouldShow) {
              if (existing) existing.remove();
              return;
            }
            if (existing) return;

            var button = document.createElement("button");
            button.className = "link-button";
            button.type = "button";
            button.textContent = "托管账号";
            button.setAttribute("data-doctor-list-host-account", "true");
            button.setAttribute("data-wecom-host-account", "true");
            button.setAttribute("data-wecom-action", "host");
            button.setAttribute(
              "aria-label",
              "托管" + (row.dataset.doctorName || "医生") + "的企业微信账号"
            );
            actions.appendChild(button);
          });
        }

        function getDoctorUserProjects(row) {
          try {
            return JSON.parse(row.dataset.doctorProjects || "[]");
          } catch (error) {
            return [];
          }
        }

        function renderDoctorUserProjectCell(cell, doctorName, projects) {
          var signature = projects.join("\u0001");
          if (
            cell.getAttribute("data-doctor-project-signature") === signature &&
            cell.querySelector("[data-doctor-project-view]")
          ) {
            return;
          }
          cell.classList.add("relative-cell");
          cell.setAttribute("data-doctor-project-signature", signature);
          cell.replaceChildren();

          var viewButton = document.createElement("button");
          viewButton.className = "link-button";
          viewButton.type = "button";
          viewButton.textContent = "查看";
          viewButton.setAttribute("data-doctor-project-view", "true");
          viewButton.setAttribute(
            "aria-label",
            "查看" + (doctorName || "医生") + "参与项目"
          );
          viewButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var current = cell.querySelector("[data-doctor-project-popover]");
            document
              .querySelectorAll("[data-doctor-project-popover]")
              .forEach(function (popover) {
                if (popover !== current) popover.remove();
              });
            if (current) {
              current.remove();
              return;
            }

            var popover = document.createElement("div");
            popover.className = "popover project-popover";
            popover.setAttribute("data-doctor-project-popover", "true");
            var heading = document.createElement("div");
            heading.className = "popover-heading";
            var title = document.createElement("strong");
            title.textContent = "参与项目（" + projects.length + "）";
            var closeButton = document.createElement("button");
            closeButton.type = "button";
            closeButton.setAttribute("aria-label", "关闭");
            closeButton.textContent = "×";
            closeButton.addEventListener("click", function (closeEvent) {
              closeEvent.preventDefault();
              closeEvent.stopPropagation();
              popover.remove();
              viewButton.focus();
            });
            heading.appendChild(title);
            heading.appendChild(closeButton);
            popover.appendChild(heading);
            if (!projects.length) {
              var empty = document.createElement("div");
              empty.className = "empty-inline";
              empty.textContent = "暂无参与项目";
              popover.appendChild(empty);
            } else {
              projects.forEach(function (project) {
                var row = document.createElement("div");
                row.className = "popover-row";
                row.textContent = project;
                popover.appendChild(row);
              });
            }
            cell.appendChild(popover);
          });
          cell.appendChild(viewButton);
        }

        function updateDoctorUserList() {
          var table = getDoctorUserTable();
          if (!table) return;
          table.setAttribute("data-doctor-user-table", "true");
          table.style.minWidth = "1540px";

          var page = table.closest(".page");
          var tablePanel = table.closest(".table-panel");
          if (!page || !tablePanel) return;
          var paginationTotal = page.querySelector(
            '.pagination[aria-label="分页"] > span'
          );
          if (
            paginationTotal &&
            !table.getAttribute("data-doctor-original-total")
          ) {
            table.setAttribute(
              "data-doctor-original-total",
              paginationTotal.textContent.trim()
            );
          }

          var headers = getDoctorUserHeaders(table);
          var projectIndex = headers.indexOf("所属项目");
          if (projectIndex < 0) projectIndex = headers.indexOf("参与项目");
          var indexes = {
            phone: headers.indexOf("手机号"),
            name: headers.indexOf("医生姓名"),
            project: projectIndex,
            status: headers.indexOf("企微托管状态"),
            registeredAt: headers.indexOf("注册时间")
          };
          if (
            indexes.project >= 0 &&
            table.querySelectorAll("thead th")[indexes.project]
          ) {
            table.querySelectorAll("thead th")[indexes.project].textContent =
              "参与项目";
          }
          table.querySelectorAll("tbody tr").forEach(function (row) {
            var cells = row.children;
            var doctorName = indexes.name >= 0 && cells[indexes.name]
              ? cells[indexes.name].textContent.trim()
              : row.dataset.doctorName || "";
            row.dataset.doctorPhone = indexes.phone >= 0 && cells[indexes.phone]
              ? cells[indexes.phone].textContent.trim()
              : row.dataset.doctorPhone || "";
            row.dataset.doctorName = doctorName;
            var projectCell = indexes.project >= 0 && cells[indexes.project]
              ? cells[indexes.project]
              : null;
            var originalProject = projectCell &&
              !projectCell.querySelector("[data-doctor-project-view]")
              ? projectCell.textContent.trim()
              : "";
            var projects = Object.prototype.hasOwnProperty.call(
              assistantProjectsByName,
              doctorName
            )
              ? (assistantProjectsByName[doctorName] || []).slice()
              : getDoctorUserProjects(row);
            if (
              !projects.length &&
              originalProject &&
              originalProject !== "--"
            ) {
              projects = [originalProject];
            }
            row.dataset.doctorProjects = JSON.stringify(projects);
            row.dataset.doctorProject = projects[0] || "--";
            if (projectCell) {
              renderDoctorUserProjectCell(projectCell, doctorName, projects);
            }
            row.dataset.doctorStatus = statusByDoctor[doctorName] ||
              (indexes.status >= 0 && cells[indexes.status]
                ? cells[indexes.status].textContent.trim()
                : row.dataset.doctorStatus || "未托管");
            row.dataset.doctorRegisteredAt =
              indexes.registeredAt >= 0 && cells[indexes.registeredAt]
                ? cells[indexes.registeredAt].textContent.trim()
                : row.dataset.doctorRegisteredAt || "";
          });

          ["所属租户", "来源渠道", "注册方式", "医生角色", "是否注册企微"]
            .map(function (header) {
              return headers.indexOf(header);
            })
            .filter(function (index) {
              return index >= 0;
            })
            .sort(function (a, b) {
              return b - a;
            })
            .forEach(function (index) {
              table.querySelectorAll("tr").forEach(function (row) {
                var cell = row.children[index];
                if (cell) cell.remove();
              });
            });

          updateDoctorUserHostActions(table);

          var oldSearch = page.querySelector(".quick-search");
          if (oldSearch) oldSearch.remove();

          var filterPanel = page.querySelector(".doctor-user-filter-panel");
          if (!filterPanel) {
            filterPanel = document.createElement("section");
            filterPanel.className =
              "filter-panel doctor-user-filter-panel";
            filterPanel.setAttribute("aria-label", "医生用户筛选");

            var doctorNameShell = document.createElement("span");
            doctorNameShell.className = "input-shell";
            var doctorNameInput = document.createElement("input");
            doctorNameInput.id = "doctor-search";
            doctorNameInput.type = "text";
            doctorNameInput.placeholder = "请输入医生姓名";
            doctorNameInput.value = doctorUserFilterState.name;
            doctorNameShell.appendChild(doctorNameInput);
            filterPanel.appendChild(
              createDoctorUserField("医生姓名", doctorNameShell)
            );

            var phoneShell = document.createElement("span");
            phoneShell.className = "input-shell";
            var phoneInput = document.createElement("input");
            phoneInput.id = "doctor-phone-filter";
            phoneInput.type = "text";
            phoneInput.placeholder = "请输入手机号";
            phoneInput.value = doctorUserFilterState.phone;
            phoneShell.appendChild(phoneInput);
            filterPanel.appendChild(
              createDoctorUserField("手机号", phoneShell)
            );

            var projectSelect = document.createElement("select");
            projectSelect.id = "doctor-project-filter";
            filterPanel.appendChild(
              createDoctorUserField("所属项目", projectSelect)
            );

            var statusSelect = document.createElement("select");
            statusSelect.id = "doctor-wecom-status-filter";
            filterPanel.appendChild(
              createDoctorUserField("企微托管状态", statusSelect)
            );

            var dateRange = document.createElement("span");
            dateRange.className = "doctor-user-date-range";
            var startDateInput = document.createElement("input");
            startDateInput.id = "doctor-register-start-filter";
            startDateInput.type = "date";
            startDateInput.setAttribute("aria-label", "注册开始日期");
            startDateInput.value = doctorUserFilterState.startDate;
            var separator = document.createElement("span");
            separator.textContent = "—";
            var endDateInput = document.createElement("input");
            endDateInput.id = "doctor-register-end-filter";
            endDateInput.type = "date";
            endDateInput.setAttribute("aria-label", "注册结束日期");
            endDateInput.value = doctorUserFilterState.endDate;
            dateRange.appendChild(startDateInput);
            dateRange.appendChild(separator);
            dateRange.appendChild(endDateInput);
            filterPanel.appendChild(
              createDoctorUserField("注册时间范围", dateRange)
            );

            var actions = document.createElement("div");
            actions.className = "filter-actions";
            var resetButton = document.createElement("button");
            resetButton.className = "button button-secondary";
            resetButton.type = "button";
            resetButton.innerHTML = "<span>重置</span>";
            var queryButton = document.createElement("button");
            queryButton.className = "button button-primary";
            queryButton.type = "button";
            queryButton.innerHTML = "<span>查询</span>";
            actions.appendChild(resetButton);
            actions.appendChild(queryButton);
            filterPanel.appendChild(actions);

            queryButton.addEventListener("click", function () {
              doctorUserFilterState = {
                name: doctorNameInput.value,
                phone: phoneInput.value,
                project: projectSelect.value,
                status: statusSelect.value,
                startDate: startDateInput.value,
                endDate: endDateInput.value
              };
              var currentTable = getDoctorUserTable();
              if (currentTable) applyDoctorUserFilters(currentTable);
            });
            resetButton.addEventListener("click", function () {
              doctorUserFilterState = {
                name: "",
                phone: "",
                project: "",
                status: "",
                startDate: "",
                endDate: ""
              };
              doctorNameInput.value = "";
              phoneInput.value = "";
              projectSelect.value = "";
              statusSelect.value = "";
              startDateInput.value = "";
              endDateInput.value = "";
              var currentTable = getDoctorUserTable();
              if (currentTable) applyDoctorUserFilters(currentTable);
            });
            [doctorNameInput, phoneInput].forEach(function (input) {
              input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") queryButton.click();
              });
            });
            tablePanel.insertAdjacentElement("beforebegin", filterPanel);
          }

          syncDoctorUserSelect(
            filterPanel.querySelector("#doctor-project-filter"),
            collectDoctorUserValues(table, "doctorProject"),
            "全部项目",
            doctorUserFilterState.project
          );
          syncDoctorUserSelect(
            filterPanel.querySelector("#doctor-wecom-status-filter"),
            ["未托管", "在线", "离线", "二次验证"],
            "全部",
            doctorUserFilterState.status
          );
          applyDoctorUserFilters(table);
        }

        var doctorAccountDialogCleanup = null;
        var doctorAccountToastTimer = null;

        function collectDoctorAccountOptions(table, headerLabel, fallback) {
          var headers = getDoctorUserHeaders(table);
          var index = headers.indexOf(headerLabel);
          var values = index < 0
            ? []
            : Array.from(table.querySelectorAll("tbody tr"))
                .map(function (row) {
                  var cell = row.children[index];
                  return cell ? cell.textContent.trim() : "";
                })
                .filter(function (value) {
                  return value && value !== "--";
                });
          values = Array.from(new Set(values));
          return values.length ? values : fallback;
        }

        function createDoctorAccountField(config) {
          var field = document.createElement("label");
          field.className = "field";
          var label = document.createElement("span");
          label.className = "field-label";
          var required = document.createElement("span");
          required.className = "required";
          required.setAttribute("aria-hidden", "true");
          required.textContent = "*";
          label.appendChild(required);
          label.appendChild(document.createTextNode(config.label));
          field.appendChild(label);

          var control;
          var shell = null;
          var getValue = null;
          if (config.options && config.multiple) {
            shell = document.createElement("div");
            shell.className =
              "user-multiselect doctor-account-project-multiselect";
            shell._selectedValues = [];

            control = document.createElement("button");
            control.className = "user-multiselect-trigger";
            control.type = "button";
            control.setAttribute("aria-haspopup", "listbox");
            control.setAttribute("aria-expanded", "false");
            control.setAttribute("aria-label", config.label);
            var value = document.createElement("span");
            value.className = "user-multiselect-value is-placeholder";
            var icon = document.createElement("i");
            icon.className = "fa-solid fa-chevron-down app-icon";
            icon.setAttribute("aria-hidden", "true");
            control.appendChild(value);
            control.appendChild(icon);

            var menu = document.createElement("div");
            menu.className = "user-multiselect-menu";
            menu.setAttribute("role", "listbox");
            menu.setAttribute("aria-label", config.label + "选项");
            menu.setAttribute("aria-multiselectable", "true");
            menu.hidden = true;
            var caption = document.createElement("div");
            caption.className = "user-multiselect-caption";
            caption.textContent = "可多选";
            menu.appendChild(caption);

            function setProjectPickerOpen(open) {
              shell.classList.toggle("is-open", open);
              control.setAttribute("aria-expanded", open ? "true" : "false");
              menu.hidden = !open;
              icon.classList.toggle("fa-chevron-up", open);
              icon.classList.toggle("fa-chevron-down", !open);
            }

            function renderProjectSelection() {
              var selected = shell._selectedValues || [];
              control.value = selected.join("\u0001");
              value.replaceChildren();
              value.classList.toggle("is-placeholder", !selected.length);
              if (!selected.length) {
                value.textContent = "请选择" + config.label;
              } else {
                selected.forEach(function (project) {
                  var chip = document.createElement("span");
                  chip.className = "user-multiselect-chip";
                  chip.textContent = project;
                  value.appendChild(chip);
                });
              }
              menu.querySelectorAll(".user-option").forEach(function (option) {
                var isSelected = selected.indexOf(option.dataset.value) >= 0;
                option.classList.toggle("is-selected", isSelected);
                option.setAttribute("aria-selected", isSelected ? "true" : "false");
                var check = option.querySelector(".user-option-check");
                if (check) check.textContent = isSelected ? "✓" : "";
              });
            }

            config.options.forEach(function (project) {
              var option = document.createElement("button");
              option.className = "user-option";
              option.type = "button";
              option.dataset.value = project;
              option.setAttribute("role", "option");
              option.setAttribute("aria-selected", "false");
              var copy = document.createElement("span");
              copy.className = "user-option-copy";
              var optionTitle = document.createElement("strong");
              optionTitle.textContent = project;
              copy.appendChild(optionTitle);
              var check = document.createElement("span");
              check.className = "user-option-check";
              check.setAttribute("aria-hidden", "true");
              option.appendChild(copy);
              option.appendChild(check);
              option.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                var selected = shell._selectedValues || [];
                shell._selectedValues = selected.indexOf(project) >= 0
                  ? selected.filter(function (item) {
                      return item !== project;
                    })
                  : selected.concat(project);
                renderProjectSelection();
                control.dispatchEvent(new Event("change", { bubbles: true }));
              });
              menu.appendChild(option);
            });

            control.addEventListener("click", function (event) {
              event.preventDefault();
              event.stopPropagation();
              setProjectPickerOpen(!shell.classList.contains("is-open"));
            });
            shell._setOpen = setProjectPickerOpen;
            shell.appendChild(control);
            shell.appendChild(menu);
            field.appendChild(shell);
            getValue = function () {
              return (shell._selectedValues || []).slice();
            };
            renderProjectSelection();
          } else if (config.options) {
            control = document.createElement("select");
            var placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "请选择" + config.label;
            control.appendChild(placeholder);
            config.options.forEach(function (value) {
              var option = document.createElement("option");
              option.value = value;
              option.textContent = value;
              control.appendChild(option);
            });
            field.appendChild(control);
          } else {
            shell = document.createElement("span");
            shell.className = "input-shell";
            control = document.createElement("input");
            control.type = "text";
            control.placeholder = config.placeholder;
            if (config.inputMode) control.inputMode = config.inputMode;
            shell.appendChild(control);
            field.appendChild(shell);
          }

          var error = document.createElement("span");
          error.className = "field-error";
          error.id = "doctor-account-error-" + config.name;
          error.setAttribute("role", "alert");
          field.appendChild(error);

          control.name = config.name;
          if (config.multiple) control.setAttribute("required", "");
          else control.required = true;
          control.setAttribute("aria-describedby", error.id);
          control.addEventListener(config.options ? "change" : "input", function () {
            var hasValue = getValue ? getValue().length > 0 : control.value.trim();
            if (!hasValue) return;
            control.removeAttribute("aria-invalid");
            if (shell) shell.classList.remove("has-error");
            else control.classList.remove("has-error");
            error.textContent = "";
          });
          return {
            field: field,
            control: control,
            shell: shell,
            error: error,
            getValue: getValue
          };
        }

        function closeDoctorAccountDialog() {
          if (doctorAccountDialogCleanup) doctorAccountDialogCleanup();
        }

        function showDoctorAccountCreatedToast(message) {
          var oldToast = document.querySelector("[data-doctor-account-toast]");
          if (oldToast) oldToast.remove();
          if (doctorAccountToastTimer) window.clearTimeout(doctorAccountToastTimer);
          var toast = document.createElement("div");
          toast.className = "toast";
          toast.setAttribute("role", "status");
          toast.setAttribute("data-doctor-account-toast", "true");
          var icon = document.createElement("i");
          icon.className = "fa-solid fa-circle-check app-icon";
          icon.setAttribute("aria-hidden", "true");
          var copy = document.createElement("span");
          copy.textContent = message || "医生账号已创建";
          var close = document.createElement("button");
          close.className = "icon-button";
          close.type = "button";
          close.setAttribute("aria-label", "关闭提示");
          var closeIcon = document.createElement("i");
          closeIcon.className = "fa-solid fa-xmark app-icon";
          closeIcon.setAttribute("aria-hidden", "true");
          close.appendChild(closeIcon);
          close.addEventListener("click", function () {
            if (doctorAccountToastTimer) window.clearTimeout(doctorAccountToastTimer);
            doctorAccountToastTimer = null;
            toast.remove();
          });
          toast.appendChild(icon);
          toast.appendChild(copy);
          toast.appendChild(close);
          document.body.appendChild(toast);
          doctorAccountToastTimer = window.setTimeout(function () {
            toast.remove();
            doctorAccountToastTimer = null;
          }, 2500);
        }

        function openDoctorAccountDialog(trigger) {
          if (document.querySelector("[data-doctor-account-dialog]")) return;
          var table = getDoctorUserTable();
          if (!table) return;
          var previousFocus = trigger || document.activeElement;
          var backdrop = document.createElement("div");
          backdrop.className = "modal-backdrop";
          backdrop.setAttribute("role", "presentation");
          backdrop.setAttribute("data-doctor-account-dialog", "true");

          var modal = document.createElement("section");
          modal.className = "modal modal-md";
          modal.setAttribute("role", "dialog");
          modal.setAttribute("aria-modal", "true");
          modal.setAttribute("aria-labelledby", "doctor-account-create-title");

          var header = document.createElement("header");
          header.className = "modal-header";
          var title = document.createElement("h2");
          title.id = "doctor-account-create-title";
          title.textContent = "创建账号";
          var closeButton = document.createElement("button");
          closeButton.className = "icon-button";
          closeButton.type = "button";
          closeButton.setAttribute("aria-label", "关闭弹窗");
          var closeIcon = document.createElement("i");
          closeIcon.className = "fa-solid fa-xmark app-icon";
          closeIcon.setAttribute("aria-hidden", "true");
          closeButton.appendChild(closeIcon);
          header.appendChild(title);
          header.appendChild(closeButton);

          var body = document.createElement("div");
          body.className = "modal-body";
          var smsNotice = document.createElement("div");
          smsNotice.className = "info-strip doctor-account-sms-notice";
          smsNotice.setAttribute("role", "note");
          var smsNoticeIcon = document.createElement("i");
          smsNoticeIcon.className = "fa-solid fa-circle-info app-icon";
          smsNoticeIcon.setAttribute("aria-hidden", "true");
          var smsNoticeText = document.createElement("span");
          smsNoticeText.textContent =
            "账号创建成功后，将发送登录账号和密码短信至医生手机号，请提醒医生注意查收。";
          smsNotice.appendChild(smsNoticeIcon);
          smsNotice.appendChild(smsNoticeText);
          body.appendChild(smsNotice);
          var form = document.createElement("form");
          form.className = "form-stack account-form doctor-account-create-form";
          form.noValidate = true;

          var configs = [
            { name: "phone", label: "手机号", placeholder: "请输入手机号", inputMode: "tel" },
            { name: "name", label: "医生姓名", placeholder: "请输入医生姓名" },
            { name: "hospital", label: "所属医院", options: collectDoctorAccountOptions(table, "所属医院", ["广德惠民医院", "仁和医院", "广州仁爱医院"]) },
            { name: "department", label: "科室", options: collectDoctorAccountOptions(table, "科室", ["内科", "消化内科", "体重管理科"]) },
            { name: "title", label: "职称", options: ["主任医师", "副主任医师", "主治医师", "住院医师"] }
          ];
          var fields = configs.map(function (config) {
            var field = createDoctorAccountField(config);
            form.appendChild(field.field);
            return field;
          });
          body.appendChild(form);

          var footer = document.createElement("footer");
          footer.className = "modal-footer";
          var cancelButton = document.createElement("button");
          cancelButton.className = "button button-secondary";
          cancelButton.type = "button";
          cancelButton.innerHTML = "<span>取消</span>";
          var confirmButton = document.createElement("button");
          confirmButton.className = "button button-primary";
          confirmButton.type = "button";
          confirmButton.innerHTML = "<span>确定</span>";
          footer.appendChild(cancelButton);
          footer.appendChild(confirmButton);

          modal.appendChild(header);
          modal.appendChild(body);
          modal.appendChild(footer);
          backdrop.appendChild(modal);

          function cleanup() {
            document.removeEventListener("keydown", handleKeydown);
            backdrop.remove();
            doctorAccountDialogCleanup = null;
            if (previousFocus && previousFocus.isConnected) previousFocus.focus();
          }
          function handleKeydown(event) {
            if (event.key === "Escape") {
              cleanup();
              return;
            }
            if (event.key !== "Tab") return;
            var focusable = Array.from(
              modal.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled])")
            ).filter(function (element) {
              return element.offsetParent !== null;
            });
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
          function validate() {
            var valid = true;
            fields.forEach(function (field, index) {
              var value = field.getValue
                ? field.getValue()
                : field.control.value.trim();
              var config = configs[index];
              if (Array.isArray(value) ? value.length : value) return;
              valid = false;
              field.control.setAttribute("aria-invalid", "true");
              if (field.shell) field.shell.classList.add("has-error");
              else field.control.classList.add("has-error");
              field.error.textContent = config.options
                ? "请选择" + config.label
                : "请输入" + config.label;
            });
            if (!valid) {
              fields.find(function (field) {
                return field.control.getAttribute("aria-invalid") === "true";
              }).control.focus();
              return;
            }
            cleanup();
            showDoctorAccountCreatedToast();
          }

          closeButton.addEventListener("click", cleanup);
          cancelButton.addEventListener("click", cleanup);
          confirmButton.addEventListener("click", validate);
          form.addEventListener("submit", function (event) {
            event.preventDefault();
            validate();
          });
          backdrop.addEventListener("mousedown", function (event) {
            if (event.target === backdrop) cleanup();
          });
          document.addEventListener("keydown", handleKeydown);
          doctorAccountDialogCleanup = cleanup;
          document.body.appendChild(backdrop);
          window.requestAnimationFrame(function () {
            fields[0].control.focus();
          });
        }

        function ensureDoctorAccountCreateButton() {
          var table = getDoctorUserTable();
          if (!table) return;
          var page = table.closest(".page");
          var tools = page && page.querySelector(".list-tools");
          if (!tools || tools.querySelector("[data-doctor-account-create]")) return;
          var button = document.createElement("button");
          button.className = "button button-primary";
          button.type = "button";
          button.setAttribute("data-doctor-account-create", "true");
          var icon = document.createElement("i");
          icon.className = "fa-solid fa-circle-plus app-icon";
          icon.setAttribute("aria-hidden", "true");
          var text = document.createElement("span");
          text.textContent = "创建账号";
          button.appendChild(icon);
          button.appendChild(text);
          button.addEventListener("click", function () {
            openDoctorAccountDialog(button);
          });
          tools.appendChild(button);
        }

        function getAssistantAccountHeaders(table) {
          return Array.from(table.querySelectorAll("thead th")).map(function (header) {
            return header.textContent.trim();
          });
        }

        function getAssistantAccountTable() {
          return Array.from(document.querySelectorAll(".table-panel table")).find(
            function (table) {
              var headers = getAssistantAccountHeaders(table);
              return (
                table.getAttribute("data-assistant-account-table") === "true" ||
                (headers.indexOf("账号") >= 0 &&
                  headers.indexOf("真实姓名") >= 0 &&
                  headers.indexOf("参与项目") >= 0 &&
                  headers.indexOf("关联租户") >= 0)
              );
            }
          );
        }

        function collectAssistantAccountValues(table, key) {
          var values = Array.from(table.querySelectorAll("tbody tr"))
            .map(function (row) {
              return row.dataset[key] || "";
            })
            .filter(function (value) {
              return value && value !== "--";
            });
          return Array.from(new Set(values));
        }

        function getAssistantRowProjects(row) {
          try {
            return JSON.parse(row.dataset.assistantProjects || "[]");
          } catch (error) {
            return [];
          }
        }

        function collectAssistantProjects(table) {
          var projects = [];
          table.querySelectorAll("tbody tr").forEach(function (row) {
            getAssistantRowProjects(row).forEach(function (project) {
              if (projects.indexOf(project) < 0) projects.push(project);
            });
          });
          return projects;
        }

        function setAssistantProjectPickerOpen(picker, open) {
          if (!picker) return;
          picker.classList.toggle("is-open", open);
          var trigger = picker.querySelector(".user-multiselect-trigger");
          var menu = picker.querySelector(".user-multiselect-menu");
          var icon = trigger && trigger.querySelector(".app-icon");
          if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
          if (menu) menu.hidden = !open;
          if (icon) {
            icon.classList.toggle("fa-chevron-up", open);
            icon.classList.toggle("fa-chevron-down", !open);
          }
        }

        function syncAssistantProjectPicker(picker, projects) {
          if (!picker) return;
          var selected = (picker._selectedProjects || []).filter(function (project) {
            return projects.indexOf(project) >= 0;
          });
          picker._selectedProjects = selected;
          var value = picker.querySelector(".user-multiselect-value");
          var valueText = !selected.length
            ? "全部项目"
            : selected.length === 1
            ? selected[0]
            : "已选择 " + selected.length + " 个项目";
          if (value && value.textContent !== valueText) value.textContent = valueText;
          if (value) value.classList.toggle("is-placeholder", !selected.length);

          var signature = projects.join("\u0001") + "||" + selected.join("\u0001");
          if (picker.getAttribute("data-render-signature") === signature) return;
          picker.setAttribute("data-render-signature", signature);
          var menu = picker.querySelector(".user-multiselect-menu");
          if (!menu) return;
          menu.replaceChildren();
          var caption = document.createElement("div");
          caption.className = "user-multiselect-caption";
          caption.textContent = projects.length
            ? "可多选"
            : "暂无可选项目";
          menu.appendChild(caption);
          projects.forEach(function (project) {
            var option = document.createElement("button");
            option.className =
              "user-option" + (selected.indexOf(project) >= 0 ? " is-selected" : "");
            option.type = "button";
            option.setAttribute("role", "option");
            option.setAttribute(
              "aria-selected",
              selected.indexOf(project) >= 0 ? "true" : "false"
            );
            option.setAttribute("aria-label", project);
            var copy = document.createElement("span");
            copy.className = "user-option-copy";
            var title = document.createElement("strong");
            title.textContent = project;
            copy.appendChild(title);
            var check = document.createElement("span");
            check.className = "user-option-check";
            check.setAttribute("aria-hidden", "true");
            if (selected.indexOf(project) >= 0) check.textContent = "✓";
            option.appendChild(copy);
            option.appendChild(check);
            option.addEventListener("click", function (event) {
              event.preventDefault();
              event.stopPropagation();
              var current = picker._selectedProjects || [];
              picker._selectedProjects = current.indexOf(project) >= 0
                ? current.filter(function (item) {
                    return item !== project;
                  })
                : current.concat(project);
              syncAssistantProjectPicker(picker, projects);
            });
            menu.appendChild(option);
          });
        }

        function applyAssistantAccountFilters(table) {
          var name = assistantAccountFilterState.name.trim().toLowerCase();
          var account = assistantAccountFilterState.account.trim().toLowerCase();
          var phone = assistantAccountFilterState.phone.trim().toLowerCase();
          var visibleCount = 0;
          table.querySelectorAll("tbody tr").forEach(function (row) {
            var rowProjects = getAssistantRowProjects(row);
            var matchedProjects =
              !assistantAccountFilterState.projects.length ||
              assistantAccountFilterState.projects.some(function (project) {
                return rowProjects.indexOf(project) >= 0;
              });
            var matched = matchedProjects &&
              (!name ||
                (row.dataset.assistantName || "").toLowerCase().indexOf(name) >= 0) &&
              (!account ||
                (row.dataset.assistantAccount || "")
                  .toLowerCase()
                  .indexOf(account) >= 0) &&
              (!phone ||
                (row.dataset.assistantPhone || "").toLowerCase().indexOf(phone) >= 0) &&
              (!assistantAccountFilterState.status ||
                row.dataset.assistantStatus === assistantAccountFilterState.status);
            row.hidden = !matched;
            if (matched) visibleCount += 1;
          });

          var page = table.closest(".page");
          var total = page && page.querySelector('.pagination[aria-label="分页"] > span');
          if (!total) return;
          var hasFilter =
            Boolean(assistantAccountFilterState.projects.length) ||
            Boolean(name) ||
            Boolean(account) ||
            Boolean(phone) ||
            Boolean(assistantAccountFilterState.status);
          var totalText = hasFilter
            ? "共 " + visibleCount + " 条数据"
            : table.getAttribute("data-assistant-original-total") || "共 30 条数据";
          if (total.textContent !== totalText) total.textContent = totalText;
        }

        function updateAssistantAccountList() {
          var table = getAssistantAccountTable();
          if (!table) return;
          table.setAttribute("data-assistant-account-table", "true");
          var page = table.closest(".page");
          var tablePanel = table.closest(".table-panel");
          if (!page || !tablePanel) return;
          var paginationTotal = page.querySelector(
            '.pagination[aria-label="分页"] > span'
          );
          if (
            paginationTotal &&
            !table.getAttribute("data-assistant-original-total")
          ) {
            table.setAttribute(
              "data-assistant-original-total",
              paginationTotal.textContent.trim()
            );
          }

          var headers = getAssistantAccountHeaders(table);
          var indexes = {
            account: headers.indexOf("账号"),
            name: headers.indexOf("真实姓名"),
            status: headers.indexOf("状态"),
            phone: headers.indexOf("手机号码"),
            tenant: headers.indexOf("关联租户")
          };
          table.querySelectorAll("tbody tr").forEach(function (row) {
            var cells = row.children;
            var name = indexes.name >= 0 && cells[indexes.name]
              ? cells[indexes.name].textContent.trim()
              : row.dataset.assistantName || "";
            row.dataset.assistantAccount = indexes.account >= 0 && cells[indexes.account]
              ? cells[indexes.account].textContent.trim()
              : row.dataset.assistantAccount || "";
            row.dataset.assistantName = name;
            row.dataset.assistantStatus = indexes.status >= 0 && cells[indexes.status]
              ? cells[indexes.status].textContent.trim()
              : row.dataset.assistantStatus || "";
            row.dataset.assistantPhone = indexes.phone >= 0 && cells[indexes.phone]
              ? cells[indexes.phone].textContent.trim()
              : row.dataset.assistantPhone || "";
            row.dataset.assistantTenant = indexes.tenant >= 0 && cells[indexes.tenant]
              ? cells[indexes.tenant].textContent.trim()
              : row.dataset.assistantTenant || "";
            row.dataset.assistantProjects = JSON.stringify(
              assistantProjectsByName[name] || []
            );
          });
          if (indexes.tenant >= 0) {
            table.querySelectorAll("tr").forEach(function (row) {
              var tenantCell = row.children[indexes.tenant];
              if (tenantCell) tenantCell.remove();
            });
          }

          var filterPanel = page.querySelector(".assistant-account-filter-panel");
          if (!filterPanel) {
            filterPanel = document.createElement("section");
            filterPanel.className =
              "filter-panel assistant-account-filter-panel";
            filterPanel.setAttribute("aria-label", "医助账号筛选");

            var projectPicker = document.createElement("div");
            projectPicker.className =
              "user-multiselect assistant-project-multiselect";
            projectPicker._selectedProjects = assistantAccountFilterState.projects.slice();
            var projectTrigger = document.createElement("button");
            projectTrigger.className = "user-multiselect-trigger";
            projectTrigger.type = "button";
            projectTrigger.setAttribute("aria-label", "参与项目");
            projectTrigger.setAttribute("aria-haspopup", "listbox");
            projectTrigger.setAttribute("aria-expanded", "false");
            var projectValue = document.createElement("span");
            projectValue.className =
              "user-multiselect-value is-placeholder";
            projectValue.textContent = "全部项目";
            var projectIcon = document.createElement("i");
            projectIcon.className = "fa-solid fa-chevron-down app-icon";
            projectIcon.setAttribute("aria-hidden", "true");
            projectTrigger.appendChild(projectValue);
            projectTrigger.appendChild(projectIcon);
            var projectMenu = document.createElement("div");
            projectMenu.className = "user-multiselect-menu";
            projectMenu.setAttribute("role", "listbox");
            projectMenu.setAttribute("aria-label", "参与项目选项");
            projectMenu.setAttribute("aria-multiselectable", "true");
            projectMenu.hidden = true;
            projectPicker.appendChild(projectTrigger);
            projectPicker.appendChild(projectMenu);
            projectTrigger.addEventListener("click", function () {
              setAssistantProjectPickerOpen(
                projectPicker,
                !projectPicker.classList.contains("is-open")
              );
            });
            filterPanel.appendChild(
              createDoctorUserField("参与项目", projectPicker)
            );

            function appendTextFilter(labelText, id, placeholder) {
              var shell = document.createElement("span");
              shell.className = "input-shell";
              var input = document.createElement("input");
              input.id = id;
              input.type = "text";
              input.placeholder = placeholder;
              shell.appendChild(input);
              filterPanel.appendChild(createDoctorUserField(labelText, shell));
              return input;
            }

            var nameInput = appendTextFilter(
              "真实姓名",
              "assistant-account-name-filter",
              "请输入真实姓名"
            );
            var accountInput = appendTextFilter(
              "账号",
              "assistant-account-id-filter",
              "请输入账号"
            );
            var phoneInput = appendTextFilter(
              "手机号",
              "assistant-account-phone-filter",
              "请输入手机号"
            );
            nameInput.value = assistantAccountFilterState.name;
            accountInput.value = assistantAccountFilterState.account;
            phoneInput.value = assistantAccountFilterState.phone;

            var statusSelect = document.createElement("select");
            statusSelect.id = "assistant-account-status-filter";
            filterPanel.appendChild(
              createDoctorUserField("状态", statusSelect)
            );

            var actions = document.createElement("div");
            actions.className = "filter-actions";
            var resetButton = document.createElement("button");
            resetButton.className = "button button-secondary";
            resetButton.type = "button";
            resetButton.innerHTML = "<span>重置</span>";
            var queryButton = document.createElement("button");
            queryButton.className = "button button-primary";
            queryButton.type = "button";
            queryButton.innerHTML = "<span>查询</span>";
            actions.appendChild(resetButton);
            actions.appendChild(queryButton);
            filterPanel.appendChild(actions);

            queryButton.addEventListener("click", function () {
              assistantAccountFilterState = {
                projects: (projectPicker._selectedProjects || []).slice(),
                name: nameInput.value,
                account: accountInput.value,
                phone: phoneInput.value,
                status: statusSelect.value
              };
              var currentTable = getAssistantAccountTable();
              if (currentTable) applyAssistantAccountFilters(currentTable);
            });
            resetButton.addEventListener("click", function () {
              assistantAccountFilterState = {
                projects: [],
                name: "",
                account: "",
                phone: "",
                status: ""
              };
              projectPicker._selectedProjects = [];
              nameInput.value = "";
              accountInput.value = "";
              phoneInput.value = "";
              statusSelect.value = "";
              var currentTable = getAssistantAccountTable();
              if (currentTable) {
                syncAssistantProjectPicker(
                  projectPicker,
                  collectAssistantProjects(currentTable)
                );
                applyAssistantAccountFilters(currentTable);
              }
            });
            [nameInput, accountInput, phoneInput].forEach(function (input) {
              input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") queryButton.click();
              });
            });
            tablePanel.insertAdjacentElement("beforebegin", filterPanel);
          }

          var initialized =
            filterPanel.getAttribute("data-filter-initialized") === "true";
          var statusControl = filterPanel.querySelector(
            "#assistant-account-status-filter"
          );
          syncDoctorUserSelect(
            statusControl,
            ["已启用", "已停用"],
            "全部状态",
            initialized ? statusControl.value : assistantAccountFilterState.status
          );
          var projectControl = filterPanel.querySelector(
            ".assistant-project-multiselect"
          );
          if (!initialized) {
            projectControl._selectedProjects =
              assistantAccountFilterState.projects.slice();
          }
          syncAssistantProjectPicker(
            projectControl,
            collectAssistantProjects(table)
          );
          filterPanel.setAttribute("data-filter-initialized", "true");
          applyAssistantAccountFilters(table);
        }

        function updateDoctorDetail() {
          var page = document.querySelector(".doctor-detail-page");
          if (!page) return;

          page.querySelectorAll("button").forEach(function (button) {
            if (button.textContent.trim() === "绑定企微") button.remove();
          });

          var nameNode = page.querySelector(".profile-banner h1");
          if (!nameNode) return;
          var doctorName = nameNode.textContent.trim();
          var status = statusByDoctor[doctorName] || "未托管";
          var statusCard = Array.from(page.querySelectorAll(".detail-card")).find(
            function (card) {
              var heading = card.querySelector("h2");
              return heading && heading.textContent.indexOf("注册与状态信息") >= 0;
            }
          );
          if (statusCard) {
            statusCard.querySelectorAll(".two-column-dl > div").forEach(
              function (group) {
                var label = group.querySelector("dt");
                var value = group.querySelector("dd");
                if (!label) return;
                var labelText = label.textContent.trim();
                if (
                  labelText.indexOf("注册方式") >= 0 ||
                  labelText.indexOf("来源渠道") >= 0
                ) {
                  group.remove();
                  return;
                }
                if (labelText.indexOf("是否注册企微") >= 0 && value) {
                  label.textContent = "企微账号：";
                  if (status === "未托管") {
                    value.textContent = "";
                    return;
                  }
                  var account = (
                    wecomAccountByDoctor[doctorName] ||
                    doctorName + "｜doctor_user"
                  ).split("｜");
                  var userId = document.createElement("span");
                  userId.className = "wecom-account-userid";
                  userId.textContent = "UserID：" + (account[1] || "doctor_user");
                  value.replaceChildren(
                    document.createTextNode((account[0] || doctorName) + "｜"),
                    userId
                  );
                }
              }
            );
            var statusList = statusCard.querySelector(".two-column-dl");
            if (statusList) {
              statusList.classList.add("doctor-registration-single-column");
              [
                "企微账号",
                "企微托管状态",
                "注册时间",
                "最后登录时间"
              ].forEach(function (fieldName) {
                var field = Array.from(statusList.children).find(function (group) {
                  var label = group.querySelector("dt");
                  return (
                    label &&
                    label.textContent.replace(/[：:]/g, "").trim() === fieldName
                  );
                });
                if (field) statusList.appendChild(field);
              });
            }
          }
          var actionByStatus = {
            "离线": {
              text: "上线",
              ariaLabel: "上线企业微信账号",
              action: "online"
            },
            "二次验证": {
              text: "二次验证",
              ariaLabel: "进行企业微信二次验证",
              action: "verify"
            }
          };

          page.querySelectorAll(".two-column-dl > div").forEach(function (group) {
            var label = group.querySelector("dt");
            var value = group.querySelector("dd");
            if (!label || !value || label.textContent.indexOf("企微托管状态") < 0) return;
            var actionConfig = actionByStatus[status] || null;
            var existingStatus = value.querySelector("[data-wecom-managed-status='" + status + "']");
            var existingAction = value.querySelector("[data-wecom-host-account]");
            var actionMatches = actionConfig
              ? existingAction &&
                existingAction.textContent.trim() === actionConfig.text &&
                existingAction.getAttribute("data-wecom-action") === actionConfig.action
              : !existingAction;
            if (
              value.getAttribute("data-wecom-managed-status") === status &&
              existingStatus &&
              actionMatches
            ) return;

            var wrap = document.createElement("span");
            wrap.className = "wecom-managed-status-wrap";
            wrap.appendChild(createStatus(status));
            if (actionConfig) {
              var action = document.createElement("button");
              action.className = "link-button";
              action.type = "button";
              action.textContent = actionConfig.text;
              action.setAttribute("data-wecom-host-account", "true");
              action.setAttribute("data-wecom-action", actionConfig.action);
              action.setAttribute("aria-label", actionConfig.ariaLabel);
              wrap.appendChild(action);
            }
            value.replaceChildren(wrap);
            value.setAttribute("data-wecom-managed-status", status);
          });
        }

        function getDoctorStatusField(page, fieldName) {
          var statusCard = Array.from(page.querySelectorAll(".detail-card")).find(
            function (card) {
              var heading = card.querySelector("h2");
              return heading && heading.textContent.indexOf("注册与状态信息") >= 0;
            }
          );
          if (!statusCard) return { value: "--", date: "--" };
          var group = Array.from(statusCard.querySelectorAll("dl > div")).find(
            function (item) {
              var label = item.querySelector("dt");
              return (
                label &&
                label.textContent.replace(/[：:]/g, "").trim() === fieldName
              );
            }
          );
          var value = group && group.querySelector("dd");
          var text = value ? value.textContent.trim() : "--";
          var dateMatch = text.match(
            /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/
          );
          return { value: text, date: dateMatch ? dateMatch[0] : "--" };
        }

        function setDoctorTimelineText(node, value) {
          if (node && node.textContent !== value) node.textContent = value;
        }

        function createDoctorTimelineItem(title, tone, role) {
          var item = document.createElement("li");
          item.className = "doctor-activity-timeline-item";
          item.setAttribute("data-timeline-role", role);

          var marker = document.createElement("span");
          marker.className =
            "doctor-activity-timeline-marker" +
            (tone === "success" ? " is-success" : "");
          marker.setAttribute("aria-hidden", "true");
          var markerIcon = document.createElement("i");
          markerIcon.className = "fa-solid fa-circle-dot app-icon";
          marker.appendChild(markerIcon);

          var content = document.createElement("div");
          content.className = "doctor-activity-timeline-content";
          var heading = document.createElement("strong");
          heading.textContent = title;
          var time = document.createElement("time");
          time.setAttribute("data-timeline-time", "true");
          var note = document.createElement("span");
          note.setAttribute("data-timeline-note", "true");
          content.appendChild(heading);
          content.appendChild(time);
          content.appendChild(note);

          item.appendChild(marker);
          item.appendChild(content);
          return item;
        }

        function updateDoctorEdcAndTimeline() {
          var page = document.querySelector(".doctor-detail-page");
          if (!page) return;
          var edcCard = page.querySelector(".edc-card");
          if (!edcCard) return;
          edcCard.classList.add("doctor-edc-card");

          var headerCopy = edcCard.querySelector("header > div > span");
          var description =
            "支持一个医生关联多个 EDC 项目，非必填。关联后的项目将用于后续患者入组等业务场景。";
          setDoctorTimelineText(headerCopy, description);

          var emptyState = edcCard.querySelector(".edc-empty");
          var emptyImage = emptyState && emptyState.querySelector("img");
          if (
            emptyImage &&
            emptyImage.getAttribute("src") !== "./assets/empty-edc.png"
          ) {
            emptyImage.setAttribute("src", "./assets/empty-edc.png");
            emptyImage.setAttribute("alt", "暂未关联 EDC 项目");
          }

          if (
            emptyState &&
            !emptyState.querySelector("[data-doctor-edc-associate]")
          ) {
            var associateButton = document.createElement("button");
            associateButton.className =
              "button button-primary doctor-edc-associate-button";
            associateButton.type = "button";
            associateButton.setAttribute("data-doctor-edc-associate", "true");
            associateButton.setAttribute("aria-label", "去关联 EDC 项目");
            var associateText = document.createElement("span");
            associateText.textContent = "去关联";
            var associateIcon = document.createElement("i");
            associateIcon.className = "fa-solid fa-chevron-right app-icon";
            associateIcon.setAttribute("aria-hidden", "true");
            associateButton.appendChild(associateText);
            associateButton.appendChild(associateIcon);
            associateButton.addEventListener("click", function () {
              var editButton = Array.from(
                edcCard.querySelectorAll("header button")
              ).find(function (button) {
                return button.textContent.trim() === "编辑关联";
              });
              if (editButton) editButton.click();
            });
            emptyState.appendChild(associateButton);
          }

          var timeline = page.querySelector(
            "[data-doctor-activity-timeline='true']"
          );
          if (!timeline) {
            timeline = document.createElement("section");
            timeline.className = "doctor-activity-timeline";
            timeline.setAttribute("data-doctor-activity-timeline", "true");
            timeline.setAttribute("aria-labelledby", "doctor-activity-title");

            var timelineHeader = document.createElement("header");
            var timelineTitle = document.createElement("strong");
            timelineTitle.id = "doctor-activity-title";
            timelineTitle.textContent = "活动时间线";
            timelineHeader.appendChild(timelineTitle);

            var timelineBody = document.createElement("div");
            timelineBody.className = "doctor-activity-timeline-body";
            var timelineList = document.createElement("ol");
            timelineList.className = "doctor-activity-timeline-list";
            timelineList.appendChild(
              createDoctorTimelineItem("最后登录", "success", "login")
            );
            timelineList.appendChild(
              createDoctorTimelineItem("注册成功", "primary", "registered")
            );
            timelineBody.appendChild(timelineList);
            timeline.appendChild(timelineHeader);
            timeline.appendChild(timelineBody);
          }
          if (timeline.previousElementSibling !== edcCard) {
            edcCard.insertAdjacentElement("afterend", timeline);
          }

          var loginInfo = getDoctorStatusField(page, "最后登录时间");
          var registeredInfo = getDoctorStatusField(page, "注册时间");
          var loginItem = timeline.querySelector(
            "[data-timeline-role='login']"
          );
          var registeredItem = timeline.querySelector(
            "[data-timeline-role='registered']"
          );
          setDoctorTimelineText(
            loginItem && loginItem.querySelector("[data-timeline-time]"),
            loginInfo.date
          );
          setDoctorTimelineText(
            loginItem && loginItem.querySelector("[data-timeline-note]"),
            "5 天前"
          );
          setDoctorTimelineText(
            registeredItem &&
              registeredItem.querySelector("[data-timeline-time]"),
            registeredInfo.date
          );
          setDoctorTimelineText(
            registeredItem &&
              registeredItem.querySelector("[data-timeline-note]"),
            "注册成功"
          );
        }

        function updateDoctorEditDialog() {
          var dialog = Array.from(document.querySelectorAll(".modal")).find(
            function (item) {
              var heading = item.querySelector(".modal-header h2");
              return heading && heading.textContent.trim() === "编辑医生信息";
            }
          );
          if (!dialog) return;

          var grid = dialog.querySelector(".modal-body .form-grid.two-columns");
          var detailPage = document.querySelector(".doctor-detail-page");
          var doctorNameNode =
            detailPage && detailPage.querySelector(".profile-banner h1");
          if (!grid || !doctorNameNode) return;

          var doctorName = doctorNameNode.textContent.trim();
          var fields = Array.from(grid.querySelectorAll(":scope > .field"));
          var titleField = fields.find(function (field) {
            var label = field.querySelector(".field-label");
            return (
              label && label.textContent.replace(/\*/g, "").trim() === "职称"
            );
          });
          var titleSelect = titleField && titleField.querySelector("select");
          if (titleSelect) {
            var titleOptions = [
              "主任医师",
              "副主任医师",
              "主治医师",
              "住院医师"
            ];
            var selectedTitle = titleOptions.indexOf(titleSelect.value) >= 0
              ? titleSelect.value
              : titleOptions[0];
            var currentTitleOptions = Array.from(titleSelect.options).map(
              function (option) {
                return option.textContent.trim();
              }
            );
            if (
              currentTitleOptions.length !== titleOptions.length ||
              currentTitleOptions.some(function (option, index) {
                return option !== titleOptions[index];
              })
            ) {
              titleSelect.replaceChildren();
              titleOptions.forEach(function (title) {
                var option = document.createElement("option");
                option.value = title;
                option.textContent = title;
                titleSelect.appendChild(option);
              });
              titleSelect.value = selectedTitle;
            }
          }

          var projectField = grid.querySelector(
            "[data-doctor-edit-project-field='true']"
          );
          if (!projectField) {
            projectField = document.createElement("label");
            projectField.className = "field";
            projectField.setAttribute(
              "data-doctor-edit-project-field",
              "true"
            );

            var projectLabel = document.createElement("span");
            projectLabel.className = "field-label";
            var required = document.createElement("span");
            required.className = "required";
            required.setAttribute("aria-hidden", "true");
            required.textContent = "*";
            projectLabel.appendChild(required);
            projectLabel.appendChild(document.createTextNode("所属项目"));

            var projectSelect = document.createElement("select");
            projectSelect.required = true;
            projectSelect.setAttribute("aria-label", "所属项目");
            projectField.appendChild(projectLabel);
            projectField.appendChild(projectSelect);
            grid.appendChild(projectField);
          }

          var projectSelect = projectField.querySelector("select");
          if (!projectSelect) return;
          var selectedProject =
            (assistantProjectsByName[doctorName] || [])[0] || "--";
          var projectOptions = [];
          Object.keys(assistantProjectsByName).forEach(function (name) {
            (assistantProjectsByName[name] || []).forEach(function (project) {
              if (projectOptions.indexOf(project) < 0) {
                projectOptions.push(project);
              }
            });
          });
          if (projectOptions.indexOf(selectedProject) < 0) {
            projectOptions.unshift(selectedProject);
          }
          if (
            projectSelect.getAttribute("data-doctor-name") !== doctorName
          ) {
            projectSelect.replaceChildren();
            projectOptions.forEach(function (project) {
              var option = document.createElement("option");
              option.value = project;
              option.textContent = project;
              projectSelect.appendChild(option);
            });
            projectSelect.value = selectedProject;
            projectSelect.setAttribute("data-doctor-name", doctorName);
          }
          var saveButton = Array.from(dialog.querySelectorAll("button")).find(
            function (button) {
              return button.textContent.trim() === "保存修改";
            }
          );
          if (
            saveButton &&
            saveButton.getAttribute("data-project-save-listener") !== "true"
          ) {
            saveButton.setAttribute("data-project-save-listener", "true");
            saveButton.addEventListener("click", function () {
              var currentProject = dialog.querySelector(
                "[data-doctor-edit-project-field='true'] select"
              );
              if (!currentProject) return;
              assistantProjectsByName[doctorName] =
                currentProject.value === "--" ? [] : [currentProject.value];
            });
          }
        }

        var sceneDoctorOptions = [
          {
            value: "林医生｜138****6698",
            name: "林医生",
            title: "主治医师",
            gender: "女",
            hospital: "黔东南爱康医院",
            department: "内分泌科",
            patients: 5
          },
          {
            value: "周医生｜139****2286",
            name: "周医生",
            title: "副主任医师",
            gender: "男",
            hospital: "中山大学肿瘤防治中心",
            department: "结直肠科",
            patients: 3
          },
          {
            value: "康医生｜136****7812",
            name: "康医生",
            title: "主治医师",
            gender: "男",
            hospital: "仁和医院",
            department: "内科",
            patients: 1
          }
        ];

        var associatedRobotByDoctor = {
          "林医生｜138****6698": "糖脂健康助手",
          "周医生｜139****2286": "患者康复助手",
          "康医生｜136****7812": "患者康复助手"
        };

        var botWelcomeConfigs = null;
        var botWelcomeSequence = 1;
        var botWelcomeMode = "";
        var botChannelStatusByName = {
          "患者助手 Bot": "已接入（在线）",
          "随访提醒 Bot": "已接入（在线）",
          "预问诊 Bot": "已接入（离线）",
          "费用咨询 Bot": "已接入（离线）",
          "报告解读 Bot": "已接入（二次验证）",
          "健康宣教 Bot": "未接入"
        };
        var botRecoveredChannelByName = {};
        var botCustomChatAgentByName = {
          "患者助手 Bot": "健康咨询智能体",
          "随访提醒 Bot": "复诊随访智能体",
          "预问诊 Bot": "门诊咨询智能体",
          "费用咨询 Bot": "健康咨询智能体",
          "报告解读 Bot": "复诊随访智能体"
        };

        function findSceneFormSection(page, title) {
          return Array.from(page.querySelectorAll(".form-section")).find(function (section) {
            var heading = section.querySelector("h2");
            return heading && heading.textContent.trim() === title;
          });
        }

        function setRemovedWelcomeValue(welcomeSection) {
          var textarea = welcomeSection && welcomeSection.querySelector(
            "textarea[placeholder='输入企微欢迎语文本内容…']"
          );
          if (!textarea || textarea.value) return;
          var valueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value"
          ).set;
          valueSetter.call(textarea, " ");
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.dispatchEvent(new Event("change", { bubbles: true }));
        }

        function ensureAssociationRequired(field) {
          if (!field) return;
          var label = field.querySelector(".field-label");
          if (!label) return;
          var markers = label.querySelectorAll(".required");
          if (!markers.length) {
            var marker = document.createElement("span");
            marker.className = "required scene-required-marker";
            marker.setAttribute("aria-hidden", "true");
            marker.textContent = "*";
            label.insertBefore(marker, label.firstChild);
          } else {
            Array.from(markers).slice(1).forEach(function (marker) {
              marker.remove();
            });
          }
        }

        function autoSelectFirstSceneAgent(robotSection, robotTrigger, agentField) {
          if (!robotSection || !robotTrigger || !agentField) return;
          var robotValue = robotTrigger.querySelector("span");
          var agentTrigger = agentField.querySelector(
            ".scene-association-trigger[aria-label='选择智能体']"
          );
          var agentValue = agentTrigger && agentTrigger.querySelector("span");
          var robotName = robotValue ? robotValue.textContent.trim() : "";
          if (
            !robotName ||
            robotName === "请选择机器人" ||
            robotName === "不关联机器人" ||
            !agentTrigger ||
            agentTrigger.disabled ||
            !agentValue
          ) {
            return;
          }
          if (agentValue.textContent.trim() !== "请选择智能体") {
            robotSection.setAttribute("data-auto-agent-for", robotName);
            robotSection.removeAttribute("data-auto-agent-pending");
            return;
          }
          if (
            robotSection.getAttribute("data-auto-agent-pending") === robotName
          ) {
            return;
          }
          robotSection.setAttribute("data-auto-agent-pending", robotName);
          window.setTimeout(function () {
            agentTrigger.click();
            window.setTimeout(function () {
              var option = agentField.querySelector(
                ".scene-association-menu [role='option']"
              );
              if (option) option.click();
              robotSection.setAttribute("data-auto-agent-for", robotName);
              robotSection.removeAttribute("data-auto-agent-pending");
            }, 30);
          }, 0);
        }

        var sceneRobotOptionData = {
          "糖脂健康助手": {
            types: ["Skill智能体", "编排智能体"],
            description: "为患者提供健康咨询、慢病知识解答、复诊随访与生活方式指导。"
          },
          "患者康复助手": {
            types: ["提示词智能体"],
            description: "为患者提供康复训练指导、注意事项提醒与康复阶段随访支持。"
          }
        };

        function enhanceSceneRobotOptions(robotSection) {
          if (
            !robotSection ||
            !robotSection.classList.contains("scene-create-robot-reference")
          ) return;
          var trigger = robotSection.querySelector(
            ".scene-association-trigger[aria-label='选择机器人']"
          );
          var select = trigger && trigger.closest(".scene-association-select");
          var menu = select && select.querySelector(".scene-association-menu");
          if (!menu) return;
          menu.classList.add("scene-robot-option-menu");
          Array.from(menu.querySelectorAll(":scope > button")).forEach(function (option) {
            var originalName = option.querySelector(":scope > span > strong");
            var name = originalName ? originalName.textContent.trim() : "";
            var data = sceneRobotOptionData[name];
            if (name === "不关联机器人") {
              option.classList.add("scene-robot-option-hidden");
              option.hidden = true;
              option.setAttribute("aria-hidden", "true");
              option.tabIndex = -1;
              return;
            }
            if (!data) {
              return;
            }
            option.classList.add("scene-robot-option");
            if (option.getAttribute("data-robot-option-enhanced") === "true") return;
            var content = option.querySelector(":scope > span");
            if (!content) return;
            var heading = document.createElement("span");
            heading.className = "scene-robot-option-heading";
            var title = document.createElement("strong");
            title.textContent = name;
            var types = document.createElement("span");
            types.className = "scene-robot-option-types";
            var visibleTypes = data.types.slice(0, 1);
            visibleTypes.forEach(function (type) {
              var tag = document.createElement("span");
              tag.className = "scene-robot-option-type";
              if (type === "编排智能体") tag.classList.add("is-orchestration");
              if (type === "提示词智能体") tag.classList.add("is-prompt");
              tag.textContent = type;
              types.appendChild(tag);
            });
            var description = document.createElement("small");
            description.className = "scene-robot-option-description";
            description.textContent = data.description;
            heading.appendChild(title);
            heading.appendChild(types);
            content.appendChild(heading);
            content.appendChild(description);
            option.setAttribute(
              "aria-label",
              name + "，关联智能体类型：" + visibleTypes.join("、") + "，简介：" + data.description
            );
            option.setAttribute("data-robot-option-enhanced", "true");
          });
        }

        function setSceneFieldLabelText(label, text) {
          if (!label) return;
          var textNode = Array.from(label.childNodes).find(function (node) {
            return node.nodeType === 3 && node.nodeValue.trim();
          });
          if (textNode) {
            textNode.nodeValue = text;
          } else {
            label.appendChild(document.createTextNode(text));
          }
        }

        function ensureSceneFieldHelp(label, className, tooltipId, tooltipText, ariaLabel) {
          if (!label) return;
          var help = label.querySelector("." + className);
          if (!help) {
            help = document.createElement("button");
            help.className = className;
            help.type = "button";
            help.innerHTML =
              '<i class="fa-regular fa-circle-question app-icon" aria-hidden="true"></i>';
            label.appendChild(help);
          }
          help.classList.add("scene-context-help");
          help.removeAttribute("title");
          help.setAttribute("aria-label", ariaLabel);
          help.setAttribute("aria-describedby", tooltipId);
          var tooltip = help.querySelector(".scene-context-help-tooltip");
          if (!tooltip) {
            tooltip = document.createElement("span");
            tooltip.className = "scene-context-help-tooltip";
            tooltip.setAttribute("role", "tooltip");
            help.appendChild(tooltip);
          }
          tooltip.id = tooltipId;
          tooltip.textContent = tooltipText;
        }

        function ensureScenePatientArchiveField(page, isCreateScene) {
          if (!page || !isCreateScene) return;
          var basicSection = findSceneFormSection(page, "基础信息");
          var grid = basicSection && basicSection.querySelector(".form-grid");
          if (!grid) return;
          grid.classList.add("scene-basic-grid-with-archive");
          var statusField = Array.from(grid.children).find(function (field) {
            var label = field.querySelector(":scope > span");
            return (
              field.classList.contains("switch-field") &&
              label &&
              label.textContent.trim() === "状态"
            );
          });
          if (!statusField) return;
          statusField.classList.add(
            "scene-basic-switch-stacked",
            "scene-basic-status-field"
          );
          var archiveField = grid.querySelector(".scene-patient-archive-field");
          if (!archiveField) {
            archiveField = document.createElement("div");
            archiveField.className =
              "switch-field scene-patient-archive-field scene-basic-switch-stacked";
            archiveField.innerHTML =
              "<span>是否需要患者建档</span>" +
              '<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="是否需要患者建档"><span></span></button>' +
              "<small>需患者建档，患者扫码需先通过小程序注册建档，不需要建档则直接扫码添加医生企微</small>";
            statusField.insertAdjacentElement("afterend", archiveField);
            var archiveToggle = archiveField.querySelector(".toggle");
            archiveToggle.addEventListener("click", function () {
              var isOn = archiveToggle.getAttribute("aria-checked") !== "true";
              archiveToggle.setAttribute("aria-checked", String(isOn));
              archiveToggle.classList.toggle("is-on", isOn);
            });
          }
        }

        function updateSceneFormLayout() {
          var page = document.querySelector(".scene-form-page");
          if (!page) return;
          var pageHeading = page.querySelector("h1");
          var isCreateScene =
            pageHeading && pageHeading.textContent.trim() === "新增场景码配置";
          var doctorSection = findSceneFormSection(page, "选择已托管企微的医生");
          var robotSection = findSceneFormSection(page, "关联机器人");
          var welcomeSection = findSceneFormSection(page, "配置企微欢迎语");

          ensureScenePatientArchiveField(page, isCreateScene);

          if (welcomeSection) {
            setRemovedWelcomeValue(welcomeSection);
            welcomeSection.hidden = true;
            welcomeSection.style.display = "none";
            welcomeSection.setAttribute("aria-hidden", "true");
          }
          if (
            doctorSection &&
            robotSection &&
            doctorSection.nextElementSibling !== robotSection
          ) {
            doctorSection.insertAdjacentElement("afterend", robotSection);
          }
          if (robotSection) {
            var robotTrigger = robotSection.querySelector(
              ".scene-association-trigger[aria-label='选择机器人']"
            );
            var agentTrigger = robotSection.querySelector(
              ".scene-association-trigger[aria-label='选择智能体']"
            );
            var robotField = robotTrigger && robotTrigger.closest(
              ".scene-association-field"
            );
            var agentField = agentTrigger && agentTrigger.closest(
              ".scene-association-field"
            );
            ensureAssociationRequired(robotField);
            if (isCreateScene) {
              robotSection.classList.add("scene-create-robot-reference");
              var grid = robotSection.querySelector(".scene-association-grid");
              if (grid) grid.classList.add("scene-create-robot-single");
              if (agentField) {
                agentField.classList.add("scene-create-agent-field-hidden");
                agentField.setAttribute("aria-hidden", "true");
              }
              var info = robotSection.querySelector(".scene-robot-info");
              if (!info) {
                info = document.createElement("div");
                info.className = "scene-robot-info";
                info.setAttribute("role", "note");
                info.innerHTML =
                  '<i class="fa-solid fa-circle-info app-icon" aria-hidden="true"></i>' +
                  "<span>选择一个机器人来处理患者扫码后的自动化流程</span>";
                var sectionHeading = robotSection.querySelector("h2");
                if (sectionHeading) sectionHeading.insertAdjacentElement("afterend", info);
              }
              var robotLabel = robotField && robotField.querySelector(".field-label");
              ensureSceneFieldHelp(
                robotLabel,
                "scene-robot-help",
                "scene-robot-help-tooltip",
                "仅能选择已发布的机器人，机器人将在患者扫码后自动触发",
                "查看选择机器人说明"
              );
              autoSelectFirstSceneAgent(
                robotSection,
                robotTrigger,
                agentField
              );
              enhanceSceneRobotOptions(robotSection);
            } else {
              ensureAssociationRequired(agentField);
            }
            if (
              robotTrigger &&
              robotTrigger.querySelector("span") &&
              robotTrigger.querySelector("span").textContent.trim() !==
                "请选择机器人"
            ) {
              setAssociationError(robotField, "");
            }
            if (
              agentTrigger &&
              agentTrigger.querySelector("span") &&
              agentTrigger.querySelector("span").textContent.trim() !==
                "请选择智能体"
            ) {
              setAssociationError(agentField, "");
            }
          }
        }

        function selectAssociatedRobot(doctorValue) {
          var robotName = associatedRobotByDoctor[doctorValue];
          var page = document.querySelector(".scene-form-page");
          var robotSection = page && findSceneFormSection(page, "关联机器人");
          var trigger = robotSection && robotSection.querySelector(
            ".scene-association-trigger[aria-label='选择机器人']"
          );
          if (!robotName || !trigger || trigger.disabled) return;
          var currentValue = trigger.querySelector("span");
          if (currentValue && currentValue.textContent.trim() === robotName) return;
          trigger.click();
          window.setTimeout(function () {
            var options = robotSection.querySelectorAll(
              ".scene-association-menu [role='option']"
            );
            var target = Array.from(options).find(function (option) {
              var name = option.querySelector("strong");
              return name && name.textContent.trim() === robotName;
            });
            if (target) target.click();
          }, 30);
        }

        function setAssociationError(field, message) {
          if (!field) return;
          var select = field.querySelector(".scene-association-select");
          var error = field.querySelector(".scene-association-required-error");
          if (!message) {
            if (select) select.classList.remove("has-error");
            if (error) error.remove();
            return;
          }
          if (select) select.classList.add("has-error");
          if (!error) {
            error = document.createElement("span");
            error.className = "field-error scene-association-required-error";
            error.setAttribute("role", "alert");
            field.appendChild(error);
          }
          error.textContent = message;
        }

        function validateRequiredAssociation(event) {
          var saveButton = event.target.closest(".sticky-form-footer button");
          var page = document.querySelector(".scene-form-page");
          if (!saveButton || !page || saveButton.textContent.trim() !== "保存") return;
          var robotSection = findSceneFormSection(page, "关联机器人");
          if (!robotSection) return;
          var pageHeading = page.querySelector("h1");
          var isCreateScene =
            pageHeading && pageHeading.textContent.trim() === "新增场景码配置";
          var robotTrigger = robotSection.querySelector(
            ".scene-association-trigger[aria-label='选择机器人']"
          );
          var agentTrigger = robotSection.querySelector(
            ".scene-association-trigger[aria-label='选择智能体']"
          );
          var robotField = robotTrigger && robotTrigger.closest(".scene-association-field");
          var agentField = agentTrigger && agentTrigger.closest(".scene-association-field");
          var robotValue = robotTrigger && robotTrigger.querySelector("span");
          var agentValue = agentTrigger && agentTrigger.querySelector("span");
          var robotMissing =
            !robotValue || robotValue.textContent.trim() === "请选择机器人";
          var agentMissing =
            !isCreateScene &&
            (!agentValue || agentValue.textContent.trim() === "请选择智能体");
          setAssociationError(robotField, robotMissing ? "请选择机器人" : "");
          setAssociationError(
            agentField,
            agentMissing ? "请选择智能体" : ""
          );
          if (!robotMissing && !agentMissing) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          robotSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        function updateSceneDoctorPicker() {
          var page = document.querySelector(".scene-form-page");
          if (!page) return;
          var section = Array.from(page.querySelectorAll(".form-section")).find(function (item) {
            var heading = item.querySelector("h2");
            return heading && heading.textContent.trim() === "选择已托管企微的医生";
          });
          if (!section) return;
          var select = section.querySelector("select");
          if (!select) return;
          select.classList.add("scene-doctor-native-select");
          var doctorField = select.closest(".field");
          var doctorLabel = doctorField && doctorField.querySelector(".field-label");
          setSceneFieldLabelText(doctorLabel, "选择医生");
          ensureSceneFieldHelp(
            doctorLabel,
            "scene-doctor-help",
            "scene-doctor-help-tooltip",
            "仅能选择已完成企业微信托管的医生",
            "查看选择医生说明"
          );

          var picker = section.querySelector(".scene-doctor-picker");
          if (!picker) {
            picker = document.createElement("div");
            picker.className = "scene-doctor-picker";
            var trigger = document.createElement("button");
            trigger.className = "scene-doctor-picker-trigger";
            trigger.type = "button";
            trigger.setAttribute("aria-haspopup", "listbox");
            trigger.setAttribute("aria-expanded", "false");
            var triggerText = document.createElement("span");
            triggerText.setAttribute("data-scene-doctor-trigger-text", "true");
            var arrow = document.createElement("span");
            arrow.className = "scene-doctor-picker-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "⌄";
            trigger.appendChild(triggerText);
            trigger.appendChild(arrow);

            var menu = document.createElement("div");
            menu.className = "scene-doctor-picker-menu";
            menu.setAttribute("role", "listbox");
            menu.hidden = true;
            sceneDoctorOptions.forEach(function (doctor) {
              var option = document.createElement("button");
              option.className = "scene-doctor-picker-option";
              option.type = "button";
              option.setAttribute("role", "option");
              option.setAttribute("data-scene-doctor-value", doctor.value);

              var avatar = document.createElement("span");
              avatar.className = "scene-doctor-picker-avatar";
              avatar.textContent = doctor.name.slice(0, 1);
              var copy = document.createElement("span");
              copy.className = "scene-doctor-picker-copy";
              var head = document.createElement("span");
              head.className = "scene-doctor-picker-head";
              var name = document.createElement("strong");
              name.className = "scene-doctor-picker-name";
              name.textContent = doctor.name;
              var title = document.createElement("span");
              title.className = "scene-doctor-picker-title";
              title.textContent = doctor.title;
              var meta = document.createElement("span");
              meta.className = "scene-doctor-picker-meta";
              meta.textContent =
                doctor.gender +
                " ｜ " +
                doctor.hospital +
                " ｜ " +
                doctor.department +
                " ｜ 已管理 " +
                doctor.patients +
                " 位患者";
              head.appendChild(name);
              head.appendChild(title);
              copy.appendChild(head);
              copy.appendChild(meta);
              option.appendChild(avatar);
              option.appendChild(copy);
              option.addEventListener("click", function (event) {
                event.stopPropagation();
                var valueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLSelectElement.prototype,
                  "value"
                ).set;
                valueSetter.call(select, doctor.value);
                select.dispatchEvent(new Event("change", { bubbles: true }));
                picker.classList.remove("is-open");
                menu.hidden = true;
                trigger.setAttribute("aria-expanded", "false");
                queueEnhancement();
                window.setTimeout(function () {
                  selectAssociatedRobot(doctor.value);
                }, 60);
              });
              menu.appendChild(option);
            });

            trigger.addEventListener("click", function (event) {
              event.stopPropagation();
              var willOpen = !picker.classList.contains("is-open");
              document.querySelectorAll(".scene-doctor-picker.is-open").forEach(function (item) {
                item.classList.remove("is-open");
                var openMenu = item.querySelector(".scene-doctor-picker-menu");
                var openTrigger = item.querySelector(".scene-doctor-picker-trigger");
                if (openMenu) openMenu.hidden = true;
                if (openTrigger) openTrigger.setAttribute("aria-expanded", "false");
              });
              picker.classList.toggle("is-open", willOpen);
              menu.hidden = !willOpen;
              trigger.setAttribute("aria-expanded", String(willOpen));
            });
            picker.appendChild(trigger);
            picker.appendChild(menu);
            select.insertAdjacentElement("afterend", picker);
          }

          var selected = sceneDoctorOptions.find(function (doctor) {
            return doctor.value === select.value;
          });
          var pickerTriggerText = picker.querySelector("[data-scene-doctor-trigger-text]");
          if (pickerTriggerText) {
            pickerTriggerText.textContent = selected
              ? selected.name + " ｜ " + selected.title + " ｜ " + selected.hospital
              : "请选择医生";
          }
          picker.querySelectorAll(".scene-doctor-picker-option").forEach(function (option) {
            var isSelected =
              option.getAttribute("data-scene-doctor-value") === select.value;
            option.classList.toggle("is-selected", isSelected);
            option.setAttribute("aria-selected", String(isSelected));
          });
        }

        function removeBotDoctorField() {
          var page = document.querySelector(".bm-create-page");
          if (!page) return;
          var heading = page.querySelector(".bm-wizard-card > h2");
          if (!heading || heading.textContent.trim() !== "基础信息") return;
          var grid = page.querySelector(".bm-two-fields");
          if (!grid) return;
          var field = Array.from(grid.querySelectorAll(":scope > .bm-field")).find(
            function (item) {
              var label = item.querySelector(":scope > span");
              if (!label) return false;
              return label.textContent.replace(/\*/g, "").trim() === "所属项目";
            }
          );
          if (!field) return;
          field.classList.add("bot-doctor-field-removed");
          field.hidden = true;
          field.setAttribute("aria-hidden", "true");
          field.querySelectorAll("input, select, textarea, button").forEach(
            function (control) {
              control.tabIndex = -1;
            }
          );
          grid.classList.add("bot-basic-single-field");
        }

        function syncOpeningValue(textarea, value) {
          if (!textarea) return;
          var valueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value"
          ).set;
          valueSetter.call(textarea, value);
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.dispatchEvent(new Event("change", { bubbles: true }));
        }

        function getBotWelcomeMode() {
          return new URLSearchParams(
            window.location.hash.split("?")[1] || ""
          ).get("mode") === "edit"
            ? "edit"
            : "create";
        }

        function createWelcomeInput(config, key, placeholder, hiddenOpening) {
          var input = document.createElement("input");
          input.type = "text";
          input.maxLength = key === "content" ? 80 : 200;
          input.placeholder = placeholder;
          input.value = config[key] || "";
          input.addEventListener("input", function () {
            config[key] = input.value;
            if (key === "content" && botWelcomeConfigs[0] === config) {
              syncOpeningValue(hiddenOpening, config.content);
            }
            window.setTimeout(function () {
              var section = input.closest(".bm-welcome-config");
              if (section) updateBotWelcomePublishState(section, hiddenOpening);
            }, 0);
          });
          return input;
        }

        function updateBotWelcomePublishState(section, hiddenOpening) {
          var page = section && section.closest(".bm-create-page");
          if (!page || !botWelcomeConfigs) return;
          var publishButton = Array.from(
            page.querySelectorAll(".bm-sticky-footer button")
          ).find(function (button) {
            return button.textContent.trim() === "提交发布";
          });
          if (!publishButton) return;
          var hasAgent = !!page.querySelector(".bm-agent-summary");
          var transferIncomplete = !!page.querySelector(".bm-inline-warning");
          var imageIncomplete = botWelcomeConfigs.some(function (config) {
            return config.type === "image" && !config.content;
          });
          publishButton.disabled =
            !hasAgent || transferIncomplete || imageIncomplete;
        }

        function renderWelcomeImageEditor(
          config,
          editor,
          section,
          hiddenOpening
        ) {
          var imageLabel = document.createElement("span");
          imageLabel.className = "bm-welcome-editor-label";
          var required = document.createElement("b");
          required.textContent = "*";
          imageLabel.appendChild(required);
          imageLabel.appendChild(document.createTextNode("图片内容"));

          var upload = document.createElement("div");
          upload.className = "bm-welcome-image-upload";
          var fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/jpeg,image/png";
          fileInput.hidden = true;

          function showError(message) {
            var error = upload.querySelector(".bm-welcome-image-error");
            if (!error) {
              error = document.createElement("span");
              error.className = "bm-welcome-image-error";
              error.setAttribute("role", "alert");
              upload.appendChild(error);
            }
            error.textContent = message;
          }

          function chooseImage() {
            fileInput.click();
          }

          fileInput.addEventListener("change", function () {
            var file = fileInput.files && fileInput.files[0];
            if (!file) return;
            if (!["image/jpeg", "image/png"].includes(file.type)) {
              showError("仅支持 JPG、PNG 格式");
              fileInput.value = "";
              return;
            }
            if (file.size > 5 * 1024 * 1024) {
              showError("图片大小不能超过 5 MB");
              fileInput.value = "";
              return;
            }
            if (config.content && config.content.indexOf("blob:") === 0) {
              URL.revokeObjectURL(config.content);
            }
            config.content = URL.createObjectURL(file);
            config.secondary = file.name;
            if (botWelcomeConfigs[0] === config) {
              syncOpeningValue(hiddenOpening, "[图片消息] " + file.name);
            }
            renderBotWelcomeConfigs(section, hiddenOpening);
          });

          if (config.content) {
            var frame = document.createElement("div");
            frame.className = "bm-welcome-image-frame";
            var preview = document.createElement("img");
            preview.className = "bm-welcome-image-preview";
            preview.src = config.content;
            preview.alt = config.secondary || "欢迎语图片预览";

            var meta = document.createElement("div");
            meta.className = "bm-welcome-image-meta";
            var fileName = document.createElement("strong");
            fileName.className = "bm-welcome-image-filename";
            fileName.textContent = config.secondary || "welcome-health-service.png";
            var note = document.createElement("p");
            note.className = "bm-welcome-image-note";
            note.appendChild(document.createTextNode("支持 JPG、PNG 格式"));
            note.appendChild(document.createElement("br"));
            note.appendChild(document.createTextNode("建议尺寸 750 × 420 px"));
            note.appendChild(document.createElement("br"));
            note.appendChild(document.createTextNode("文件不超过 5 MB"));

            var actions = document.createElement("div");
            actions.className = "bm-welcome-image-actions";
            var replaceButton = document.createElement("button");
            replaceButton.className = "bm-welcome-image-action";
            replaceButton.type = "button";
            replaceButton.textContent = "更换图片";
            replaceButton.addEventListener("click", chooseImage);
            var deleteButton = document.createElement("button");
            deleteButton.className = "bm-welcome-image-action is-danger";
            deleteButton.type = "button";
            deleteButton.textContent = "删除图片";
            deleteButton.addEventListener("click", function () {
              if (config.content.indexOf("blob:") === 0) {
                URL.revokeObjectURL(config.content);
              }
              config.content = "";
              config.secondary = "";
              if (botWelcomeConfigs[0] === config) {
                syncOpeningValue(hiddenOpening, "");
              }
              renderBotWelcomeConfigs(section, hiddenOpening);
            });
            actions.appendChild(replaceButton);
            actions.appendChild(deleteButton);
            meta.appendChild(fileName);
            meta.appendChild(note);
            meta.appendChild(actions);
            frame.appendChild(preview);
            frame.appendChild(meta);
            upload.appendChild(frame);
          } else {
            var empty = document.createElement("div");
            empty.className = "bm-welcome-image-empty";
            var imageIcon = document.createElement("i");
            imageIcon.className = "app-icon fa-solid fa-image";
            imageIcon.setAttribute("aria-hidden", "true");
            var emptyCopy = document.createElement("strong");
            emptyCopy.textContent = "请上传图片";
            var emptyNote = document.createElement("span");
            emptyNote.textContent = "支持 JPG、PNG，建议 750 × 420 px，不超过 5 MB";
            var uploadButton = document.createElement("button");
            uploadButton.className = "bm-welcome-image-action";
            uploadButton.type = "button";
            uploadButton.textContent = "上传图片";
            uploadButton.addEventListener("click", chooseImage);
            empty.appendChild(imageIcon);
            empty.appendChild(emptyCopy);
            empty.appendChild(emptyNote);
            empty.appendChild(uploadButton);
            upload.appendChild(empty);
          }

          upload.appendChild(fileInput);
          editor.appendChild(imageLabel);
          editor.appendChild(upload);
        }

        function renderBotWelcomeConfigs(section, hiddenOpening) {
          var list = section.querySelector(".bm-welcome-list");
          var addButton = section.querySelector(".bm-welcome-add");
          if (!list || !addButton || !botWelcomeConfigs) return;
          list.replaceChildren();

          botWelcomeConfigs.forEach(function (config, index) {
            var card = document.createElement("article");
            card.className = "bm-welcome-card";
            card.setAttribute("data-welcome-id", String(config.id));

            var head = document.createElement("header");
            head.className = "bm-welcome-card-head";
            var title = document.createElement("strong");
            title.textContent = "欢迎语 " + (index + 1);
            head.appendChild(title);
            if (index > 0) {
              var remove = document.createElement("button");
              remove.className = "bm-welcome-remove";
              remove.type = "button";
              remove.textContent = "删除";
              remove.setAttribute("aria-label", "删除欢迎语 " + (index + 1));
              remove.addEventListener("click", function () {
                botWelcomeConfigs = botWelcomeConfigs.filter(function (item) {
                  return item.id !== config.id;
                });
                renderBotWelcomeConfigs(section, hiddenOpening);
              });
              head.appendChild(remove);
            }
            card.appendChild(head);

            var tabs = document.createElement("div");
            tabs.className = "bm-welcome-tabs";
            tabs.setAttribute("role", "tablist");
            [
              { value: "text", label: "文本消息" },
              { value: "mini", label: "小程序卡片" },
              { value: "article", label: "推文卡片" },
              { value: "image", label: "图片消息" }
            ].forEach(function (type) {
              var tab = document.createElement("button");
              var textUsedByOther =
                type.value === "text" &&
                config.type !== "text" &&
                botWelcomeConfigs.some(function (item) {
                  return item !== config && item.type === "text";
                });
              tab.type = "button";
              tab.textContent = type.label;
              tab.className = config.type === type.value ? "is-active" : "";
              tab.setAttribute("role", "tab");
              tab.setAttribute(
                "aria-selected",
                String(config.type === type.value)
              );
              tab.disabled = textUsedByOther;
              if (textUsedByOther) tab.title = "文本消息仅可配置 1 条";
              tab.addEventListener("click", function () {
                if (config.type === type.value) return;
                if (config.content && config.content.indexOf("blob:") === 0) {
                  URL.revokeObjectURL(config.content);
                }
                var shouldShowExistingImage =
                  type.value === "image" && getBotWelcomeMode() === "edit";
                config.type = type.value;
                config.content =
                  shouldShowExistingImage
                    ? "./assets/welcome-health-service.png"
                    : "";
                config.secondary =
                  shouldShowExistingImage ? "welcome-health-service.png" : "";
                if (botWelcomeConfigs[0] === config) {
                  syncOpeningValue(
                    hiddenOpening,
                    shouldShowExistingImage
                      ? "[图片消息] welcome-health-service.png"
                      : ""
                  );
                }
                renderBotWelcomeConfigs(section, hiddenOpening);
              });
              tabs.appendChild(tab);
            });
            card.appendChild(tabs);

            var editor = document.createElement("div");
            editor.className = "bm-welcome-editor";
            if (config.type === "text") {
              var textLabel = document.createElement("span");
              textLabel.className = "bm-welcome-editor-label";
              var required = document.createElement("b");
              required.textContent = "*";
              textLabel.appendChild(required);
              textLabel.appendChild(document.createTextNode("文本内容"));
              var textarea = document.createElement("textarea");
              textarea.maxLength = 300;
              textarea.placeholder = "请输入欢迎语文本内容…";
              textarea.value = config.content || "";
              var count = document.createElement("span");
              count.className = "bm-welcome-count";
              count.textContent = textarea.value.length + " / 300";
              textarea.addEventListener("input", function () {
                config.content = textarea.value;
                count.textContent = textarea.value.length + " / 300";
                if (botWelcomeConfigs[0] === config) {
                  syncOpeningValue(hiddenOpening, config.content);
                }
                window.setTimeout(function () {
                  updateBotWelcomePublishState(section, hiddenOpening);
                }, 0);
              });
              editor.appendChild(textLabel);
              editor.appendChild(textarea);
              editor.appendChild(count);
            } else if (config.type === "image") {
              renderWelcomeImageEditor(
                config,
                editor,
                section,
                hiddenOpening
              );
            } else {
              var cardTitleLabel = document.createElement("span");
              cardTitleLabel.className = "bm-welcome-editor-label";
              var cardRequired = document.createElement("b");
              cardRequired.textContent = "*";
              cardTitleLabel.appendChild(cardRequired);
              cardTitleLabel.appendChild(
                document.createTextNode(
                  config.type === "mini" ? "小程序卡片" : "推文卡片"
                )
              );
              var cardOptions =
                config.type === "mini"
                  ? [
                      {
                        title: "登录/注册",
                        meta: "AppID: wx78230c06f6eb0e21"
                      },
                      {
                        title: "在线问诊",
                        meta: "AppID: wx3ad8f24e91c66210"
                      },
                      {
                        title: "患者随访",
                        meta: "AppID: wx6c31a19d20f47b83"
                      }
                    ]
                  : [
                      {
                        title: "糖尿病患者日常健康管理",
                        meta: "作者：卓睦鸟健康"
                      },
                      {
                        title: "科学用药与复诊提醒",
                        meta: "作者：患者服务中心"
                      },
                      {
                        title: "营养干预实用指南",
                        meta: "作者：医学内容团队"
                      }
                    ];
              var selectedCard = cardOptions.find(function (item) {
                return item.title === config.content;
              });
              var picker = document.createElement("div");
              picker.className = "bm-welcome-card-picker";
              var pickerTrigger = document.createElement("button");
              pickerTrigger.className = "bm-welcome-card-picker-trigger";
              pickerTrigger.type = "button";
              pickerTrigger.setAttribute("aria-haspopup", "listbox");
              pickerTrigger.setAttribute("aria-expanded", "false");
              pickerTrigger.setAttribute(
                "aria-label",
                config.type === "mini" ? "选择小程序卡片" : "选择推文卡片"
              );
              var pickerCopy = document.createElement("span");
              pickerCopy.className = "bm-welcome-card-picker-copy";
              if (selectedCard) {
                var selectedTitle = document.createElement("strong");
                selectedTitle.textContent = selectedCard.title;
                var selectedMeta = document.createElement("small");
                selectedMeta.textContent = selectedCard.meta;
                pickerCopy.appendChild(selectedTitle);
                pickerCopy.appendChild(selectedMeta);
              } else {
                var pickerPlaceholder = document.createElement("span");
                pickerPlaceholder.textContent =
                  config.type === "mini"
                    ? "请选择小程序卡片"
                    : "请选择推文卡片";
                pickerCopy.appendChild(pickerPlaceholder);
              }
              var searchIcon = document.createElement("span");
              searchIcon.className = "bm-welcome-search-icon";
              searchIcon.setAttribute("aria-hidden", "true");
              var pickerMenu = document.createElement("div");
              pickerMenu.className = "bm-welcome-card-picker-menu";
              pickerMenu.setAttribute("role", "listbox");
              pickerMenu.setAttribute(
                "aria-label",
                config.type === "mini" ? "小程序卡片列表" : "推文卡片列表"
              );
              pickerMenu.hidden = true;
              cardOptions.forEach(function (cardOption) {
                var option = document.createElement("button");
                option.className = "bm-welcome-card-picker-option";
                option.type = "button";
                option.setAttribute("role", "option");
                option.setAttribute(
                  "aria-selected",
                  String(cardOption.title === config.content)
                );
                if (cardOption.title === config.content) {
                  option.classList.add("is-selected");
                }
                var optionTitle = document.createElement("strong");
                optionTitle.textContent = cardOption.title;
                var optionMeta = document.createElement("small");
                optionMeta.textContent = cardOption.meta;
                option.appendChild(optionTitle);
                option.appendChild(optionMeta);
                option.addEventListener("click", function (event) {
                  event.stopPropagation();
                  config.content = cardOption.title;
                  config.secondary = cardOption.meta;
                  if (botWelcomeConfigs[0] === config) {
                    syncOpeningValue(hiddenOpening, config.content);
                  }
                  renderBotWelcomeConfigs(section, hiddenOpening);
                });
                pickerMenu.appendChild(option);
              });
              pickerTrigger.appendChild(pickerCopy);
              pickerTrigger.appendChild(searchIcon);
              pickerTrigger.addEventListener("click", function (event) {
                event.stopPropagation();
                var willOpen = !picker.classList.contains("is-open");
                document
                  .querySelectorAll(".bm-welcome-card-picker.is-open")
                  .forEach(function (item) {
                    item.classList.remove("is-open");
                    var menu = item.querySelector(
                      ".bm-welcome-card-picker-menu"
                    );
                    var trigger = item.querySelector(
                      ".bm-welcome-card-picker-trigger"
                    );
                    if (menu) menu.hidden = true;
                    if (trigger) trigger.setAttribute("aria-expanded", "false");
                  });
                picker.classList.toggle("is-open", willOpen);
                pickerMenu.hidden = !willOpen;
                pickerTrigger.setAttribute("aria-expanded", String(willOpen));
              });
              picker.appendChild(pickerTrigger);
              picker.appendChild(pickerMenu);
              editor.appendChild(cardTitleLabel);
              editor.appendChild(picker);
            }
            card.appendChild(editor);
            list.appendChild(card);
          });

          addButton.disabled = botWelcomeConfigs.length >= 10;
          addButton.textContent =
            botWelcomeConfigs.length >= 10 ? "已达配置上限" : "＋ 添加欢迎语";
          updateBotWelcomePublishState(section, hiddenOpening);
        }

        function updateBotWelcomeConfig() {
          var page = document.querySelector(".bm-create-page");
          if (!page) {
            botWelcomeConfigs = null;
            botWelcomeSequence = 1;
            botWelcomeMode = "";
            return;
          }
          var heading = page.querySelector(".bm-wizard-card > h2");
          if (!heading || heading.textContent.trim() !== "服务设置") return;
          var currentWelcomeMode = getBotWelcomeMode();
          var welcomeModeChanged =
            !!botWelcomeMode && botWelcomeMode !== currentWelcomeMode;
          if (welcomeModeChanged) {
            botWelcomeConfigs = null;
            botWelcomeSequence = 1;
          }
          botWelcomeMode = currentWelcomeMode;
          var openingField = Array.from(
            page.querySelectorAll(".bm-form-main > .bm-field")
          ).find(function (field) {
            var label = field.querySelector(":scope > span");
            return label && label.textContent.indexOf("开场白") >= 0;
          });
          if (!openingField) return;
          var hiddenOpening = openingField.querySelector("textarea");
          if (!hiddenOpening) return;
          openingField.classList.add("bm-opening-native-field");
          openingField.hidden = true;
          openingField.setAttribute("aria-hidden", "true");

          var section = page.querySelector(".bm-welcome-config");
          var sectionCreated = false;
          if (!section) {
            sectionCreated = true;
            section = document.createElement("section");
            section.className = "bm-welcome-config";
            var title = document.createElement("h3");
            title.textContent = "配置欢迎语";
            var notice = document.createElement("div");
            notice.className = "bm-welcome-notice";
            var noticeIcon = document.createElement("span");
            noticeIcon.className = "bm-welcome-notice-icon";
            noticeIcon.setAttribute("aria-hidden", "true");
            noticeIcon.textContent = "i";
            var noticeText = document.createElement("span");
            noticeText.textContent =
              "支持配置文本、图片、小程序卡片和推文卡片，其中文本仅 1 条，其他消息合计最多 9 条";
            notice.appendChild(noticeIcon);
            notice.appendChild(noticeText);
            var list = document.createElement("div");
            list.className = "bm-welcome-list";
            var addButton = document.createElement("button");
            addButton.className = "bm-welcome-add";
            addButton.type = "button";
            addButton.textContent = "＋ 添加欢迎语";
            addButton.addEventListener("click", function () {
              if (botWelcomeConfigs.length >= 10) return;
              botWelcomeSequence += 1;
              botWelcomeConfigs.push({
                id: botWelcomeSequence,
                type: "mini",
                content: "",
                secondary: ""
              });
              renderBotWelcomeConfigs(section, hiddenOpening);
            });
            section.appendChild(title);
            section.appendChild(notice);
            section.appendChild(list);
            section.appendChild(addButton);
            openingField.insertAdjacentElement("beforebegin", section);
          }

          if (!botWelcomeConfigs) {
            botWelcomeConfigs = [
              {
                id: 1,
                type: "text",
                content: hiddenOpening.value || "",
                secondary: ""
              }
            ];
            botWelcomeSequence = 1;
          }
          if (
            sectionCreated ||
            welcomeModeChanged ||
            !section.querySelector(".bm-welcome-card")
          ) {
            renderBotWelcomeConfigs(section, hiddenOpening);
          }

          page.querySelectorAll(".bm-help-card li").forEach(function (item) {
            if (item.textContent.trim() === "开场白将在首次会话时展示") {
              item.textContent = "配置的欢迎语将在首次会话时展示";
            }
          });
          updateBotWelcomePublishState(section, hiddenOpening);
        }

        function isChannelException(status) {
          return status === "已接入（离线）" || status === "已接入（二次验证）";
        }

        function setBotUnavailableTag(tag) {
          if (!tag || tag.textContent.trim() === "不可用待处理") return;
          tag.textContent = "不可用待处理";
          tag.classList.remove(
            "bm-status-info",
            "bm-status-success",
            "bm-status-danger",
            "bm-status-neutral"
          );
          tag.classList.add("bm-status-warning");
        }

        function setBotPublishedTag(tag) {
          if (!tag) return;
          if (tag.textContent.trim() !== "已发布") tag.textContent = "已发布";
          tag.classList.remove(
            "bm-status-info",
            "bm-status-warning",
            "bm-status-danger",
            "bm-status-neutral"
          );
          tag.classList.add("bm-status-success");
        }

        function openBotChannelQrDialog(mode) {
          if (document.querySelector("[data-bot-channel-qr-dialog]")) return;
          var verify = mode === "verify";
          var backdrop = document.createElement("div");
          backdrop.className = "modal-backdrop";
          backdrop.setAttribute("role", "presentation");
          backdrop.setAttribute("data-bot-channel-qr-dialog", "true");

          var modal = document.createElement("section");
          modal.className = "modal modal-sm";
          modal.setAttribute("role", "dialog");
          modal.setAttribute("aria-modal", "true");
          modal.setAttribute("aria-labelledby", "bot-channel-qr-title");

          var header = document.createElement("header");
          header.className = "modal-header";
          var title = document.createElement("h2");
          title.id = "bot-channel-qr-title";
          title.textContent = verify ? "企业微信二次验证" : "接入企业微信智能机器人";
          var closeButton = document.createElement("button");
          closeButton.className = "icon-button";
          closeButton.type = "button";
          closeButton.setAttribute("aria-label", "关闭弹窗");
          closeButton.textContent = "×";
          header.appendChild(title);
          header.appendChild(closeButton);

          var body = document.createElement("div");
          body.className = "modal-body";
          var qr = document.createElement("div");
          qr.className = "bm-wecom-qr";
          var frame = document.createElement("div");
          frame.className = "bm-wecom-qr-frame";
          var qrGraphic = createQrGraphic();
          qrGraphic.setAttribute(
            "aria-label",
            verify ? "企业微信二次验证二维码" : "企业微信智能机器人授权二维码"
          );
          frame.appendChild(qrGraphic);
          var tip = document.createElement("p");
          tip.appendChild(
            document.createTextNode("请使用企业微信扫描二维码完成")
          );
          tip.appendChild(document.createElement("br"));
          tip.appendChild(document.createTextNode(verify ? "二次验证" : "授权配置"));
          qr.appendChild(frame);
          qr.appendChild(tip);
          body.appendChild(qr);
          modal.appendChild(header);
          modal.appendChild(body);
          backdrop.appendChild(modal);

          function closeDialog() {
            document.removeEventListener("keydown", handleKeydown);
            backdrop.remove();
          }
          function handleKeydown(event) {
            if (event.key === "Escape") closeDialog();
          }
          closeButton.addEventListener("click", closeDialog);
          backdrop.addEventListener("mousedown", function (event) {
            if (event.target === backdrop) closeDialog();
          });
          document.addEventListener("keydown", handleKeydown);
          document.body.appendChild(backdrop);
          window.requestAnimationFrame(function () {
            closeButton.focus();
          });
        }

        function openBotChannelChatDialog(botName, agentName) {
          if (document.querySelector("[data-bot-channel-chat-dialog]")) return;
          var replyTimer = null;
          var backdrop = document.createElement("div");
          backdrop.className = "modal-backdrop";
          backdrop.setAttribute("role", "presentation");
          backdrop.setAttribute("data-bot-channel-chat-dialog", "true");

          var modal = document.createElement("section");
          modal.className = "modal modal-lg";
          modal.setAttribute("role", "dialog");
          modal.setAttribute("aria-modal", "true");
          modal.setAttribute("aria-labelledby", "bot-channel-chat-title");

          var modalHeader = document.createElement("header");
          modalHeader.className = "modal-header";
          var modalTitle = document.createElement("h2");
          modalTitle.id = "bot-channel-chat-title";
          modalTitle.textContent = agentName + " · 企业微信对话";
          var closeButton = document.createElement("button");
          closeButton.className = "icon-button";
          closeButton.type = "button";
          closeButton.setAttribute("aria-label", "关闭弹窗");
          closeButton.textContent = "×";
          modalHeader.appendChild(modalTitle);
          modalHeader.appendChild(closeButton);

          var modalBody = document.createElement("div");
          modalBody.className = "modal-body";
          var chat = document.createElement("div");
          chat.className = "bm-channel-chat";

          var chatHeader = document.createElement("header");
          chatHeader.className = "bm-chat-head";
          var appIcon = document.createElement("span");
          appIcon.className = "bm-chat-app";
          var appGlyph = document.createElement("i");
          appGlyph.className = "app-icon fa-solid fa-comments";
          appIcon.appendChild(appGlyph);
          var chatIdentity = document.createElement("span");
          var identityName = document.createElement("strong");
          identityName.textContent = agentName;
          var identityStatus = document.createElement("small");
          var onlineDot = document.createElement("i");
          identityStatus.appendChild(onlineDot);
          identityStatus.appendChild(document.createTextNode("企业微信 · 在线"));
          chatIdentity.appendChild(identityName);
          chatIdentity.appendChild(identityStatus);
          chatHeader.appendChild(appIcon);
          chatHeader.appendChild(chatIdentity);

          var thread = document.createElement("div");
          thread.className = "bm-chat-thread";

          function createAvatar(user) {
            var avatar = document.createElement("span");
            avatar.className = "bm-chat-avatar" + (user ? " is-user" : "");
            var icon = document.createElement("i");
            icon.className = "app-icon fa-solid " + (user ? "fa-user" : "fa-robot");
            avatar.appendChild(icon);
            return avatar;
          }

          function appendMessage(role, message, suggestions) {
            var user = role === "user";
            var row = document.createElement("article");
            row.className = "bm-chat-message" + (user ? " is-user" : "");
            var content = document.createElement("div");
            var time = document.createElement("small");
            time.textContent = new Date().toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit"
            });
            var bubble = document.createElement("div");
            bubble.className = "bm-chat-bubble";
            bubble.textContent = message;
            content.appendChild(time);
            content.appendChild(bubble);
            if (suggestions && suggestions.length) {
              var suggestionList = document.createElement("div");
              suggestionList.className = "bm-chat-suggestions";
              suggestions.forEach(function (suggestion) {
                var suggestionButton = document.createElement("button");
                suggestionButton.type = "button";
                suggestionButton.textContent = suggestion;
                suggestionButton.addEventListener("click", function () {
                  sendMessage(suggestion);
                });
                suggestionList.appendChild(suggestionButton);
              });
              content.appendChild(suggestionList);
            }
            row.appendChild(createAvatar(user));
            row.appendChild(content);
            thread.appendChild(row);
            thread.scrollTop = thread.scrollHeight;
          }

          var composer = document.createElement("div");
          composer.className = "bm-chat-composer";
          var clearButton = document.createElement("button");
          clearButton.className = "icon-button";
          clearButton.type = "button";
          clearButton.setAttribute("aria-label", "清空对话");
          var clearIcon = document.createElement("i");
          clearIcon.className = "app-icon fa-solid fa-trash-can";
          clearButton.appendChild(clearIcon);
          var input = document.createElement("textarea");
          input.setAttribute("aria-label", "聊天内容");
          input.placeholder = "输入聊天内容，Shift+Enter 换行";
          var sendButton = document.createElement("button");
          sendButton.className = "icon-button bm-chat-send";
          sendButton.type = "button";
          sendButton.setAttribute("aria-label", "发送消息");
          var sendIcon = document.createElement("i");
          sendIcon.className = "app-icon fa-solid fa-paper-plane";
          sendButton.appendChild(sendIcon);
          var disclaimer = document.createElement("small");
          disclaimer.textContent = "内容由 AI 生成，仅供参考";
          composer.appendChild(clearButton);
          composer.appendChild(input);
          composer.appendChild(sendButton);
          composer.appendChild(disclaimer);

          function sendMessage(message) {
            var text = (message || input.value).trim();
            if (!text) return;
            appendMessage("user", text);
            input.value = "";
            window.clearTimeout(replyTimer);
            replyTimer = window.setTimeout(function () {
              appendMessage(
                "bot",
                "已收到您的问题。我会根据当前 Bot 配置为您提供服务，如需人工协助也可转接医助处理。"
              );
            }, 350);
          }

          clearButton.addEventListener("click", function () {
            thread.replaceChildren();
            appendMessage("bot", "您好，我是" + agentName + "。请问有什么可以帮助您？");
          });
          sendButton.addEventListener("click", function () {
            sendMessage();
          });
          input.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          });

          appendMessage(
            "bot",
            "您好，我是" + agentName + "。请问您想了解哪些服务信息？",
            ["如何查看随访计划？", "复诊需要准备什么？", "如何联系项目医助？"]
          );
          chat.appendChild(chatHeader);
          chat.appendChild(thread);
          chat.appendChild(composer);
          modalBody.appendChild(chat);
          modal.appendChild(modalHeader);
          modal.appendChild(modalBody);
          backdrop.appendChild(modal);

          function closeDialog() {
            window.clearTimeout(replyTimer);
            document.removeEventListener("keydown", handleKeydown);
            backdrop.remove();
          }
          function handleKeydown(event) {
            if (event.key === "Escape") closeDialog();
          }
          closeButton.addEventListener("click", closeDialog);
          backdrop.addEventListener("mousedown", function (event) {
            if (event.target === backdrop) closeDialog();
          });
          document.addEventListener("keydown", handleKeydown);
          document.body.appendChild(backdrop);
          window.requestAnimationFrame(function () {
            input.focus();
          });
        }

        function updateBotCardsChannelState() {
          document.querySelectorAll(".bm-bot-card").forEach(function (card) {
            var title = card.querySelector(".bm-card-head h3");
            if (!title) return;
            var botName = title.textContent.trim();
            var statusTag = card.querySelector(".bm-status-tag");
            var published = statusTag && statusTag.textContent.trim() === "已发布";
            var footer = card.querySelector(".bm-card-actions");
            var chatButton = card.querySelector(".bm-card-chat-button");
            if (published && footer) {
              card.classList.add("has-card-chat");
              if (!chatButton) {
                chatButton = document.createElement("button");
                chatButton.className = "bm-card-chat-button";
                chatButton.type = "button";
                chatButton.textContent = "开始对话";
                chatButton.setAttribute("aria-label", botName + "开始对话");
                chatButton.setAttribute("data-bot-name", botName);
                chatButton.addEventListener("click", function (event) {
                  event.preventDefault();
                  event.stopPropagation();
                  var currentBotName = chatButton.getAttribute("data-bot-name") || botName;
                  var agentName = botCustomChatAgentByName[currentBotName] || currentBotName;
                  openBotChannelChatDialog(currentBotName, agentName);
                });
                footer.insertBefore(chatButton, footer.firstElementChild);
              }
            } else {
              card.classList.remove("has-card-chat");
              if (chatButton) chatButton.remove();
            }

            var status = botChannelStatusByName[botName];
            if (!status) return;
            var online = status === "已接入（在线）";
            var channelIcon = card.querySelector(".bm-channel");
            if (channelIcon) {
              channelIcon.classList.toggle("is-online", online);
              channelIcon.classList.toggle("is-offline", !online);
              var channelLabel = "企业微信，" + status;
              if (channelIcon.getAttribute("title") !== channelLabel) {
                channelIcon.setAttribute("title", channelLabel);
              }
              if (channelIcon.getAttribute("aria-label") !== channelLabel) {
                channelIcon.setAttribute("aria-label", channelLabel);
              }
            }

            var existing = card.querySelector("[data-channel-error-summary]");
            if (existing) existing.remove();
          });
        }

        function updateBotDetailPresentation() {
          var page = document.querySelector(".bm-detail-page");
          if (!page) return;
          var channelTab = Array.from(
            page.querySelectorAll(".bm-detail-tabs button")
          ).find(function (button) {
            return button.textContent.trim() === "接入渠道设置";
          });
          if (channelTab) channelTab.remove();

          var overviewGrid = page.querySelector(".bm-overview-grid-three");
          if (overviewGrid) {
            var basicSection = Array.from(
              overviewGrid.querySelectorAll(":scope > section")
            ).find(function (section) {
              var heading = section.querySelector(":scope > h2");
              return heading && heading.textContent.trim() === "基础信息";
            });
            if (basicSection) basicSection.remove();
            overviewGrid.classList.add("bm-overview-without-basic");

            var overviewServiceSection = Array.from(
              overviewGrid.querySelectorAll(":scope > section")
            ).find(function (section) {
              var heading = section.querySelector(":scope > h2");
              return heading && heading.textContent.trim() === "服务设置";
            });
            var overviewWelcomeLabel = overviewServiceSection && Array.from(
              overviewServiceSection.querySelectorAll("dt")
            ).find(function (label) {
              return label.textContent.trim() === "开场白";
            });
            if (overviewWelcomeLabel) overviewWelcomeLabel.textContent = "欢迎语";
          }

          var welcomeLabel = Array.from(
            page.querySelectorAll(".bm-service-detail dt")
          ).find(function (label) {
            return label.textContent.trim() === "开场白";
          });
          if (welcomeLabel) welcomeLabel.textContent = "欢迎语";

          var route = window.location.hash.replace(/^#/, "");
          var parts = route.split("?");
          if (parts[0] !== "bot-detail") return;
          var params = new URLSearchParams(parts[1] || "");
          if (params.get("tab") === "channels") {
            var botId = params.get("id") || "1";
            window.location.hash = "bot-detail?tab=overview&id=" + encodeURIComponent(botId);
          }
        }

        function updateBotChannelSettings() {
          var page = document.querySelector(".bm-detail-page");
          var settings = page && page.querySelector(".bm-channel-settings");
          if (!settings) return;
          var title = page.querySelector(".bm-detail-title h1");
          if (!title) return;
          var status = botChannelStatusByName[title.textContent.trim()] || "未接入";
          var online = status === "已接入（在线）";
          var row = settings.querySelector(".bm-channel-list-row");
          if (!row) return;

          var appIcon = row.querySelector(".bm-channel-app-icon");
          if (appIcon) appIcon.classList.toggle("is-offline", !online);

          var statusNode = row.querySelector(".bm-dot-status");
          if (statusNode && statusNode.getAttribute("data-channel-status") !== status) {
            var dot = document.createElement("i");
            statusNode.replaceChildren(dot, document.createTextNode(status));
            statusNode.classList.toggle("is-on", online);
            statusNode.setAttribute("data-channel-status", status);
          }

          var actions = row.querySelector(".bm-channel-actions");
          if (!actions) return;
          var actionText = online
            ? "开始对话"
            : status === "已接入（离线）"
              ? "上线"
              : status === "已接入（二次验证）"
                ? "二次验证"
                : "接入";
          var current = actions.querySelector("button");
          if (!current) {
            current = document.createElement("button");
            current.type = "button";
            actions.appendChild(current);
          }
          Array.from(actions.querySelectorAll("button")).slice(1).forEach(function (button) {
            button.remove();
          });
          if (current.textContent.trim() !== actionText) current.textContent = actionText;
          if (current.disabled) current.disabled = false;
          current.classList.add("bm-channel-text-action");
          if (current.getAttribute("data-channel-action") !== actionText) {
            current.setAttribute("data-channel-action", actionText);
          }
          var botName = title.textContent.trim();
          if (current.getAttribute("data-channel-bot-name") !== botName) {
            current.setAttribute("data-channel-bot-name", botName);
          }
          if (!current.hasAttribute("data-channel-action-bound")) {
            current.setAttribute("data-channel-action-bound", "true");
            current.addEventListener(
              "click",
              function (event) {
                var action = current.getAttribute("data-channel-action");
                var currentBotName = current.getAttribute("data-channel-bot-name");
                if (action === "开始对话") {
                  var customAgentName = botCustomChatAgentByName[currentBotName];
                  if (!customAgentName) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  openBotChannelChatDialog(currentBotName, customAgentName);
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (action === "上线") {
                  botChannelStatusByName[currentBotName] = "已接入（在线）";
                  botRecoveredChannelByName[currentBotName] = true;
                  updateBotChannelSettings();
                  updateBotCardsChannelState();
                } else if (action === "二次验证") {
                  openBotChannelQrDialog("verify");
                } else if (action === "接入") {
                  openBotChannelQrDialog("connect");
                }
              },
              true
            );
          }
        }

        function updateBotListFilters() {
          var filterBar = document.querySelector(".bm-list-page .bm-filter-bar");
          if (!filterBar) return;
          Array.from(filterBar.querySelectorAll(":scope > label")).forEach(function (label) {
            var fieldName = label.querySelector(":scope > span");
            if (!fieldName) return;
            var name = fieldName.textContent.trim();
            if (name === "接入渠道" || name === "项目") {
              label.remove();
              return;
            }
            if (name === "排序") {
              Array.from(label.querySelectorAll("option")).forEach(function (option) {
                if (option.textContent.trim() === "Bot 名称") option.remove();
              });
            }
          });

          var resetButton = Array.from(filterBar.querySelectorAll(":scope > button")).find(
            function (button) {
              return button.textContent.trim() === "重置";
            }
          );
          if (!resetButton) return;
          resetButton.classList.add("bm-filter-reset-button");
          var resetIcon = resetButton.querySelector(".app-icon");
          if (resetIcon) resetIcon.remove();

          var buttonGroup = filterBar.querySelector(":scope > .bm-filter-button-group");
          if (!buttonGroup) {
            buttonGroup = document.createElement("div");
            buttonGroup.className = "bm-filter-button-group";
            resetButton.insertAdjacentElement("beforebegin", buttonGroup);
            buttonGroup.appendChild(resetButton);
          }

          var queryButton = filterBar.querySelector(".bm-filter-query-button");
          if (!queryButton) {
            queryButton = document.createElement("button");
            queryButton.className = "button button-primary bm-filter-query-button";
            queryButton.type = "button";
            var queryText = document.createElement("span");
            queryText.textContent = "查询";
            queryButton.appendChild(queryText);
            queryButton.addEventListener("click", function () {
              var activeElement = document.activeElement;
              if (activeElement && filterBar.contains(activeElement)) activeElement.blur();
            });
            buttonGroup.appendChild(queryButton);
          } else if (queryButton.parentElement !== buttonGroup) {
            buttonGroup.appendChild(queryButton);
          }
          if (resetButton.nextElementSibling !== queryButton) {
            buttonGroup.insertBefore(resetButton, queryButton);
          }
        }

        function getDoctorChannelHeaders(table) {
          return Array.from(table.querySelectorAll("thead th")).map(function (header) {
            return header.textContent.trim();
          });
        }

        function getDoctorChannelTable() {
          return Array.from(document.querySelectorAll(".table-panel table")).find(
            function (table) {
              var headers = getDoctorChannelHeaders(table);
              return (
                table.getAttribute("data-doctor-channel-table") === "true" ||
                (headers.indexOf("渠道名称") >= 0 &&
                  headers.indexOf("关联租户") >= 0 &&
                  headers.indexOf("所属项目") >= 0 &&
                  headers.indexOf("企微客服") >= 0)
              );
            }
          );
        }

        function createDoctorChannelField(labelText, control) {
          var label = document.createElement("label");
          label.className = "field";
          var name = document.createElement("span");
          name.className = "field-label";
          name.textContent = labelText;
          label.appendChild(name);
          label.appendChild(control);
          return label;
        }

        function syncDoctorChannelSelect(select, values, allLabel, value) {
          var signature = values.join("\u0001");
          if (select.getAttribute("data-option-signature") !== signature) {
            select.textContent = "";
            var allOption = document.createElement("option");
            allOption.value = "";
            allOption.textContent = allLabel;
            select.appendChild(allOption);
            values.forEach(function (item) {
              var option = document.createElement("option");
              option.value = item;
              option.textContent = item;
              select.appendChild(option);
            });
            select.setAttribute("data-option-signature", signature);
          }
          select.value = value;
        }

        function collectDoctorChannelValues(table, columnIndex) {
          var values = Array.from(table.querySelectorAll("tbody tr"))
            .map(function (row) {
              var cell = row.children[columnIndex];
              return cell ? cell.textContent.trim() : "";
            })
            .filter(Boolean);
          return Array.from(new Set(values));
        }

        function applyDoctorChannelFilters(table) {
          var headers = getDoctorChannelHeaders(table);
          var nameIndex = headers.indexOf("渠道名称");
          var tenantIndex = headers.indexOf("关联租户");
          var projectIndex = headers.indexOf("所属项目");
          if (nameIndex < 0 || tenantIndex < 0 || projectIndex < 0) return;

          var keyword = doctorChannelFilterState.name.trim().toLowerCase();
          var visibleCount = 0;
          table.querySelectorAll("tbody tr").forEach(function (row) {
            var cells = row.children;
            var channelName = cells[nameIndex]
              ? cells[nameIndex].textContent.trim().toLowerCase()
              : "";
            var tenant = cells[tenantIndex]
              ? cells[tenantIndex].textContent.trim()
              : "";
            var project = cells[projectIndex]
              ? cells[projectIndex].textContent.trim()
              : "";
            var matched =
              (!keyword || channelName.indexOf(keyword) >= 0) &&
              (!doctorChannelFilterState.tenant ||
                tenant === doctorChannelFilterState.tenant) &&
              (!doctorChannelFilterState.project ||
                project === doctorChannelFilterState.project);
            row.hidden = !matched;
            if (matched) visibleCount += 1;
          });

          var page = table.closest(".page");
          var total = page && page.querySelector('.pagination[aria-label="分页"] > span');
          if (total) {
            var totalText = "共 " + visibleCount + " 条数据";
            if (total.textContent !== totalText) total.textContent = totalText;
          }
        }

        function updateDoctorChannelConfigPage() {
          var table = getDoctorChannelTable();
          if (!table) return;
          table.setAttribute("data-doctor-channel-table", "true");

          var headers = getDoctorChannelHeaders(table);
          var roleIndex = headers.indexOf("医生角色");
          if (roleIndex >= 0) {
            table.querySelectorAll("tr").forEach(function (row) {
              var cell = row.children[roleIndex];
              if (cell) cell.remove();
            });
            headers = getDoctorChannelHeaders(table);
          }

          var page = table.closest(".page");
          var tablePanel = table.closest(".table-panel");
          if (!page || !tablePanel) return;

          var filterPanel = page.querySelector(".doctor-channel-filter-panel");
          if (!filterPanel) {
            filterPanel = document.createElement("section");
            filterPanel.className =
              "filter-panel four-columns doctor-channel-filter-panel";
            filterPanel.setAttribute("aria-label", "医生注册渠道筛选");

            var tenantSelect = document.createElement("select");
            tenantSelect.id = "doctor-channel-tenant-filter";
            filterPanel.appendChild(
              createDoctorChannelField("关联租户", tenantSelect)
            );

            var projectSelect = document.createElement("select");
            projectSelect.id = "doctor-channel-project-filter";
            filterPanel.appendChild(
              createDoctorChannelField("所属项目", projectSelect)
            );

            var inputShell = document.createElement("span");
            inputShell.className = "input-shell";
            var channelInput = document.createElement("input");
            channelInput.id = "doctor-channel-name-filter";
            channelInput.type = "text";
            channelInput.placeholder = "请输入渠道名称";
            channelInput.value = doctorChannelFilterState.name;
            inputShell.appendChild(channelInput);
            filterPanel.appendChild(
              createDoctorChannelField("渠道名称", inputShell)
            );

            var actions = document.createElement("div");
            actions.className = "filter-actions";
            var queryButton = document.createElement("button");
            queryButton.className = "button button-primary";
            queryButton.type = "button";
            queryButton.innerHTML = "<span>查询</span>";
            var resetButton = document.createElement("button");
            resetButton.className = "button button-secondary";
            resetButton.type = "button";
            resetButton.innerHTML = "<span>重置</span>";
            actions.appendChild(queryButton);
            actions.appendChild(resetButton);
            filterPanel.appendChild(actions);

            queryButton.addEventListener("click", function () {
              doctorChannelFilterState = {
                tenant: tenantSelect.value,
                project: projectSelect.value,
                name: channelInput.value
              };
              applyDoctorChannelFilters(table);
            });
            resetButton.addEventListener("click", function () {
              doctorChannelFilterState = { tenant: "", project: "", name: "" };
              tenantSelect.value = "";
              projectSelect.value = "";
              channelInput.value = "";
              applyDoctorChannelFilters(table);
            });
            channelInput.addEventListener("keydown", function (event) {
              if (event.key === "Enter") queryButton.click();
            });

            tablePanel.insertAdjacentElement("beforebegin", filterPanel);
          }

          var tenantIndex = headers.indexOf("关联租户");
          var projectIndex = headers.indexOf("所属项目");
          var tenantControl = filterPanel.querySelector(
            "#doctor-channel-tenant-filter"
          );
          var projectControl = filterPanel.querySelector(
            "#doctor-channel-project-filter"
          );
          if (tenantControl && tenantIndex >= 0) {
            syncDoctorChannelSelect(
              tenantControl,
              collectDoctorChannelValues(table, tenantIndex),
              "全部租户",
              doctorChannelFilterState.tenant
            );
          }
          if (projectControl && projectIndex >= 0) {
            syncDoctorChannelSelect(
              projectControl,
              collectDoctorChannelValues(table, projectIndex),
              "全部项目",
              doctorChannelFilterState.project
            );
          }
          applyDoctorChannelFilters(table);
        }

        var projectMemberOptions = [
          {
            id: "assistant-1",
            name: "陈雨桐",
            account: "chenyutong",
            phone: "138****6698",
            role: "医助",
            enabled: true
          },
          {
            id: "assistant-2",
            name: "李思琪",
            account: "lisiqi",
            phone: "139****2286",
            role: "医助",
            enabled: true
          },
          {
            id: "assistant-3",
            name: "周婉晴",
            account: "zhouwanqing",
            phone: "136****7812",
            role: "医助",
            enabled: true
          },
          {
            id: "assistant-4",
            name: "赵可欣",
            account: "zhaokexin",
            phone: "133****1645",
            role: "医助",
            enabled: false
          },
          {
            id: "assistant-5",
            name: "孙晨曦",
            account: "sunchenxi",
            phone: "158****8016",
            role: "医助",
            enabled: true
          },
          {
            id: "user-6",
            name: "林医生",
            account: "linyisheng",
            phone: "135****3399",
            role: "医生",
            enabled: true
          },
          {
            id: "user-7",
            name: "王项目",
            account: "wangxiangmu",
            phone: "137****4508",
            role: "项目管理员",
            enabled: true
          }
        ];
        var projectMemberStateByProject = {};
        var projectMemberRowSequence = 1;
        var projectMemberToastTimer = null;

        function getProjectMemberRouteKey() {
          var match = window.location.hash.match(/[?&]id=(\d+)/);
          return match ? match[1] : "default";
        }

        function findProjectMember(id) {
          return projectMemberOptions.find(function (member) {
            return member.id === id;
          });
        }

        function findProjectMemberByName(name) {
          return projectMemberOptions.find(function (member) {
            return member.name === name;
          });
        }

        function createProjectMemberStatus(member) {
          if (!member) {
            var empty = document.createElement("span");
            empty.className = "project-member-muted";
            empty.textContent = "--";
            return empty;
          }
          var status = document.createElement("span");
          status.className = "status " +
            (member.enabled ? "is-active" : "is-inactive");
          var dot = document.createElement("span");
          dot.className = "status-dot";
          dot.setAttribute("aria-hidden", "true");
          status.appendChild(dot);
          status.appendChild(
            document.createTextNode(member.enabled ? "已启用" : "已停用")
          );
          return status;
        }

        function setProjectMemberComboOpen(combo, open) {
          if (!combo) return;
          combo.classList.toggle("is-open", open);
          var input = combo.querySelector("input[role='combobox']");
          var menu = combo.querySelector(".user-multiselect-menu");
          var icon = combo.querySelector(".project-member-name-control .app-icon");
          if (input) input.setAttribute("aria-expanded", open ? "true" : "false");
          if (menu) menu.hidden = !open;
          if (icon) {
            icon.classList.toggle("fa-chevron-up", open);
            icon.classList.toggle("fa-chevron-down", !open);
          }
        }

        function showProjectMemberToast(message, tone) {
          var current = document.querySelector("[data-project-member-toast]");
          if (current) current.remove();
          if (projectMemberToastTimer) {
            window.clearTimeout(projectMemberToastTimer);
          }
          var toast = document.createElement("div");
          toast.className = "toast project-member-toast" +
            (tone === "warning" ? " is-warning" : "");
          toast.setAttribute(
            "role",
            tone === "warning" ? "alert" : "status"
          );
          toast.setAttribute("data-project-member-toast", "true");
          var icon = document.createElement("i");
          icon.className = "fa-solid " +
            (tone === "warning"
              ? "fa-circle-exclamation"
              : "fa-circle-check") +
            " app-icon";
          icon.setAttribute("aria-hidden", "true");
          var copy = document.createElement("span");
          copy.textContent = message;
          var close = document.createElement("button");
          close.className = "icon-button";
          close.type = "button";
          close.setAttribute("aria-label", "关闭提示");
          close.innerHTML =
            '<i class="fa-solid fa-xmark app-icon" aria-hidden="true"></i>';
          close.addEventListener("click", function () {
            if (projectMemberToastTimer) {
              window.clearTimeout(projectMemberToastTimer);
            }
            projectMemberToastTimer = null;
            toast.remove();
          });
          toast.appendChild(icon);
          toast.appendChild(copy);
          toast.appendChild(close);
          document.body.appendChild(toast);
          projectMemberToastTimer = window.setTimeout(function () {
            toast.remove();
            projectMemberToastTimer = null;
          }, 2500);
        }

        function getProjectMemberState(key, originalField) {
          if (projectMemberStateByProject[key]) {
            return projectMemberStateByProject[key];
          }
          var selectedNames = Array.from(
            originalField.querySelectorAll(".user-multiselect-chip")
          ).map(function (chip) {
            return chip.textContent.trim();
          });
          var rows = selectedNames
            .map(function (name) {
              var member = findProjectMemberByName(name);
              if (!member) return null;
              return {
                rowId: "project-member-row-" + projectMemberRowSequence++,
                memberId: member.id,
                query: member.name,
                checked: false,
                error: false
              };
            })
            .filter(Boolean);
          projectMemberStateByProject[key] = { rows: rows };
          return projectMemberStateByProject[key];
        }

        function updateProjectMemberRowCells(row, rowElement) {
          var member = findProjectMember(row.memberId);
          var cells = rowElement.children;
          if (!cells[2] || !cells[3] || !cells[4]) return;
          cells[2].textContent = member ? member.phone : "--";
          cells[2].classList.toggle("project-member-muted", !member);
          cells[3].textContent = member ? member.role : "--";
          cells[3].classList.toggle("project-member-muted", !member);
          cells[4].replaceChildren(createProjectMemberStatus(member));
        }

        function renderProjectMemberOptions(row, state, combo) {
          var input = combo.querySelector("input[role='combobox']");
          var menu = combo.querySelector(".user-multiselect-menu");
          if (!input || !menu) return;
          var query = input.value.trim().toLowerCase();
          var usedMemberIds = state.rows
            .filter(function (item) {
              return item !== row && item.memberId;
            })
            .map(function (item) {
              return item.memberId;
            });
          var options = projectMemberOptions.filter(function (member) {
            if (["医助", "医生"].indexOf(member.role) < 0) return false;
            if (usedMemberIds.indexOf(member.id) >= 0) return false;
            if (!query) return true;
            return [member.name, member.account, member.phone, member.role]
              .join(" ")
              .toLowerCase()
              .indexOf(query) >= 0;
          });
          menu.replaceChildren();
          var caption = document.createElement("div");
          caption.className = "user-multiselect-caption";
          caption.textContent = options.length
            ? "输入姓名搜索，点击选择一名成员"
            : "未找到匹配成员";
          menu.appendChild(caption);
          options.forEach(function (member) {
            var option = document.createElement("button");
            var selected = row.memberId === member.id;
            option.className = "user-option" +
              (selected ? " is-selected" : "");
            option.type = "button";
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", selected ? "true" : "false");
            option.setAttribute(
              "aria-label",
              member.name + "，手机号 " + member.phone + "，角色 " + member.role
            );
            var copy = document.createElement("span");
            copy.className = "user-option-copy";
            var heading = document.createElement("span");
            heading.className = "project-member-option-heading";
            var name = document.createElement("strong");
            name.textContent = member.name;
            var role = document.createElement("span");
            role.className =
              "tag project-member-option-role" +
              (member.role === "医生"
                ? " tag-green"
                : member.role !== "医助"
                  ? " tag-gray"
                  : "");
            role.textContent = member.role;
            heading.appendChild(name);
            heading.appendChild(role);
            var meta = document.createElement("span");
            meta.className = "user-option-meta";
            var account = document.createElement("span");
            account.textContent = "账号：" + member.account;
            var phone = document.createElement("span");
            phone.className = "user-option-divider";
            phone.textContent = "手机号：" + member.phone;
            meta.appendChild(account);
            meta.appendChild(phone);
            copy.appendChild(heading);
            copy.appendChild(meta);
            option.appendChild(copy);
            option.addEventListener("click", function (event) {
              event.preventDefault();
              event.stopPropagation();
              row.memberId = member.id;
              row.query = member.name;
              row.error = false;
              input.value = member.name;
              input.removeAttribute("aria-invalid");
              combo.classList.remove("has-error");
              var error = combo.querySelector(".field-error");
              if (error) error.textContent = "";
              updateProjectMemberRowCells(row, combo.closest("tr"));
              setProjectMemberComboOpen(combo, false);
            });
            menu.appendChild(option);
          });
        }

        function syncProjectMemberHeaderCheck(editor, state) {
          var selectAll = editor.querySelector(
            "[data-project-member-select-all]"
          );
          if (!selectAll) return;
          var visibleRows = getFilteredProjectMemberRows(state);
          var selectedCount = visibleRows.filter(function (row) {
            return row.checked;
          }).length;
          selectAll.disabled = !visibleRows.length;
          selectAll.checked = Boolean(
            visibleRows.length && selectedCount === visibleRows.length
          );
          selectAll.indeterminate = Boolean(
            selectedCount && selectedCount < visibleRows.length
          );
        }

        function getFilteredProjectMemberRows(state) {
          var query = (state.searchQuery || "").trim().toLowerCase();
          if (!query) return state.rows;
          return state.rows.filter(function (row) {
            var member = findProjectMember(row.memberId);
            var name = member ? member.name : row.query || "";
            return name.toLowerCase().indexOf(query) >= 0;
          });
        }

        function renderProjectMemberRows(editor, state) {
          var body = editor.querySelector("tbody");
          if (!body) return;
          body.replaceChildren();
          var visibleRows = getFilteredProjectMemberRows(state);
          if (!visibleRows.length) {
            var emptyRow = document.createElement("tr");
            var emptyCell = document.createElement("td");
            emptyCell.className = "project-member-empty";
            emptyCell.colSpan = 5;
            emptyCell.textContent = state.rows.length && state.searchQuery
              ? "未找到匹配的项目成员"
              : "暂无项目成员，点击“添加”新增";
            emptyRow.appendChild(emptyCell);
            body.appendChild(emptyRow);
            syncProjectMemberHeaderCheck(editor, state);
            return;
          }

          visibleRows.forEach(function (row, index) {
            var rowElement = document.createElement("tr");
            rowElement.setAttribute("data-project-member-row", row.rowId);

            var checkCell = document.createElement("td");
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(row.checked);
            checkbox.setAttribute(
              "aria-label",
              "勾选第 " + (index + 1) + " 行项目成员"
            );
            checkbox.addEventListener("change", function () {
              row.checked = checkbox.checked;
              syncProjectMemberHeaderCheck(editor, state);
            });
            checkCell.appendChild(checkbox);

            var nameCell = document.createElement("td");
            var combo = document.createElement("div");
            combo.className = "project-member-combobox" +
              (row.error ? " has-error" : "");
            var inputShell = document.createElement("span");
            inputShell.className = "input-shell project-member-name-control";
            var input = document.createElement("input");
            input.type = "text";
            input.autocomplete = "off";
            input.placeholder = "请输入或选择成员姓名";
            input.value = row.memberId
              ? (findProjectMember(row.memberId) || {}).name || ""
              : row.query || "";
            input.setAttribute("role", "combobox");
            input.setAttribute("aria-autocomplete", "list");
            input.setAttribute("aria-expanded", "false");
            input.setAttribute(
              "aria-label",
              "第 " + (index + 1) + " 行成员姓名"
            );
            var menuId = row.rowId + "-options";
            input.setAttribute("aria-controls", menuId);
            if (row.error) input.setAttribute("aria-invalid", "true");
            var arrow = document.createElement("i");
            arrow.className = "fa-solid fa-chevron-down app-icon";
            arrow.setAttribute("aria-hidden", "true");
            inputShell.appendChild(input);
            inputShell.appendChild(arrow);
            var menu = document.createElement("div");
            menu.id = menuId;
            menu.className = "user-multiselect-menu";
            menu.setAttribute("role", "listbox");
            menu.setAttribute("aria-label", "项目成员候选用户");
            menu.hidden = true;
            var error = document.createElement("span");
            error.className = "field-error";
            error.setAttribute("role", "alert");
            error.textContent = row.error ? "请选择成员姓名" : "";
            combo.appendChild(inputShell);
            combo.appendChild(menu);
            combo.appendChild(error);
            nameCell.appendChild(combo);

            var phoneCell = document.createElement("td");
            var roleCell = document.createElement("td");
            var statusCell = document.createElement("td");
            rowElement.appendChild(checkCell);
            rowElement.appendChild(nameCell);
            rowElement.appendChild(phoneCell);
            rowElement.appendChild(roleCell);
            rowElement.appendChild(statusCell);
            body.appendChild(rowElement);
            updateProjectMemberRowCells(row, rowElement);

            input.addEventListener("focus", function () {
              renderProjectMemberOptions(row, state, combo);
              setProjectMemberComboOpen(combo, true);
            });
            input.addEventListener("input", function () {
              row.memberId = "";
              row.query = input.value;
              row.error = false;
              input.removeAttribute("aria-invalid");
              combo.classList.remove("has-error");
              error.textContent = "";
              updateProjectMemberRowCells(row, rowElement);
              renderProjectMemberOptions(row, state, combo);
              setProjectMemberComboOpen(combo, true);
            });
            input.addEventListener("keydown", function (event) {
              if (event.key === "Escape") {
                setProjectMemberComboOpen(combo, false);
                return;
              }
              if (event.key !== "Enter" || !combo.classList.contains("is-open")) {
                return;
              }
              var firstOption = menu.querySelector("[role='option']");
              if (!firstOption) return;
              event.preventDefault();
              firstOption.click();
            });
            inputShell.addEventListener("click", function (event) {
              if (event.target === input) return;
              input.focus();
            });
          });
          syncProjectMemberHeaderCheck(editor, state);
        }

        function createProjectMemberEditor(key, state) {
          var editor = document.createElement("div");
          editor.className = "field full-span project-members-field";
          editor.setAttribute("data-project-member-editor", "true");
          editor.setAttribute("data-project-key", key);

          var heading = document.createElement("div");
          heading.className = "project-members-heading";
          var label = document.createElement("span");
          label.className = "field-label";
          label.textContent = "项目成员";
          var actions = document.createElement("div");
          actions.className = "project-members-actions";
          var addButton = document.createElement("button");
          addButton.className = "button button-primary";
          addButton.type = "button";
          addButton.setAttribute("data-project-member-add", "true");
          addButton.innerHTML =
            '<i class="fa-solid fa-plus app-icon" aria-hidden="true"></i><span>添加</span>';
          var deleteButton = document.createElement("button");
          deleteButton.className =
            "button button-secondary project-member-delete";
          deleteButton.type = "button";
          deleteButton.setAttribute("data-project-member-delete", "true");
          deleteButton.innerHTML =
            '<i class="fa-solid fa-trash-can app-icon" aria-hidden="true"></i><span>删除</span>';
          actions.appendChild(addButton);
          actions.appendChild(deleteButton);
          heading.appendChild(label);
          heading.appendChild(actions);

          var search = document.createElement("label");
          search.className = "project-members-search";
          var searchShell = document.createElement("span");
          searchShell.className = "input-shell";
          var searchIcon = document.createElement("i");
          searchIcon.className = "fa-solid fa-magnifying-glass app-icon";
          searchIcon.setAttribute("aria-hidden", "true");
          var searchInput = document.createElement("input");
          searchInput.type = "search";
          searchInput.autocomplete = "off";
          searchInput.placeholder = "请输入成员姓名";
          searchInput.value = state.searchQuery || "";
          searchInput.setAttribute("aria-label", "查询成员姓名");
          searchShell.appendChild(searchIcon);
          searchShell.appendChild(searchInput);
          search.appendChild(searchShell);

          var tableWrap = document.createElement("div");
          tableWrap.className = "project-members-table";
          tableWrap.setAttribute("role", "region");
          tableWrap.setAttribute("aria-label", "项目成员列表");
          var table = document.createElement("table");
          var head = document.createElement("thead");
          var headRow = document.createElement("tr");
          var selectAllHead = document.createElement("th");
          var selectAll = document.createElement("input");
          selectAll.type = "checkbox";
          selectAll.setAttribute("data-project-member-select-all", "true");
          selectAll.setAttribute("aria-label", "全选项目成员");
          selectAllHead.appendChild(selectAll);
          headRow.appendChild(selectAllHead);
          ["成员姓名", "手机号", "角色", "状态"].forEach(function (text) {
            var header = document.createElement("th");
            header.textContent = text;
            headRow.appendChild(header);
          });
          head.appendChild(headRow);
          var body = document.createElement("tbody");
          table.appendChild(head);
          table.appendChild(body);
          tableWrap.appendChild(table);
          editor.appendChild(heading);
          editor.appendChild(search);
          editor.appendChild(tableWrap);

          searchInput.addEventListener("input", function () {
            state.searchQuery = searchInput.value;
            renderProjectMemberRows(editor, state);
          });

          addButton.addEventListener("click", function () {
            var row = {
              rowId: "project-member-row-" + projectMemberRowSequence++,
              memberId: "",
              query: "",
              checked: false,
              error: false
            };
            state.rows.push(row);
            state.searchQuery = "";
            searchInput.value = "";
            renderProjectMemberRows(editor, state);
          });
          deleteButton.addEventListener("click", function () {
            var selected = state.rows.filter(function (row) {
              return row.checked;
            });
            if (!selected.length) {
              showProjectMemberToast(
                "请先勾选需要删除的项目成员",
                "warning"
              );
              return;
            }
            state.rows = state.rows.filter(function (row) {
              return !row.checked;
            });
            renderProjectMemberRows(editor, state);
          });
          selectAll.addEventListener("change", function () {
            getFilteredProjectMemberRows(state).forEach(function (row) {
              row.checked = selectAll.checked;
            });
            renderProjectMemberRows(editor, state);
          });
          renderProjectMemberRows(editor, state);
          return editor;
        }

        function handleProjectMemberSave(event) {
          var editor = document.querySelector(
            "[data-project-member-editor='true']"
          );
          if (!editor) return;
          var key = editor.getAttribute("data-project-key");
          var state = projectMemberStateByProject[key];
          if (!state) return;
          var invalidRows = state.rows.filter(function (row) {
            return !row.memberId;
          });
          if (invalidRows.length) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            state.rows.forEach(function (row) {
              row.error = !row.memberId;
            });
            renderProjectMemberRows(editor, state);
            showProjectMemberToast("请选择新增行的成员姓名", "warning");
            window.requestAnimationFrame(function () {
              var invalid = editor.querySelector(
                ".project-member-combobox.has-error input"
              );
              if (invalid) invalid.focus();
            });
            return;
          }
          var page = editor.closest(".edit-page");
          var projectName = page && page.querySelector(
            "input[placeholder='请输入项目名称']"
          );
          if (!projectName || !projectName.value.trim()) return;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          showProjectMemberToast(
            window.location.hash.indexOf("mode=create") >= 0
              ? "项目已创建"
              : "项目信息已保存",
            "success"
          );
          window.location.hash = "projects";
        }

        function updateProjectMemberList() {
          if (window.location.hash.indexOf("projects") < 0) return;
          var region = document.querySelector(
            "[role='region'][aria-label='项目信息列表']"
          );
          if (!region) return;
          var page = region.closest(".page");
          var filterPanel = page && page.querySelector(
            ".filter-panel[aria-label='项目筛选']"
          );
          if (filterPanel) {
            filterPanel.classList.add("project-filter-no-tenant");
            Array.from(filterPanel.querySelectorAll(":scope > .field")).forEach(
              function (field) {
                var label = field.querySelector(":scope > .field-label");
                if (label && label.textContent.trim() === "租户名称") {
                  field.remove();
                }
              }
            );
          }
          var memberHeader = Array.from(
            region.querySelectorAll("thead th")
          ).find(function (header) {
            return ["医助", "项目成员"].indexOf(
              header.textContent.trim()
            ) >= 0;
          });
          if (memberHeader && memberHeader.textContent.trim() === "医助") {
            memberHeader.textContent = "项目成员";
          }

          region.querySelectorAll(".popover[role='dialog']").forEach(
            function (popover) {
              var label = popover.getAttribute("aria-label") || "";
              if (label.indexOf("关联医助") === 0) {
                popover.setAttribute(
                  "aria-label",
                  label.replace("关联医助", "项目成员")
                );
              }
              var title = popover.querySelector(".popover-heading strong");
              if (title && title.textContent.indexOf("关联医助") === 0) {
                title.textContent = title.textContent.replace(
                  "关联医助",
                  "项目成员"
                );
              }
              popover.classList.add("project-member-list-popover");
              if (!popover.querySelector(".popover-column-head")) {
                var columnHead = document.createElement("div");
                columnHead.className = "popover-column-head";
                ["成员姓名", "手机号", "角色"].forEach(function (text) {
                  var cell = document.createElement("span");
                  cell.textContent = text;
                  columnHead.appendChild(cell);
                });
                var heading = popover.querySelector(".popover-heading");
                if (heading) heading.insertAdjacentElement("afterend", columnHead);
              }
              popover.querySelectorAll(".popover-row").forEach(function (row) {
                if (row.children.length >= 3) return;
                var name = row.children[0]
                  ? row.children[0].textContent.trim()
                  : "";
                var role = document.createElement("span");
                role.textContent = name.indexOf("医生") >= 0 ? "医生" : "医助";
                row.appendChild(role);
              });
            }
          );
        }

        function updateProjectMemberEditor() {
          if (window.location.hash.indexOf("project-edit") < 0) {
            return;
          }
          var isCreateMode =
            window.location.hash.indexOf("mode=create") >= 0;
          var page = document.querySelector(".edit-page");
          var grid = page && page.querySelector(
            ".form-card .form-grid.two-columns"
          );
          if (!grid) return;
          var originalField = Array.from(
            grid.querySelectorAll(":scope > .field")
          ).find(function (field) {
            var label = field.querySelector(":scope > .field-label");
            return label &&
              label.textContent.replace(/\*/g, "").trim() === "医助";
          });
          if (!originalField) return;

          var key = isCreateMode ? "create" : getProjectMemberRouteKey();
          if (
            isCreateMode &&
            page.getAttribute("data-project-create-initialized") !== "true"
          ) {
            projectMemberStateByProject[key] = { rows: [] };
            page.setAttribute("data-project-create-initialized", "true");
          }
          var state = getProjectMemberState(key, originalField);
          grid.classList.add("project-edit-single-column");
          originalField.hidden = true;
          originalField.setAttribute("aria-hidden", "true");
          originalField.setAttribute("data-original-assistant-field", "true");

          var editor = grid.querySelector(
            "[data-project-member-editor='true']"
          );
          if (editor && editor.getAttribute("data-project-key") !== key) {
            editor.remove();
            editor = null;
          }
          if (!editor) {
            editor = createProjectMemberEditor(key, state);
            originalField.insertAdjacentElement("afterend", editor);
          }

          var saveButton = Array.from(
            page.querySelectorAll(".page-toolbar .page-actions button")
          ).find(function (button) {
            return button.textContent.trim() === "保存";
          });
          if (
            saveButton &&
            saveButton.getAttribute("data-project-member-save-bound") !== "true"
          ) {
            saveButton.setAttribute("data-project-member-save-bound", "true");
            saveButton.addEventListener("click", handleProjectMemberSave, true);
          }
        }

        function updateRegistrationMenu() {
          var sidebar = document.querySelector(".sidebar");
          if (!sidebar) return;

          var registrationGroup = Array.from(
            sidebar.querySelectorAll(".nav-group")
          ).find(function (group) {
            var topLabel = group.querySelector(".nav-item span");
            return topLabel && topLabel.textContent.trim() === "注册管理";
          });
          if (!registrationGroup) return;

          registrationGroup
            .querySelectorAll(".subnav button")
            .forEach(function (button) {
              var label = button.querySelector("span");
              var text = label ? label.textContent : button.textContent;
              if (text.trim() === "医生注册渠道配置") button.remove();
            });

          var topButton = registrationGroup.querySelector(".nav-item");
          if (
            !topButton ||
            topButton.hasAttribute("data-registration-menu-bound")
          ) {
            return;
          }
          topButton.setAttribute("data-registration-menu-bound", "true");
          topButton.addEventListener(
            "click",
            function (event) {
              if (topButton.classList.contains("is-active")) return;
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              window.location.hash = "patient-scenes";
            },
            true
          );
        }

        function enhanceDoctorPages() {
          updateProjectMemberEditor();
          updateProjectMemberList();
          updateRegistrationMenu();
          updateAssistantAccountList();
          updateDoctorList();
          updateDoctorUserList();
          ensureDoctorAccountCreateButton();
          updateDoctorDetail();
          updateDoctorEdcAndTimeline();
          updateDoctorEditDialog();
          updateDoctorChannelConfigPage();
          updateSceneFormLayout();
          updateSceneDoctorPicker();
          removeBotDoctorField();
          updateBotWelcomeConfig();
          updateBotCardsChannelState();
          updateBotDetailPresentation();
          updateBotChannelSettings();
          updateBotListFilters();
        }

        function queueEnhancement() {
          if (enhancementQueued) return;
          enhancementQueued = true;
          window.requestAnimationFrame(function () {
            enhancementQueued = false;
            enhanceDoctorPages();
          });
        }

        function addRect(svg, x, y, width, height, fill) {
          var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", x);
          rect.setAttribute("y", y);
          rect.setAttribute("width", width);
          rect.setAttribute("height", height);
          rect.setAttribute("fill", fill);
          svg.appendChild(rect);
        }

        function addFinder(svg, x, y) {
          addRect(svg, x, y, 7, 7, "#000");
          addRect(svg, x + 1, y + 1, 5, 5, "#fff");
          addRect(svg, x + 2, y + 2, 3, 3, "#000");
        }

        function createQrGraphic() {
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("viewBox", "0 0 33 33");
          svg.setAttribute("shape-rendering", "crispEdges");
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", "企业微信托管登录二维码");
          addRect(svg, 0, 0, 33, 33, "#fff");
          addFinder(svg, 2, 2);
          addFinder(svg, 24, 2);
          addFinder(svg, 2, 24);
          for (var y = 1; y < 32; y += 1) {
            for (var x = 1; x < 32; x += 1) {
              var inFinder = (x < 11 && y < 11) || (x > 22 && y < 11) || (x < 11 && y > 22);
              if (inFinder) continue;
              var value = (x * x + 3 * y * y + 7 * x * y + 11 * x + 13 * y) % 17;
              if (value < 8 || (x === 16 && y % 2 === 0) || (y === 16 && x % 2 === 0)) {
                addRect(svg, x, y, 1, 1, "#000");
              }
            }
          }
          return svg;
        }

        function closeQrDialog() {
          if (qrTimer) {
            window.clearInterval(qrTimer);
            qrTimer = null;
          }
          var overlay = document.getElementById("wecom-host-qr-dialog");
          if (overlay) overlay.remove();
        }

        function openQrDialog() {
          closeQrDialog();
          var overlay = document.createElement("div");
          overlay.id = "wecom-host-qr-dialog";
          overlay.className = "wecom-host-qr-overlay";
          overlay.setAttribute("role", "dialog");
          overlay.setAttribute("aria-modal", "true");
          overlay.setAttribute("aria-label", "托管企业微信账号");

          var content = document.createElement("div");
          content.className = "wecom-host-qr-content";
          var card = document.createElement("section");
          card.className = "wecom-host-qr-card";
          var close = document.createElement("button");
          close.className = "wecom-host-qr-close";
          close.type = "button";
          close.textContent = "×";
          close.setAttribute("aria-label", "关闭");
          close.addEventListener("click", closeQrDialog);

          var header = document.createElement("header");
          header.className = "wecom-host-qr-header";
          header.appendChild(close);
          var frame = document.createElement("div");
          frame.className = "wecom-host-qr-frame";
          frame.appendChild(createQrGraphic());
          var countdown = document.createElement("div");
          countdown.className = "wecom-host-qr-countdown";
          var seconds = 93;
          countdown.textContent = seconds + "秒后失效";

          var tip = document.createElement("p");
          tip.className = "wecom-host-qr-tip";
          tip.textContent = "请使用手机企业微信扫码，并在手机上确认登录";

          card.appendChild(header);
          card.appendChild(frame);
          card.appendChild(countdown);
          card.appendChild(tip);
          content.appendChild(card);
          overlay.appendChild(content);
          overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeQrDialog();
          });
          document.body.appendChild(overlay);

          qrTimer = window.setInterval(function () {
            seconds -= 1;
            countdown.textContent = Math.max(seconds, 0) + "秒后失效";
            if (seconds <= 0) {
              window.clearInterval(qrTimer);
              qrTimer = null;
            }
          }, 1000);
        }

        document.addEventListener("click", validateRequiredAssociation, true);
        document.addEventListener("click", function (event) {
          var button = event.target.closest("[data-wecom-host-account]");
          if (!button) return;
          if (button.getAttribute("data-wecom-action") === "online") {
            var detailPage = document.querySelector(".doctor-detail-page");
            var doctorName = detailPage && detailPage.querySelector(".profile-banner h1");
            if (doctorName) {
              statusByDoctor[doctorName.textContent.trim()] = "在线";
              queueEnhancement();
            }
            return;
          }
          openQrDialog();
        });
        document.addEventListener("click", function (event) {
          document.querySelectorAll(".scene-doctor-picker.is-open").forEach(function (picker) {
            if (picker.contains(event.target)) return;
            picker.classList.remove("is-open");
            var menu = picker.querySelector(".scene-doctor-picker-menu");
            var trigger = picker.querySelector(".scene-doctor-picker-trigger");
            if (menu) menu.hidden = true;
            if (trigger) trigger.setAttribute("aria-expanded", "false");
          });
          document
            .querySelectorAll(".bm-welcome-card-picker.is-open")
            .forEach(function (picker) {
              if (picker.contains(event.target)) return;
              picker.classList.remove("is-open");
              var menu = picker.querySelector(".bm-welcome-card-picker-menu");
              var trigger = picker.querySelector(
                ".bm-welcome-card-picker-trigger"
              );
              if (menu) menu.hidden = true;
              if (trigger) trigger.setAttribute("aria-expanded", "false");
            });
          document
            .querySelectorAll(".assistant-project-multiselect.is-open")
            .forEach(function (picker) {
              if (picker.contains(event.target)) return;
              setAssistantProjectPickerOpen(picker, false);
            });
          document
            .querySelectorAll(".doctor-account-project-multiselect.is-open")
            .forEach(function (picker) {
              if (picker.contains(event.target)) return;
              if (typeof picker._setOpen === "function") picker._setOpen(false);
            });
          document
            .querySelectorAll(".project-member-combobox.is-open")
            .forEach(function (combo) {
              if (combo.contains(event.target)) return;
              setProjectMemberComboOpen(combo, false);
            });
        });
        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape") {
            closeQrDialog();
            document
              .querySelectorAll(".assistant-project-multiselect.is-open")
              .forEach(function (picker) {
                setAssistantProjectPickerOpen(picker, false);
              });
          }
        });
        window.addEventListener("hashchange", queueEnhancement);
        window.addEventListener("hashchange", closeDoctorAccountDialog);
        if (root) {
          new MutationObserver(queueEnhancement).observe(root, {
            childList: true,
            subtree: true
          });
        }
        queueEnhancement();
      })();
    