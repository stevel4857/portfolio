// Simple component loader for static site
// Usage: Include this script and add data-component="nav" to placeholder elements

async function loadComponent(element) {
  const componentName = element.getAttribute('data-component');
  if (!componentName) return;

  try {
    const response = await fetch(`components/${componentName}.html`);
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
}

// Auto-load when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
  loadAllComponents();
}
