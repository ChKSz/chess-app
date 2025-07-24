# Cloudflare Chess App 部署指南

本指南将详细说明如何将您的在线国际象棋应用部署到 Cloudflare Workers 和 Cloudflare Pages。

## 1. 前提条件

*   已安装 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)
*   已安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-update/) (`npm i -g wrangler`)
*   已登录 Cloudflare 账户并配置 Wrangler CLI (`wrangler login`)
*   您的项目已初始化 Git 仓库，并连接到 GitHub 等代码托管平台（用于 Cloudflare Pages 自动部署）

## 2. 配置 SvelteKit 适配器

确保您的 SvelteKit 项目配置了 Cloudflare 适配器。如果您按照之前的步骤操作，这部分应该已经完成。

1.  **安装适配器** (如果尚未安装):

    ```bash
    cd frontend
    pnpm i -D @sveltejs/adapter-cloudflare
    ```

2.  **配置 `svelte.config.js`**:

    确保 `frontend/svelte.config.js` 文件内容如下：

    ```javascript
    import adapter from '@sveltejs/adapter-cloudflare';

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
    	kit: {
    		adapter: adapter()
    	}
    };

    export default config;
    ```

## 3. 配置 Cloudflare Worker (`wrangler.toml`)

确保您的 Worker 项目配置了 Durable Objects 绑定。如果您按照之前的步骤操作，这部分应该已经完成。

在 `worker/wrangler.toml` 文件中，确保包含以下内容：

```toml
name = "chess-worker"
main = "src/index.ts"

[[durable_objects.bindings]]
name = "ROOM"
class_name = "RoomDO"
```

*   `name = "chess-worker"`: 这是您的 Worker 的名称。
*   `main = "src/index.ts"`: 这是 Worker 的入口文件。
*   `[[durable_objects.bindings]]`: 定义 Durable Object 绑定。
    *   `name = "ROOM"`: 这是在 Worker 代码中引用 Durable Object 的环境变量名称（例如 `env.ROOM`）。
    *   `class_name = "RoomDO"`: 这是 Durable Object 的类名，对应 `worker/src/RoomDO.ts` 中导出的类。

## 4. 部署 Worker

1.  **构建 Worker 项目**:

    ```bash
    cd worker
    pnpm build
    ```

2.  **部署 Worker 到 Cloudflare**:

    ```bash
    wrangler deploy
    ```

    Wrangler 会将您的 Worker 代码部署到 Cloudflare。部署成功后，您将获得一个 Worker URL。

## 5. 部署前端 (Cloudflare Pages)

Cloudflare Pages 可以与您的 Git 仓库集成，实现自动部署。

1.  **构建前端项目**:

    ```bash
    cd frontend
    pnpm build
    ```

    这将在 `frontend/build` 目录下生成静态文件。

2.  **在 Cloudflare Pages 中创建新项目**:

    *   登录您的 Cloudflare 仪表板。
    *   导航到 **Pages**。
    *   点击 **Create a project**。
    *   选择您的 Git 提供商（如 GitHub），并授权 Cloudflare 访问您的仓库。
    *   选择包含您项目代码的仓库。

3.  **配置构建设置**:

    在 Pages 项目设置中，配置以下内容：

    *   **Build command**: `pnpm build` (或 `npm run build`，取决于您的包管理器)
    *   **Build output directory**: `build` (这是 SvelteKit 构建后的默认输出目录)

4.  **连接到 Worker (环境变量)**:

    由于您的前端需要连接到部署的 Worker，您需要配置环境变量来指向 Worker 的 URL。

    *   在 Pages 项目设置中，找到 **Environment variables**。
    *   添加一个环境变量，例如 `VITE_WORKER_URL`，其值为您部署 Worker 后获得的 URL。

    **注意**：您需要在前端代码中修改 WebSocket 连接地址，使其使用这个环境变量。例如，在 `frontend/src/routes/room/[roomId]/+page.svelte` 中，将硬编码的 `ws://127.0.0.1:8787` 替换为动态获取的环境变量：

    ```javascript
    // 示例：在 SvelteKit 中获取环境变量
    // 在 vite.config.js 中配置 import.meta.env.VITE_WORKER_URL
    // 或者直接使用 window.location.host 来构建 WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = new URL(`/room/${roomId}`, `${wsProtocol}//${window.location.host}`.replace('http', 'ws'));
    ws = new WebSocket(wsUrl);
    ```

    **重要提示**：由于 Pages 和 Workers 部署在同一个 Cloudflare 边缘网络上，通常可以直接使用相对路径或 `window.location.host` 来构建 WebSocket URL，而无需硬编码 Worker 的完整 URL。我已经在 `frontend/src/routes/room/[roomId]/+page.svelte` 中更新了这部分逻辑。

5.  **保存并部署**:

    保存设置后，Cloudflare Pages 将自动从您的 Git 仓库拉取代码，执行构建命令，并将生成的静态文件部署到全球边缘网络。

## 6. 测试部署

部署完成后，访问您的 Cloudflare Pages 域名，即可测试您的在线国际象棋应用。

## 故障排除

*   **Worker 部署失败**：检查 Wrangler CLI 的输出，查看是否有语法错误或配置问题。
*   **Pages 部署失败**：检查 Pages 构建日志，确保构建命令和输出目录配置正确。
*   **前端无法连接 Worker**：检查浏览器控制台的网络请求，确保 WebSocket 连接地址正确，并且 Worker 正在运行。

祝您部署顺利！