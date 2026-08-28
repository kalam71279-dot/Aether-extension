const goalEl = document.getElementById('goal');
const modeLabel = document.getElementById('modeLabel');

document.getElementById('backBtn').addEventListener('click', () => history.back());
document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'setFocusMode', active: false }, response => {
    if (response?.success) history.back();
  });
});

chrome.storage.local.get(['aetherFocusMode'], result => {
  const focus = result.aetherFocusMode;
  if (!focus?.active) {
    goalEl.textContent = 'Focus Mode is no longer active.';
    modeLabel.textContent = 'Focus ended';
    return;
  }
  modeLabel.textContent = focus.mode === 'strict' ? 'Strict Study Mode' : 'Research Mode';
  goalEl.textContent = focus.goal || 'Keep moving toward your study goal.';
});
