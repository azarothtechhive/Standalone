// src/services/animationDraftService.ts
// Service for managing animation drafts and version control

import { AnimationConfig, AnimationDraft, AnimationVersion } from '../types/animation';

class AnimationDraftService {
  private storageKey = 'animation_drafts';
  private versionsKey = 'animation_versions';
  private currentVersionKey = 'animation_current_version';

  // Save a new draft
  saveDraft(name: string, description: string | undefined, config: AnimationConfig): AnimationDraft {
    const drafts = this.getAllDrafts();
    const draft: AnimationDraft = {
      id: `draft-${Date.now()}`,
      name,
      description,
      config: JSON.parse(JSON.stringify(config)), // Deep clone
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    drafts.push(draft);
    this.setItem(this.storageKey, drafts);
    return draft;
  }

  // Get all drafts
  getAllDrafts(): AnimationDraft[] {
    return this.getItem<AnimationDraft[]>(this.storageKey) || [];
  }

  // Get a specific draft
  getDraft(id: string): AnimationDraft | undefined {
    const drafts = this.getAllDrafts();
    return drafts.find(draft => draft.id === id);
  }

  // Update a draft
  updateDraft(id: string, updates: Partial<AnimationDraft>): AnimationDraft | undefined {
    const drafts = this.getAllDrafts();
    const index = drafts.findIndex(draft => draft.id === id);
    
    if (index === -1) return undefined;

    drafts[index] = {
      ...drafts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(this.storageKey, drafts);
    return drafts[index];
  }

  // Delete a draft
  deleteDraft(id: string): boolean {
    const drafts = this.getAllDrafts();
    const filtered = drafts.filter(draft => draft.id !== id);
    
    if (filtered.length === drafts.length) return false;

    this.setItem(this.storageKey, filtered);
    return true;
  }

  // Publish a draft (create a new version)
  publishDraft(draftId: string, notes?: string): AnimationVersion | undefined {
    const draft = this.getDraft(draftId);
    if (!draft) return undefined;

    const versions = this.getAllVersions();
    const latestVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0;

    const version: AnimationVersion = {
      id: `version-${Date.now()}`,
      version: latestVersion + 1,
      config: JSON.parse(JSON.stringify(draft.config)), // Deep clone
      createdAt: new Date().toISOString(),
      createdBy: 'admin', // TODO: Get from auth context
      notes: notes || `Published from draft: ${draft.name}`,
    };

    versions.push(version);
    this.setItem(this.versionsKey, versions);
    this.setItem(this.currentVersionKey, version.id);

    // Optionally delete the draft after publishing
    this.deleteDraft(draftId);

    return version;
  }

  // Get all versions
  getAllVersions(): AnimationVersion[] {
    return this.getItem<AnimationVersion[]>(this.versionsKey) || [];
  }

  // Get a specific version
  getVersion(id: string): AnimationVersion | undefined {
    const versions = this.getAllVersions();
    return versions.find(version => version.id === id);
  }

  // Get current published version
  getCurrentVersion(): AnimationVersion | undefined {
    const currentId = this.getItem<string>(this.currentVersionKey);
    if (!currentId) return undefined;
    return this.getVersion(currentId);
  }

  // Rollback to a specific version
  rollbackToVersion(versionId: string): AnimationVersion | undefined {
    const version = this.getVersion(versionId);
    if (!version) return undefined;

    this.setItem(this.currentVersionKey, versionId);
    return version;
  }

  // Delete a version
  deleteVersion(id: string): boolean {
    const versions = this.getAllVersions();
    const filtered = versions.filter(version => version.id !== id);
    
    if (filtered.length === versions.length) return false;

    this.setItem(this.versionsKey, filtered);

    // If this was the current version, set to the latest
    const currentId = this.getItem<string>(this.currentVersionKey);
    if (currentId === id && filtered.length > 0) {
      const latest = filtered.reduce((prev, current) => 
        current.version > prev.version ? current : prev
      );
      this.setItem(this.currentVersionKey, latest.id);
    }

    return true;
  }

  // Helper methods for localStorage
  private getItem<T>(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
}

export const animationDraftService = new AnimationDraftService();
