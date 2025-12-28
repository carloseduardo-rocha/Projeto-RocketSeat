<h1 align="center">👨‍💻 Carlos Eduardo - Full Stack Developer</h1>

<p align="center">
  <strong>Portfolio pessoal desenvolvido durante o programa Discover da Rocketseat</strong>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-features">Features</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-technologies">Technologies</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-project-structure">Project Structure</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-getting-started">Getting Started</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-license">License</a>
</p>

<p align="center">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/carloseduardo-rocha/Projeto-RocketSeat?color=00ffff&style=flat-square">
  <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/carloseduardo-rocha/Projeto-RocketSeat?color=00ffff&style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-49AA26?style=flat-square">
  <img alt="Status" src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square">
</p>

<p align="center">
  <img alt="Portfolio Preview" src=".github/preview.jpg" width="90%">
</p>

## 🚀 Live Demo

🔗 **Acesse o portfolio online:** [https://carloseduardo-rocha.github.io/Projeto-RocketSeat/](https://carloseduardo-rocha.github.io/Projeto-RocketSeat/)

## ✨ Features

### 🎨 **Design & UI/UX**
- ✅ **Dark/Light Theme Toggle** - Switch com animação suave e persistência
- ✅ **Responsive Design** - Adaptável para mobile, tablet e desktop
- ✅ **Particle Background** - Sistema de partículas interativas com mouse
- ✅ **Modern Card Design** - Cards com hover effects e gradientes

### 🎮 **Interactive Elements**
- ✅ **Snake Mini-Game** - Jogo completo com controles por teclado e mobile
- ✅ **Theme Persistence** - Salva preferência no localStorage
- ✅ **Smooth Animations** - Transições e efeitos visuais otimizados
- ✅ **Interactive Links** - Links com feedback visual

### 📱 **Responsive Features**
- ✅ **Mobile Controls** - Controles touch para o jogo Snake
- ✅ **Adaptive Layout** - Grids que se ajustam automaticamente
- ✅ **Touch-friendly** - Elementos com tamanhos adequados para touch

## 🛠️ Technologies

<div align="center">
  
| Frontend | Styling | Interactive |
|----------|---------|-------------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| **Canvas API** | **CSS Variables** | **LocalStorage** |
| **Ionicons** | **Google Fonts** | **Responsive Design** |

</div>

## 📁 Project Structure

```
Projeto-RocketSeat/
├── 📄 index.html          # Main HTML structure
├── 🎨 style.css           # All styles with CSS variables
├── ⚡ script.js           # Main JavaScript functionality
├── 📁 assets/             # Images and resources
│   ├── avatar.png        # Profile image (dark mode)
│   ├── avatar-light.png  # Profile image (light mode)
│   ├── bg-desktop.jpg    # Desktop background
│   └── bg-mobile.jpg     # Mobile background
├── 📁 .github/            # GitHub configurations
│   └── preview.jpg       # Project preview image
└── 📄 README.md          # This documentation
```

## 🚀 Getting Started

### 📋 Prerequisites
- Navegador moderno (Chrome, Firefox, Edge)
- Git (para clonar o repositório)

### ⚡ Quick Start
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/carloseduardo-rocha/Projeto-RocketSeat.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd Projeto-RocketSeat
   ```

3. **Abra no navegador:**
   - Duplo clique no `index.html`
   - Ou use um live server (VS Code)

### 🎯 Key Features Implementation

#### **Theme System**
```javascript
// Toggle between dark/light themes with localStorage
function toggleMode() {
  const html = document.documentElement;
  html.classList.toggle("light");
  localStorage.setItem("theme", html.classList.contains("light") ? "light" : "dark");
}
```

#### **Snake Game Engine**
- Grid-based movement (20x20)
- Score tracking with high score persistence
- Visual effects on food consumption
- Mobile touch controls

#### **Particle System**
- Interactive particles that react to mouse movement
- Theme-based color changes
- Performance optimized with requestAnimationFrame

## 🤝 Contributing

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 License

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 🙏 Acknowledgments

- Agradecimentos à [Rocketseat](https://www.rocketseat.com.br/) pelo programa Discover
- Inspiração do design moderno e clean
- Comunidade de desenvolvimento por compartilhar conhecimento

---
<div align="center">
  
⭐️ Se este projeto te ajudou, considere dar uma estrela no repositório!

</div>
