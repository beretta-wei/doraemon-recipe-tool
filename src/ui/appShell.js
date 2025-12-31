export function renderAppShell(container) {
  container.innerHTML = `
    <section class="app-shell container py-4 py-lg-5">
      <header class="mb-4">
        <h1 class="app-shell__title mb-1">Doraemon Recipe Tool</h1>
        <p class="app-shell__subtitle mb-0">功能將從這裡逐步擴充。</p>
      </header>
      <div class="tabs card shadow-sm" data-tabs>
        <div class="card-body p-3 p-md-4">
          <div
            class="tabs__list d-flex flex-nowrap gap-2 pb-3 mb-3 border-bottom overflow-auto"
            role="tablist"
            aria-label="功能頁籤"
            data-tabs-list
          ></div>
          <div class="tabs__panels">
            <section
              class="tabs__panel is-active"
              role="tabpanel"
              tabindex="0"
              data-tab-panel="content"
            ></section>
          </div>
        </div>
      </div>
    </section>
  `;
}
