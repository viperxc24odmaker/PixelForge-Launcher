import 'animate.css'
import 'vuetify/styles'

export const globalStyles = `
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  html, body {
    overflow: hidden;
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1929 100%);
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #7c3aed, #06b6d4);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #8b5cf6, #0ea5e9);
  }

  /* Card depth and hover */
  .v-card {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
  }

  .v-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top-left, rgba(124, 58, 237, 0.1), transparent 80%);
    pointer-events: none;
  }

  .v-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(124, 58, 237, 0.2),
                0 10px 20px rgba(6, 182, 212, 0.1);
    border-color: rgba(124, 58, 237, 0.3);
  }

  /* Button animations */
  .v-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease !important;
  }

  .v-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .v-btn:hover::before {
    width: 300px;
    height: 300px;
  }

  .v-btn:active {
    transform: scale(0.95);
  }

  .v-btn.v-btn--color-primary {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
  }

  .v-btn.v-btn--color-primary:hover {
    box-shadow: 0 15px 40px rgba(124, 58, 237, 0.5);
  }

  .v-btn.v-btn--color-secondary {
    background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
  }

  .v-btn.v-btn--color-secondary:hover {
    box-shadow: 0 15px 40px rgba(6, 182, 212, 0.5);
  }

  /* Input field depth */
  .v-field .v-field__control {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
  }

  .v-field .v-field__control:hover {
    background: rgba(255, 255, 255, 0.04) !important;
    border-color: rgba(124, 58, 237, 0.3) !important;
  }

  .v-field .v-field__control:focus-within {
    background: rgba(124, 58, 237, 0.1) !important;
    border-color: rgba(124, 58, 237, 0.6) !important;
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
  }

  /* Dialog overlay */
  .v-overlay {
    backdrop-filter: blur(4px);
  }

  /* List item hover */
  .v-list-item {
    transition: all 0.3s ease;
  }

  .v-list-item:hover {
    background: rgba(124, 58, 237, 0.1);
    transform: translateX(4px);
  }

  /* Tab animations */
  .v-tabs .v-tabs__nav {
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(124, 58, 237, 0.1);
  }

  .v-tabs .v-tab {
    transition: all 0.3s ease;
  }

  .v-tabs .v-tab:hover {
    background: rgba(124, 58, 237, 0.1);
  }

  .v-tabs .v-tab.v-tab--selected {
    color: #7c3aed;
  }

  /* Chip styling */
  .v-chip {
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .v-chip:hover {
    background: rgba(124, 58, 237, 0.2) !important;
    border-color: rgba(124, 58, 237, 0.4);
    transform: scale(1.05);
  }

  /* Badge animations */
  .v-badge {
    animation: badgeBounce 0.5s ease-out;
  }

  @keyframes badgeBounce {
    0% {
      transform: scale(0);
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Loading spinner */
  .v-progress-circular {
    animation: spinnerGlow 2s ease-in-out infinite;
  }

  @keyframes spinnerGlow {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.3));
    }
    50% {
      filter: drop-shadow(0 0 25px rgba(124, 58, 237, 0.8));
    }
  }

  /* Alert animations */
  .v-alert {
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: slideDown 0.4s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Page transition */
  .page-enter-active,
  .page-leave-active {
    transition: all 0.4s ease;
  }

  .page-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .page-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, #7c3aed, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Glow effect */
  .glow-effect {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4),
                0 0 40px rgba(6, 182, 212, 0.2);
  }

  /* Floating animation */
  .floating {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* Shimmer loading effect */
  .shimmer {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    background-size: 200% 100%;
    animation: shimmerLoading 2s infinite;
  }

  @keyframes shimmerLoading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`
