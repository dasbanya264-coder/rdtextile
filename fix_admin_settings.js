const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');

// Modify uploadTask.on
content = content.replace(
  "uploadTask.on('state_changed', null, reject, async () => {",
  "uploadTask.on('state_changed', () => {}, reject, async () => {"
);

// Add auto-save
content = content.replace(
  "setSettings(prev => ({ \n        ...prev, \n        [type === 'banner' ? 'bannerUrl' : 'logoUrl']: downloadURL \n      }));",
  `const newSettings = { 
        ...settings, 
        [type === 'banner' ? 'bannerUrl' : 'logoUrl']: downloadURL 
      };
      setSettings(newSettings);
      
      // Auto-save to database
      setSaving(true);
      try {
        await setDoc(doc(db, 'settings', 'store'), newSettings, { merge: true });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setSaving(false);
      }`
);

// We need to make sure we use `settings` correctly in the closure, wait, in handleImageUpload `settings` might be stale!
// So it's better to fetch the latest or rely on `setSettings` callback. Let's rewrite `handleImageUpload` entirely to be safe.
