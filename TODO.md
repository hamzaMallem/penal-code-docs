# Font Size Control Feature - TODO

## Implementation Progress

### 1. Types Definition
- [x] Add `FontSize` type to `lib/types.ts`

### 2. CSS Updates
- [x] Add `--font-size-base` CSS variable to `app/globals.css`
- [x] Add font size utility classes
- [x] Update body font-size to use CSS variable

### 3. Custom Hook
- [x] Create `hooks/useFontSize.ts`
- [x] Implement localStorage persistence
- [x] Handle hydration mismatch

### 4. UI Component
- [x] Create `components/features/FontSizeControl.tsx`
- [x] Add increase/decrease/reset buttons
- [x] Arabic labels and accessibility

### 5. Integration
- [x] Export hook from `hooks/index.ts`
- [x] Add FontSizeControl to `components/layout/Header.tsx`

### 6. Testing
- [ ] Test in browser
- [ ] Verify localStorage persistence
- [ ] Test keyboard navigation
- [ ] Test RTL layout compatibility
