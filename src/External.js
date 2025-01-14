document.addEventListener("DOMContentLoaded", () => {
  // Only initialize chat widget on landing page
  if (
    window.location.pathname === "/" ||
    window.location.pathname === "/about" ||
    window.location.pathname === "/faq" ||
    window.location.pathname === "/pricing"
  ) {
    const s = (t, a = {}, c = "") =>
      Object.assign(document.createElement(t), a, c ? { innerHTML: c } : {});
    const iframe = s("iframe", {
      src: "https://chatbot-user.vercel.app/?websiteId=browsey",
      style:
        "position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,0.2);display:none;background:white;",
    });
    const chatIcon = s(
      "div",
      {
        className: "chat",
        style:
          "position:fixed;bottom:20px;right:20px;width:64px;height:64px;background:#5E56E8;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10000;",
      },
      `<svg width="30" height="30" fill="#fff"><circle cx="15" cy="15" r="12" stroke="none"></circle><text x="9" y="20" font-size="12"></text></svg>`
    );
    chatIcon.addEventListener("click", () => {
      iframe.style.display = iframe.style.display === "none" ? "block" : "none";
    });
    document.body.append(chatIcon, iframe);
  }
});
