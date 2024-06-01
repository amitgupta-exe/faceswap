document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('mySidebar');
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Sidebar';
    toggleButton.onclick = () => {
      sidebar.classList.toggle('open');
    };
    document.body.appendChild(toggleButton);
  });
  

  document.addEventListener('DOMContentLoaded', () => {
    const snipBtn = document.getElementById('snipBtn');
    snipBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'startSnipping'}, (response) => {
        console.log(response.status);
      });
    });
  });
  