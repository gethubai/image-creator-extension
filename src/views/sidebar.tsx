import React, { useMemo, useCallback } from 'react';

import {
  component,
  localize,
  Content,
  Header,
  getEventPosition,
} from '@hubai/core';
import { ImageCreatorController } from '../controllers/imageCreatorController';
import { ImageCreatorState } from '../models/imageCreatorState';

const { Toolbar, Collapse,  Menu, useContextViewEle, TreeView } = component;

export type Props = ImageCreatorController & ImageCreatorState & {};

function Sidebar({
  headerToolBar,
  creations,
  error,
  onContextMenuClick,
  selectOrOpenImageCreatorWindow,
}: Props) {
  const contextView = useContextViewEle();
  const collapseItems = creations?.map(
    (item) =>
      ({
        id: item.id,
        name: item.name,
        value: item,
        fileType: 'File',
        icon: 'device-camera',
        isLeaf: true,
      } as component.ICollapseItem)
  );

  const openContextMenu = useCallback(
    (e: React.MouseEvent, selected: component.ITreeNodeItemProps) => {
      e.preventDefault();
      contextView?.show(getEventPosition(e), () => (
        <Menu
          role="menu"
          onClick={(_: any, item: component.IMenuItemProps) => {
            contextView?.hide();
            onContextMenuClick?.(item, selected.value);
          }}
          data={[
            {
              id: 'remove',
              name: localize('imageCreator.menu.remove', 'Remove'),
              icon: 'x',
            },
          ]}
        />
      ));
    },
    [contextView, onContextMenuClick]
  );

  const onSelectItem = useCallback(
    (node: component.ITreeNodeItemProps<any>) => {
      if (!node.isLeaf) return;

      selectOrOpenImageCreatorWindow(node.value);
    },
    [selectOrOpenImageCreatorWindow]
  );

  const renderCollapse = useMemo<component.ICollapseItem[]>(
    () => [
      {
        id: 'imageCreator.list',
        name: localize('imageCreator.listTitle', 'Creations'),
        renderPanel: () => {
          return (
            <TreeView
              data={collapseItems}
              className="imageCreatorTree"
              onSelect={onSelectItem}
              onRightClick={openContextMenu}
            />
          );
        },
      },
    ],
    [collapseItems, onSelectItem, openContextMenu]
  );

  return (
    <div className="container" style={{ width: '100%', height: '100%' }}>
      <Header
        title={localize('imageCreator.sidebarTitle', 'Image Creations')}
        toolbar={<Toolbar data={headerToolBar || []} />}
      />
      <Content>
        {!error && (
          <Collapse
            data={renderCollapse}
            activePanelKeys={['imageCreator.list']}
          />
        )}

        {error && (
          <div className="error-container">
            <h3>{localize('imageCreator.error', 'Error')}</h3>
            <p>{error}</p>
          </div>
        )}
      </Content>
    </div>
  );
}

export default Sidebar;
