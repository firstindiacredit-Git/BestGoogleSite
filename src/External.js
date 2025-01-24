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

    // Create the WhatsApp button with the new design
    const chatButton = document.createElement('button');
    chatButton.className = 'Btn';
    chatButton.innerHTML = `
      <div class="sign">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <path d="M0 0 C0.7027002 -0.00191345 1.40540039 -0.0038269 2.12939453 -0.00579834 C3.61556354 -0.00715975 5.10174445 -0.00346632 6.58789062 0.00488281 C8.86615646 0.01558346 11.14363377 0.00498661 13.421875 -0.0078125 C14.86458508 -0.0064909 16.30729466 -0.00392849 17.75 0 C19.06742188 0.00225586 20.38484375 0.00451172 21.7421875 0.00683594 C24.875 0.265625 24.875 0.265625 26.875 2.265625 C27.0703125 4.8671875 27.0703125 4.8671875 27 7.890625 C26.98195312 8.89351562 26.96390625 9.89640625 26.9453125 10.9296875 C26.92210937 11.70054688 26.89890625 12.47140625 26.875 13.265625 C27.57367188 13.24242187 28.27234375 13.21921875 28.9921875 13.1953125 C30.35730469 13.16824219 30.35730469 13.16824219 31.75 13.140625 C33.10738281 13.10582031 33.10738281 13.10582031 34.4921875 13.0703125 C36.875 13.265625 36.875 13.265625 38.875 15.265625 C39.04995606 17.77483346 39.10669569 20.17187441 39.0703125 22.6796875 C39.0674826 23.40932709 39.06465271 24.13896667 39.06173706 24.89071655 C39.05053002 27.22418528 39.0254251 29.55727203 39 31.890625 C38.98997085 33.47134863 38.98084489 35.05207827 38.97265625 36.6328125 C38.95058905 40.51056414 38.91605615 44.38802978 38.875 48.265625 C37.72873678 47.28696162 36.58300212 46.30767913 35.4375 45.328125 C34.79941406 44.78285156 34.16132812 44.23757812 33.50390625 43.67578125 C32.60508851 42.89766805 31.71563472 42.10625972 30.875 41.265625 C29.04600475 41.13204353 27.21227786 41.06214778 25.37890625 41.01953125 C24.26322266 40.98666016 23.14753906 40.95378906 21.99804688 40.91992188 C19.6283502 40.85882712 17.25855272 40.80152245 14.88867188 40.74804688 C13.21321289 40.69680664 13.21321289 40.69680664 11.50390625 40.64453125 C10.47338135 40.6194751 9.44285645 40.59441895 8.38110352 40.56860352 C5.875 40.265625 5.875 40.265625 3.875 38.265625 C3.6796875 35.6640625 3.6796875 35.6640625 3.75 32.640625 C3.76804687 31.63773438 3.78609375 30.63484375 3.8046875 29.6015625 C3.82789063 28.83070312 3.85109375 28.05984375 3.875 27.265625 C-0.15043649 28.24743878 -2.78214945 29.63926768 -5.83984375 32.3515625 C-6.45851318 32.89603027 -7.07718262 33.44049805 -7.71459961 34.00146484 C-8.18003174 34.4186377 -8.64546387 34.83581055 -9.125 35.265625 C-9.17437279 30.60255486 -9.21070627 25.93963627 -9.23486328 21.27636719 C-9.24493188 19.68942617 -9.25858767 18.10250375 -9.27587891 16.515625 C-9.30009001 14.23693253 -9.31147422 11.95848494 -9.3203125 9.6796875 C-9.33063507 8.96817535 -9.34095764 8.25666321 -9.35159302 7.52359009 C-9.35199422 5.76930835 -9.24702209 4.01565791 -9.125 2.265625 C-6.22058341 -0.63879159 -4.05742155 0.00694764 0 0 Z" fill="#2999F2" transform="translate(9.125,-0.265625)"/>
        </svg>
      </div>
      <div class="text">Chat with us</div>
    `;
    


    // Create a wrapper div with the styled component styles
    const wrapper = document.createElement('div');
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .Btn {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 45px;
        height: 45px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        position: fixed;
        bottom: 20px;
        right: 20px;
        overflow: hidden;
        transition-duration: 0.3s;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
        background-color: #6366f1;
        z-index: 10000;
      }

      .sign {
        width: 100%;
        transition-duration: 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sign svg {
        width: 25px;
      }

      .sign svg path {
        fill: white;
      }

      .text {
        position: absolute;
        right: 0;
        width: 0;
        opacity: 0;
        color: white;
        font-size: 1.2em;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(50%);
        white-space: nowrap;
        pointer-events: none;
        overflow: hidden;
      }

      .Btn:hover {
        width: 150px;
        border-radius: 40px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .Btn:hover .sign {
        width: 30%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding-left: 10px;
      }

      .Btn:hover .text {
        opacity: 1;
        width: 70%;
        transform: translateX(0);
        padding-right: 10px;
      }

      .Btn:active {
        transform: translate(2px, 2px);
      }
    `;
    wrapper.appendChild(styleSheet);
    wrapper.appendChild(chatButton);

    chatButton.addEventListener("click", () => {
      iframe.style.display = iframe.style.display === "none" ? "block" : "none";
    });

    document.body.append(wrapper, iframe);
  }
});
