/**
 * Barrel for the layout/primitive UI kit introduced by the redesign.
 *
 * Components that are domain-specific (ServiceCard, SourceCard, ChatMessage…)
 * stay in their own folders; this barrel only exports generic building blocks.
 */
export { ProgressBar, StepIndicator, type StepIndicatorStep } from '@/components/ui/Progress';
export { Drawer } from '@/components/ui/Drawer';
export { Tooltip } from '@/components/ui/Tooltip';
export { UploadZone } from '@/components/ui/UploadZone';
