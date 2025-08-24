# Hover Scroll Synchronization Test Report

## 📋 User Requirement
**中间主表格、两侧固定列，hover其中一个上下滚动的时候，另外一者也要同步上下滚动**

*English: Main table and fixed columns on both sides, when hovering over one and scrolling up and down, the other should synchronize scrolling*

## 🔍 Current Implementation Analysis

### ✅ What's Working Well

1. **Comprehensive Test Functions Available**
   - ✅ `window.testVerticalSync(scrollTop)` - Tests vertical scroll synchronization
   - ✅ `window.testHoverScrollSync()` - Tests hover scroll sync functionality
   - ✅ `window.forceScroll(target, scrollTop)` - Force scroll individual components
   - ✅ `window.testMainTableDOMQuery()` - Tests main table DOM detection
   - ✅ `window.checkRefConnections()` - Checks component ref connections
   - ✅ `window.testScrollEvents()` - Tests scroll event binding
   - ✅ `window.testWheelEvents(deltaY)` - Tests wheel event handling

2. **VXE-Table Style Synchronization**
   - ✅ Implements `vxeStyleAbsoluteSync()` with synchronization locks
   - ✅ Prevents infinite recursion with `isSyncing` ref
   - ✅ Handles both wheel events and scroll events
   - ✅ Uses global boundary constraints for consistent scrolling

3. **DOM Query Fallback System**
   - ✅ Primary method: Component refs (`bodyRef.value`, `leftBodyWrapperRef.value`, etc.)
   - ✅ Fallback method: DOM queries (`.vant-table-body`, `.vant-table-fixed__body`)
   - ✅ Retry mechanism with exponential backoff

4. **Event Handling Coverage**
   - ✅ Main table: `handleMainTableWheel`, `handleScroll`
   - ✅ Fixed columns: `handleFixedColumnWheel`, `handleFixedColumnScroll`
   - ✅ Touch events: Basic touch event handlers
   - ✅ Mouse events: `handleAreaMouseEnter`, `handleAreaMouseLeave`

### ⚠️ Potential Issues Identified

1. **Ref Connection Issues**
   ```javascript
   // From the logs mentioned by user:
   // - headerContentRef and bodyRef not being connected properly
   // - Fixed column refs are being connected successfully through DOM queries
   ```

2. **Component Import Path Mismatch**
   ```vue
   // example/App.vue imports:
   import VantTable from '@cc/vant-table'
   import '@cc/vant-table/dist/index.css'
   
   // But the actual component is at:
   // src/VantTable.vue
   ```

3. **Timing Issues**
   - Component mounting timing
   - Ref connection timing
   - Event handler binding timing

### 🧪 Test Setup

The current example provides ideal testing conditions:
- **Data**: 40 rows of test data
- **Height**: 330px (creates scrollable content)
- **Fixed Columns**: 
  - Left: ID column (`fixed: 'left'`)
  - Right: Actions column (`fixed: 'right'`)
- **Scrollable Content**: Sufficient data to trigger vertical scrolling

## 🔧 How to Test

### Method 1: Using Test HTML Page
1. Open the test page at: `/test-hover-scroll-sync.html`
2. Click the test buttons to run various checks
3. View results in the console outputs

### Method 2: Using Browser Console
1. Open `http://localhost:3001/` in browser
2. Copy and paste the content of `/test-scroll-sync-console.js`
3. Run the comprehensive test suite

### Method 3: Manual Testing
1. Open `http://localhost:3001/`
2. Use the browser console to run individual tests:
   ```javascript
   // Check if test functions are available
   console.log(typeof window.testVerticalSync);
   console.log(typeof window.testHoverScrollSync);
   
   // Test vertical synchronization
   window.testVerticalSync(100);
   
   // Test hover scroll sync
   window.testHoverScrollSync();
   
   // Quick manual test
   window.quickScrollTest(50);
   ```

## 📊 Expected Test Results

### ✅ Successful Scenario
```
🔍 Checking ref connections...
✅ Main component successfully gets header content ref
✅ Main component successfully gets table body ref  
✅ Main component successfully gets left fixed column body ref
✅ Main component successfully gets right fixed column body ref

🧪 Testing vertical sync with scrollTop: 100px...
✅ Main table scrollTop set: 100
✅ Left fixed column scrollTop set: 100  
✅ Right fixed column scrollTop set: 100
✅ Sync successful: true
```

### ⚠️ Partial Success Scenario  
```
⚠️ Main component unable to get header content ref
✅ Main component successfully gets table body ref
✅ Method 2 successful: Get left fixed column via DOM query
✅ Method 2 successful: Get right fixed column via DOM query

🧪 Testing vertical sync with scrollTop: 100px...
✅ Main table scrollTop set: 100
✅ Left fixed column scrollTop set: 100
✅ Right fixed column scrollTop set: 100  
✅ Sync successful via DOM fallback: true
```

### ❌ Problem Scenario
```
⚠️ Main component unable to get table body ref
❌ 5 retries later still unable to get left fixed column body ref
❌ 5 retries later still unable to get right fixed column body ref

🧪 Testing vertical sync with scrollTop: 100px...
❌ Skip main table sync (bodyRef and DOM query both failed)
❌ Skip left fixed column sync (leftBodyWrapperRef does not exist)
❌ Skip right fixed column sync (rightBodyWrapperRef does not exist)
```

## 🛠️ Troubleshooting Guide

### Issue 1: Test Functions Not Available
**Symptoms**: `window.testVerticalSync is not a function`

**Solutions**:
1. Ensure VantTable component is mounted
2. Check browser console for component loading errors
3. Verify the development server is running correctly

### Issue 2: Ref Connections Failing
**Symptoms**: `⚠️ Main component unable to get table body ref`

**Solutions**:
1. Run `window.forceReconnectRefs()` to retry connections
2. Check component mounting order
3. Verify Vue component lifecycle timing

### Issue 3: DOM Elements Not Found
**Symptoms**: `❌ Skip main table sync (bodyRef and DOM query both failed)`

**Solutions**:
1. Run `window.testMainTableDOMQuery()` to check DOM structure
2. Inspect the actual rendered HTML structure
3. Check CSS class names match expectations

### Issue 4: Scroll Sync Not Working
**Symptoms**: Scroll positions don't synchronize

**Solutions**:
1. Test individual components: `window.forceScroll('main', 100)`
2. Check event binding: `window.testScrollEvents()`
3. Verify wheel event handling: `window.testWheelEvents(50)`

## 🎯 Key Implementation Details

### Synchronization Logic
```javascript
// VXE-table style synchronization with locks
const vxeStyleAbsoluteSync = (targetScrollTop, targetScrollLeft, skipSource = null) => {
  if (isSyncing.value) return; // Prevent infinite loops
  
  isSyncing.value = true;
  
  // Sync all containers to the same position
  // - Main table
  // - Left fixed column  
  // - Right fixed column
  // - Header (horizontal only)
  
  isSyncing.value = false;
}
```

### Event Handling Strategy
```javascript
// Main table wheel event
handleMainTableWheel(event) => {
  event.preventDefault(); // Manual control
  vxeStyleAbsoluteSync(newScrollTop, newScrollLeft, null);
}

// Fixed column wheel event  
handleFixedColumnWheel(event) => {
  event.preventDefault(); // Manual control
  vxeStyleAbsoluteSync(newScrollTop, newScrollLeft, null);
}
```

### Ref Connection Pattern
```javascript
// Primary: Component refs
headerContentRef.value = tableHeaderRef.value?.headerContentRef?.value;
bodyRef.value = tableBodyRef.value?.bodyRef?.value;

// Fallback: DOM queries
const mainBodyElements = document.querySelectorAll('.vant-table-body');
const leftFixedElements = document.querySelectorAll('.vant-table-fixed--left .vant-table-fixed__body');
```

## 📈 Recommendations

### For Testing
1. **Always run the comprehensive test suite first** to get an overall assessment
2. **Use the test HTML page** for a user-friendly testing interface  
3. **Run manual scroll tests** to verify real-world behavior
4. **Check browser console** for detailed logging during tests

### For Development
1. **Monitor ref connection logs** during component mounting
2. **Use the DOM fallback system** as a reliable backup
3. **Test with various data sizes** to ensure scrolling works with different content heights
4. **Verify event binding** on both desktop and mobile devices

### For Deployment
1. **Include the test functions** in development builds for debugging
2. **Remove console logging** in production builds for performance
3. **Test across different browsers** to ensure compatibility
4. **Verify touch event handling** on mobile devices

## 🔗 Test Resources

- **Test HTML Page**: `/test-hover-scroll-sync.html`
- **Console Test Script**: `/test-scroll-sync-console.js`  
- **Development Server**: `http://localhost:3001/`
- **Component Source**: `/src/VantTable.vue`
- **Scroll Handlers**: `/src/composables/useScrollHandlers.js`

## 📝 Test Commands Summary

```javascript
// Quick assessment
window.testHoverScrollSync();

// Comprehensive test
window.testHoverScrollFunctionality.runAllTests();

// Manual scroll test
window.quickScrollTest(100);

// Check connections
window.checkRefConnections();

// Force scroll individual components
window.forceScroll('main', 50);
window.forceScroll('left', 50);  
window.forceScroll('right', 50);

// Test DOM queries
window.testMainTableDOMQuery();
```

Run these commands in the browser console at `http://localhost:3001/` to test the hover scroll synchronization functionality.