import React from 'react';

import { AppContext, Controller, localize } from '@hubai/core';
import {
  IBrainClientManager,
  LocalBrain,
} from '@hubai/core';
import ImageCreatorView from '../views/imageCreatorWindow';
import ImageCreatorService from '../services/imageCreatorService';
import { ImageCreatorItem } from '../models/imageCreatorState';
import generateUniqueId from '../utils/uniqueId';

export class ImageCreatorController extends Controller {
  availableBrains!: LocalBrain[];

  brainClientManager: IBrainClientManager;

  service: ImageCreatorService;

  appContext: AppContext;

  constructor(
    service: ImageCreatorService,
    appContext: AppContext
  ) {
    super();

    this.brainClientManager = appContext.services.brainClientManager;
    this.service = service;
    this.appContext = appContext;
  }

  initView(): void {
    const headerToolBar = [
      {
        icon: 'add',
        id: 'imageCreator.add',
        title: localize('create', 'Create'),
        onClick: () => {
          const session = { id: generateUniqueId(), name: 'New Creation' };

          this.service.addImageCreatorSession(session);
          this.selectOrOpenImageCreatorWindow(session);
        },
      },
    ];

    this.service.setState({
      headerToolBar,
    });
  }

  onContextMenuClick = ({ id }: any, item: ImageCreatorItem) => {
    switch (id) {
      case 'remove':
        this.service.removeImageCreatorSession(item);
        break;
      default:
        break;
    }
  };

  selectOrOpenImageCreatorWindow = ({ id, name }: ImageCreatorItem) => {
    let renderPane;
    this.availableBrains = this.brainClientManager
      .getAvailableBrains()
      .filter((b) => b.capabilities.includes('image_generation'));

    if (!this.appContext.services.editor.isOpened(id)) {
      renderPane = () => (
        <ImageCreatorView
          key={id}
          id={id}
          availableBrains={this.availableBrains}
          brainClientManager={this.brainClientManager}
          name={name}
          onChangeName={(e) => {
            this.service.updateSession({ id, name: e.target.value });
          }}
        />
      );
    }

    this.appContext.services.editor.open({
      id,
      name,
      icon: 'comment',
      renderPane,
    });
  };
}
