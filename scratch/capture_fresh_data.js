import { execSync } from "child_process";
import path from "path";

const artDir = `C:\\Users\\DANTECH\\.gemini\\antigravity-ide\\brain\\7bbe31bb-c042-4a66-a7a9-4a38c1139201`;
const chromePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

const urls = [
  { url: "http://localhost:8081/", out: path.join(artDir, "new_data_home.png") },
  { url: "http://localhost:8081/products", out: path.join(artDir, "new_data_products.png") },
  { url: "http://localhost:8081/products/calla-lily-elegance-bouquet", out: path.join(artDir, "new_data_detail.png") },
  { url: "http://localhost:8081/admin/products", out: path.join(artDir, "new_data_admin.png") },
];

for (const item of urls) {
  console.log("Capturing:", item.url);
  const cmd = `${chromePath} --headless=new --disable-gpu --window-size=1920,1080 --screenshot="${item.out}" "${item.url}"`;
  try {
    execSync(cmd, { timeout: 15000 });
    console.log("Saved:", item.out);
  } catch (err) {
    console.error("Capture error:", err.message);
  }
}
