import { ImageCreatorItem } from '../models/imageCreatorState';

export interface IImageCreatorStorage {
  addCreation(creation: ImageCreatorItem): void;
  getCreations(): ImageCreatorItem[];
  updateCreation(creation: ImageCreatorItem): void;
  removeCreation(id: string): void;
}

const storageKey = 'imageCreator.creations';
export class ImageCreatorLocalStorage implements IImageCreatorStorage {
  addCreation(creation: ImageCreatorItem): void {
    const creations = this.getCreations();
    creations.push(creation);

    this.setCreations(creations);
  }

  getCreations(): ImageCreatorItem[] {
    const creations = localStorage.getItem(storageKey);
    if (!creations) return [];

    return JSON.parse(creations);
  }

  updateCreation(creation: ImageCreatorItem): void {
    const creations = this.getCreations();
    const index = creations.findIndex((c) => c.id === creation.id);
    if (index === -1) return;

    creations[index] = creation;

    this.setCreations(creations);
  }

  setCreations(creations: ImageCreatorItem[]): void {
    localStorage.setItem(storageKey, JSON.stringify(creations));
  }

  removeCreation(id: string): void {
    const creations = this.getCreations();
    const index = creations.findIndex((c) => c.id === id);
    if (index === -1) return;

    creations.splice(index, 1);

    this.setCreations(creations);
  }
}
