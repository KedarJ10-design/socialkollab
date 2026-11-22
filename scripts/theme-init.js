try {
  if (localStorage.getItem("tsk-theme") === "amber") {
    document.documentElement.setAttribute("data-theme", "amber");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#111410");
  }
} catch {}
