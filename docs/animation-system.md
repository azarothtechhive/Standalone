# CMS-Based Animation System

## Overview

This document describes the comprehensive CMS-driven animation customization system for Azaroth Tech-Hive. All animations across the application can now be configured, customized, and managed through a central CMS interface without requiring frontend redeployment.

## Architecture

### Core Components

1. **Type Definitions** (`src/types/animation.ts`)
   - `AnimationProperties`: Complete animation configuration interface
   - `AnimationPreset`: Reusable animation presets
   - `ComponentAnimationConfig`: Component-specific animation settings
   - `GlobalAnimationSettings`: Global animation controls
   - `AnimationConfig`: Complete animation configuration structure

2. **Animation Registry** (`src/utils/animationRegistry.ts`)
   - Central registry of all animation presets
   - CSS keyframe definitions
   - Helper functions for preset retrieval

3. **Animation Hook** (`src/hooks/useCMSAnimation.ts`)
   - Main hook for consuming CMS animation configuration
   - Automatic fallback to defaults
   - Performance and accessibility safeguards
   - Metrics tracking for monitoring

4. **CMS Context** (`src/context/CMSContext.tsx`)
   - Expanded `animationConfig` with comprehensive settings
   - Global defaults and component-specific overrides
   - CSS keyframes, shimmer effects, and cursor gradients

5. **Admin UI Components** (`src/components/admin/`)
   - `AnimationManager`: Main management interface
   - `GlobalAnimationSettings`: Global animation controls
   - `ComponentAnimationSettings`: Component-specific settings
   - `AnimationPresetLibrary`: Preset browser and application
   - `AnimationPreview`: Animation preview component

6. **Draft/Version Service** (`src/services/animationDraftService.ts`)
   - Draft management for safe experimentation
   - Version control with rollback capability
   - Publish workflow from drafts

## Migrated Components

The following components have been migrated to use CMS-driven animations:

- **Reveal** (`src/components/common/Reveal.tsx`)
  - Supports `componentId`, `elementId`, `presetId` props
  - Backward compatible with legacy props
  - Opt-in via `useCMS` prop (default: true)

- **AnimatedImage** (`src/components/common/AnimatedImage.tsx`)
  - CMS-driven animation types
  - Supports all animation properties from CMS
  - Backward compatible with legacy props

- **AnimatedWords** (`src/components/common/AnimatedWords.tsx`)
  - CMS-controlled stagger delays
  - Configurable duration and easing
  - Backward compatible with legacy behavior

- **Hero Badges** (`src/components/home/Hero.tsx`)
  - CMS-controlled floating animations
  - Preset-based animation assignment
  - Individual badge control

## Animation Properties

All animations support the following configurable properties:

### Basic Properties
- `enabled`: Enable/disable animation
- `type`: Animation type (fade, slide, scale, rotate, float, etc.)
- `duration`: Animation duration in seconds
- `delay`: Animation delay in seconds
- `easing`: Easing function (preset or custom cubic-bezier)

### Transform Properties
- `direction`: Animation direction (up, down, left, right)
- `distance`: Movement distance in pixels
- `opacity`: Start/end opacity values
- `scale`: Start/end scale values
- `rotation`: Start/end rotation values

### Control Properties
- `repeat`: Repeat behavior (once, infinite, or number)
- `loop`: Enable looping
- `scrollTrigger`: Scroll-based animation triggers
  - `enabled`: Enable scroll trigger
  - `viewportMargin`: Viewport margin for trigger
  - `once`: Animate only once per scroll
- `stagger`: Stagger delays for lists
  - `enabled`: Enable staggering
  - `delay`: Delay between items
  - `from`: Stagger direction (first, last, center)

### Hover Effects
- `hover`: Hover animation configuration
  - `enabled`: Enable hover effect
  - `type`: Hover animation type
  - `scale`: Scale on hover
  - `translateY`: Y-axis translation on hover
  - `translateX`: X-axis translation on hover
  - `duration`: Hover animation duration
  - `easing`: Hover easing function

### Responsive Settings
- `responsive`: Device-specific overrides
  - `desktop`: Desktop-specific properties
  - `tablet`: Tablet-specific properties
  - `mobile`: Mobile-specific properties

## Animation Presets

The system includes 25+ pre-configured animation presets organized by category:

### Entrance Animations
- Fade Up/Down/Left/Right
- Scale In/Out
- Zoom In/Out
- Slide Up/Down/Left/Right
- Rotate

### Continuous Animations
- Float
- Float Up/Down
- Float Left/Right
- Pulse
- Pulse Glow
- Scale Breath
- Rotate Slow
- Gradient Shift
- Wave Flow
- Orbit Float

### Hover Animations
- Lift
- Scale
- Glow

### Special Effects
- Shimmer Text
- Shimmer Pulse
- Hero Badge Float patterns

## Global Settings

### Master Controls
- **Master Switch**: Enable/disable all animations globally
- **Respect Reduced Motion**: Automatically disable for users with reduced motion preference

### Default Properties
- Default duration, delay, easing
- Default scroll trigger margin
- Default viewport once behavior

### Category Controls
- Scroll-triggered animations
- Hover animations
- Continuous/looping animations
- Mobile animations (with simplification option)

## Performance & Accessibility

### Performance Safeguards
1. **Low-End Device Detection**
   - Detects devices with <4 CPU cores
   - Automatically simplifies animations
   - Disables expensive effects

2. **Animation Count Limiting**
   - Tracks total animations on page
   - Disables animations if >50 present
   - Prevents performance degradation

3. **Mobile Optimization**
   - Optional simplification on mobile
   - Shorter durations
   - Disabled scroll triggers
   - No infinite animations

### Accessibility Features
1. **Reduced Motion Support**
   - Respects `prefers-reduced-motion` media query
   - Automatically disables animations
   - Tracks accessibility metrics

2. **Performance Metrics**
   - `getAnimationMetrics()`: Get current metrics
   - `resetAnimationMetrics()`: Reset metrics tracking
   - Monitors total, disabled for performance, disabled for accessibility

## Draft & Version Control

### Draft Management
- Create drafts for safe experimentation
- Update and delete drafts
- Drafts stored in localStorage
- Automatic timestamping

### Version Control
- Publish drafts as versions
- Version numbering (auto-increment)
- Rollback to any previous version
- Version notes for tracking changes
- Current version tracking

### Service API
```typescript
import { animationDraftService } from './services/animationDraftService';

// Create draft
const draft = animationDraftService.saveDraft('My Draft', 'Description', config);

// Update draft
animationDraftService.updateDraft(draftId, { name: 'Updated Name' });

// Publish draft
const version = animationDraftService.publishDraft(draftId, 'Release notes');

// Rollback
animationDraftService.rollbackToVersion(versionId);

// Get current version
const current = animationDraftService.getCurrentVersion();
```

## Usage Examples

### Using the Hook

```typescript
import { useCMSAnimation } from '../hooks/useCMSAnimation';

function MyComponent() {
  const animation = useCMSAnimation({
    componentId: 'hero',
    elementId: 'badges',
    presetId: 'hero-badge-float-1',
  });

  return (
    <motion.div {...animation.motionProps}>
      Content
    </motion.div>
  );
}
```

### Migrating Existing Components

```typescript
// Before
<Reveal delay={0.5} y={30} duration={0.6}>
  <Content />
</Reveal>

// After (with CMS control)
<Reveal componentId="hero" elementId="content">
  <Content />
</Reveal>

// Or with custom override
<Reveal 
  componentId="hero" 
  elementId="content"
  customProperties={{ duration: 0.8 }}
>
  <Content />
</Reveal>
```

### Disabling CMS for Specific Components

```typescript
<Reveal useCMS={false} delay={0.5} y={30}>
  <Content />
</Reveal>
```

## Admin Interface

The admin interface provides:

1. **Global Settings Tab**
   - Master animation controls
   - Default property configuration
   - Category toggles
   - Mobile settings

2. **Components Tab**
   - Per-component animation configuration
   - Element-level animation settings
   - Preset selection
   - Enable/disable toggles
   - Animation preview

3. **Presets Library Tab**
   - Browse all available presets
   - Filter by category
   - View preset details
   - Apply presets to components

4. **Preview Tab**
   - Preview selected animations
   - View animation properties
   - Replay functionality

## CSS Keyframes

All CSS keyframes are defined in the CMS configuration and can be customized:

- `fadeInUp`, `fadeIn`, `slideInLeft`, `slideInRight`
- `scaleIn`, `slideInUp`
- `pulseGlow`, `float`, `rotateSlow`
- `gradientShift`, `pulseSlow`
- `floatUpDown`, `floatLeftRight`, `scaleBreath`
- `textShimmer`, `fadeInScale`, `waveFlow`, `orbitFloat`
- `shimmerText`, `shimmerPulse`, `shimmer`, `cursorGradient`

Each keyframe has configurable:
- Enabled/disabled state
- Keyframe definitions
- Duration
- Timing function
- Iteration count

## Shimmer Effects

Shimmer effects are CMS-configurable:

- `shimmerText`: Primary shimmer gradient
- `shimmerTextWarm`: Warm color shimmer
- `shimmerTextPremium`: Premium shimmer
- `shimmerLoader`: Loading shimmer

Each effect has configurable:
- Gradient definition
- Background size
- Duration

## Cursor Gradients

Cursor gradient effects are CMS-configurable:

- `cursorGradientIndigoRose`
- `cursorGradientRoseIndigo`
- `cursorGradientVioletCoral`

## Best Practices

1. **Use Presets**: Start with presets before customizing
2. **Test on Mobile**: Always test animations on mobile devices
3. **Respect Accessibility**: Keep reduced motion enabled by default
4. **Monitor Performance**: Use metrics to identify performance issues
5. **Version Control**: Use drafts for experimentation, publish when ready
6. **Component-Level**: Configure animations at component level for granular control
7. **Global Defaults**: Set sensible global defaults to reduce configuration overhead

## Troubleshooting

### Animations Not Working
1. Check master switch in global settings
2. Verify component is enabled
3. Check if reduced motion is respected
4. Review performance metrics for automatic disabling

### Performance Issues
1. Check animation count metrics
2. Enable mobile simplification
3. Reduce animation durations
4. Disable continuous animations
5. Check for low-end device detection

### CMS Changes Not Reflecting
1. Verify CMS context is properly updated
2. Check component IDs match configuration
3. Ensure useCMS prop is enabled (default: true)
4. Review browser console for errors

## Future Enhancements

Potential future improvements:

1. **Animation Builder**: Visual animation builder interface
2. **A/B Testing**: Test different animation configurations
3. **Analytics**: Track animation engagement metrics
4. **Export/Import**: Share animation configurations
5. **Cloud Storage**: Store drafts and versions in cloud
6. **Collaboration**: Multiple admin support with change tracking
7. **AI Suggestions**: Suggest animations based on content
8. **Performance Profiling**: Detailed performance profiling tools

## Support

For issues or questions about the animation system:
1. Check this documentation
2. Review component-specific documentation
3. Check browser console for errors
4. Review performance metrics
5. Contact development team
