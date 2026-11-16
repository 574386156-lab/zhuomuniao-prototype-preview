
      (() => {
        const profileAssets = {
          back: 'patient-profile-assets/chevron-left.svg.png',
          next: 'patient-profile-assets/chevron-right.svg.png',
          information: 'patient-profile-assets/user.svg.png',
          medicalRecord: 'patient-profile-assets/file-medical.svg.png',
          settings: 'patient-profile-assets/file-lines.svg.png',
          avatar: 'patient-profile-assets/profile-avatar.png',
        };

        const closeProfileContext = (profileLayer) => {
          const standalone = profileLayer.closest('[data-profile-standalone]');
          if (standalone) standalone.dispatchEvent(new CustomEvent('patient-profile-exit', {bubbles:true,composed:true}));
          else document.getElementById('ai-assistant-layer')?.remove();
        };

        const createMenuRow = (icon, label) => {
          const row = document.createElement('button');
          row.className = 'ai-profile-row';
          row.type = 'button';
          row.innerHTML = `
            <span class="ai-profile-row-icon" aria-hidden="true"><img src="${icon}" alt="" /></span>
            <span class="ai-profile-row-label">${label}</span>
            <img class="ai-profile-chevron" src="${profileAssets.next}" alt="" aria-hidden="true" />`;
          return row;
        };

        // Prototype-only joined projects. Keep selection during navigation in this page session.
        const joinedProjects = [
          { id: 'health-a', name: '糖脂减重' },
          { id: 'health-b', name: '爱康问答助手' },
        ];
        let activeProjectId = joinedProjects[0]?.id;

        const mountProjectPage = (profileLayer, project, trigger) => {
          if (profileLayer.querySelector('#ai-project-detail-layer')) return;
          activeProjectId = project.id;
          profileLayer.dataset.projectId = project.id;
          const layer = document.createElement('section');
          layer.id = 'ai-project-detail-layer';
          layer.setAttribute('aria-label', project.name);
          layer.innerHTML = `
            <header class="ai-profile-header">
              <button class="ai-profile-back" type="button" aria-label="返回我的"><img src="${profileAssets.back}" alt="" /></button>
              <h1 tabindex="-1">我的健康服务</h1>
            </header>
            <main class="ai-project-detail-main">
              <section class="ai-project-detail-summary"><p>已加入的健康服务</p><h2></h2></section>
              <nav class="ai-profile-menu" aria-label="健康服务"></nav>
            </main>`;
          layer.querySelector('h2').textContent = project.name;
          const informationButton = createMenuRow(profileAssets.information, '我的信息');
          informationButton.addEventListener('click', () => mountInformationPage(profileLayer, informationButton));
          const medicalRecordButton = createMenuRow(profileAssets.medicalRecord, '我的病历');
          medicalRecordButton.addEventListener('click', () => mountMedicalTimeline(profileLayer, medicalRecordButton));
          layer.querySelector('nav').append(informationButton, medicalRecordButton);
          const hostActions = profileLayer.querySelector('.ai-profile-header .ai-assistant-host-actions')?.cloneNode(true);
          if (hostActions) {
            layer.querySelector('header').appendChild(hostActions);
            hostActions.querySelector('.ai-assistant-host-button:last-child')?.addEventListener('click', () => closeProfileContext(profileLayer));
          }
          const siblings = [...profileLayer.children];
          const previousInert = siblings.map(node => node.inert);
          const scrollTop = profileLayer.querySelector('.ai-profile-main').scrollTop;
          siblings.forEach(node => { node.inert = true; });
          layer.querySelector('.ai-profile-back').addEventListener('click', () => {
            layer.remove();
            siblings.forEach((node, index) => { node.inert = previousInert[index]; });
            profileLayer.querySelector('.ai-profile-main').scrollTop = scrollTop;
            trigger.focus({ preventScroll: true });
          });
          profileLayer.appendChild(layer);
          layer.querySelector('h1').focus({ preventScroll: true });
        };

        const createProjectCards = (profileLayer) => {
          const section = document.createElement('section');
          section.className = 'ai-service-projects';
          section.setAttribute('aria-labelledby', 'ai-service-projects-title');
          section.innerHTML = '<div class="ai-service-projects-heading"><h2 id="ai-service-projects-title">我的健康服务</h2><span></span></div><div class="ai-service-project-grid"></div>';
          section.querySelector('.ai-service-projects-heading span').textContent = `已加入 ${joinedProjects.length} 项服务`;
          joinedProjects.forEach(project => {
            const card = document.createElement('button');
            card.className = 'ai-service-project-card';
            card.type = 'button';
            card.innerHTML = `<span class="ai-service-project-copy"><strong></strong></span><span class="ai-service-project-action"><span>查看服务</span><img class="ai-profile-chevron" src="${profileAssets.next}" alt="" aria-hidden="true" /></span>`;
            card.querySelector('strong').textContent = project.name;
            card.setAttribute('aria-label', `查看${project.name}`);
            card.addEventListener('click', () => mountProjectPage(profileLayer, project, card));
            section.querySelector('.ai-service-project-grid').appendChild(card);
          });
          return section;
        };

        // Session-only prototype state; no patient data is written to browser storage.
        let savedBasicInfo = { name: '', phone: '', gender: '', idCard: '', birthday: '', height: '', diagnosis: '' };
        const savedSpecialInfo = new Map();
        const emptySpecialInfo = () => ({ treatmentStage: '', medication: '', note: '' });
        const maskPhone = (phone) => phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '--';
        const updateProfileIdentity = (profileLayer) => {
          if (!savedBasicInfo.name) return;
          profileLayer.querySelector('.ai-profile-name').textContent = savedBasicInfo.name;
          profileLayer.querySelector('.ai-profile-phone').textContent = maskPhone(savedBasicInfo.phone);
        };
        // Capture the existing record forms before their completion handler removes them.
        document.addEventListener('click', (event) => {
          if (!event.target.closest('[data-record-finish]')) return;
          const basic = document.getElementById('patient-basic-record-form');
          const special = document.getElementById('patient-special-record-form');
          if (!basic || !special) return;
          savedBasicInfo = { ...Object.fromEntries(new FormData(basic)), phone: basic.elements.namedItem('phone').value };
          savedSpecialInfo.set(activeProjectId, Object.fromEntries(new FormData(special)));
        }, true);

        const mountInformationPage = (profileLayer, trigger) => {
          if (profileLayer.querySelector('#ai-information-layer')) return;
          const previousToast = profileLayer.querySelector('.ai-project-toast');
          if (previousToast) previousToast.textContent = '';
          const projectId = activeProjectId;
          const projectName = joinedProjects.find((project) => project.id === projectId)?.name || '当前健康服务';
          const layer = document.createElement('section');
          layer.id = 'ai-information-layer';
          layer.setAttribute('aria-label', '我的信息');
          const fields = [
            ['name', '姓名', 'text', true], ['phone', '手机号', 'tel', true],
            ['gender', '性别', 'select', true], ['idCard', '身份证号', 'text', false],
            ['birthday', '出生日期', 'date', false], ['height', '身高（cm）', 'number', false],
            ['diagnosis', '主要诊断', 'text', false],
            ['treatmentStage', '当前治疗阶段', 'select', false],
            ['medication', '目前用药', 'text', false], ['note', '补充说明', 'textarea', false],
          ];
          const fieldMarkup = ([key, label, type, required]) => {
            const id = `info-${key}`;
            const attrs = `id="${id}" name="${key}" aria-describedby="${id}-error" ${required ? 'required' : ''}`;
            let input;
            if (key === 'gender') input = `<select ${attrs}><option value="">请选择</option><option value="male">男</option><option value="female">女</option></select>`;
            else if (key === 'treatmentStage') input = `<select ${attrs}><option value="">请选择</option><option value="diagnosis">诊断期</option><option value="treatment">治疗期</option><option value="follow-up">随访期</option></select>`;
            else if (type === 'textarea') input = `<textarea ${attrs} placeholder="请输入补充说明" maxlength="500"></textarea>`;
            else input = `<input ${attrs} type="${type}" ${key === 'phone' ? 'inputmode="numeric" maxlength="11"' : ''} ${key === 'height' ? 'min="1" max="300" step="0.1"' : ''} ${key === 'idCard' ? 'maxlength="18"' : ''} ${['name','diagnosis','medication'].includes(key) ? 'maxlength="100"' : ''} ${type !== 'date' ? `placeholder="请输入${label}"` : ''} />`;
            if (key === 'phone') input += `
              <div class="ai-phone-verification" hidden>
                <label for="info-phoneCode"><span class="ai-information-required" aria-hidden="true">*</span>短信验证码</label>
                <div class="ai-phone-code-row">
                  <input id="info-phoneCode" name="phoneCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="请输入6位验证码" aria-describedby="info-phoneCode-hint info-phoneCode-error" />
                  <button class="ai-phone-send" type="button">发送验证码</button>
                </div>
                <p id="info-phoneCode-hint" class="ai-phone-code-hint" aria-live="polite">修改手机号后，请验证新手机号再保存。</p>
                <p id="info-phoneCode-error" class="ai-information-error" aria-live="polite"></p>
              </div>`;
            return `<div class="ai-information-field"><label for="${id}">${required ? '<span class="ai-information-required" aria-hidden="true">*</span>' : ''}${label}${required ? '' : '（选填）'}</label>${input}<p class="ai-information-error" id="${id}-error" aria-live="polite"></p></div>`;
          };
          layer.innerHTML = `
            <header class="ai-information-header">
              <button class="ai-profile-back" type="button" aria-label="返回健康服务"><img src="${profileAssets.back}" alt="" /></button>
              <h1 tabindex="-1">我的信息</h1>
            </header>
            <nav class="ai-information-tabs" role="tablist" aria-label="信息分类">
              <button class="ai-information-tab" id="info-basic-tab" type="button" role="tab" aria-selected="true" aria-controls="info-basic-panel" data-info-tab="basic">基本信息</button>
              <button class="ai-information-tab" id="info-special-tab" type="button" role="tab" aria-selected="false" aria-controls="info-special-panel" tabindex="-1" data-info-tab="special">专项信息</button>
            </nav>
            <main class="ai-information-main">
              <form id="ai-information-form" novalidate>
                <section class="ai-information-card" id="info-basic-panel" role="tabpanel" aria-labelledby="info-basic-tab">
                  ${fields.slice(0, 7).map(fieldMarkup).join('')}
                </section>
                <section class="ai-information-card" id="info-special-panel" role="tabpanel" aria-labelledby="info-special-tab" hidden>
                  <p class="ai-information-context"></p>
                  ${fields.slice(7).map(fieldMarkup).join('')}
                </section>
              </form>
            </main>
            <footer class="ai-information-footer">
              <button class="ai-information-cancel" type="button">取消</button>
              <button class="ai-information-save" type="submit" form="ai-information-form">保存修改</button>
            </footer>`;
          layer.querySelector('.ai-information-context').textContent = projectName;
          const form = layer.querySelector('form');
          const tabs = [...layer.querySelectorAll('[data-info-tab]')];
          const setInformationTab = (key, focusTab = false) => {
            tabs.forEach((tab) => {
              const active = tab.dataset.infoTab === key;
              tab.setAttribute('aria-selected', String(active));
              tab.tabIndex = active ? 0 : -1;
              layer.querySelector(`#${tab.getAttribute('aria-controls')}`).hidden = !active;
              if (active && focusTab) tab.focus();
            });
            layer.querySelector('.ai-information-main').scrollTo(0, 0);
          };
          tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => setInformationTab(tab.dataset.infoTab));
            tab.addEventListener('keydown', (event) => {
              let next;
              if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
              else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = tabs.length - 1;
              else return;
              event.preventDefault();
              setInformationTab(tabs[next].dataset.infoTab, true);
            });
          });
          const values = { ...savedBasicInfo, ...(savedSpecialInfo.get(projectId) || emptySpecialInfo()) };
          fields.forEach(([key]) => { form.elements.namedItem(key).value = values[key] || ''; });
          const phoneInput = form.elements.namedItem('phone');
          const codeInput = form.elements.namedItem('phoneCode');
          const verification = layer.querySelector('.ai-phone-verification');
          const sendCode = layer.querySelector('.ai-phone-send');
          const codeHint = layer.querySelector('#info-phoneCode-hint');
          const codeError = layer.querySelector('#info-phoneCode-error');
          // Local prototype only: no SMS is sent and no verification data is persisted.
          const demoCode = '123456';
          let sentPhone = '', expiresAt = 0, resendAt = 0, resendTimer = null;
          const updateSendButton = () => {
            const seconds = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
            sendCode.disabled = seconds > 0 || !/^1[3-9]\d{9}$/.test(phoneInput.value.trim());
            sendCode.textContent = seconds > 0 ? `${seconds}秒后重发` : '发送验证码';
            if (!seconds) { clearInterval(resendTimer); resendTimer = null; }
          };
          phoneInput.addEventListener('input', () => {
            const changed = phoneInput.value.trim() !== savedBasicInfo.phone;
            verification.hidden = !changed;
            codeInput.required = changed;
            sentPhone = ''; expiresAt = 0;
            codeInput.value = '';
            codeInput.removeAttribute('aria-invalid');
            codeError.textContent = '';
            codeHint.textContent = '修改手机号后，请验证新手机号再保存。';
            updateSendButton();
          });
          sendCode.addEventListener('click', () => {
            const phone = phoneInput.value.trim();
            if (!/^1[3-9]\d{9}$/.test(phone) || Date.now() < resendAt) return;
            sentPhone = phone;
            expiresAt = Date.now() + 5 * 60 * 1000;
            resendAt = Date.now() + 60 * 1000;
            codeInput.value = '';
            codeError.textContent = '';
            codeInput.removeAttribute('aria-invalid');
            codeHint.textContent = `验证码已模拟发送至 ${maskPhone(phone)}，5分钟内有效。原型演示验证码：${demoCode}（不会发送真实短信）。`;
            clearInterval(resendTimer);
            resendTimer = setInterval(updateSendButton, 1000);
            updateSendButton();
            codeInput.focus();
          });
          const today = new Date();
          const maxBirthday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          form.elements.namedItem('birthday').max = maxBirthday;
          const siblings = [...profileLayer.children];
          const previousInert = siblings.map((node) => node.inert);
          siblings.forEach((node) => { node.inert = true; });
          const close = () => {
            clearInterval(resendTimer);
            layer.remove(); siblings.forEach((node, i) => { node.inert = previousInert[i]; });
            trigger.focus({ preventScroll: true });
          };
          layer.querySelector('.ai-profile-back').addEventListener('click', close);
          layer.querySelector('.ai-information-cancel').addEventListener('click', close);
          form.addEventListener('input', (event) => {
            const control = event.target;
            if (!control.name) return;
            control.removeAttribute('aria-invalid');
            layer.querySelector(`#info-${control.name}-error`).textContent = '';
          });
          form.addEventListener('submit', (event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            Object.keys(data).forEach((key) => { data[key] = data[key].trim(); });
            const errors = {};
            if (!data.name) errors.name = '请输入姓名';
            if (!/^1[3-9]\d{9}$/.test(data.phone)) errors.phone = '请输入正确的11位手机号';
            if (!data.gender) errors.gender = '请选择性别';
            if (data.idCard && !/^\d{17}[\dXx]$/.test(data.idCard)) errors.idCard = '请输入18位身份证号';
            if (data.birthday && data.birthday > maxBirthday) errors.birthday = '出生日期不能晚于今天';
            if (data.height && (!Number.isFinite(Number(data.height)) || Number(data.height) <= 0 || Number(data.height) > 300)) errors.height = '请输入1至300之间的身高';
            fields.forEach(([key]) => {
              const control = form.elements.namedItem(key);
              if (!errors[key] && !control.validity.valid) errors[key] = '请检查输入内容';
              layer.querySelector(`#info-${key}-error`).textContent = errors[key] || '';
              if (errors[key]) control.setAttribute('aria-invalid', 'true');
              else control.removeAttribute('aria-invalid');
            });
            const firstError = fields.find(([key]) => errors[key]);
            if (firstError) {
              setInformationTab(fields.findIndex(([key]) => key === firstError[0]) < 7 ? 'basic' : 'special');
              form.elements.namedItem(firstError[0]).focus();
              return;
            }
            if (data.phone !== savedBasicInfo.phone) {
              let message = '';
              if (sentPhone !== data.phone) message = '请先向新手机号发送验证码';
              else if (Date.now() >= expiresAt) message = '验证码已过期，请重新发送';
              else if (!data.phoneCode) message = '请输入短信验证码';
              else if (data.phoneCode !== demoCode) message = '验证码不正确，请重新输入';
              if (message) {
                codeError.textContent = message;
                codeInput.setAttribute('aria-invalid', 'true');
                setInformationTab('basic');
                codeInput.focus();
                return;
              }
            }
            savedBasicInfo = Object.fromEntries(fields.slice(0, 7).map(([key]) => [key, data[key]]));
            savedSpecialInfo.set(projectId, Object.fromEntries(fields.slice(7).map(([key]) => [key, data[key]])));
            updateProfileIdentity(profileLayer);
            close();
            const toast = profileLayer.querySelector('.ai-project-toast');
            toast.textContent = '信息已保存';
            window.setTimeout(() => { if (toast.textContent === '信息已保存') toast.textContent = ''; }, 3000);
          });
          profileLayer.appendChild(layer);
          layer.querySelector('h1').focus({ preventScroll: true });
        };

        // Fictional records for demonstrating the timeline; no real patient data.
        const sampleMedicalRecords = [
          { id: 'sample-03', time: '2026-08-28T09:30:00', type: '门诊病历', department: '呼吸内科', title: '门诊复诊记录', summary: [['就诊类型', '门诊复诊'], ['记录内容', '记录近期身体情况、既往检查及随访安排。'], ['病历状态', '已归档']], note: '本次门诊记录为虚拟样例，不含实际诊疗建议。' },
          { id: 'sample-01', time: '2026-09-16T14:20:00', type: '影像报告', department: '医学影像科', title: '胸部 CT 检查报告', summary: [['检查部位', '胸部'], ['影像类型', 'CT'], ['检查结论', '胸部检查已完成，影像报告及对比记录已归档。'], ['DICOM', '--']], note: '报告包含检查信息、影像所见及检查结论；当前展示为虚拟样例。' },
          { id: 'sample-06', time: '2026-07-05T10:15:00', type: '病理报告', department: '病理科', title: '组织病理检查报告', summary: [['检查项目', '组织病理检查'], ['标本类型', '组织标本'], ['报告摘要', '病理检查已完成，报告已归档。']], note: '样例不展示具体病理诊断或真实标本编号。' },
          { id: 'sample-02', time: '2026-09-16T08:45:00', type: '检验报告', department: '医学检验科', title: '血常规检查报告', summary: [['检验项目', '血常规'], ['标本类型', '静脉血'], ['检验结果', '检验结果已出具，详细指标见报告。']], note: '此处仅演示检验报告的信息结构，不提供真实检验数值。' },
          { id: 'sample-04', time: '2026-08-12T11:10:00', type: '影像报告', department: '超声科', title: '腹部超声检查报告', summary: [['检查部位', '腹部'], ['影像类型', '超声'], ['检查结论', '腹部超声检查已完成，报告已归档。'], ['DICOM', '--']], note: '此条用于演示同一类型报告在不同日期的展示。' },
          { id: 'sample-08', time: '2026-06-03T09:20:00', type: '门诊病历', department: '呼吸内科', title: '首次门诊记录', summary: [['就诊类型', '首次门诊'], ['记录内容', '完成基本情况、既往史及现有检查资料登记。'], ['病历状态', '已归档']], note: '首次门诊记录为虚拟样例。' },
          { id: 'sample-05', time: '2026-07-22T15:00:00', type: '出院小结', department: '呼吸内科', title: '住院诊疗记录摘要', summary: [['入院日期', '2026-07-15'], ['出院日期', '2026-07-22'], ['病历摘要', '住院期间的检查及诊疗记录已整理归档。']], note: '样例不包含真实住院号、用药方案或个人身份信息。' },
          { id: 'sample-07', time: '2026-06-18T08:30:00', type: '检验报告', department: '医学检验科', title: '肝肾功能检查报告', summary: [['检验项目', '肝功能、肾功能'], ['标本类型', '静脉血'], ['检验结果', '报告已出具，检验项目已归档。']], note: '此处仅演示历史检验记录，不提供真实检验数值。' },
        ];

        const sampleReportImage = './page-assets/images/6dc0dc7ef3c1919be18df87de6c4757a47d471a98f9d911e866d61190b728b69.png';

        // Submitted event records stay in this prototype session; v1.7 sample records are unchanged.
        // v1.8 only: anonymous examples keep the new timeline visible after a prototype refresh.
        const eventRecords = [
          {id:'event-demo-failed',time:'',submittedAt:'2026-10-21 09:30:00',updatedAt:'2026-10-21 09:32:00',summaryStatus:'failed',content:'',interpretation:'',readings:[],files:[{id:'failed-demo-report',name:'复查报告示例.png',format:'image',src:sampleReportImage,demo:true}]},
          {id:'event-demo-multipage',calendarEvents:[{"type":"treatment"}],interpretationStatus:'failed',time:'2026-10-20',submittedAt:'2026-10-20 09:30:00',content:'腹腔镜胰十二指肠切除术。术后 6 次辅助化疗（FOLFOX，家属口述小剂量，具体未知）。',interpretation:'',readings:[],files:[{id:'merge-demo-page-1',name:'复查报告-第1页.png',format:'image',src:sampleReportImage,demo:true},{id:'merge-demo-page-2',name:'复查报告-第2页.png',format:'image',src:sampleReportImage,demo:true},{id:'merge-demo-outpatient',name:'门诊记录.png',format:'image',src:sampleReportImage,demo:true}]},
          { id:'event-demo-01',calendarEvents:[{"type":"assessment"}],time:'2026-10-19',submittedAt:'2026-10-19 00:00',content:'打球扭到腰后，反复腰痛，2 月体重下降 10 斤。',interpretation:'',readings:[{id:'demo-reading-1',fileIds:['demo-report-page-1','demo-report-page-2'],content:'这组材料记录了打球扭到腰后出现反复腰痛的经过。原文未说明腰痛的明确病因，此处仅整理症状记录。（示例解读）',status:'completed',source:'conversation',createdAt:'2026-10-19 10:14:00'},{id:'demo-reading-2',fileIds:['demo-outpatient'],content:'门诊记录另提及 2 个月体重下降 10 斤。该项作为病历中记录的体重变化单独呈现，不根据这一信息补充诊断结论。（示例解读）',status:'completed',source:'conversation',createdAt:'2026-10-19 10:18:00'}],files:[{id:'demo-report-page-1',name:'复查报告-第1页.png',format:'image',src:sampleReportImage,demo:true},{id:'demo-report-page-2',name:'复查报告-第2页.png',format:'image',src:sampleReportImage,demo:true},{id:'demo-outpatient',name:'门诊记录.png',format:'image',src:sampleReportImage,demo:true}] },
          { id:'event-demo-02',calendarEvents:[{"type":"exam"}],time:'2026-10-12',submittedAt:'2026-10-12 00:00',content:'PET-CT：右肺上叶 80mm 肿块（SUVmax 14.6）；L3 椎体溶骨性破坏+病理性骨折（SUVmax 9.1）。',interpretation:'',files:[{name:'示例病历材料.png',format:'image',src:sampleReportImage,demo:true}] },
          {id:'event-demo-mr',calendarEvents:[{"type":"exam"}],time:'2026-09-28',submittedAt:'2026-10-20 09:10:00',content:'脊柱 MR：L3 椎旁肿块，L3/4 左侧神经根受压。',interpretation:'',readings:[],files:[{name:'示例影像资料.png',format:'image',src:sampleReportImage,demo:true}]},
          {id:'event-demo-procedure',calendarEvents:[{"type":"treatment"}],time:'2026-09-28',submittedAt:'2026-10-20 09:09:00',content:'经皮 L3 椎体活检+微波消融术。术前检验未见明显异常。',interpretation:'',readings:[],files:[{name:'示例手术资料.png',format:'image',src:sampleReportImage,demo:true}]},
          {id:'event-demo-labs',calendarEvents:[{"type":"lab"},{"type":"exam"}],time:'2026-09-28',submittedAt:'2026-10-20 09:08:00',content:'WBC 28.31↑，HGB 124↓，LDH 303↑。\n肺功能：中重度混合性通气障碍，弥散功能中度下降。\n心脏超声：EF 69%，结构功能正常。',interpretation:'',readings:[],files:[{name:'示例检查资料.png',format:'image',src:sampleReportImage,demo:true}]}
        ];
        const eventSubscribers=new Set();
        const eventStatus=record=>record.summaryStatus||'completed';
        const eventStatusLabel=record=>eventStatus(record)==='processing'?'总结中':eventStatus(record)==='failed'?'处理失败':'已完成';
        const eventNow=()=>new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'});
        const observeEventLayer=(layer,refresh)=>{const sub={layer,refresh};eventSubscribers.add(sub);return ()=>eventSubscribers.delete(sub);};
        const notifyEventRecords=()=>{eventSubscribers.forEach(sub=>{if(!sub.layer.isConnected)eventSubscribers.delete(sub);else sub.refresh();});window.dispatchEvent(new Event('patient-record-background-change'));};
        // Association comes from the actual files used by each reading request, never from inferred report types.
        function medicalReadingExample(record) {
          var content=String(record.content||'').trim();
          if(!content)return '';
          if(content.indexOf("腹腔镜胰十二指肠切除术")>=0)return "这条病历记录了手术及术后辅助化疗经过：已行腹腔镜胰十二指肠切除术，术后完成 6 次 FOLFOX 辅助化疗。“小剂量”为家属口述，具体剂量未记录，不能据此补充具体用药剂量。（示例解读）";
          if(content.indexOf("打球扭到腰后")>=0)return "这条记录包含活动后反复腰痛，以及 2 个月体重下降 10 斤两部分信息。病历仅描述了症状和体重变化，未提供明确诊断或病因结论。（示例解读）";
          if(content.indexOf("PET-CT")>=0)return "报告分别记录了肺部和腰椎的影像表现：右肺上叶见 80mm 肿块，SUVmax 为 14.6；L3 椎体见溶骨性破坏及病理性骨折，SUVmax 为 9.1。这里保留报告中的部位、大小和数值，不据此补充病理诊断或疾病分期。（示例解读）";
          if(content.indexOf("脊柱 MR")>=0)return "这份 MR 记录的主要信息为 L3 椎旁肿块，以及 L3/4 左侧神经根受压。原文未提供肿块性质或病理结论，示例仅说明报告已记录的检查表现。（示例解读）";
          if(content.indexOf("经皮 L3 椎体活检")>=0)return "病历记载了经皮 L3 椎体活检和微波消融术，术前检验未见明显异常。当前记录未包含活检病理结果或术后疗效结论，这些信息不作补充。（示例解读）";
          if(content.indexOf("WBC 28.31")>=0)return "这份病历汇集了血液检验、肺功能和心脏超声三部分结果：WBC 28.31↑、HGB 124↓、LDH 303↑；肺功能为中重度混合性通气障碍、弥散功能中度下降；心脏超声 EF 69%，结构功能正常。各项结果按原文分别呈现，不额外推断异常原因。（示例解读）";
          return '本次病历记录：'+content+'。以上按现有病历内容整理，未补充原文未记载的诊断、治疗或疗效结论。（示例解读）';
        }
        function medicalReportReadingStatus(record) {
          if(record.interpretationStatus)return record.interpretationStatus;
          var readings=record.readings||[];
          return readings.some(function(reading){return reading.status==='processing';})?'processing':readings.some(function(reading){return reading.status==='failed';})?'failed':'completed';
        }
        function addMedicalReadingExample(record) {
          if(medicalReportReadingStatus(record)!=='completed')return;
          var text=medicalReadingExample(record);
          record.readings.forEach(function(reading){if(reading.example)reading.content=text;});
          if((record.summaryStatus||'completed')!=='completed'||!text||!record.files.length||record.readings.some(function(reading){return reading.status==='completed'&&reading.content&&reading.content.trim();}))return;
          record.readings.push({id:record.id+'-example-reading',fileIds:record.files.map(function(file){return file.id;}),content:text,status:'completed',example:true});
        }
        function medicalReadingPlaceholder(record) {
          return record.summaryStatus==='failed'?'病历内容尚未生成，暂无可展示的解读内容。':record.summaryStatus==='processing'?'报告正在后台整理，解读内容将在处理完成后展示。':'暂无可展示的解读内容。';
        }
        const ensureEventReadings=record=>{
          record.files.forEach((file,index)=>{if(!file.id)file.id=record.id+'-file-'+(index+1);});
          if(!Array.isArray(record.readings))record.readings=record.interpretation?.trim()?[{id:record.id+'-existing-reading',fileIds:record.files.map(file=>file.id),content:record.interpretation,status:'completed',source:'existing',createdAt:record.updatedAt||record.submittedAt}]:[];
          const ids=new Set(record.files.map(file=>file.id));
          record.readings=record.readings.filter(reading=>reading.fileIds?.length&&reading.fileIds.every(id=>ids.has(id)));
          addMedicalReadingExample(record);
          return record.readings;
        };
        const completedEventReadings=record=>ensureEventReadings(record).filter(reading=>reading.status==='completed'&&reading.content?.trim());
        // Prototype summarization continues independently of navigation and file-reading jobs.
        const completeEventSummary=record=>{
          const failed=record.files.every(file=>file.size===0);record.jobRunning=false;record.summaryStatus=failed?'failed':'completed';
          if(!failed){record.time='2026-10-19';record.calendarEvents=[{type:'exam'}];record.content='PET-CT：右肺上叶 80mm 肿块（SUVmax 14.6）；L3 椎体溶骨性破坏+病理性骨折（SUVmax 9.1）。';}
          record.updatedAt=eventNow();notifyEventRecords();
        };
        // Advance the prototype to the ready-notification state only when returning from submission.
        window.completePatientEventSummaryDemo=record=>{
          if(!record||!eventRecords.includes(record)||eventStatus(record)!=='processing')return;
          record.jobRun=(record.jobRun||0)+1;completeEventSummary(record);
        };
        const runEventBackground=record=>{
          if(eventStatus(record)==='processing'&&record.jobRunning)return;
          const run=(record.jobRun||0)+1;record.jobRun=run;record.summaryStatus='processing';record.jobRunning=true;
          record.updatedAt=eventNow();notifyEventRecords();
          window.setTimeout(()=>{
            if(record.jobRun!==run)return;
            completeEventSummary(record);
          },20000);
        };
        const runFileReading=(record,fileIds)=>{
          const readings=ensureEventReadings(record),ids=[...new Set(fileIds)];
          const files=record.files.filter(file=>ids.includes(file.id));if(files.length!==ids.length||!ids.length)return;
          if(readings.some(reading=>reading.status==='processing'&&reading.fileIds.some(id=>ids.includes(id))))return;
          let reading=readings.find(item=>item.status==='failed'&&item.fileIds.length===ids.length&&item.fileIds.every(id=>ids.includes(id)));
          if(!reading){reading={id:record.id+'-reading-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),fileIds:ids,source:'file',content:''};record.readings.push(reading);}
          reading.status='processing';reading.createdAt=eventNow();const run=(reading.run||0)+1;reading.run=run;record.updatedAt=reading.createdAt;notifyEventRecords();
          window.setTimeout(()=>{
            if(reading.run!==run)return;
            const failed=files.every(file=>file.size===0);reading.status=failed?'failed':'completed';
            if(!failed)reading.content='本次解读依据「'+files.map(file=>file.name).join('、')+'」生成，可从检查项目、主要结果和报告结论三个部分查阅。建议结合既往资料及报告原文了解本次记录。（AI 解读演示内容）';
            reading.createdAt=eventNow();record.updatedAt=reading.createdAt;record.interpretationStatus=failed?'failed':'completed';if(!failed)reading.content=medicalReadingExample(record)||reading.content;notifyEventRecords();
          },20000);
        };
        const retryEventReportReading=record=>{
          if(medicalReportReadingStatus(record)!=='failed')return;
          record.interpretationStatus='processing';
          runFileReading(record,record.files.map(file=>file.id));
        };
        window.savePatientEventRecord=record=>{
          const existing=eventRecords.find(item=>item.id===record.id);if(existing)return existing;
          const saved={...record,time:record.time||'',content:record.content||'',interpretation:record.interpretation||'',updatedAt:record.updatedAt||record.submittedAt,files:record.files.map(file=>({...file})),...(Array.isArray(record.readings)?{readings:record.readings.map(reading=>({...reading,fileIds:[...reading.fileIds]}))}:{})};
          ensureEventReadings(saved);eventRecords.push(saved);
          if(saved.summaryStatus==='processing')runEventBackground(saved);else notifyEventRecords();return saved;
        };
        const eventHeader = (title, backLabel) => {
          const header = document.createElement('header');
          header.className = 'ai-timeline-header';
          header.innerHTML = `<button class="ai-profile-back" type="button"><img src="${profileAssets.back}" alt=""></button><h1 tabindex="-1"></h1>`;
          header.querySelector('button').setAttribute('aria-label', backLabel);
          header.querySelector('h1').textContent = title;
          return header;
        };
        const appendEventLayer = (profileLayer, layer, trigger) => {
          const siblings = [...profileLayer.children];
          const previousInert = siblings.map(node => node.inert);
          siblings.forEach(node => node.inert = true);
          const actions = profileLayer.querySelector('.ai-profile-header .ai-assistant-host-actions')?.cloneNode(true);
          if (actions) {
            layer.querySelector('header').appendChild(actions);
            actions.querySelector('.ai-assistant-host-button:last-child')?.addEventListener('click', () => closeProfileContext(profileLayer));
          }
          const close = () => {
            layer.cleanupEventLayer?.();
            layer.remove();
            siblings.forEach((node,index) => node.inert = previousInert[index]);
            if (trigger?.isConnected) trigger.focus({preventScroll:true});
          };
          layer.querySelector('.ai-profile-back').addEventListener('click',close);
          profileLayer.appendChild(layer);
          layer.querySelector('h1').focus({preventScroll:true});
          return close;
        };
        const mountEventOriginal = (profileLayer, file, trigger) => {
          if (profileLayer.querySelector('#ai-event-original-layer')) return;
          const layer=document.createElement('section');
          layer.id='ai-event-original-layer';
          layer.setAttribute('aria-label','文件原件');
          layer.appendChild(eventHeader('文件原件','返回病历详情'));
          const viewport=document.createElement('main');
          viewport.className='ai-event-original-main';
          const footer=document.createElement('footer');
          footer.className='ai-event-original-footer';
          const name=document.createElement('span');name.textContent=file.name;footer.appendChild(name);
          if (file.format==='image') {
            const image=document.createElement('img');image.src=file.src;image.alt=file.name;viewport.appendChild(image);
            const zoom=document.createElement('button');zoom.type='button';zoom.className='ai-event-text-button';zoom.textContent='放大';zoom.setAttribute('aria-pressed','false');
            zoom.addEventListener('click',()=>{const expanded=zoom.getAttribute('aria-pressed')!=='true';zoom.setAttribute('aria-pressed',String(expanded));zoom.textContent=expanded?'缩小':'放大';image.style.width=expanded?'200%':'100%';image.style.maxWidth=expanded?'none':'100%';});
            footer.appendChild(zoom);
          } else if (file.format==='pdf') {
            const frame=document.createElement('iframe');frame.src=file.src;frame.title=file.name;viewport.appendChild(frame);
          } else {
            const copy=document.createElement('p');copy.textContent='请下载原件，使用支持 WORD 的应用查看。';viewport.appendChild(copy);
          }
          const download=document.createElement('a');download.href=file.src;download.download=file.name;download.textContent='下载原件';footer.appendChild(download);
          layer.append(viewport,footer);
          const close=appendEventLayer(profileLayer,layer,trigger);
          layer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
        };
        const mountEventDetail=(timelineLayer,record,trigger)=>{
          const profileLayer=timelineLayer.parentElement;if(profileLayer.querySelector('#ai-event-detail-layer'))return;
          const layer=document.createElement('section');layer.id='ai-event-detail-layer';layer.dataset.recordId=record.id;layer.setAttribute('aria-label','病历详情');
          const header=eventHeader('病历详情','返回病历时间轴');header.className='ai-record-detail-header';layer.appendChild(header);
          const main=document.createElement('main');main.className='ai-event-detail-main ai-record-detail-main';layer.appendChild(main);
          let editing=false;
          const appendText=(parent,tag,text)=>{const node=document.createElement(tag);node.textContent=text;parent.appendChild(node);return node;};
          const actionButton=(parent,text,action)=>{const button=document.createElement('button');button.type='button';button.className='ai-event-text-button';button.textContent=text;button.addEventListener('click',action);parent.appendChild(button);return button;};
          const renderReadingModules=()=>{
            const readings=completedEventReadings(record);
            if(medicalReportReadingStatus(record)==='completed'){
              const module=document.createElement('section');module.className='ai-event-card ai-event-readings';appendText(module,'h2','报告解读');
              const content=[...new Set(readings.map(reading=>reading.content.trim()).filter(Boolean))].join('\n\n')||medicalReadingPlaceholder(record);
              const body=appendText(module,'p',content);body.style.whiteSpace='pre-wrap';main.appendChild(module);
            }
            const files=document.createElement('section');files.className='ai-event-card';files.innerHTML='<div class="ai-event-section-heading"><h2>文件原件</h2></div><div class="ai-event-files"></div>';
            record.files.forEach(file=>{
              const entry=document.createElement('div');entry.className='ai-event-file-entry';entry.dataset.eventFileId=file.id;
              const row=document.createElement('div');row.className='ai-event-file-row';
              const preview=document.createElement('button');preview.type='button';preview.className='ai-event-file';
              const image=document.createElement('img');image.src=file.format==='image'?file.src:profileAssets.medicalRecord;image.alt='';const copy=document.createElement('span');appendText(copy,'strong',file.name);appendText(copy,'small',file.format==='image'?'图片':file.format==='pdf'?'PDF':'WORD');preview.setAttribute('aria-label',`查看原件：${file.name}`);preview.append(image,copy);preview.addEventListener('click',()=>mountEventOriginal(profileLayer,file,preview));row.appendChild(preview);
              entry.appendChild(row);files.querySelector('.ai-event-files').appendChild(entry);
            });
            main.appendChild(files);
          };
          const edit=()=>{
            editing=true;const scroll=main.scrollTop;main.replaceChildren();const form=document.createElement('form');form.className='ai-event-card ai-event-edit';form.innerHTML='<h2>编辑就诊信息</h2><label>病历时间<input type="date" name="visitDate" required></label><label>病历内容<textarea name="visitContent" rows="7" required></textarea></label><div class="ai-event-edit-actions"></div>';
            form.elements.visitDate.value=record.time;form.elements.visitContent.value=record.content;
            form.elements.visitContent.addEventListener('input',()=>form.elements.visitContent.setCustomValidity(''));
            actionButton(form.querySelector('.ai-event-edit-actions'),'取消',()=>{editing=false;refresh();main.scrollTop=scroll;});
            const save=actionButton(form.querySelector('.ai-event-edit-actions'),'保存修改',()=>form.requestSubmit());save.classList.add('is-primary');
            form.addEventListener('submit',event=>{event.preventDefault();const content=form.elements.visitContent;content.setCustomValidity(content.value.trim()?'':'请填写病历内容');if(!form.reportValidity())return;record.time=form.elements.visitDate.value;record.content=content.value.trim();record.summaryStatus='completed';record.updatedAt=eventNow();editing=false;notifyEventRecords();});
            main.appendChild(form);form.elements.visitDate.focus();
          };
          const refresh=()=>{
            if(editing)return;const scroll=main.scrollTop;const focusedFile=layer.getRootNode().activeElement?.dataset.readingFileId;main.replaceChildren();
            const summary=document.createElement('section');summary.className='ai-record-detail-summary';summary.setAttribute('aria-label','病历信息');summary.innerHTML='<dl class="ai-record-detail-meta"><dt>创建时间：</dt><dd data-created></dd><dt>更新时间：</dt><dd data-updated></dd></dl>';
            summary.querySelector('[data-created]').textContent=record.submittedAt||'--';summary.querySelector('[data-updated]').textContent=record.updatedAt||record.submittedAt||'--';main.appendChild(summary);
            const info=document.createElement('section');info.className='ai-event-card';main.appendChild(info);
            const status=eventStatus(record);const badge=appendText(info,'span',eventStatusLabel(record));badge.className='ai-event-status is-'+status;
            if(medicalReportReadingStatus(record)!=='completed'){const readingBadge=appendText(info,'span',medicalReportReadingStatus(record)==='failed'?'报告解读失败':'报告解读中');readingBadge.className='ai-event-status is-'+(medicalReportReadingStatus(record)==='failed'?'failed':'processing');readingBadge.style.marginLeft='8px';}
            if(status!=='processing') {
              const heading=document.createElement('div');heading.className='ai-event-section-heading';appendText(heading,'h2','病历记录');
              const actions=document.createElement('div');actions.className='ai-event-summary-actions';actions.style.display='flex';actions.style.alignItems='center';actions.style.gap='16px';actions.style.whiteSpace='nowrap';
              if(status==='failed')actionButton(actions,'重新总结',()=>runEventBackground(record));
              const readingStatus=medicalReportReadingStatus(record);
              if(readingStatus==='failed'||readingStatus==='processing'){const retry=actionButton(actions,readingStatus==='processing'?'正在重新解读':'重新解读报告',()=>retryEventReportReading(record));retry.disabled=readingStatus==='processing';}
              actionButton(actions,'编辑',edit);if(readingStatus!=='completed'){heading.style.flexWrap='wrap';actions.style.flexWrap='wrap';}heading.appendChild(actions);info.appendChild(heading);
            }
            if(status==='completed') {
              const fields=document.createElement('dl');fields.innerHTML='<div><dt>病历时间</dt><dd data-time></dd></div><div><dt>病历内容</dt><dd data-content></dd></div>';fields.querySelector('[data-time]').textContent=record.time;fields.querySelector('[data-content]').textContent=record.content;info.appendChild(fields);
            } else {
              if(status==='processing')appendText(info,'h2','正在整理病历');
              appendText(info,'p',status==='processing'?'报告已提交，AI 正在后台整理病历时间和内容，通常需要几分钟。您可以离开此页，稍后在「我的病历」中查看。':'报告原件已保存，您可以重新总结，或手动补充就诊信息。');
            }
            renderReadingModules();main.scrollTop=scroll;
            if(focusedFile)[...main.querySelectorAll('[data-reading-file-id]')].find(button=>button.dataset.readingFileId===focusedFile)?.focus({preventScroll:true});
          };
          layer.cleanupEventLayer=observeEventLayer(layer,refresh);appendEventLayer(profileLayer,layer,trigger);refresh();
        };
        const eventCardTypes=[{id:'diagnosis',label:'诊断'},{id:'treatment',label:'治疗'},{id:'exam',label:'检查'},{id:'lab',label:'检验'},{id:'pathology',label:'病理/基因'},{id:'assessment',label:'病情评估'}];
        // Reuse explicit example metadata; cards do not infer a type from a failed summary.
        const appendEventCardTypes=(parent,record)=>{
          const ids=new Set((record.calendarEvents||[]).map(event=>event.type));
          const types=eventCardTypes.filter(type=>ids.has(type.id));
          (types.length?types:[{id:'unknown',label:'待识别'}]).forEach(type=>{
            const tag=document.createElement('span');tag.className='ai-event-type-tag is-'+type.id;tag.textContent=type.label;parent.appendChild(tag);
          });
        };
        const appendEventCardThumbnails=(parent,record)=>{
          const gallery=document.createElement('div');gallery.className='ai-event-card-thumbnails';gallery.setAttribute('aria-label','已保存的文件缩略图');
          record.files.slice(0,3).forEach(file=>{
            const tile=document.createElement('figure');tile.className='ai-event-card-thumbnail';
            if(file.format==='image'){const img=document.createElement('img');img.src=file.src;img.alt=file.name;tile.appendChild(img);}
            else {const doc=document.createElement('span');doc.className='ai-event-document-thumbnail';doc.textContent=file.format==='pdf'?'PDF':'WORD';tile.appendChild(doc);}
            const name=document.createElement('figcaption');name.textContent=file.name;name.title=file.name;tile.appendChild(name);gallery.appendChild(tile);
          });
          if(record.files.length>3){const more=document.createElement('span');more.className='ai-event-thumbnail-more';more.textContent='+'+(record.files.length-3);gallery.appendChild(more);}
          parent.appendChild(gallery);
        };
        const mountEventTimeline=(profileLayer,trigger,options={})=>{
          if(profileLayer.querySelector('#ai-timeline-layer'))return;
          const layer=document.createElement('section');layer.id='ai-timeline-layer';layer.setAttribute('aria-label','病历时间轴');layer.appendChild(eventHeader('病历时间轴',options.onBack?'返回聊天':trigger?.closest('#ai-project-detail-layer')?'返回健康服务':'返回我的'));
          const main=document.createElement('main');main.className='ai-timeline-main';main.innerHTML='<div class="ai-timeline-intro"><h2>病历时间轴</h2><span class="ai-timeline-count"></span></div><ol class="ai-timeline-list" aria-label="病历记录"></ol><p class="ai-event-empty" hidden>暂无病历记录，可通过病历上传链接提交后查看。</p><p class="ai-timeline-end">已展示全部病历</p>';layer.appendChild(main);
          let observer;
          const renderRecords=()=>{
            const scroll=main.scrollTop;observer?.disconnect();
            const records=(options.records||eventRecords).filter(record=>['failed','completed'].includes(eventStatus(record))).sort((a,b)=>Number(eventStatus(b)!=='completed')-Number(eventStatus(a)!=='completed')||(b.time||b.submittedAt).localeCompare(a.time||a.submittedAt)||b.submittedAt.localeCompare(a.submittedAt));
            main.querySelector('.ai-timeline-count').textContent=`共 ${records.length} 条`;main.querySelector('.ai-event-empty').hidden=records.length>0;main.querySelector('.ai-timeline-end').hidden=!records.length;
            const list=main.querySelector('ol');list.replaceChildren();
            observer=new ResizeObserver(entries=>entries.forEach(({target})=>{const button=target.nextElementSibling;if(button.getAttribute('aria-expanded')==='true')return;button.hidden=target.scrollHeight<=target.clientHeight+1;}));
            records.forEach(record=>{
              const status=eventStatus(record),date=status==='failed'?'':record.time||record.submittedAt.slice(0,10);
              const item=document.createElement('li');item.className='ai-timeline-item';item.dataset.timelineRecord=record.id;
              item.innerHTML=`<span class="ai-timeline-node" aria-hidden="true"><img src="${profileAssets.medicalRecord}" alt=""></span><article class="ai-timeline-card"><header class="ai-timeline-card-header"><time class="ai-timeline-date"></time><button class="ai-timeline-details-button" type="button">查看详情</button></header><div class="ai-event-card-types" aria-label="事件类型"></div><div class="ai-event-card-body"></div><div class="ai-event-card-footer"><div class="ai-event-timeline-status"><span></span><small></small></div></div></article>`;
              const card=item.querySelector('article'),header=item.querySelector('.ai-timeline-card-header'),body=item.querySelector('.ai-event-card-body'),statusRow=item.querySelector('.ai-event-timeline-status');
              card.setAttribute('aria-label',status==='failed'?'处理失败病历记录':`${date} 病历记录`);
              if(status==='failed'){item.querySelector('time').remove();header.style.justifyContent='flex-end';appendEventCardThumbnails(body,record);}
              else {
                item.querySelector('time').dateTime=date;item.querySelector('time').textContent=date;
                const content=document.createElement('p');content.className='ai-event-excerpt';content.dataset.collapsed='true';content.id=`event-content-${record.id}`;content.textContent=record.content;
                const more=document.createElement('button');more.className='ai-event-more';more.type='button';more.textContent='展示更多';more.hidden=true;more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls',content.id);
                more.addEventListener('click',()=>{const expanded=more.getAttribute('aria-expanded')!=='true';more.setAttribute('aria-expanded',String(expanded));more.textContent=expanded?'收起':'展示更多';content.dataset.collapsed=String(!expanded);});body.append(content,more);observer.observe(content);
              }
              const badge=statusRow.querySelector('span');badge.className='ai-event-status is-'+status;badge.textContent=eventStatusLabel(record);
              if(medicalReportReadingStatus(record)==='completed'&&completedEventReadings(record).length){const readingTag=document.createElement('span');readingTag.className='ai-event-reading-tag';readingTag.textContent='含报告解读';badge.after(readingTag);}
              else if(medicalReportReadingStatus(record)==='processing'){const readingTag=document.createElement('span');readingTag.className='ai-event-status is-processing';readingTag.textContent='报告解读中';badge.after(readingTag);}
              statusRow.querySelector('small').textContent=`${record.files.length} 份原始文件`;
              if(status==='failed')item.querySelector('.ai-event-card-types').remove();else appendEventCardTypes(item.querySelector('.ai-event-card-types'),record);
              const detail=item.querySelector('.ai-timeline-details-button');detail.addEventListener('click',()=>mountEventDetail(layer,record,detail));list.appendChild(item);
            });main.scrollTop=scroll;
          };
          const unsubscribe=observeEventLayer(layer,renderRecords);layer.refreshEventRecords=renderRecords;layer.cleanupEventLayer=()=>{observer?.disconnect();unsubscribe();};appendEventLayer(profileLayer,layer,trigger);if(options.onBack)layer.querySelector('.ai-profile-back').addEventListener('click',options.onBack);renderRecords();
        };
        window.openPatientSummaryTimelineExample = (host,sourceRecord) => {
          const profile=window.mountPatientProfileScene(host);
          [...profile.children].forEach(node=>{
            if(node.matches('.ai-profile-header,.ai-profile-main,.ai-project-toast'))node.inert=false;
            else {node.cleanupEventLayer?.();node.remove();}
          });
          const files=sourceRecord?.files?.length?sourceRecord.files:[{id:'summary-example-original',name:'病历资料示例.png',format:'image',src:sampleReportImage,demo:true}];
          const ids=['event-demo-multipage','event-demo-01','event-demo-02'];
          const records=ids.map((id,index)=>{
            const example=eventRecords.find(item=>item.id===id);
            return {...example,id:'summary-'+(sourceRecord?.id||'demo')+'-'+(index+1),summaryStatus:'completed',submittedAt:sourceRecord?.submittedAt||example.submittedAt,updatedAt:sourceRecord?.updatedAt||example.submittedAt,interpretation:'',readings:[],files:files.map(file=>({...file}))};
          });
          mountEventTimeline(profile,null,{records,onBack:()=>host.dispatchEvent(new CustomEvent('patient-profile-exit'))});
        };

        window.openPatientSummaryExample = (host) => {
          const profile=window.mountPatientProfileScene(host);
          [...profile.children].forEach(node=>{
            if(node.matches('.ai-profile-header,.ai-profile-main,.ai-project-toast'))node.inert=false;
            else {node.cleanupEventLayer?.();node.remove();}
          });
          const record=eventRecords.find(item=>item.id==='event-demo-02'&&eventStatus(item)==='completed')||eventRecords.find(item=>eventStatus(item)==='completed');
          if(!record)return;
          mountEventDetail({parentElement:profile},record,null);
          const detail=profile.querySelector('#ai-event-detail-layer');
          const back=detail.querySelector('.ai-profile-back');back.setAttribute('aria-label','返回聊天');
          back.addEventListener('click',()=>host.dispatchEvent(new CustomEvent('patient-profile-exit')));
        };

        window.openPatientEventTimeline = (host) => {
          const profile=window.mountPatientProfileScene(host);
          [...profile.children].forEach(node=>{
            if(node.matches('.ai-profile-header,.ai-profile-main,.ai-project-toast')) node.inert=false;
            else {node.cleanupEventLayer?.();node.remove();}
          });
          const project=joinedProjects.find(item=>item.id===activeProjectId)||joinedProjects[0];
          const projectTrigger=[...profile.querySelectorAll('.ai-service-project-card')].find(card=>card.getAttribute('aria-label')===`查看${project.name}`);
          mountProjectPage(profile,project,projectTrigger);
          const recordTrigger=[...profile.querySelectorAll('#ai-project-detail-layer button')].find(button=>button.textContent.trim()==='我的病历');
          mountEventTimeline(profile,recordTrigger);
        };

        const mountMedicalRecordDetail = (timelineLayer, record, trigger) => {
          const profileLayer = timelineLayer.parentElement;
          if (profileLayer.querySelector('#ai-record-detail-layer')) return;
          const layer = document.createElement('section');
          layer.id = 'ai-record-detail-layer';
          layer.dataset.recordId = record.id;
          layer.setAttribute('aria-label', '病历详情');
          layer.innerHTML = `
            <header class="ai-record-detail-header">
              <button class="ai-profile-back" type="button" aria-label="返回病历时间轴"><img src="${profileAssets.back}" alt="" /></button>
              <h1 tabindex="-1">病历详情</h1>
            </header>
            <main class="ai-record-detail-main">
              <section class="ai-record-detail-summary" aria-label="报告信息">
                <h2></h2>
                <dl class="ai-record-detail-meta">
                  <dt>创建时间：</dt><dd data-detail-created></dd>
                  <dt>患者：</dt><dd data-detail-patient></dd>
                  <dt>医院：</dt><dd>--</dd>
                </dl>
              </section>
              <nav class="ai-record-detail-tabs" role="tablist" aria-label="病历内容类型">
                <button class="ai-record-detail-tab" id="record-structured-tab" role="tab" type="button" aria-controls="record-structured-panel" aria-selected="true" data-detail-tab="structured">结构化内容</button>
                <button class="ai-record-detail-tab" id="record-images-tab" role="tab" type="button" aria-controls="record-images-panel" aria-selected="false" tabindex="-1" data-detail-tab="images">图片</button>
                <button class="ai-record-detail-tab" id="record-ocr-tab" role="tab" type="button" aria-controls="record-ocr-panel" aria-selected="false" tabindex="-1" data-detail-tab="ocr">OCR内容</button>
              </nav>
              <section class="ai-record-detail-panel" id="record-structured-panel" role="tabpanel" aria-labelledby="record-structured-tab"><div class="ai-record-detail-fields"></div></section>
              <section class="ai-record-detail-panel" id="record-images-panel" role="tabpanel" aria-labelledby="record-images-tab" hidden>
                <div class="ai-record-detail-empty"><img src="${profileAssets.medicalRecord}" alt="" aria-hidden="true" /><h3>暂无报告图片</h3><p>此条样例未附报告图片</p></div>
              </section>
              <section class="ai-record-detail-panel" id="record-ocr-panel" role="tabpanel" aria-labelledby="record-ocr-tab" hidden>
                <div class="ai-record-detail-ocr"><p class="ai-record-detail-ocr-label">示例文本</p><pre></pre></div>
              </section>
            </main>`;
          if (record.id === 'sample-01') {
            const imagePanel = layer.querySelector('#record-images-panel');
            imagePanel.innerHTML = `<figure class="ai-record-image-card"><button class="ai-record-image-open" type="button" aria-label="查看胸部 CT 报告图片"><img alt="胸部 CT 检查报告（虚拟示例）" /></button><figcaption>胸部 CT 报告 · 1 张<br />虚拟示例 · 点击图片查看</figcaption></figure>`;
            imagePanel.querySelector('img').src = sampleReportImage;
            const openImage = imagePanel.querySelector('.ai-record-image-open');
            openImage.addEventListener('click', () => {
              if (profileLayer.querySelector('#ai-report-image-layer')) return;
              const viewer = document.createElement('section');
              viewer.id = 'ai-report-image-layer';
              viewer.setAttribute('aria-label', '报告图片');
              viewer.innerHTML = `<header class="ai-report-image-header"><button class="ai-profile-back" type="button" aria-label="返回病历详情"><img src="${profileAssets.back}" alt="" /></button><h1 tabindex="-1">报告图片</h1><button class="ai-report-image-zoom" type="button" aria-pressed="false">放大</button></header><main class="ai-report-image-viewport"><img alt="胸部 CT 检查报告（虚拟示例）" /></main>`;
              viewer.querySelector('.ai-report-image-viewport img').src = sampleReportImage;
              const viewport = viewer.querySelector('.ai-report-image-viewport');
              const zoom = viewer.querySelector('.ai-report-image-zoom');
              zoom.addEventListener('click', () => {
                const expanded = viewport.classList.toggle('is-zoomed');
                zoom.setAttribute('aria-pressed', String(expanded));
                zoom.textContent = expanded ? '缩小' : '放大';
                if (!expanded) viewport.scrollTo(0, 0);
              });
              const previousInert = layer.inert;
              const close = () => {
                viewer.remove(); layer.inert = previousInert;
                openImage.focus({ preventScroll: true });
              };
              viewer.querySelector('.ai-profile-back').addEventListener('click', close);
              viewer.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
              layer.inert = true;
              // Keep detail-page color variables on the sibling image viewer.
              viewer.style.setProperty('--detail-background', getComputedStyle(layer).getPropertyValue('--detail-background'));
              profileLayer.appendChild(viewer);
              viewer.querySelector('h1').focus({ preventScroll: true });
            });
          }
          layer.querySelector('.ai-record-detail-summary h2').textContent = record.type;
          layer.querySelector('[data-detail-created]').textContent = (record.createdAt || record.time).replace('T', ' ');
          const patient = [...(savedBasicInfo.name || '示例患者')];
          layer.querySelector('[data-detail-patient]').textContent = patient.length > 2 ? `${patient[0]}${'*'.repeat(patient.length - 2)}${patient.at(-1)}` : `${patient[0]}*`;
          const summary = new Map(record.summary);
          const dateLabel = record.type === '门诊病历' ? '就诊日期' : record.type === '出院小结' ? '病历日期' : '检查日期';
          let fields;
          if (record.type === '影像报告') {
            fields = [
              ['检查日期', record.time.slice(0, 10)],
              ['影像类型', summary.get('影像类型') || '--'],
              ['检查部位', summary.get('检查部位') || '--'],
              ['检查所见', record.id === 'sample-01' ? '胸部 CT 检查资料已归档，包含检查影像与对应报告。\n可结合原始影像查看详细检查所见。' : '腹部超声检查资料已归档，包含检查部位与影像记录。\n详细检查所见以原始报告为准。'],
              ['检查结论', summary.get('检查结论') || '--'],
              ['DICOM', summary.get('DICOM') || '--'],
            ];
          } else {
            fields = [[dateLabel, record.time.slice(0, 10)], ...record.summary];
          }
          const container = layer.querySelector('.ai-record-detail-fields');
          fields.forEach(([label, value]) => {
            const card = document.createElement('section'); card.className = 'ai-record-detail-field';
            const heading = document.createElement('h3'); heading.textContent = label;
            const content = document.createElement('p'); content.textContent = value;
            card.append(heading, content); container.appendChild(card);
          });
          layer.querySelector('.ai-record-detail-ocr pre').textContent = [record.title, ...fields.map(([label, value]) => `${label}：${value}`)].join('\n\n');
          const tabs = [...layer.querySelectorAll('[data-detail-tab]')];
          const selectTab = (activeTab, focus = false) => {
            tabs.forEach((tab) => {
              const active = tab === activeTab;
              tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
              layer.querySelector(`#${tab.getAttribute('aria-controls')}`).hidden = !active;
            });
            layer.querySelector('.ai-record-detail-main').scrollTo(0, 0);
            if (focus) activeTab.focus({ preventScroll: true });
          };
          tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => selectTab(tab));
            tab.addEventListener('keydown', (event) => {
              const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
              if (next < 0) return;
              event.preventDefault(); selectTab(tabs[next], true);
            });
          });
          const hostActions = timelineLayer.querySelector('.ai-assistant-host-actions')?.cloneNode(true);
          if (hostActions) {
            layer.querySelector('.ai-record-detail-header').appendChild(hostActions);
            hostActions.querySelector('.ai-assistant-host-button:last-child')?.addEventListener('click', () => closeProfileContext(profileLayer));
          }
          const previousInert = timelineLayer.inert;
          const timelineScroll = timelineLayer.querySelector('.ai-timeline-main').scrollTop;
          timelineLayer.inert = true;
          layer.querySelector('.ai-profile-back').addEventListener('click', () => {
            layer.remove(); timelineLayer.inert = previousInert;
            timelineLayer.querySelector('.ai-timeline-main').scrollTop = timelineScroll;
            trigger.focus({ preventScroll: true });
          });
          profileLayer.appendChild(layer);
          layer.querySelector('h1').focus({ preventScroll: true });
        };

        const mountMedicalTimeline = (profileLayer, trigger) => {
          if (profileLayer.closest('[data-profile-standalone]') || window.__patientEmbeddedRecord === true) return mountEventTimeline(profileLayer,trigger);
          if (profileLayer.querySelector('#ai-timeline-layer')) return;
          const toast = profileLayer.querySelector('.ai-project-toast');
          if (toast) toast.textContent = '';
          const layer = document.createElement('section');
          layer.id = 'ai-timeline-layer';
          layer.setAttribute('aria-label', '病历时间轴');
          layer.innerHTML = `
            <header class="ai-timeline-header">
              <button class="ai-profile-back" type="button" aria-label="返回健康服务"><img src="${profileAssets.back}" alt="" /></button>
              <h1 tabindex="-1">病历时间轴</h1>
            </header>
            <main class="ai-timeline-main">
              <div class="ai-timeline-intro"><h2>病历时间轴</h2><span class="ai-timeline-count"></span></div>
              <p class="ai-timeline-caption">按病历时间倒序 · 示例数据</p>
              <ol class="ai-timeline-list" aria-label="病历记录，按时间倒序"></ol>
              <p class="ai-timeline-end">已展示全部病历</p>
            </main>`;
          const records = [...sampleMedicalRecords].sort((a, b) => b.time.localeCompare(a.time));
          layer.querySelector('.ai-timeline-count').textContent = `共 ${records.length} 条`;
          const list = layer.querySelector('.ai-timeline-list');
          records.forEach((record) => {
            const item = document.createElement('li');
            item.className = 'ai-timeline-item';
            item.innerHTML = `
              <span class="ai-timeline-node" aria-hidden="true"><img src="${profileAssets.medicalRecord}" alt="" /></span>
              <article class="ai-timeline-card">
                <header class="ai-timeline-card-header">
                  <time class="ai-timeline-date"></time>
                  <button class="ai-timeline-details-button" type="button">查看详情</button>
                </header>
                <span class="ai-timeline-tag"></span>
                <ul class="ai-timeline-summary"></ul>
              </article>`;
            const time = item.querySelector('time');
            time.dateTime = record.time;
            time.textContent = record.time.slice(0, 10);
            item.querySelector('.ai-timeline-card').setAttribute('aria-label', `${time.textContent} ${record.type}`);
            item.querySelector('.ai-timeline-tag').textContent = record.type;
            const summary = item.querySelector('.ai-timeline-summary');
            record.summary.forEach(([label, value]) => {
              const row = document.createElement('li'); row.textContent = `${label}：${value}`; summary.appendChild(row);
            });
            const button = item.querySelector('.ai-timeline-details-button');
            button.addEventListener('click', () => mountMedicalRecordDetail(layer, record, button));
            list.appendChild(item);
          });
          const hostActions = profileLayer.querySelector('.ai-profile-header .ai-assistant-host-actions')?.cloneNode(true);
          if (hostActions) {
            layer.querySelector('.ai-timeline-header').appendChild(hostActions);
            hostActions.querySelector('.ai-assistant-host-button:last-child')?.addEventListener('click', () => closeProfileContext(profileLayer));
          }
          const siblings = [...profileLayer.children];
          const previousInert = siblings.map((node) => node.inert);
          siblings.forEach((node) => { node.inert = true; });
          layer.querySelector('.ai-profile-back').addEventListener('click', () => {
            layer.remove(); siblings.forEach((node, index) => { node.inert = previousInert[index]; });
            trigger.focus({ preventScroll: true });
          });
          profileLayer.appendChild(layer);
          layer.querySelector('h1').focus({ preventScroll: true });
        };

        const mountProfilePage = (profileButton, assistantLayer = document.getElementById('ai-assistant-layer')) => {
          if (!assistantLayer) return;
          const existing = assistantLayer.querySelector('#ai-profile-layer');
          if (existing) return existing;

          const profileLayer = document.createElement('section');
          profileLayer.id = 'ai-profile-layer';
          profileLayer.dataset.testid = 'ai-profile-screen';
          profileLayer.setAttribute('aria-label', '我的');

          const header = document.createElement('header');
          header.className = 'ai-profile-header';
          header.innerHTML = `
            <button class="ai-profile-back" type="button" aria-label="返回健康助手">
              <img src="${profileAssets.back}" alt="" aria-hidden="true" />
            </button>
            <h1>我的</h1>`;

          const hostActions = assistantLayer.querySelector('.ai-assistant-host-actions')?.cloneNode(true);
          if (hostActions) {
            hostActions.setAttribute('aria-label', '宿主操作控件');
            hostActions.querySelector('[data-ai-assistant-close]')?.removeAttribute('data-ai-assistant-close');
            header.appendChild(hostActions);
          }

          const main = document.createElement('main');
          main.className = 'ai-profile-main';
          main.innerHTML = `
            <section class="ai-profile-summary" aria-label="患者账号信息">
              <div class="ai-profile-avatar" aria-hidden="true"></div>
              <div class="ai-profile-identity">
                <div class="ai-profile-name-row">
                  <p class="ai-profile-name">五患者</p>
                  <span class="ai-profile-status">未实名</span>
                </div>
                <p class="ai-profile-phone">133****0620</p>
              </div>
            </section>`;

          const avatar = main.querySelector('.ai-profile-avatar');
          avatar.style.backgroundImage = `url("${profileAssets.avatar}")`;

          const menu = document.createElement('nav');
          menu.className = 'ai-profile-menu';
          menu.setAttribute('aria-label', '个人中心菜单');
          menu.append(createMenuRow(profileAssets.settings, '设置'));

          const logout = document.createElement('button');
          logout.className = 'ai-profile-logout';
          logout.type = 'button';
          logout.textContent = '退出登录';

          const projectCards = createProjectCards(profileLayer);
          main.append(projectCards, menu, logout);
          const toast = document.createElement('div');
          toast.className = 'ai-project-toast';
          toast.setAttribute('role', 'status');
          toast.setAttribute('aria-live', 'polite');
          toast.setAttribute('aria-atomic', 'true');
          profileLayer.append(header, main, toast);
          assistantLayer.appendChild(profileLayer);
          updateProfileIdentity(profileLayer);

          const back = header.querySelector('.ai-profile-back');
          if (assistantLayer.hasAttribute('data-profile-standalone')) back.setAttribute('aria-label','返回上传病历');
          back?.addEventListener('click', () => assistantLayer.hasAttribute('data-profile-standalone') ? closeProfileContext(profileLayer) : profileLayer.remove());
          const closeButton = hostActions?.querySelector('.ai-assistant-host-button:last-child');
          closeButton?.addEventListener('click', () => closeProfileContext(profileLayer));
          return profileLayer;
        };


        window.mountPatientProfileScene = (host) => {
          if (!host.shadowRoot) {
            const root=host.attachShadow({mode:'open'});
            const style=document.createElement('style');
            style.textContent="\n:host { position:absolute;inset:0;z-index:65;display:block;font:14px/1.5 -apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif; }\n:host([hidden]),[hidden] { display:none!important; }\n*,*::before,*::after { box-sizing:border-box; }\nbutton,input,textarea,select { font:inherit;letter-spacing:inherit;color:inherit;margin:0; }\nbutton { cursor:pointer;border:0;background:transparent;padding:0; }\nimg,svg { display:block;max-width:100%; }\ninput,textarea,select { user-select:text; }\n\n      #ai-assistant-layer {\n        --ai-color-background-top: #cdf9e8;\n        --ai-color-background-mid: #ebfaf6;\n        --ai-color-background-page: #f6fafb;\n        --ai-color-ink: #12385f;\n        --ai-color-muted: #7d9bb1;\n        --ai-color-surface: #ffffff;\n        --ai-color-control: rgba(255, 255, 255, 0.72);\n        --ai-color-control-border: rgba(18, 56, 95, 0.1);\n        --ai-color-input: #f3f7f8;\n        --ai-color-placeholder: #c3cdd2;\n        --ai-space-2: 2px;\n        --ai-space-4: 4px;\n        --ai-space-8: 8px;\n        --ai-space-12: 12px;\n        --ai-space-16: 16px;\n        --ai-space-20: 20px;\n        --ai-space-24: 24px;\n        --ai-radius-message: 16px;\n        --ai-radius-input: 10px;\n        --ai-radius-pill: 999px;\n        --ai-safe-top: 54px;\n        --ai-safe-bottom: 34px;\n        --ai-header-height: 42px;\n        --ai-footer-height: 56px;\n        box-sizing: border-box;\n        position: absolute;\n        inset: 0;\n        z-index: 65;\n        display: grid;\n        grid-template-rows: var(--ai-header-height) minmax(0, 1fr) var(--ai-footer-height);\n        padding: var(--ai-safe-top) 0 var(--ai-safe-bottom);\n        overflow: hidden;\n        background: linear-gradient(\n          180deg,\n          var(--ai-color-background-top) 0%,\n          var(--ai-color-background-mid) 24%,\n          var(--ai-color-background-page) 48%,\n          var(--ai-color-background-page) 100%\n        );\n        color: var(--ai-color-ink);\n        font-family: var(--font-ui, -apple-system, BlinkMacSystemFont, \"PingFang SC\", \"Microsoft YaHei\", sans-serif);\n      }\n\n      #ai-assistant-layer,\n      #ai-assistant-layer * {\n        box-sizing: border-box;\n      }\n\n      .ai-assistant-header {\n        display: grid;\n        grid-template-columns: 40px minmax(0, 1fr) 106px;\n        align-items: center;\n        gap: var(--ai-space-8);\n        padding: 0 var(--ai-space-12) 0 var(--ai-space-16);\n      }\n\n      .ai-assistant-header h1 {\n        min-width: 0;\n        margin: 0;\n        overflow: hidden;\n        color: var(--ai-color-ink);\n        font-size: 20px;\n        font-weight: 600;\n        line-height: 1.2;\n        letter-spacing: 0.01em;\n        text-align: center;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n\n      .ai-assistant-profile,\n      .ai-assistant-host-button {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        margin: 0;\n        padding: 0;\n        border: 0;\n        color: var(--ai-color-ink);\n        cursor: pointer;\n        -webkit-tap-highlight-color: transparent;\n      }\n\n      .ai-assistant-profile {\n        width: 34px;\n        height: 34px;\n        border-radius: var(--ai-radius-pill);\n        background: var(--ai-color-surface);\n        background-repeat: no-repeat;\n        background-position: center;\n        background-size: 24px 24px;\n      }\n\n      .ai-assistant-host-actions {\n        justify-self: end;\n        display: grid;\n        grid-template-columns: 1fr 1px 1fr;\n        align-items: center;\n        width: 106px;\n        height: 38px;\n        border: 1px solid var(--ai-color-control-border);\n        border-radius: var(--ai-radius-pill);\n        background: var(--ai-color-control);\n      }\n\n      .ai-assistant-host-divider {\n        width: 1px;\n        height: 22px;\n        background: var(--ai-color-control-border);\n      }\n\n      .ai-assistant-host-button {\n        width: 100%;\n        height: 100%;\n        background: transparent;\n      }\n\n      .ai-assistant-host-button img {\n        width: 19px;\n        height: 19px;\n        object-fit: contain;\n      }\n\n      .ai-assistant-host-button:last-child img {\n        width: 23px;\n        height: 23px;\n      }\n\n      .ai-assistant-profile:hover,\n      .ai-assistant-host-button:hover {\n        opacity: 0.82;\n      }\n\n      .ai-assistant-profile:active,\n      .ai-assistant-host-button:active {\n        transform: scale(0.96);\n      }\n\n      .ai-assistant-profile:focus-visible,\n      .ai-assistant-host-button:focus-visible,\n      .ai-assistant-input:focus-visible {\n        outline: 2px solid var(--ai-color-ink);\n        outline-offset: 2px;\n      }\n\n      .ai-assistant-chat {\n        min-height: 0;\n        overflow-y: auto;\n        overscroll-behavior: contain;\n        padding: var(--ai-space-4) var(--ai-space-12) var(--ai-space-24);\n        scrollbar-width: none;\n      }\n\n      .ai-assistant-chat::-webkit-scrollbar {\n        display: none;\n      }\n\n      .ai-assistant-time {\n        display: block;\n        margin: 0;\n        color: var(--ai-color-muted);\n        font-size: 15px;\n        font-weight: 400;\n        line-height: 22px;\n        text-align: center;\n      }\n\n      .ai-assistant-message {\n        width: 214px;\n        margin-top: var(--ai-space-16);\n        padding: var(--ai-space-12) var(--ai-space-16);\n        border-radius: var(--ai-radius-message);\n        background: var(--ai-color-surface);\n      }\n\n      .ai-assistant-message p {\n        margin: 0;\n        color: var(--ai-color-ink);\n        font-size: 17px;\n        font-weight: 400;\n        line-height: 24px;\n        white-space: nowrap;\n      }\n\n      .ai-assistant-disclaimer {\n        margin: var(--ai-space-8) 0 0;\n        color: var(--ai-color-muted);\n        font-size: 13px;\n        font-weight: 400;\n        line-height: 20px;\n      }\n\n      .ai-assistant-composer {\n        display: flex;\n        align-items: flex-start;\n        padding: 7px var(--ai-space-12);\n        border-top: 1px solid rgba(18, 56, 95, 0.05);\n        background: var(--ai-color-surface);\n      }\n\n      .ai-assistant-input {\n        width: 100%;\n        height: 42px;\n        margin: 0;\n        padding: 0 var(--ai-space-16);\n        border: 0;\n        border-radius: var(--ai-radius-input);\n        outline: 0;\n        background: var(--ai-color-input);\n        color: var(--ai-color-ink);\n        font: inherit;\n        font-size: 17px;\n        line-height: 42px;\n      }\n\n      .ai-assistant-input::placeholder {\n        color: var(--ai-color-placeholder);\n        opacity: 1;\n      }\n\n      .ai-assistant-input:disabled {\n        cursor: not-allowed;\n        opacity: 0.5;\n      }\n\n      .ai-assistant-visually-hidden {\n        position: absolute;\n        width: 1px;\n        height: 1px;\n        margin: -1px;\n        padding: 0;\n        overflow: hidden;\n        clip: rect(0 0 0 0);\n        white-space: nowrap;\n        border: 0;\n      }\n\n      .device-screen:has(#ai-assistant-layer) .mobile-cursor {\n        display: none;\n      }\n\n      @media (max-width: 360px) {\n        #ai-assistant-layer {\n          --ai-header-height: 42px;\n        }\n\n        .ai-assistant-header {\n          grid-template-columns: 36px minmax(0, 1fr) 98px;\n          padding-right: var(--ai-space-8);\n          padding-left: var(--ai-space-12);\n        }\n\n        .ai-assistant-header h1 {\n          font-size: 18px;\n        }\n\n        .ai-assistant-host-actions {\n          width: 98px;\n        }\n\n        .ai-assistant-message {\n          width: min(214px, calc(100vw - 24px));\n        }\n      }\n    \n      #ai-profile-layer {\n        --profile-color-ink: #12385f;\n        --profile-color-muted: #55789a;\n        --profile-color-accent: #20b7ad;\n        --profile-color-tag: #29beb4;\n        --profile-color-tag-surface: rgba(255, 255, 255, 0.34);\n        --profile-color-surface: #ffffff;\n        --profile-color-divider: #e9eef1;\n        --profile-color-chevron: #bfd0dc;\n        --profile-color-background-top: #c9f8ad;\n        --profile-color-background-right: #82dfc2;\n        --profile-color-background-page: #f5f7fc;\n        --profile-color-background-clear: rgba(245, 247, 252, 0);\n        --profile-color-background-soft: rgba(245, 247, 252, 0.92);\n        --profile-space-4: 4px;\n        --profile-space-8: 8px;\n        --profile-space-12: 12px;\n        --profile-space-16: 16px;\n        --profile-space-20: 20px;\n        --profile-radius-card: 10px;\n        --profile-radius-pill: 999px;\n        box-sizing: border-box;\n        position: absolute;\n        inset: 0;\n        z-index: 2;\n        display: grid;\n        grid-template-rows: var(--ai-header-height) minmax(0, 1fr);\n        padding: var(--ai-safe-top) 0 var(--ai-safe-bottom);\n        overflow: hidden;\n        background:\n          linear-gradient(\n            180deg,\n            var(--profile-color-background-clear) 0%,\n            var(--profile-color-background-clear) 14%,\n            var(--profile-color-background-soft) 30%,\n            var(--profile-color-background-page) 44%,\n            var(--profile-color-background-page) 100%\n          ),\n          linear-gradient(\n            120deg,\n            var(--profile-color-background-top) 0%,\n            var(--profile-color-background-right) 100%\n          );\n        color: var(--profile-color-ink);\n        font-family: inherit;\n      }\n\n      #ai-profile-layer,\n      #ai-profile-layer * {\n        box-sizing: border-box;\n      }\n\n      .ai-profile-header {\n        display: grid;\n        grid-template-columns: 40px minmax(0, 1fr) 106px;\n        align-items: center;\n        gap: var(--profile-space-8);\n        padding: 0 var(--profile-space-12) 0 var(--profile-space-16);\n      }\n\n      .ai-profile-header h1 {\n        min-width: 0;\n        margin: 0;\n        color: var(--profile-color-ink);\n        font-size: 20px;\n        font-weight: 600;\n        line-height: 1.2;\n        letter-spacing: 0.02em;\n        text-align: center;\n        white-space: nowrap;\n      }\n\n      .ai-profile-back,\n      .ai-profile-row,\n      .ai-profile-logout {\n        margin: 0;\n        border: 0;\n        color: inherit;\n        font: inherit;\n        cursor: pointer;\n        -webkit-tap-highlight-color: transparent;\n      }\n\n      .ai-profile-back {\n        display: inline-flex;\n        align-items: center;\n        justify-content: flex-start;\n        width: 40px;\n        height: 40px;\n        padding: 0;\n        background: transparent;\n      }\n\n      .ai-profile-back img {\n        width: 20px;\n        height: 20px;\n        object-fit: contain;\n        opacity: 0.92;\n      }\n\n      .ai-profile-main {\n        min-height: 0;\n        overflow-y: auto;\n        overscroll-behavior: contain;\n        padding: 0 var(--profile-space-16) var(--profile-space-20);\n        scrollbar-width: none;\n      }\n\n      .ai-profile-main::-webkit-scrollbar {\n        display: none;\n      }\n\n      .ai-profile-summary {\n        display: grid;\n        grid-template-columns: 56px minmax(0, 1fr);\n        align-items: center;\n        gap: var(--profile-space-12);\n        min-height: 93px;\n        padding: 8px 0 6px;\n      }\n\n      .ai-profile-avatar {\n        width: 52px;\n        height: 52px;\n        border-radius: var(--profile-radius-pill);\n        background-color: var(--profile-color-surface);\n        background-repeat: no-repeat;\n        background-position: center;\n        background-size: 36px 36px;\n      }\n\n      .ai-profile-identity {\n        min-width: 0;\n      }\n\n      .ai-profile-name-row {\n        display: flex;\n        align-items: center;\n        gap: var(--profile-space-8);\n      }\n\n      .ai-profile-name {\n        margin: 0;\n        color: var(--profile-color-ink);\n        font-size: 20px;\n        font-weight: 600;\n        line-height: 26px;\n        white-space: nowrap;\n      }\n\n      .ai-profile-status {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        min-width: 46px;\n        height: 23px;\n        padding: 0 var(--profile-space-8);\n        border-radius: 5px;\n        background: var(--profile-color-tag-surface);\n        color: var(--profile-color-tag);\n        font-size: 13px;\n        font-weight: 500;\n        line-height: 23px;\n        white-space: nowrap;\n      }\n\n      .ai-profile-phone {\n        margin: 0;\n        color: var(--profile-color-ink);\n        font-size: 17px;\n        font-weight: 400;\n        line-height: 24px;\n        white-space: nowrap;\n      }\n\n      .ai-profile-menu {\n        overflow: hidden;\n        border-radius: var(--profile-radius-card);\n        background: var(--profile-color-surface);\n      }\n\n      .ai-profile-row {\n        display: grid;\n        grid-template-columns: 28px minmax(0, 1fr) 16px;\n        align-items: center;\n        gap: var(--profile-space-12);\n        width: 100%;\n        min-height: 53px;\n        padding: 0 var(--profile-space-16);\n        background: var(--profile-color-surface);\n        text-align: left;\n      }\n\n      .ai-profile-row + .ai-profile-row {\n        border-top: 1px solid var(--profile-color-divider);\n      }\n\n      .ai-profile-row-icon {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        width: 28px;\n        height: 28px;\n      }\n\n      .ai-profile-row-icon img {\n        display: block;\n        width: 22px;\n        height: 22px;\n        object-fit: contain;\n      }\n\n      .ai-profile-row-label {\n        color: var(--profile-color-ink);\n        font-size: 17px;\n        font-weight: 600;\n        line-height: 24px;\n      }\n\n      .ai-profile-chevron {\n        display: block;\n        width: 14px;\n        height: 14px;\n        object-fit: contain;\n      }\n\n      .ai-profile-logout {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 100%;\n        height: 46px;\n        margin-top: 14px;\n        border-radius: var(--profile-radius-card);\n        background: var(--profile-color-surface);\n        color: var(--profile-color-muted);\n        font-size: 17px;\n        font-weight: 400;\n        line-height: 24px;\n      }\n\n      .ai-profile-back:hover,\n      .ai-profile-row:hover,\n      .ai-profile-logout:hover {\n        opacity: 0.82;\n      }\n\n      .ai-profile-back:active,\n      .ai-profile-row:active,\n      .ai-profile-logout:active {\n        transform: scale(0.98);\n      }\n\n      .ai-profile-back:focus-visible,\n      .ai-profile-row:focus-visible,\n      .ai-profile-logout:focus-visible {\n        outline: 2px solid var(--profile-color-ink);\n        outline-offset: -2px;\n      }\n\n      @media (max-width: 360px) {\n        .ai-profile-header {\n          grid-template-columns: 36px minmax(0, 1fr) 98px;\n          padding-right: var(--profile-space-8);\n          padding-left: var(--profile-space-12);\n        }\n\n        .ai-profile-header h1 {\n          font-size: 18px;\n        }\n\n        .ai-profile-main {\n          padding-right: var(--profile-space-12);\n          padding-left: var(--profile-space-12);\n        }\n      }\n    \n#ai-information-layer .ai-phone-verification { display: grid; gap: 8px; margin-top: 4px; }\n#ai-information-layer .ai-phone-verification[hidden] { display: none; }\n#ai-information-layer .ai-phone-code-row { display: flex; gap: 8px; }\n#ai-information-layer .ai-phone-code-row input { flex: 1; width: 0; min-width: 0; }\n#ai-information-layer .ai-phone-send { flex: 0 0 108px; min-height: 44px; border: 1px solid var(--project-action); border-radius: 6px; background: var(--project-action); color: #fff; font: inherit; font-size: 14px; cursor: pointer; }\n#ai-information-layer .ai-phone-send:disabled { opacity: .5; cursor: not-allowed; }\n#ai-information-layer .ai-phone-send:focus-visible { outline: 2px solid var(--project-action); outline-offset: 2px; }\n#ai-information-layer .ai-phone-code-hint { margin: 0; color: var(--project-muted); font-size: 12px; line-height: 20px; }\n\n      #ai-profile-layer {\n        --project-action: #0365bf;\n        --project-action-hover: #0058aa;\n        --project-ink: #0f2f4f;\n        --project-muted: #4f6e91;\n        --project-border: #e5e8ec;\n        --project-info: #eef7ff;\n        --project-neutral: #f4f6f8;\n        --project-overlay: rgba(15,47,79,.38);\n        --project-radius: 8px;\n      }\n\n      .ai-service-projects { margin: var(--profile-space-8) 0 var(--profile-space-16); }\n      .ai-service-projects-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--profile-space-12); margin-bottom: var(--profile-space-12); }\n      .ai-service-projects-heading h2 { margin: 0; font-size: 18px; line-height: 26px; font-weight: 600; }\n      .ai-service-projects-heading > span { font-size: 13px; line-height: 22px; color: var(--profile-color-muted); }\n      .ai-service-project-grid { display: grid; gap: var(--profile-space-12); }\n      .ai-service-project-card { width: 100%; min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: var(--profile-space-16); padding: var(--profile-space-16); border: 1px solid var(--profile-color-divider); border-radius: var(--profile-radius-card); background: var(--profile-color-surface); color: var(--profile-color-ink); font: inherit; text-align: left; cursor: pointer; }\n      .ai-service-project-copy { min-width: 0; display: grid; gap: var(--profile-space-8); align-self: flex-start; }\n      .ai-service-project-copy strong { font-size: 18px; font-weight: 600; line-height: 26px; overflow-wrap: anywhere; }\n      .ai-service-project-action { display: inline-flex; align-items: center; align-self: flex-end; gap: 4px; flex-shrink: 0; white-space: nowrap; }\n      .ai-service-project-action > span { color: var(--color-brand-deep, #057f73); font-size: 14px; line-height: 22px; }\n      .ai-service-project-card:hover { border-color: var(--profile-color-accent); }\n      .ai-service-project-card:active { background: var(--color-page-bottom, #d9f8eb); }\n      .ai-service-project-card:focus-visible { outline: 2px solid var(--profile-color-accent); outline-offset: 2px; }\n      #ai-project-detail-layer { position: absolute; inset: 0; z-index: 3; display: grid; grid-template-rows: var(--ai-header-height) minmax(0, 1fr); padding: var(--ai-safe-top) 0 var(--ai-safe-bottom); background: inherit; color: var(--profile-color-ink); }\n      .ai-project-detail-main { min-height: 0; overflow-y: auto; padding: var(--profile-space-20) var(--profile-space-16); }\n      .ai-project-detail-summary { margin-bottom: var(--profile-space-20); }\n      .ai-project-detail-summary p { margin: 0 0 var(--profile-space-8); color: var(--profile-color-muted); font-size: 14px; line-height: 22px; }\n      .ai-project-detail-summary h2 { margin: 0; font-size: 20px; font-weight: 600; line-height: 28px; overflow-wrap: anywhere; }\n      .ai-project-toast { position: absolute; z-index: 6; bottom: calc(var(--ai-safe-bottom) + var(--profile-space-20)); left: var(--profile-space-20); right: var(--profile-space-20); padding: var(--profile-space-12) var(--profile-space-16); border-radius: var(--project-radius); background: var(--project-ink); color: var(--profile-color-surface); text-align: center; font-size: 14px; line-height: 22px; pointer-events: none; }\n      .ai-project-toast:empty { display: none; }\n    \n      .ai-profile-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }\n      #ai-information-layer {\n        --project-action: var(--color-action-start, #20b7ad);\n        --project-action-hover: var(--color-brand-deep, #057f73);\n        --project-info: var(--color-page-bottom, #d9f8eb);\n        position: absolute; inset: 0; z-index: 4;\n        display: grid; grid-template-rows: 42px 48px minmax(0, 1fr) auto;\n        padding-top: var(--ai-safe-top); background: var(--profile-color-background-page);\n        color: var(--project-ink);\n      }\n      .ai-information-header {\n        display: grid; grid-template-columns: 40px minmax(0, 1fr) 40px;\n        align-items: center; padding: 0 var(--profile-space-16);\n        border-bottom: 1px solid var(--project-border); background: var(--profile-color-surface);\n      }\n      .ai-information-header h1 { margin: 0; text-align: center; font-size: 18px; font-weight: 600; line-height: 26px; }\n      .ai-information-main { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: var(--profile-space-16); scrollbar-width: none; }\n      .ai-information-main::-webkit-scrollbar { display: none; }\n      .ai-information-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 0 var(--profile-space-16); border-bottom: 1px solid var(--project-border); background: var(--profile-color-surface); }\n      .ai-information-tab { margin: 0; padding: 0 var(--profile-space-16); border: 0; border-bottom: 2px solid transparent; background: var(--profile-color-surface); color: var(--color-brand-deep, #057f73); font: inherit; font-size: 16px; line-height: 24px; cursor: pointer; }\n      .ai-information-tab[aria-selected=\"true\"] { border-bottom-color: var(--project-action); color: var(--color-brand-deep, #057f73); font-weight: 600; }\n      .ai-information-tab:hover { background: var(--project-info); }\n      .ai-information-tab:focus-visible { outline: 2px solid var(--project-action); outline-offset: -4px; }\n      .ai-information-card[hidden] { display: none; }\n      .ai-information-card { display: grid; gap: var(--profile-space-16); margin: 0 0 var(--profile-space-16); padding: var(--profile-space-16); border: 1px solid var(--project-border); border-radius: var(--project-radius); background: var(--profile-color-surface); }\n      .ai-information-card:last-child { margin-bottom: 0; }\n      .ai-information-card h2 { margin: 0; font-size: 18px; font-weight: 600; line-height: 26px; }\n      .ai-information-context { margin: var(--profile-space-4) 0 0; color: var(--project-muted); font-size: 12px; line-height: 20px; overflow-wrap: anywhere; }\n      .ai-information-field { display: grid; gap: var(--profile-space-8); }\n      .ai-information-field label { color: var(--project-muted); font-size: 14px; line-height: 22px; }\n      .ai-information-required { color: var(--information-danger); margin-right: var(--profile-space-4); }\n      #ai-information-layer { --information-danger: #ff4d4f; --information-error-text: #c3272b; --information-placeholder: #8fa3b7; }\n      .ai-information-field input, .ai-information-field select, .ai-information-field textarea {\n        box-sizing: border-box; width: 100%; min-width: 0; min-height: 40px;\n        padding: var(--profile-space-8) var(--profile-space-12); border: 1px solid var(--project-border);\n        border-radius: 6px; background: var(--profile-color-surface); color: var(--project-ink);\n        font: inherit; font-size: 16px; line-height: 24px;\n      }\n      .ai-information-field textarea { min-height: 88px; resize: vertical; }\n      .ai-information-field input::placeholder, .ai-information-field textarea::placeholder { color: var(--information-placeholder); }\n      .ai-information-field input:focus-visible, .ai-information-field select:focus-visible, .ai-information-field textarea:focus-visible,\n      .ai-information-cancel:focus-visible, .ai-information-save:focus-visible { outline: 2px solid var(--project-action); outline-offset: 2px; }\n      .ai-information-field [aria-invalid=\"true\"] { border-color: var(--information-danger); }\n      .ai-information-error { margin: 0; color: var(--information-error-text); font-size: 12px; line-height: 20px; }\n      .ai-information-error:empty { display: none; }\n      .ai-information-footer { display: grid; grid-template-columns: 1fr 2fr; gap: var(--profile-space-12); padding: var(--profile-space-12) var(--profile-space-16) calc(var(--profile-space-12) + var(--ai-safe-bottom)); border-top: 1px solid var(--project-border); background: var(--profile-color-surface); }\n      .ai-information-cancel, .ai-information-save { min-height: 44px; padding: var(--profile-space-8) var(--profile-space-16); border: 1px solid var(--project-border); border-radius: 6px; font: inherit; font-size: 16px; line-height: 24px; font-weight: 500; cursor: pointer; }\n      .ai-information-cancel { border-color: var(--project-action); background: var(--profile-color-surface); color: var(--color-brand-deep, #057f73); }\n      .ai-information-save { border-color: var(--project-action); background: var(--project-action); color: var(--profile-color-surface); }\n      .ai-information-cancel:hover { background: var(--project-info); }\n      .ai-information-save:hover { background: var(--project-action-hover); }\n      .ai-information-save:active { box-shadow: 0 2px 0 rgba(32,183,173,.1); }\n      .ai-information-save:disabled { opacity: .5; cursor: not-allowed; }\n    \n      #ai-timeline-layer {\n        --timeline-line: #bfdde6;\n        --timeline-tag-ink: #a66b00;\n        --timeline-tag-surface: #fff8eb;\n        --timeline-tag-border: #ffd28b;\n        position: absolute; inset: 0; z-index: 4;\n        display: grid; grid-template-rows: 42px minmax(0, 1fr);\n        padding-top: var(--ai-safe-top); background: inherit;\n        color: var(--project-ink);\n      }\n      .ai-timeline-header { display: grid; grid-template-columns: 40px minmax(0, 1fr) 106px; align-items: center; gap: var(--profile-space-8); padding: 0 var(--profile-space-12) 0 var(--profile-space-16); }\n      .ai-timeline-header h1 { margin: 0; font-size: 18px; font-weight: 600; line-height: 26px; text-align: center; white-space: nowrap; }\n      .ai-timeline-main { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: var(--profile-space-20) var(--profile-space-16) calc(var(--profile-space-20) + var(--ai-safe-bottom)); background: transparent; scrollbar-width: none; }\n      .ai-timeline-main::-webkit-scrollbar { display: none; }\n      .ai-timeline-intro { display: flex; align-items: center; justify-content: space-between; gap: var(--profile-space-8); margin-bottom: var(--profile-space-4); }\n      .ai-timeline-intro h2 { margin: 0; font-size: 18px; font-weight: 600; line-height: 26px; }\n      .ai-timeline-intro span, .ai-timeline-caption { color: var(--project-muted); font-size: 12px; line-height: 20px; }\n      .ai-timeline-caption { margin: 0 0 var(--profile-space-20); }\n      .ai-timeline-list { list-style: none; margin: 0; padding: 0; }\n      .ai-timeline-item { position: relative; display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: var(--profile-space-12); padding-bottom: var(--profile-space-20); }\n      .ai-timeline-item:not(:last-child)::before { content: ''; position: absolute; top: 32px; bottom: 0; left: 15px; width: 2px; background: var(--timeline-line); }\n      .ai-timeline-node { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--profile-radius-pill); background: var(--timeline-tag-surface); }\n      .ai-timeline-node img { width: 20px; height: 20px; object-fit: contain; }\n      .ai-timeline-card { min-width: 0; padding: var(--profile-space-16); border: 1px solid var(--project-border); border-radius: var(--project-radius); background: var(--profile-color-surface); box-shadow: 0 1px 8px rgba(15,47,79,.06); }\n      .ai-timeline-card-header { display: flex; align-items: center; justify-content: space-between; gap: var(--profile-space-8); }\n      .ai-timeline-date { color: var(--project-ink); font-size: 18px; line-height: 26px; font-weight: 500; white-space: nowrap; }\n      .ai-timeline-details-button { flex-shrink: 0; min-height: 32px; margin: 0; padding: 0; border: 0; background: var(--profile-color-surface); color: var(--project-action); font: inherit; font-size: 12px; line-height: 20px; cursor: pointer; }\n      .ai-timeline-details-button:hover { color: var(--project-action-hover); text-decoration: underline; }\n      .ai-timeline-details-button:focus-visible { outline: 2px solid var(--project-action); outline-offset: 2px; }\n      .ai-timeline-tag { display: inline-block; margin-top: var(--profile-space-8); padding: 0 var(--profile-space-8); border: 1px solid var(--timeline-tag-border); border-left-width: 3px; border-radius: 4px; color: var(--timeline-tag-ink); background: var(--timeline-tag-surface); font-size: 12px; line-height: 22px; }\n      .ai-timeline-summary { margin: var(--profile-space-12) 0 0; padding-left: var(--profile-space-16); color: var(--project-ink); font-size: 14px; line-height: 22px; }\n      .ai-timeline-summary li + li { margin-top: var(--profile-space-8); }\n      .ai-timeline-summary li { overflow-wrap: anywhere; }\n      .ai-timeline-end { margin: 0 0 0 44px; text-align: center; color: var(--project-muted); font-size: 12px; line-height: 20px; }\n    \n      #ai-record-detail-layer {\n        --detail-background: var(--profile-color-background-page);\n        --detail-active: #087f79;\n        --detail-active-hover: #066a65;\n        position: absolute; inset: 0; z-index: 5;\n        display: grid; grid-template-rows: 42px minmax(0, 1fr);\n        padding-top: var(--ai-safe-top); background: inherit;\n        color: var(--project-ink);\n      }\n      .ai-record-detail-header { display: grid; grid-template-columns: 40px minmax(0, 1fr) 106px; align-items: center; gap: var(--profile-space-8); padding: 0 var(--profile-space-12) 0 var(--profile-space-16); }\n      .ai-record-detail-header h1 { margin: 0; font-size: 18px; font-weight: 600; line-height: 26px; text-align: center; white-space: nowrap; }\n      .ai-record-detail-main { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 var(--profile-space-16) calc(var(--profile-space-20) + var(--ai-safe-bottom)); background: transparent; scrollbar-width: none; }\n      .ai-record-detail-main::-webkit-scrollbar { display: none; }\n      .ai-record-detail-summary { padding: var(--profile-space-20) 0; border-bottom: 1px solid var(--project-border); }\n      .ai-record-detail-summary h2 { margin: 0 0 var(--profile-space-16); font-size: 24px; font-weight: 600; line-height: 34px; }\n      .ai-record-detail-meta { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--profile-space-8); margin: 0; color: var(--project-muted); font-size: 14px; line-height: 22px; }\n      .ai-record-detail-meta dt, .ai-record-detail-meta dd { margin: 0; overflow-wrap: anywhere; }\n      .ai-record-detail-tabs { position: sticky; top: 0; z-index: 1; display: flex; gap: var(--profile-space-8); padding: var(--profile-space-16) 0; background: var(--detail-background); }\n      .ai-record-detail-tab { min-height: 40px; padding: var(--profile-space-8) var(--profile-space-12); border: 0; border-radius: 6px; background: var(--profile-color-surface); color: var(--project-muted); font: inherit; font-size: 14px; line-height: 22px; white-space: nowrap; cursor: pointer; }\n      .ai-record-detail-tab[aria-selected=\"true\"] { background: var(--detail-active); color: var(--profile-color-surface); font-weight: 500; }\n      .ai-record-detail-tab:hover { color: var(--detail-active); }\n      .ai-record-detail-tab[aria-selected=\"true\"]:hover { background: var(--detail-active-hover); color: var(--profile-color-surface); }\n      .ai-record-detail-tab:focus-visible { outline: 2px solid var(--project-action); outline-offset: 2px; }\n      .ai-record-detail-panel[hidden] { display: none; }\n      .ai-record-detail-fields { display: grid; gap: var(--profile-space-16); }\n      .ai-record-detail-field, .ai-record-detail-empty, .ai-record-detail-ocr { padding: var(--profile-space-16); border: 1px solid var(--project-border); border-radius: var(--project-radius); background: var(--profile-color-surface); box-shadow: 0 1px 8px rgba(15,47,79,.06); }\n      .ai-record-detail-field h3 { margin: 0; padding-bottom: var(--profile-space-12); border-bottom: 1px solid var(--project-border); font-size: 18px; font-weight: 500; line-height: 26px; }\n      .ai-record-detail-field p { margin: var(--profile-space-12) 0 0; color: var(--project-muted); font-size: 14px; line-height: 24px; white-space: pre-wrap; overflow-wrap: anywhere; }\n      .ai-record-detail-empty { padding: 40px var(--profile-space-16); text-align: center; }\n      .ai-record-detail-empty img { display: block; width: 40px; height: 40px; margin: 0 auto var(--profile-space-16); object-fit: contain; }\n      .ai-record-detail-empty h3 { margin: 0; font-size: 18px; font-weight: 500; line-height: 26px; }\n      .ai-record-detail-empty p, .ai-record-detail-ocr-label { margin: var(--profile-space-8) 0 0; color: var(--project-muted); font-size: 12px; line-height: 20px; }\n      .ai-record-detail-ocr-label { margin-top: 0; padding-bottom: var(--profile-space-12); border-bottom: 1px solid var(--project-border); }\n      .ai-record-detail-ocr pre { margin: var(--profile-space-12) 0 0; color: var(--project-muted); font: inherit; font-size: 14px; line-height: 24px; white-space: pre-wrap; overflow-wrap: anywhere; }\n    \n      .ai-record-image-card { margin: 0; padding: var(--profile-space-12); border: 1px solid var(--project-border); border-radius: var(--project-radius); background: var(--profile-color-surface); }\n      .ai-record-image-open { display: block; width: 100%; margin: 0; padding: 0; border: 0; background: var(--profile-color-surface); cursor: zoom-in; }\n      .ai-record-image-open img { display: block; width: 100%; max-height: 340px; object-fit: contain; }\n      .ai-record-image-card figcaption { margin-top: var(--profile-space-12); color: var(--project-muted); font-size: 12px; line-height: 20px; text-align: center; }\n      .ai-record-image-open:focus-visible, .ai-report-image-zoom:focus-visible { outline: 2px solid var(--project-action); outline-offset: 2px; }\n      #ai-report-image-layer { position: absolute; inset: 0; z-index: 6; display: grid; grid-template-rows: 42px minmax(0, 1fr); padding: var(--ai-safe-top) 0 var(--ai-safe-bottom); background: var(--detail-background); }\n      .ai-report-image-header { display: grid; grid-template-columns: 40px minmax(0, 1fr) 64px; align-items: center; gap: var(--profile-space-8); padding: 0 var(--profile-space-16); background: var(--profile-color-surface); }\n      .ai-report-image-header h1 { margin: 0; text-align: center; color: var(--project-ink); font-size: 18px; font-weight: 600; line-height: 26px; }\n      .ai-report-image-zoom { min-height: 40px; padding: 0 var(--profile-space-8); border: 0; border-radius: 6px; background: var(--profile-color-surface); color: var(--project-action); font: inherit; font-size: 14px; cursor: pointer; }\n      .ai-report-image-zoom:hover { background: var(--project-info); }\n      .ai-report-image-viewport { min-height: 0; overflow: auto; overscroll-behavior: contain; }\n      .ai-report-image-viewport img { display: block; width: 100%; max-width: none; height: auto; }\n      .ai-report-image-viewport.is-zoomed img { width: 200%; }\n    /* Event-based records are scoped to the v1.8 My scene. */\n.ai-event-excerpt { margin:12px 0 0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:22px; }\n.ai-event-excerpt[data-collapsed=\"true\"] { display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden; }\n.ai-event-more { display:block;width:100%;margin-top:12px;padding:10px 0 0;border:0;border-top:1px solid var(--project-border);background:transparent;color:var(--color-brand-deep,#057f73);font-size:13px;text-align:center; }\n.ai-event-more[hidden] { display:none; }\n.ai-event-empty { margin:28px 0;padding:24px 16px;background:white;border-radius:10px;color:var(--project-muted);text-align:center;line-height:1.7; }\n#ai-event-detail-layer,#ai-event-original-layer { position:absolute;inset:0;z-index:5;display:grid;grid-template-rows:42px minmax(0,1fr);padding-top:var(--ai-safe-top);background:var(--profile-color-background-page);color:var(--project-ink); }\n.ai-event-detail-main { min-height:0;overflow:auto;overscroll-behavior:contain;padding:16px 16px calc(20px + var(--ai-safe-bottom)); }\n.ai-event-card { background:#fff;border:1px solid var(--project-border);border-radius:10px;padding:16px;margin-bottom:16px; }\n.ai-event-card h2 { font-size:16px;line-height:24px;margin:0 0 16px;font-weight:600; }\n.ai-event-card dl { margin:0; }\n.ai-event-card dl>div+div { margin-top:20px; }\n.ai-event-card dt { margin-bottom:7px;color:var(--project-muted);font-size:13px; }\n.ai-event-card dd,.ai-event-card p { margin:0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8; }\n.ai-event-files { display:grid;gap:12px; }\n.ai-event-file { display:flex;align-items:center;gap:12px;width:100%;padding:12px;text-align:left;border:1px solid var(--project-border);border-radius:8px;background:#f8fafb; }\n.ai-event-file img { width:42px;height:54px;object-fit:contain;flex:none; }\n.ai-event-file>span:not(.ai-event-file-action) { flex:1;min-width:0; }\n.ai-event-file strong { display:block;overflow-wrap:anywhere;font-size:14px;font-weight:500; }\n.ai-event-file small { display:block;margin-top:4px;color:var(--project-muted);font-size:12px; }\n.ai-event-file-action,.ai-event-text-button { color:var(--color-brand-deep,#057f73);font-size:13px;flex:none; }\n#ai-event-original-layer { z-index:6;grid-template-rows:42px minmax(0,1fr) auto;background:#f5f7fc; }\n.ai-event-original-main { min-height:0;overflow:auto;padding:16px; }\n.ai-event-original-main img { width:100%;height:auto; }\n.ai-event-original-main iframe { width:100%;height:100%;border:0;background:white; }\n.ai-event-original-footer { display:flex;align-items:center;gap:12px;padding:12px 16px calc(12px + var(--ai-safe-bottom));border-top:1px solid var(--project-border);background:#fff;font-size:13px; }\n.ai-event-original-footer>span { min-width:0;flex:1;overflow-wrap:anywhere; }\n.ai-event-original-footer a { color:var(--color-brand-deep,#057f73);white-space:nowrap;text-decoration:none; }\n.ai-event-more:focus-visible,.ai-event-file:focus-visible,.ai-event-original-footer a:focus-visible,.ai-event-text-button:focus-visible { outline:2px solid #057f73;outline-offset:3px; }\n\n/* v1.8 detail: preserve the original gradient, metadata and card treatment. */\n#ai-event-detail-layer { background:inherit; }\n#ai-event-detail-layer .ai-event-detail-main { padding:0 var(--profile-space-16) calc(var(--profile-space-20) + var(--ai-safe-bottom));background:transparent;scrollbar-width:none; }\n#ai-event-detail-layer .ai-record-detail-summary { margin-bottom:var(--profile-space-16); }\n#ai-event-detail-layer .ai-event-card { border-radius:var(--project-radius);box-shadow:0 1px 8px rgba(15,47,79,.06); }\n#ai-event-detail-layer .ai-event-card h2 { margin:0 0 var(--profile-space-12);padding-bottom:var(--profile-space-12);border-bottom:1px solid var(--project-border);font-size:18px;font-weight:500;line-height:26px; }\n#ai-event-detail-layer .ai-event-card dd,#ai-event-detail-layer .ai-event-card p { color:var(--project-muted);font-size:14px;line-height:24px; }\n\n/* v1.8: emphasize the two patient record labels only. */\n#ai-event-detail-layer .ai-event-card dt { color:#000;font-weight:700; }\n\n      /* v1.8 timeline cards: thumbnails above a shared footer, scoped away from v1.7. */\n      #ai-timeline-layer .ai-event-card-footer { display:grid;grid-template-columns:minmax(0,1fr);justify-items:start;gap:6px;margin-top:12px; }\n      #ai-timeline-layer .ai-event-card-footer .ai-event-timeline-status { flex-wrap:wrap;margin:0;gap:6px; }\n      #ai-timeline-layer .ai-event-card-types { display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin:6px 0 12px; } #ai-timeline-layer .ai-event-card-types + .ai-event-card-body .ai-event-excerpt { margin-top:0; }\n      #ai-timeline-layer .ai-event-reading-tag { padding:0 6px;border-radius:4px;background:#edf5fc;color:#5c85a7;font-size:11px;line-height:22px;white-space:nowrap; }\n      #ai-timeline-layer .ai-event-card-thumbnails { display:flex;align-items:flex-start;gap:10px;padding-top:8px; }\n      #ai-timeline-layer .ai-event-card-thumbnail { flex:0 1 72px;min-width:0;margin:0; }\n      #ai-timeline-layer .ai-event-card-thumbnail img,#ai-timeline-layer .ai-event-document-thumbnail { display:block;width:100%;height:88px;object-fit:contain;border:1px solid #dce5ed;border-radius:5px;background:#f8fafc; }\n      #ai-timeline-layer .ai-event-document-thumbnail { display:grid;place-items:center;color:#52799d;font-size:13px;font-weight:600; }\n      #ai-timeline-layer .ai-event-card-thumbnail figcaption { margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#8198ad; }\n      #ai-timeline-layer .ai-event-thumbnail-more { align-self:center;color:#8198ad;font-size:13px; }\n\n      #ai-timeline-layer .ai-event-type-tag { display:inline-flex;align-items:center;gap:5px;white-space:nowrap;color:#8594a3;font-size:12px;line-height:22px; }\n      #ai-timeline-layer .ai-event-type-tag::before { flex:none;width:6px;height:6px;border-radius:50%;background:currentColor;content:\"\"; }\n      #ai-timeline-layer .ai-event-type-tag.is-diagnosis { color:#2478b7; }\n      #ai-timeline-layer .ai-event-type-tag.is-treatment { color:#148b74; }\n      #ai-timeline-layer .ai-event-type-tag.is-exam { color:#7960bd; }\n      #ai-timeline-layer .ai-event-type-tag.is-lab { color:#b77a22; }\n      #ai-timeline-layer .ai-event-type-tag.is-pathology { color:#a85d9e; }\n      #ai-timeline-layer .ai-event-type-tag.is-assessment { color:#607e98; }\n";
            style.textContent += "\n      #ai-event-detail-layer .ai-event-status,.ai-event-timeline-status .ai-event-status { display:inline-flex;border-radius:4px;padding:2px 8px;font-size:12px;line-height:20px;background:#e8f7ee;color:#23865e;margin:0 0 12px; }\n      #ai-event-detail-layer .ai-event-status.is-processing,.ai-event-timeline-status .ai-event-status.is-processing { background:#e8f5ff;color:#2372ad; }\n      #ai-event-detail-layer .ai-event-status.is-failed,.ai-event-timeline-status .ai-event-status.is-failed { background:#fff1e2;color:#ad702c; }\n      .ai-event-timeline-status { display:flex;align-items:center;gap:8px;margin:10px 0; }.ai-event-timeline-status .ai-event-status { margin:0; }.ai-event-timeline-status small { color:#8198ad;font-size:12px; }\n      #ai-event-detail-layer .ai-event-section-heading { display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px; }#ai-event-detail-layer .ai-event-section-heading h2 { margin:0; }\n      #ai-event-detail-layer .ai-event-edit label { display:grid;gap:10px;margin-top:20px;font-size:14px;font-weight:600;color:#111; }\n      #ai-event-detail-layer .ai-event-edit input,#ai-event-detail-layer .ai-event-edit textarea { box-sizing:border-box;min-width:0;width:100%;border:1px solid #dce4ec;border-radius:8px;padding:12px;font:inherit;font-size:14px;font-weight:400;line-height:1.7;color:#173c62;background:#fff; }\n      #ai-event-detail-layer .ai-event-edit-actions { display:flex;justify-content:flex-end;gap:20px;margin-top:22px; }#ai-event-detail-layer .ai-event-edit-actions .is-primary { color:#07867e;font-weight:600; }\n";
            style.textContent += "\n      #ai-event-detail-layer .ai-event-file-row { display:flex;align-items:center;gap:10px;border:1px solid var(--project-border,#e1e7ed);border-radius:8px;background:#f8fafb;padding:12px; }\n      #ai-event-detail-layer .ai-event-file-row .ai-event-file { flex:1;min-width:0;width:auto;padding:0;border:0;background:transparent;gap:10px; }\n      #ai-event-detail-layer .ai-event-file-reading { flex:none;max-width:96px;white-space:nowrap;font-size:13px;line-height:1.6; }\n      #ai-event-detail-layer .ai-event-file-reading:disabled { color:#8397aa;cursor:default; }\n      #ai-event-detail-layer .ai-event-file-status { margin:6px 2px 0;font-size:12px;line-height:1.7;color:var(--project-muted,#718ba4); }\n      #ai-event-detail-layer .ai-event-file-status.is-error { color:#b27a38; }\n      #ai-event-detail-layer .ai-event-reading-result { border:1px solid var(--project-border,#e1e7ed);border-radius:8px;margin-top:12px;overflow:hidden;scroll-margin-top:16px; }\n      #ai-event-detail-layer .ai-event-reading-result>summary { display:flex;align-items:center;gap:8px;list-style:none;padding:14px 12px;cursor:pointer;background:#f8fafb;font-size:14px; }\n      #ai-event-detail-layer .ai-event-reading-result>summary::-webkit-details-marker { display:none; }\n      #ai-event-detail-layer .ai-event-reading-result>summary strong { color:#173b60;font-weight:600; }\n      #ai-event-detail-layer .ai-event-reading-result>summary span { margin-left:auto;font-size:12px;color:var(--project-muted,#718ba4); }\n      #ai-event-detail-layer .ai-event-reading-result>summary::after { content:'⌄';color:#6b879e; }\n      #ai-event-detail-layer .ai-event-reading-result[open]>summary::after { transform:rotate(180deg); }\n      #ai-event-detail-layer .ai-event-reading-body { padding:14px 12px; }\n      #ai-event-detail-layer .ai-event-reading-body>small { display:block;font-size:12px;line-height:1.8;color:var(--project-muted,#718ba4); }\n      #ai-event-detail-layer .ai-event-reading-sources { display:grid;gap:6px;padding:10px 12px;margin:12px 0;background:#f4f8fa;border-radius:6px;font-size:12px; }\n      #ai-event-detail-layer .ai-event-reading-sources>span { color:#718ba4; }\n      #ai-event-detail-layer .ai-event-reading-sources button { text-align:left;overflow-wrap:anywhere;white-space:normal;font-size:12px;line-height:1.7; }\n      #ai-event-detail-layer .ai-event-reading-body>p { margin:12px 0 0;white-space:pre-wrap;line-height:1.9;font-size:14px; }\n      #ai-event-detail-layer .ai-event-file-reading:focus-visible,#ai-event-detail-layer .ai-event-reading-result>summary:focus-visible { outline:2px solid #07867d;outline-offset:3px; }\n";
            style.textContent += "\n      #ai-event-detail-layer .ai-event-merge-hint { margin:0 0 14px;color:#6e879e;font-size:13px;line-height:1.8; }\n      #ai-event-detail-layer input.ai-event-merge-checkbox { flex:0 0 16px;width:16px;min-width:16px;height:16px;min-height:16px;margin:0;padding:0;accent-color:#07867d;cursor:pointer; }\n      #ai-event-detail-layer .ai-event-merge-actions { display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--project-border,#e1e7ed);margin-top:16px;padding-top:16px; }\n      #ai-event-detail-layer .ai-event-merge-actions>span { color:#6e879e;font-size:13px; }\n      #ai-event-detail-layer .ai-event-merge-actions>button { padding:10px 16px;background:#07867d;color:#fff;border-radius:8px;font-weight:500; }\n      #ai-event-detail-layer .ai-event-merge-actions>button:disabled { background:#d9e3e6;color:#92a3ad;cursor:default; }\n      #ai-event-detail-layer .ai-event-section-heading>button[data-merge-toggle] { white-space:nowrap;font-size:13px; }\n";
            root.appendChild(style);
            const container=document.createElement('section');
            container.id='ai-assistant-layer';
            container.dataset.profileStandalone='true';
            container.innerHTML=`<div class="ai-assistant-host-actions" aria-label="宿主操作控件"><button class="ai-assistant-host-button" type="button" aria-label="更多操作"><img src="${"./page-assets/images/c27349e8d565d57264cbe822a60f84c17cab4ddd07746fade8a82172d2bbf5ef.png"}" alt="" aria-hidden="true"></button><span class="ai-assistant-host-divider" aria-hidden="true"></span><button class="ai-assistant-host-button" type="button" aria-label="关闭我的"><img src="${"./page-assets/images/655cdaa81fb3e1fbe91a979f884eb863f007be5147c8c3d1ac982bf4c094e6f0.png"}" alt="" aria-hidden="true"></button></div>`;
            root.appendChild(container);
          }
          const container=host.shadowRoot.getElementById('ai-assistant-layer');
          const layer=mountProfilePage(null,container);
          container.querySelector(':scope > .ai-assistant-host-actions')?.remove();
          return layer;
        };

        document.addEventListener('click', (event) => {
          const profileButton = event.target.closest('.ai-assistant-profile');
          if (!profileButton) return;
          event.preventDefault();
          event.stopPropagation();
          mountProfilePage(profileButton);
        }, true);
      })();
    