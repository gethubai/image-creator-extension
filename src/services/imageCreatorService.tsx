import { react } from '@hubai/core';
import {
  ImageCreatorItem,
  ImageCreatorState,
} from '../models/imageCreatorState';
import {
  IImageCreatorStorage,
  ImageCreatorLocalStorage,
} from './imageCreatorStorage';

const { Component } = react;

export default class ImageCreatorService extends Component<ImageCreatorState> {
  protected state: ImageCreatorState;

  public storage: IImageCreatorStorage;

  constructor() {
    super();
    this.storage = new ImageCreatorLocalStorage();
    this.state = { creations: this.storage.getCreations() };
  }

  addImageCreatorSession(session: ImageCreatorItem): void {
    this.storage.addCreation(session);

    this.updateCreations();
  }

  removeImageCreatorSession(session: ImageCreatorItem): void {
    this.storage.removeCreation(session.id);

    this.updateCreations();
  }

  updateSession(session: ImageCreatorItem): void {
    this.storage.updateCreation(session);

    this.updateCreations();
  }

  updateCreations(): void {
    this.setState({
      creations: this.storage.getCreations(),
    });
  }
}
