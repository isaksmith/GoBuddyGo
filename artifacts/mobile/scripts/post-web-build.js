const fs = require("fs");
const path = require("path");

const distIndex = path.join(__dirname, "..", "dist", "index.html");

if (!fs.existsSync(distIndex)) {
  console.error("dist/index.html not found, skipping post-build");
  process.exit(0);
}

let html = fs.readFileSync(distIndex, "utf-8");

html = html.replace(
  /<style id="expo-reset">[\s\S]*?<\/style>/,
  `<style id="expo-reset">
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        overflow: hidden;
        background: #0a0a1a;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #phone-frame {
        width: 390px;
        height: 844px;
        max-height: 100vh;
        max-width: 100vw;
        border-radius: 40px;
        overflow: hidden;
        box-shadow: 0 0 0 8px #1a1a2e, 0 0 0 10px #333, 0 20px 60px rgba(0,0,0,0.6);
        position: relative;
        background: #0D1B2A;
      }
      #root {
        display: flex;
        height: 100%;
        flex: 1;
      }
      @media (max-width: 430px) {
        #phone-frame {
          width: 100vw;
          height: 100vh;
          border-radius: 0;
          box-shadow: none;
        }
      }
    </style>`
);

html = html.replace(
  '<div id="root"></div>',
  '<div id="phone-frame"><div id="root"></div></div>'
);

fs.writeFileSync(distIndex, html, "utf-8");
console.log("Post-build: phone frame applied to dist/index.html");
