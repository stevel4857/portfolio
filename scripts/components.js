// Simple component loader for static site
// Usage: Include this script and add data-component="nav" to placeholder elements

async function loadComponent(element) {
  const componentName = element.getAttribute('data-component');
  if (!componentName) return;

  try {
    const response = await fetch(`/components/${componentName}.html`);
    if (!response.ok) {
      console.warn(`Component "${componentName}" not found`);
      return;
    }
    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error(`Failed to load component "${componentName}":`, error);
  }
}

async function loadAllComponents() {
  const placeholders = document.querySelectorAll('[data-component]');
  await Promise.all(Array.from(placeholders).map(loadComponent));
  initMobileMenu();
}

function initMobileMenu() {
  const buttons = document.querySelectorAll('#mobile-menu-button');
  buttons.forEach((button) => {
    const menuId = button.getAttribute('aria-controls');
    const menu = document.getElementById(menuId);
    if (!menu) return;

    const icon = button.querySelector('i');

    const closeMenu = () => {
      menu.classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    };

    const openMenu = () => {
      menu.classList.remove('hidden');
      button.setAttribute('aria-expanded', 'true');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      }
    };

    const toggleMenu = (e) => {
      if (e) e.stopPropagation();
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    button.addEventListener('click', toggleMenu);

    // Prevent default on touchstart to avoid 300ms delay and ghost clicks on mobile
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Close when clicking any link in the menu
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !button.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        closeMenu();
        button.focus();
      }
    });
  });
}

// Auto-load when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
  loadAllComponents();
}
