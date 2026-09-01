# Scroll Restoration - Quick Reference Card

## 🚀 Quick Start

The scroll restoration is **already active**. No additional setup needed!

## 📍 How to Use Image Classes

### Product Images (Square - 1:1)
```tsx
<div className="product-image">
  <Image src="/product.jpg" alt="Product" fill />
</div>
```

### Hero Images (Wide - 16:9)
```tsx
<div className="hero-image">
  <Image src="/hero.jpg" alt="Hero" fill />
</div>
```

### Collection Images (4:3)
```tsx
<div className="collection-image">
  <Image src="/collection.jpg" alt="Collection" fill />
</div>
```

### Custom Container
```tsx
<div data-image-container className="aspect-[3/4]">
  <Image src="/custom.jpg" alt="Custom" fill />
</div>
```

## 🔍 Quick Tests

### Test 1: Basic Test (30 seconds)
1. Navigate to homepage
2. Scroll to middle
3. Press F5
4. ✅ Should return to same position

### Test 2: Slow Network (1 minute)
1. Open DevTools (F12)
2. Network → Throttle → Slow 3G
3. Navigate to product page
4. Scroll down
5. Refresh
6. ✅ Should restore after images load

### Test 3: Mobile (30 seconds)
1. Open DevTools
2. Toggle device toolbar
3. Select iPhone or Android
4. Scroll and refresh
5. ✅ Should work on mobile

## 🐛 Quick Debugging

### Check if it's working:
```javascript
// In browser console:
console.log(sessionStorage.getItem('pavira_scroll_position'));
console.log(window.scrollY);
```

### Clear saved position:
```javascript
sessionStorage.removeItem('pavira_scroll_position');
```

### Check current scroll:
```javascript
console.log('Current Y:', window.scrollY);
```

## ⚙️ Configuration

### Modify restoration delays (if needed)
Edit `utils/scrollRestoration.ts`:
```typescript
const RESTORATION_ATTEMPTS = [0, 100, 300, 600, 1000, 1500, 2000];
```

### Modify debounce delay (if needed)
```typescript
const DEBOUNCE_DELAY = 150; // milliseconds
```

## 🎯 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Not restoring at all | Check browser console for errors |
| Slight jump | Add aspect-ratio to images |
| Works desktop, not mobile | Test in actual mobile browser |
| Slow on image-heavy pages | Images need aspect-ratio CSS |
| Dynamic content breaks it | Add `data-loading="true"` attribute |

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 🔧 Utility Functions

### Save scroll manually (for custom navigation)
```typescript
import { saveCurrentScrollPosition } from '@/utils/scrollRestoration';

saveCurrentScrollPosition();
```

### Clear scroll manually
```typescript
import { clearScrollPosition } from '@/utils/scrollRestoration';

clearScrollPosition();
```

## 📊 What Gets Stored

```json
{
  "x": 0,
  "y": 1250,
  "pathname": "/products/wall-clock",
  "timestamp": 1725148800000
}
```

Stored in: `sessionStorage.pavira_scroll_position`

## ✅ 5-Minute Test Procedure

1. **Homepage Test** (1 min)
   - Scroll to middle → Refresh → ✅ Position maintained

2. **Product Page Test** (1 min)
   - Open product → Scroll → Refresh → ✅ Position maintained

3. **Collection Page Test** (1 min)
   - Open collection → Scroll → Refresh → ✅ Position maintained

4. **Slow Network Test** (1 min)
   - Enable throttling → Scroll → Refresh → ✅ Works after load

5. **Mobile Test** (1 min)
   - Device emulation → Scroll → Refresh → ✅ Works on mobile

**If all 5 pass: ✅ Implementation successful!**

## 🚨 Emergency Disable

If you need to temporarily disable scroll restoration:

**Option 1:** Comment out in `app/layout.tsx`:
```tsx
{/* <ScrollRestoration /> */}
```

**Option 2:** Add to `utils/scrollRestoration.ts`:
```typescript
export function initScrollRestoration(): void {
  return; // Disabled
  // ... rest of code
}
```

## 📞 Need Help?

1. Check `SCROLL_RESTORATION_GUIDE.md` for detailed info
2. Check browser console for errors
3. Verify sessionStorage is enabled
4. Test in incognito/private mode

---

**Version:** 1.0.0 | **Updated:** Sept 1, 2026
