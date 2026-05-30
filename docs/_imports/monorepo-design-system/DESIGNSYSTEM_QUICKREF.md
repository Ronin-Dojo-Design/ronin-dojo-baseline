# 🎨 DesignSystem: Quick Reference Guide

## 🚀 Quick Start

### Access the Panel
Click the ⚙️ button in the bottom-right corner of any brand app (TuffBuffs, BlackBeltLegacy, WEKAF).

### Use Design Tokens
```jsx
import { useDesignSystem } from '../../components/DesignSystem';

const { theme, tokens, haptics } = useDesignSystem();

// Colors
tokens.colors[theme].accent.emphasis
tokens.colors[theme].fg.default

// Spacing
tokens.spacing[4]  // 1rem / 16px

// Shadows
tokens.shadows.lg

// Typography
tokens.typography.fontSizes.lg
```

## 📦 Components Quick Reference

### Skeleton Loaders
```jsx
import { Skeleton, SkeletonCard, SkeletonList } from '../../components/DesignSystem/Skeleton';

<Skeleton width="200px" height="1rem" />
<SkeletonCard showAvatar showImage textLines={3} />
<SkeletonList items={5} />
```

### Tooltips
```jsx
import { Tooltip } from '../../components/DesignSystem/Tooltip';

<Tooltip content="Info" placement="top" variant="accent">
  <button>Hover me</button>
</Tooltip>
```

### Transitions
```jsx
import { TransitionCard, StaggerGroup } from '../../components/DesignSystem/TransitionCard';

<TransitionCard transition="slideUp" duration={300}>
  <Card />
</TransitionCard>

<StaggerGroup transition="slideUp" staggerDelay={100}>
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</StaggerGroup>
```

### Shared Components
```jsx
import { BrandHeader, BrandFooter } from '../../components/shared';

<BrandHeader
  brandName="TuffBuffs"
  brandColors={{ background: '#fff', text: '#000' }}
  logo={<Logo />}
  navigation={<Nav />}
/>

<BrandFooter
  brandName="TuffBuffs"
  brandColors={{ background: '#fff', text: '#000' }}
  socialLinks={[{ name: 'Instagram', icon: 'instagram', url: '...' }]}
  email="info@example.com"
/>
```

## 🎨 Brand Colors

### TuffBuffs
- Primary: `#CFB87C` (CU Gold)
- Secondary: `#000000` (Black)
- Accent: `#FFD700` (Bright Gold)

### Black Belt Legacy
- Primary: `#8B0000` (Dark Red)
- Secondary: `#000000` (Black)
- Accent: `#FFD700` (Gold)

### WEKAF-USA
- Primary: `#1e40af` (Royal Blue)
- Secondary: `#dc2626` (Red)
- Accent: `#fbbf24` (Amber/Gold)

## 📱 Haptic Feedback

```jsx
const { haptics } = useDesignSystem();

haptics.light()    // Subtle tap
haptics.medium()   // Standard interaction
haptics.heavy()    // Important action
haptics.success()  // Success pattern
haptics.error()    // Error pattern
```

## 🔧 Customization

### Interactive Creators
1. **Skeleton Picker**: Choose skeleton styles visually
2. **Tooltip Creator**: Design custom tooltips
3. **Transition Creator**: Preview animations

### Token Overrides
```jsx
const { updateToken, resetTokens } = useDesignSystem();

updateToken('colors.light.accent.emphasis', '#FF0000');
resetTokens();  // Reset all customizations
```

## 📚 Documentation

- **Full Documentation**: `src/components/DesignSystem/README.md`
- **Implementation Summary**: `DESIGNSYSTEM_SUMMARY.md`
- **API Reference**: See DesignSystem README

## 🎯 Common Patterns

### Loading States
```jsx
{isLoading ? (
  <SkeletonCard showAvatar textLines={3} />
) : (
  <ActualCard data={data} />
)}
```

### Animated Lists
```jsx
<StaggerGroup transition="slideUp" staggerDelay={100}>
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</StaggerGroup>
```

### Informative Buttons
```jsx
<Tooltip content="Save your changes" placement="top" variant="accent">
  <button onClick={handleSave}>Save</button>
</Tooltip>
```

### Responsive Spacing
```jsx
style={{
  padding: tokens.spacing[4],     // Mobile
  '@media (min-width: 768px)': {
    padding: tokens.spacing[8],   // Desktop
  }
}}
```

## ⚠️ Best Practices

### DO ✅
- Always use design tokens instead of hardcoded values
- Access colors via `tokens.colors[theme]` for theme support
- Use semantic color names (accent, success, danger)
- Add haptic feedback to interactive elements
- Use skeleton loaders for loading states

### DON'T ❌
- Don't hardcode colors, spacing, or font sizes
- Don't ignore theme context
- Don't create brand-specific design tokens
- Don't skip loading states
- Don't forget accessibility (ARIA labels)

## 🔍 Troubleshooting

### Theme not updating?
Make sure component is wrapped in `DesignSystemProvider`

### Tokens undefined?
Use `useDesignSystem()` hook inside components

### Haptics not working?
Haptics require mobile device with vibration support

### Panel not showing?
Include `<DesignSystemPanel />` in your app

## 📞 Support

See `src/components/DesignSystem/README.md` for:
- Detailed API documentation
- Complete component reference
- Advanced usage patterns
- Integration examples

## 🎉 Features at a Glance

✅ GitHub-inspired design system  
✅ Light/Dark themes  
✅ 4 brand configurations  
✅ Skeleton loaders (5 variants)  
✅ Tooltips (4 placements, 5 variants)  
✅ Transitions (8 animations, 4 hover effects)  
✅ Haptic feedback  
✅ Interactive creators  
✅ Shared components  
✅ Comprehensive documentation  

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Status**: Production Ready ✨
