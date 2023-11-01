import { component } from '@hubai/core';

export type ImageCreatorItem = { 
  id: string;
  name: string;
};

export interface ImageCreatorState {
  headerToolBar?: component.IActionBarItemProps[];
  creations?: ImageCreatorItem[];
  error?: string;
}

export type ImageCreatorMessage = {
  id: string;
  prompt: string;
  files: component.ChatMessageAttachment[];
};

export type ImageCreatorSession = {
  messages: ImageCreatorMessage[];
};
