
      (() => {
        let phoneAuthorized = false;
        let recordCompleted = false;
        window.addEventListener('patient-v17-scene-change', event => {
          if (!['registration','my'].includes(event.detail?.scene)) return;
          phoneAuthorized = false;
          if (event.detail.scene === 'registration') recordCompleted = false;
          document.querySelector('#root #patient-record-layer')?.remove();
        });

        const recordMarkup = `
          <div class="patient-record-shell">
            <header class="patient-record-header">完善档案信息</header>
            <nav class="patient-record-steps" aria-label="建档步骤">
              <button class="patient-record-step is-active" type="button" data-record-step="1" aria-current="step">1 基础建档</button>
              <button class="patient-record-step" type="button" data-record-step="2">2 专项信息</button>
            </nav>
            <main class="patient-record-main">
              <section class="patient-record-panel" data-record-panel="1">
                <form class="patient-record-card" id="patient-basic-record-form">
                  <h2>基础建档信息</h2>
                  <div class="patient-record-field">
                    <label for="patient-name"><span class="patient-record-required">*</span>姓名</label>
                    <input id="patient-name" name="name" value="王大明" required />
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-phone"><span class="patient-record-required">*</span>手机号</label>
                    <input id="patient-phone" name="phone" type="tel" value="13800135621" required disabled />
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-gender"><span class="patient-record-required">*</span>性别</label>
                    <select id="patient-gender" name="gender" required>
                      <option value="male" selected>男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-id-card">身份证号（非必填）</label>
                    <input id="patient-id-card" name="idCard" placeholder="选填" />
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-birthday">出生日期（非必填）</label>
                    <input id="patient-birthday" name="birthday" type="date" value="1964-03-12" />
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-height">身高 cm（非必填）</label>
                    <input id="patient-height" name="height" inputmode="numeric" value="170" />
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-diagnosis">主要诊断（非必填）</label>
                    <input id="patient-diagnosis" name="diagnosis" value="非小细胞肺癌" />
                  </div>
                </form>
              </section>
              <section class="patient-record-panel" data-record-panel="2" hidden>
                <form class="patient-record-card" id="patient-special-record-form">
                  <h2>专项信息</h2>
                  <div class="patient-record-field">
                    <label for="patient-treatment-stage">当前治疗阶段（非必填）</label>
                    <select id="patient-treatment-stage" name="treatmentStage">
                      <option value="">请选择</option>
                      <option value="diagnosis">诊断期</option>
                      <option value="treatment">治疗期</option>
                      <option value="follow-up">随访期</option>
                    </select>
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-medication">目前用药（非必填）</label>
                    <input id="patient-medication" name="medication" placeholder="请输入目前用药" />
                  </div>
                  <div class="patient-record-field">
                    <label for="patient-special-note">补充说明（非必填）</label>
                    <textarea id="patient-special-note" name="note" placeholder="请输入补充说明"></textarea>
                  </div>
                </form>
              </section>
              <section class="patient-record-panel" data-record-panel="success" hidden>
                <div class="patient-record-card patient-record-success">
                  <strong>档案已完善</strong>
                  <p>基础信息与专项信息已保存，可继续使用患管助手服务。</p>
                </div>
              </section>
            </main>
            <footer class="patient-record-footer">
              <button class="patient-record-primary" type="submit" form="patient-basic-record-form" data-record-next>下一步</button>
            </footer>
          </div>`;

        const setStep = (layer, step) => {
          layer.querySelectorAll('[data-record-panel]').forEach((panel) => {
            panel.hidden = panel.dataset.recordPanel !== String(step);
          });
          layer.querySelectorAll('[data-record-step]').forEach((tab) => {
            const active = tab.dataset.recordStep === String(step);
            tab.classList.toggle('is-active', active);
            if (active) tab.setAttribute('aria-current', 'step');
            else tab.removeAttribute('aria-current');
          });

          const footer = layer.querySelector('.patient-record-footer');
          if (step === 1) {
            footer.className = 'patient-record-footer';
            footer.innerHTML = '<button class="patient-record-primary" type="submit" form="patient-basic-record-form" data-record-next>下一步</button>';
          } else if (step === 2) {
            footer.className = 'patient-record-footer has-back';
            footer.innerHTML = '<button class="patient-record-secondary" type="button" data-record-back>上一步</button><button class="patient-record-primary" type="button" data-record-finish>完成建档</button>';
          } else {
            footer.className = 'patient-record-footer';
            footer.innerHTML = '<button class="patient-record-primary" type="button" data-record-return>进入患管助手</button>';
          }
          layer.querySelector('.patient-record-main')?.scrollTo(0, 0);
        };

        const bindRecordFlow = (layer) => {
          layer.addEventListener('submit', (event) => {
            if (event.target.id !== 'patient-basic-record-form') return;
            event.preventDefault();
            if (event.target.reportValidity()) setStep(layer, 2);
          });

          layer.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            if (button.matches('[data-record-step="1"], [data-record-back]')) setStep(layer, 1);
            if (button.matches('[data-record-step="2"]')) setStep(layer, 2);
            if (button.matches('[data-record-finish]')) {
              recordCompleted = true;
              layer.remove();
            }
            if (button.matches('[data-record-return]')) layer.remove();
          });
        };

        const mountRecordFlow = () => {
          if (!phoneAuthorized) return false;
          if (recordCompleted || document.getElementById('patient-record-layer')) return true;
          const screen = document.querySelector('[data-testid="device-screen"]');
          if (!screen) return false;
          const layer = document.createElement('section');
          layer.id = 'patient-record-layer';
          layer.setAttribute('aria-label', '完善档案信息');
          layer.innerHTML = recordMarkup;
          screen.appendChild(layer);
          bindRecordFlow(layer);
          return true;
        };

        window.addEventListener('patient-scene-confirmed', () => {
          phoneAuthorized = true;
          window.setTimeout(mountRecordFlow, 220);
        });

        const observer = new MutationObserver(() => {
          if (phoneAuthorized && !recordCompleted && document.querySelector('.invite-page')) mountRecordFlow();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      })();
    