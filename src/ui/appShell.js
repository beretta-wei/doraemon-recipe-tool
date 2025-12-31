export function renderAppShell(container) {
  container.innerHTML = `
    <section class="app-shell">
      <h1 class="app-shell__title">Doraemon Recipe Tool</h1>
      <p class="app-shell__subtitle">功能將從這裡逐步擴充。</p>
      <div class="tabs" data-tabs>
        <div class="tabs__list" role="tablist" aria-label="功能頁籤" data-tabs-list></div>
        <div class="tabs__panels">
          <section
            class="tabs__panel is-active"
            role="tabpanel"
            tabindex="0"
            data-tab-panel="content"
          ></section>
        </div>
      </div>
    </section>
  `;
}
