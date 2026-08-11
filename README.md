# PixelForge Launcher

A modern, lightweight Minecraft launcher built with **Electron**, **Vue 3**, and **XMCL**.

## 🎯 Features

- **Multi-Instance Management** — Create, manage, and launch multiple Minecraft instances
- **Mod Support** — CurseForge and Modrinth integration (coming soon)
- **Clean UI** — Dark theme with Vuetify components
- **Cross-Platform** — Built with Electron (Windows, macOS, Linux)
- **Browser-Only CI** — GitHub Actions for automated builds

## 🛠️ Tech Stack

- **Electron** — Desktop shell
- **Vue 3** — UI framework
- **TypeScript** — Type-safe development
- **Vuetify** — UI component library
- **XMCL** — Minecraft launcher core
- **Vite** — Fast bundling
- **pnpm** — Package management

## 📦 Setup

### Prerequisites

- **Node.js 22+**
- **pnpm** (`npm i -g pnpm`)
- **Java** (for Minecraft launching)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/viperxc24odmaker/PixelForge-Launcher.git
   cd PixelForge-Launcher
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development:
   ```bash
   pnpm run dev
   ```

   This will start Vite dev server + Electron app simultaneously.

## 🚀 Building

### Development Build
```bash
pnpm run dev
```

### Production Build
```bash
pnpm run build
```

This outputs a Windows `.exe` installer to `release/`

## 📁 Project Structure

```
src/
├── main/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # IPC bridge
│   ├── minecraft.ts     # Minecraft launcher logic
│   └── utils.ts
├── views/
│   ├── Home.vue         # Home screen
│   ├── Instances.vue    # Instance manager
│   ├── Mods.vue         # Mod browser
│   └── Settings.vue     # Settings
├── stores/
│   └── minecraft.ts     # Pinia store for state
├── router/
│   └── index.ts         # Vue Router config
├── plugins/
│   └── vuetify.ts       # Vuetify theme
├── App.vue
└── main.ts

.github/
└── workflows/
    └── build.yml        # CI/CD workflow

index.html
package.json
tsconfig.json
vite.config.ts
```

## 🎮 Minecraft Features (MVP)

- ✅ Instance creation and management
- ✅ Minecraft version selection (1.20.1, 1.20, 1.19.2, etc.)
- ✅ Loader support (Vanilla, Forge, Fabric)
- ✅ Launch game from launcher
- 🔜 CurseForge/Modrinth mod browsing
- 🔜 Modpack import
- 🔜 Skin viewer

## 🔨 Next Steps

1. **Wire XMCL fully** — Implement real instance scanning/creation
2. **Add mod browser** — Connect CurseForge/Modrinth APIs
3. **Polish UI** — Refine designs, add animations
4. **Test launcher** — Full E2E testing
5. **Release build** — Generate `.exe` and sign

## 📝 License

MIT
