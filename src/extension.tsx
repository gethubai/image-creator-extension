import React from 'react';
import { AppContext, IExtension } from '@hubai/core';
import { react } from '@hubai/core';
import ImageCreatorService from './services/imageCreatorService';
import { ImageCreatorController } from './controllers/imageCreatorController';
import Sidebar from './views/sidebar';
const { connect } = react;

const ImageCreatorExtension: IExtension = {
  id: 'imageCreator',
  name: 'Image creator',

  async activate(context: AppContext) {
    const service = new ImageCreatorService();

    const controller = new ImageCreatorController(service, context);

    const SidebarViewConnected = connect(service, Sidebar, controller);

    controller.initView();

    const sidebar = {
      id: 'imageCreator.sidebarPane',
      title: 'SidebarPanel',
      render: () => <SidebarViewConnected />,
    };

    const activityBar = {
      id: 'imageCreator.sidebarPane',
      name: 'ImageCreator',
      title: 'Image Creator',
      icon: 'device-camera',
    };

    context.services.sidebar.add(sidebar);
    context.services.activityBar.add(activityBar);
  },

  dispose(context: AppContext): void {
    context.services.sidebar.remove('imageCreator.sidebarPane');
    context.services.activityBar.remove('imageCreator.sidebarPane');
  },
};

export default ImageCreatorExtension;
