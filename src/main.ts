import { appWindow } from '@tauri-apps/api/window';
import { register } from '@tauri-apps/api/globalShortcut';
let ignoreCursorEvents = false; // Variable para almacenar el estado

(async () => {
  await register('CommandOrControl+O', async () => {
    ignoreCursorEvents = !ignoreCursorEvents; // Cambiar el estado
    if (ignoreCursorEvents) {
      await appWindow.setIgnoreCursorEvents(true); // Bloquear eventos del cursor
    } else {
      await appWindow.setIgnoreCursorEvents(false); // Permitir eventos del cursor
    }
       
    console.log('Shortcut triggered');
  });
})()
